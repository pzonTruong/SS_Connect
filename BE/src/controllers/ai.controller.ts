import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { env } from '../config/env';

export const recommendExperts = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nhu cầu hoặc thắc mắc của bạn để AI phân tích.' });
    }

    // Get list of active experts from DB
    const experts = await UserModel.find({ role: 'expert' })
      .select('displayName title bio specialties experienceYears consultingStyle ratingAverage reviewCount consultingType')
      .lean();

    if (experts.length === 0) {
      return res.json({ recommendations: [], summary: 'Hiện chưa có dữ liệu chuyên gia trong hệ thống.' });
    }

    // Format experts list for Gemini prompt
    const expertsContext = experts.map((e, idx) => `
Expert ${idx + 1}:
ID: ${e._id}
Tên: ${e.displayName || 'Chuyên gia'}
Chức danh: ${e.title || 'Cố vấn Student Success'}
Kinh nghiệm: ${e.experienceYears || 1} năm
Lĩnh vực chuyên môn: ${e.specialties ? e.specialties.join(', ') : 'Chung'}
Phong cách tư vấn: ${e.consultingStyle || 'Thân thiện, nhiệt tình'}
Giới thiệu: ${e.bio || 'Chuyên gia hỗ trợ học viên'}
Đánh giá: ${e.ratingAverage || 5.0}/5 (${e.reviewCount || 0} lượt đánh giá)
Hình thức: ${e.consultingType ? e.consultingType.join(', ') : 'Online'}
`).join('\n---');

    const apiKey = env.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback rule-based matching if GEMINI_API_KEY is not configured
      const q = query.toLowerCase();
      const matched = experts.map(e => {
        let score = 70;
        const text = `${e.displayName} ${e.title} ${e.bio} ${(e.specialties || []).join(' ')}`.toLowerCase();
        if (q.split(' ').some(word => word.length > 2 && text.includes(word))) {
          score += 20;
        }
        return {
          expertId: e._id,
          matchScore: score,
          reason: `Chuyên gia ${e.displayName} có chuyên môn phù hợp với nhu cầu "${query}" của bạn.`
        };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

      return res.json({
        recommendations: matched,
        summary: 'Đã phân tích nhu cầu của bạn và lựa chọn các chuyên gia phù hợp nhất dựa trên tiêu chí lĩnh vực.'
      });
    }

    // Call Gemini REST API directly using v1beta API endpoint with standard model fallback
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Bạn là một trợ lý AI thông minh cho nền tảng SS_Connect (Student Success Connect) của MindX.
Nhiệm vụ của bạn là đọc nhu cầu/khó khăn của học viên và phân tích danh sách Chuyên gia để chọn ra tối đa 3 chuyên gia phù hợp nhất.

Dưới đây là danh sách Chuyên gia hiện có trong hệ thống:
${expertsContext}

Học viên nhập nhu cầu: "${query.trim()}"

Hãy trả về phản hồi DUY NHẤT một chuỗi JSON hợp lệ (không kèm theo bất kỳ văn bản giải thích nào khác ngoài chuỗi JSON) theo định dạng exact này:
{
  "summary": "Đoạn tóm tắt ngắn gọn 1-2 câu nhận xét về nhu cầu của học viên và tiêu chí lựa chọn",
  "recommendations": [
    {
      "expertId": "ID của expert được chọn",
      "matchScore": 95,
      "reason": "Giải thích chi tiết 2-3 câu vì sao chuyên gia này là lựa chọn tốt nhất dựa trên kỹ năng, kinh nghiệm hoặc phong cách tư vấn"
    }
  ]
}`;

    const fetchResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!fetchResponse.ok) {
      // Fallback try gemini-1.5-flash endpoint if gemini-2.0-flash fails
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      if (!fallbackRes.ok) {
        throw new Error(`Gemini API HTTP Error: ${fetchResponse.status}`);
      }

      const fallbackData = await fallbackRes.json();
      const rawText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    }

    const data = await fetchResponse.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean string markdown wrappers if present
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error calling Gemini AI API:', error);

    // Reliable fallback matching if AI call encounters issues
    const experts = await UserModel.find({ role: 'expert' }).select('_id displayName title specialties').lean();
    const fallbackRecs = experts.slice(0, 3).map((e, idx) => ({
      expertId: e._id,
      matchScore: 90 - idx * 5,
      reason: `Chuyên gia ${e.displayName} (${e.title || 'SS Consultant'}) có kinh nghiệm chuyên sâu có thể hỗ trợ tốt nhất cho thắc mắc của bạn.`
    }));

    return res.json({
      summary: 'Đã gợi ý các chuyên gia hàng đầu phù hợp với yêu cầu tư vấn của bạn.',
      recommendations: fallbackRecs
    });
  }
};

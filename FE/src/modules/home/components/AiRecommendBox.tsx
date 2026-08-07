import { useState } from 'react';
import { Sparkles, Bot, Loader2, Award, UserCheck } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

interface Recommendation {
  expertId: string;
  matchScore: number;
  reason: string;
}

interface AiRecommendBoxProps {
  expertsMap: Record<string, any>;
}

export const AiRecommendBox = ({ expertsMap }: AiRecommendBoxProps) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await http.post('/ai/recommend-experts', { query });
      setSummary(res.data.summary || '');
      setRecommendations(res.data.recommendations || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6 relative overflow-hidden transition-colors duration-200">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="size-5 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground">
            Gợi Ý Chuyên Gia Thông Minh bằng Gemini AI
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full">
              AI Match
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Nhập khó khăn hoặc nhu cầu học tập của bạn, AI sẽ phân tích danh sách và tìm Chuyên gia phù hợp nhất!
          </p>
        </div>
      </div>

      <form onSubmit={handleRecommend} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: Em học Frontend, CV chưa đẹp và cần tư vấn phỏng vấn..."
            className="w-full h-11 bg-background border border-input rounded-xl px-4 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-11 px-6 bg-brand-brown hover:bg-[#4E2505] text-white text-xs font-bold rounded-xl shadow-xs shrink-0 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1.5" />
              Đang phân tích...
            </>
          ) : (
            <>
              <Bot className="size-4 mr-1.5" />
              Gợi ý ngay
            </>
          )}
        </Button>
      </form>

      {/* Preset prompt tags */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold">Gợi ý mẫu:</span>
        {[
          'Sửa CV ngành Data Analysis',
          'Tư vấn phỏng vấn Web ReactJS',
          'Định hướng nghề nghiệp IT cho tân sinh viên'
        ].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setQuery(tag)}
            className="px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors border border-border/50"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* AI Output results */}
      {summary && (
        <div className="space-y-4 pt-2 border-t border-border animate-fadeIn">
          <p className="text-xs text-primary font-medium italic bg-primary/5 p-3 rounded-xl border border-primary/20">
            "{summary}"
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {recommendations.map((rec) => {
              const exp = expertsMap[rec.expertId];
              if (!exp) return null;

              return (
                <div
                  key={rec.expertId}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-3 relative group hover:border-primary/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="size-3 text-emerald-500" />
                      Phù hợp {rec.matchScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {exp.avatarUrl ? (
                      <img src={exp.avatarUrl} alt={exp.displayName} className="size-10 rounded-full object-cover border shrink-0" />
                    ) : (
                      <div className="size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border shrink-0">
                        {exp.displayName?.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{exp.displayName}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{exp.title || 'SS Consultant'}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg italic">
                    {rec.reason}
                  </p>

                  <Link to={`/booking/${exp._id}`} className="block pt-1">
                    <Button size="sm" className="w-full text-xs font-semibold bg-brand-brown hover:bg-[#4E2505] text-white rounded-lg">
                      <UserCheck className="size-3.5 mr-1.5" /> Đặt lịch ngay
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

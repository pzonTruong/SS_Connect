import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({ from: env.emailFrom, to, subject, html });
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const expiresInMinutes = env.otpExpiresMinutes;
  try {
    await sendEmail(
      to,
      'Verify your email - OTP code',
      `
        <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
            <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
              <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
                MERN Auth Starter
              </p>
              <h2 style="margin:0 0 10px;font-size:22px;color:#18181b;">Email Verification OTP</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
                Use this OTP to verify your account. This code is valid for ${expiresInMinutes} minutes.
              </p>
              <div style="margin:0 0 18px;padding:14px;border-radius:12px;background:#faf5ff;border:1px dashed #a855f7;text-align:center;">
                <span style="font-size:30px;font-weight:700;letter-spacing:0.35em;color:#6d28d9;">${otp}</span>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#52525b;">If you did not request this OTP, please ignore this email.</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">For security, never share this OTP with anyone.</p>
            </div>
          </div>
        </div>
      `
    );
  } catch (error) {
    console.warn(`⚠️ Failed to send verification email to ${to}:`, error);
  }
  console.log(`🔑 [DEVELOPMENT OTP BYPASS] OTP for ${to} is: ${otp}`);
};

export const sendResetTokenEmail = async (to: string, token: string) => {
  try {
    await sendEmail(
      to,
      'Password reset token',
      `<p>Your reset token is <b>${token}</b>. It expires in ${env.resetTokenExpiresMinutes} minutes.</p>`
    );
  } catch (error) {
    console.warn(`⚠️ Failed to send reset email to ${to}:`, error);
  }
  console.log(`🔑 [DEVELOPMENT RESET BYPASS] Reset token for ${to} is: ${token}`);
};

export const sendBookingConfirmationToStudent = async (
  to: string,
  booking: any,
  expertName: string
) => {
  const expertProfileUrl = `${env.clientUrl}/experts/${booking.expertId}`;
  const meetingHtml = booking.mode === 'online' 
    ? `<p style="margin:0 0 12px;font-size:14px;color:#3f3f46;"><b>Link meeting online:</b> <a href="${booking.meetingLink || 'https://meet.google.com/abc-defg-hij'}" style="color:#2563eb;text-decoration:underline;">Tham gia cuộc họp</a></p>`
    : `<p style="margin:0 0 12px;font-size:14px;color:#3f3f46;"><b>Địa điểm offline:</b> Văn phòng Student Success Hub tại Cơ sở MindX gần nhất</p>`;

  await sendEmail(
    to,
    `[SS Connect] Đặt lịch tư vấn thành công với chuyên gia ${expertName}`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Đặt lịch tư vấn thành công</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chào bạn <b>${booking.studentName}</b>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Yêu cầu đặt lịch của bạn đã được ghi nhận thành công trong hệ thống. Dưới đây là thông tin chi tiết:
            </p>
            <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Chuyên gia tư vấn:</b> <a href="${expertProfileUrl}" style="color:#0a66c2;text-decoration:underline;font-weight:bold;">${expertName}</a></p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Thời gian:</b> ${booking.time} ngày ${booking.date}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Hình thức:</b> ${booking.mode === 'online' ? 'Online' : 'Offline'}</p>
              ${meetingHtml}
            </div>
            
            <div style="margin:0 0 18px;padding:14px;border-radius:8px;background:#fef3c7;border:1px solid #fcd34d;">
              <h4 style="margin:0 0 6px;font-size:14px;color:#92400e;">Lưu ý trước buổi tư vấn:</h4>
              <ul style="margin:0;padding-left:20px;font-size:13px;color:#b45309;line-height:1.5;">
                <li>Chuẩn bị sẵn CV hoặc link Portfolio/GitHub/LinkedIn (nếu tư vấn sửa CV/portfolio).</li>
                <li>Ghi lại các câu hỏi hoặc khó khăn cụ thể bạn đang gặp phải.</li>
                <li>Vui lòng có mặt đúng giờ để buổi tư vấn đạt kết quả tốt nhất.</li>
              </ul>
            </div>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Nếu có thắc mắc hoặc cần thay đổi lịch, vui lòng liên hệ bộ phận Student Success.</p>
          </div>
        </div>
      </div>
    `
  );
};

export const sendBookingNotificationToExpert = async (
  to: string,
  booking: any,
  studentName: string
) => {
  const cvHtml = booking.cvLink 
    ? `<p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Link CV/Portfolio:</b> <a href="${booking.cvLink}" style="color:#2563eb;text-decoration:underline;">Xem CV học viên</a></p>`
    : '';

  await sendEmail(
    to,
    `[SS Connect] Thông báo: Yêu cầu đặt lịch tư vấn mới từ học viên ${studentName}`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Lịch tư vấn mới từ học viên</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Kính gửi chuyên gia,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Có một học viên vừa đăng ký lịch tư vấn trực tiếp với anh/chị. Dưới đây là thông tin đăng ký:
            </p>
            
            <h3 style="margin:0 0 8px;font-size:15px;color:#111827;">1. Thông tin học viên</h3>
            <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:14px;margin-bottom:16px;">
              <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;"><b>Họ tên:</b> ${booking.studentName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;"><b>Email:</b> ${booking.studentEmail}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;"><b>Số điện thoại:</b> ${booking.studentPhone}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;"><b>Khóa học MindX:</b> ${booking.course}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#3f3f46;"><b>Ngành học:</b> ${booking.major}</p>
            </div>
            
            <h3 style="margin:0 0 8px;font-size:15px;color:#111827;">2. Chi tiết buổi tư vấn</h3>
            <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:8px;padding:14px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Thời gian:</b> ${booking.time} ngày ${booking.date}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Hình thức:</b> ${booking.mode === 'online' ? 'Online' : 'Offline'}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Mục tiêu tư vấn:</b> ${booking.goals}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><b>Vấn đề đang gặp:</b> ${booking.issues}</p>
              ${cvHtml}
              ${booking.notes ? `<p style="margin:0;font-size:14px;color:#3f3f46;"><b>Ghi chú:</b> ${booking.notes}</p>` : ''}
            </div>
            
            <div style="text-align:center;margin-top:24px;margin-bottom:10px;">
              <p style="font-size:14px;color:#3f3f46;margin-bottom:16px;">Vui lòng truy cập trang quản lý để xác nhận hoặc từ chối lịch hẹn này.</p>
              <a href="${env.clientUrl}/expert-dashboard" style="background:#7c3aed;color:#ffffff;padding:12px 24px;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;display:inline-block;">Đi tới trang quản lý</a>
            </div>
          </div>
        </div>
      </div>
    `
  );
};

export const sendBookingCancellationToStudent = async (
  to: string,
  booking: any,
  expertName: string
) => {
  await sendEmail(
    to,
    `[SS Connect] Thông báo: Lịch hẹn tư vấn với chuyên gia ${expertName} đã bị hủy`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#ef4444;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Lịch hẹn tư vấn đã bị hủy</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chào bạn <b>${booking.studentName}</b>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chúng tôi rất tiếc phải thông báo rằng yêu cầu đặt lịch hẹn tư vấn sau của bạn đã bị hủy hoặc từ chối bởi chuyên gia:
            </p>
            <div style="background:#fef2f2;border:1px solid #fee2e2;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><b>Chuyên gia tư vấn:</b> ${expertName}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><b>Thời gian dự kiến:</b> ${booking.time} ngày ${booking.date}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><b>Hình thức:</b> ${booking.mode === 'online' ? 'Online' : 'Offline'}</p>
            </div>
            
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Bạn có thể truy cập hệ thống để xem các chuyên gia khác hoặc lựa chọn một khung giờ rảnh khác của chuyên gia này để đặt lại lịch.
            </p>
            <div style="text-align:center;margin-top:20px;margin-bottom:20px;">
              <a href="${env.clientUrl}/experts" style="background:#0a66c2;color:#ffffff;padding:12px 24px;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;display:inline-block;">Tìm chuyên gia tư vấn khác</a>
            </div>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Nếu có thắc mắc hoặc cần hỗ trợ gấp, vui lòng liên hệ bộ phận Student Success tại cơ sở của bạn.</p>
          </div>
        </div>
      </div>
    `
  );
};

export const sendBookingCompletionToStudent = async (
  to: string,
  booking: any,
  expertName: string,
  feedback: string
) => {
  await sendEmail(
    to,
    `[SS Connect] Đánh giá & Nhận xét từ chuyên gia ${expertName} cho buổi tư vấn của bạn`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#10b981;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Hoàn thành buổi tư vấn</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chào bạn <b>${booking.studentName}</b>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Buổi tư vấn của bạn với chuyên gia đã hoàn thành tốt đẹp. Dưới đây là tóm tắt thông tin lịch hẹn và nhận xét/đánh giá từ chuyên gia dành cho bạn:
            </p>
            
            <div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#14532d;"><b>Chuyên gia tư vấn:</b> ${expertName}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#14532d;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#14532d;"><b>Thời gian:</b> ${booking.time} ngày ${booking.date}</p>
            </div>

            <h3 style="margin:0 0 8px;font-size:15px;color:#111827;">Nhận xét & Định hướng từ chuyên gia:</h3>
            <div style="background:#f9fafb;border-left:4px solid #10b981;padding:12px 16px;margin-bottom:20px;font-style:italic;color:#374151;font-size:14px;line-height:1.6;">
              ${feedback ? feedback.replace(/\n/g, '<br/>') : 'Không có ghi chú thêm.'}
            </div>

            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chúc bạn luôn giữ vững tinh thần học tập và đạt kết quả tốt nhất trên lộ trình tiếp theo của mình!
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Mọi phản hồi về dịch vụ hoặc thắc mắc vui lòng liên hệ trực tiếp cán bộ hỗ trợ học viên.</p>
          </div>
        </div>
      </div>
    `
  );
};

export const sendRescheduleRequestToStudent = async (
  to: string,
  booking: any,
  expertName: string
) => {
  await sendEmail(
    to,
    `[SS Connect] Yêu cầu đổi lịch hẹn tư vấn từ chuyên gia ${expertName}`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#d97706;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Yêu cầu thay đổi lịch hẹn</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chào bạn <b>${booking.studentName}</b>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chuyên gia <b>${expertName}</b> vừa gửi yêu cầu đề nghị thay đổi lịch hẹn tư vấn hiện tại của bạn do bận lịch đột xuất:
            </p>
            
            <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#92400e;"><b>Lịch hẹn cũ:</b> ${booking.time} ngày ${booking.date}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#92400e;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#92400e;"><b>Hình thức:</b> ${booking.mode === 'online' ? 'Online' : 'Offline'}</p>
            </div>

            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Vui lòng truy cập hệ thống SS Connect, vào danh sách lịch hẹn của bạn và chọn chức năng <b>Đổi lịch</b> để đặt lại một khung giờ rảnh khác phù hợp với bạn.
            </p>
            <div style="text-align:center;margin-top:20px;margin-bottom:20px;">
              <a href="${env.clientUrl}/my-bookings" style="background:#d97706;color:#ffffff;padding:12px 24px;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;display:inline-block;">Đi tới Lịch hẹn của tôi</a>
            </div>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ bộ phận Student Success.</p>
          </div>
        </div>
      </div>
    `
  );
};

export const sendRescheduleSubmissionToStudent = async (
  to: string,
  booking: any,
  expertName: string
) => {
  await sendEmail(
    to,
    `[SS Connect] Đã ghi nhận yêu cầu đổi lịch hẹn với chuyên gia ${expertName}`,
    `
      <div style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
          <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">
              Student Success Connect
            </p>
            <h2 style="margin:0 0 14px;font-size:20px;color:#2563eb;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Đã gửi yêu cầu đổi lịch hẹn</h2>
            <p style="margin:0 0 12px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chào bạn <b>${booking.studentName}</b>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Chúng tôi đã ghi nhận yêu cầu đổi lịch hẹn tư vấn của bạn sang khung giờ mới. Dưới đây là thông tin chi tiết:
            </p>
            
            <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;"><b>Chuyên gia tư vấn:</b> ${expertName}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;"><b>Chủ đề:</b> ${booking.bookingType}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;"><b>Khung giờ mới:</b> ${booking.time} ngày ${booking.date}</p>
              <p style="margin:0 0 8px;font-size:14px;color:#1e40af;"><b>Hình thức:</b> ${booking.mode === 'online' ? 'Online' : 'Offline'}</p>
            </div>

            <p style="margin:0 0 16px;font-size:14px;color:#3f3f46;line-height:1.6;">
              Yêu cầu đổi lịch của bạn hiện đang chờ chuyên gia phê duyệt. Hệ thống sẽ gửi email xác nhận chính thức cho bạn ngay khi chuyên gia đồng ý.
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Nếu có thắc mắc hoặc cần thay đổi, vui lòng liên hệ bộ phận Student Success.</p>
          </div>
        </div>
      </div>
    `
  );
};


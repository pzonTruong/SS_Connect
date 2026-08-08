import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Compass, Video, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { formatTimeRange } from '@/shared/lib/utils';

export const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();

  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const expertName = decodeURIComponent(searchParams.get('expertName') || '');
  const mode = searchParams.get('mode') || 'online';
  const expertId = searchParams.get('expertId') || '';

  return (
    <div className="max-w-xl mx-auto text-center py-10 space-y-8 pb-16">
      {/* Icon + success header */}
      <section className="space-y-4 animate-fadeIn">
        <div className="inline-flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 shadow-inner">
          <CheckCircle className="size-10 animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Gửi Yêu Cầu Thành Công!</h1>
          <p className="text-sm text-muted-foreground">
            Yêu cầu đặt lịch hẹn của bạn đang chờ phê duyệt. Hệ thống sẽ tự động gửi email xác nhận kèm liên kết tham gia cho bạn ngay sau khi chuyên gia xác nhận đồng ý.
          </p>
        </div>
      </section>

      {/* Summary Box */}
      <section className="bg-card border rounded-2xl p-6 shadow-sm text-left divide-y divide-border">
        <div className="pb-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thông tin chi tiết</h3>
          <div className="space-y-2.5 text-sm font-semibold">
            <div className="flex items-center gap-3">
              <Compass className="size-4.5 text-primary shrink-0" />
              <span>
                Chuyên gia:{' '}
                {expertId ? (
                  <Link to={`/experts/${expertId}`} className="text-primary hover:underline hover:text-primary-hover font-bold">
                    {expertName}
                  </Link>
                ) : (
                  <span className="text-primary">{expertName}</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="size-4.5 text-primary shrink-0" />
              <span>Ngày tư vấn: {date}</span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="size-4.5 text-primary shrink-0" />
              <span>Khung giờ: {formatTimeRange(time)} (Thời lượng: 2 tiếng)</span>
            </div>

            <div className="flex items-center gap-3">
              <Video className="size-4.5 text-primary shrink-0" />
              <span>Hình thức: {mode === 'online' ? 'Online qua cuộc gọi trực tuyến' : 'Offline tại Văn phòng MindX'}</span>
            </div>
          </div>
        </div>

        {mode === 'online' && (
          <div className="py-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đường dẫn tham gia (Google Meet):</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 leading-relaxed">
              ⚡ Đường dẫn cuộc họp Google Meet sẽ được khởi tạo và gửi qua email cho bạn ngay sau khi chuyên gia chấp nhận xác nhận lịch hẹn.
            </p>
          </div>
        )}

        <div className="pt-4 space-y-3">
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Một số lưu ý quan trọng:</h4>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
            <li>Email xác nhận chi tiết và đường dẫn phòng họp sẽ được gửi tới hòm thư của bạn sau khi chuyên gia xác nhận lịch hẹn. Hãy kiểm tra kỹ hộp thư (bao gồm cả mục Spam).</li>
            <li>Chuẩn bị trước CV, portfolio, hoặc danh sách câu hỏi cần chuyên gia phản biện.</li>
            <li>Hãy tham gia đúng giờ quy định. Chuyên gia có thể rời phòng họp sau 15 phút nếu bạn vắng mặt.</li>
          </ul>
        </div>
      </section>

      {/* Control Buttons */}
      <section className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Link to="/my-bookings" className="w-full sm:w-auto">
          <Button className="w-full font-semibold shadow-sm bg-brand-brown hover:bg-[#4E2505] text-white dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-350 transition-colors duration-200">
            Xem lịch của tôi <ArrowRight className="size-4 ml-1 shrink-0" />
          </Button>
        </Link>
        
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full font-semibold border-slate-300 dark:border-slate-700">
            <Home className="size-4 mr-1 shrink-0" /> Quay về trang chủ
          </Button>
        </Link>
      </section>
    </div>
  );
};

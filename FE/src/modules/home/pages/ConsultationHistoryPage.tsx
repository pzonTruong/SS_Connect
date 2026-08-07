import { useEffect, useState } from 'react';
import { History, Calendar, Clock, Video, CheckCircle, Star, FileText } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatTimeRange } from '@/shared/lib/utils';
import { ReviewModal } from '../components/ReviewModal';

interface Expert {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
}

interface Booking {
  _id: string;
  expertId: Expert;
  studentName: string;
  bookingType: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  meetingLink?: string;
  goals: string;
  issues: string;
  status: 'completed' | 'cancelled_student' | 'cancelled_expert' | 'no_show';
  postConsultationNotes?: string;
  isReviewed?: boolean;
}

export const ConsultationHistoryPage = () => {
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    http.get('/bookings/my-bookings')
      .then((res) => {
        // Filter history statuses only
        const historyList = (res.data as Booking[]).filter((b) =>
          ['completed', 'cancelled_student', 'cancelled_expert', 'no_show'].includes(b.status)
        );
        setHistoryBookings(historyList);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = historyBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 font-semibold uppercase text-[10px]">Đã hoàn thành</Badge>;
      case 'cancelled_student':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 dark:bg-neutral-900 font-semibold uppercase text-[10px]">Học viên hủy</Badge>;
      case 'cancelled_expert':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 dark:bg-neutral-900 font-semibold uppercase text-[10px]">Chuyên gia hủy</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20 font-semibold uppercase text-[10px]">Vắng mặt</Badge>;
      default:
        return <Badge variant="outline" className="font-semibold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="size-6 text-primary" /> Lịch Sử Tư Vấn Chi Tiết
        </h1>
        <p className="text-sm text-muted-foreground">
          Tra cứu toàn bộ lịch sử các buổi tư vấn đã qua, xem lại nhận xét từ chuyên gia và phản hồi của bạn.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {[
          { key: 'all', label: 'Tất cả lịch sử' },
          { key: 'completed', label: 'Đã hoàn thành' },
          { key: 'cancelled_student', label: 'Học viên hủy' },
          { key: 'cancelled_expert', label: 'Chuyên gia hủy' },
          { key: 'no_show', label: 'Vắng mặt' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-[180px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-card space-y-2">
          <p className="text-muted-foreground text-sm">Không có buổi tư vấn nào trong lịch sử.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((booking) => {
            const exp = booking.expertId;

            return (
              <Card key={booking._id} className="border hover:shadow-md transition-all duration-300 overflow-hidden bg-card">
                <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/10 border-b p-4 flex flex-row flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {exp?.avatarUrl ? (
                      <div className="size-10 rounded-full overflow-hidden border shrink-0">
                        <img src={exp.avatarUrl} alt={exp.displayName} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                        {(exp?.displayName || 'C').slice(0, 1)}
                      </div>
                    )}

                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
                        Chuyên gia: {exp?.displayName || 'Cố vấn MindX'}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        {exp?.title || 'Cố vấn Student Success'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed border-b pb-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Thời gian tư vấn:</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                        <Calendar className="size-3.5 text-primary" />
                        <span>Ngày {booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                        <Clock className="size-3.5 text-primary" />
                        <span>Lúc {formatTimeRange(booking.time)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Chủ đề & Hình thức:</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{booking.bookingType}</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                        <Video className="size-3.5 text-primary" />
                        <span className="capitalize">{booking.mode === 'online' ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 uppercase tracking-wider">Mục tiêu & Vấn đề:</p>
                      <p className="text-muted-foreground truncate max-w-[220px]"><b>Mục tiêu:</b> {booking.goals}</p>
                      <p className="text-muted-foreground truncate max-w-[220px]"><b>Khó khăn:</b> {booking.issues}</p>
                    </div>
                  </div>

                  {/* Post consultation notes from expert */}
                  {booking.postConsultationNotes && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-950/40 rounded-xl p-3.5 text-xs space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <FileText className="size-3.5 text-emerald-500" /> Nhận xét & Đóng góp từ chuyên gia:
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 italic font-medium leading-relaxed">
                        "{booking.postConsultationNotes}"
                      </p>
                    </div>
                  )}

                  {/* Review action for completed sessions */}
                  {booking.status === 'completed' && (
                    <div className="flex justify-end pt-2">
                      {booking.isReviewed ? (
                        <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 font-semibold text-xs py-1 px-3 flex items-center gap-1.5">
                          <CheckCircle className="size-3.5" /> Đã gửi đánh giá
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setReviewBooking(booking)}
                          className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        >
                          <Star className="size-3.5 mr-1.5 fill-white" /> Đánh giá buổi tư vấn
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking._id}
          expertName={reviewBooking.expertId?.displayName || 'Chuyên gia'}
          bookingType={reviewBooking.bookingType}
          onSuccess={fetchHistory}
        />
      )}
    </div>
  );
};

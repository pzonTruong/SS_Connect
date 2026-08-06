import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { formatTimeRange } from '@/shared/lib/utils';

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
  studentEmail: string;
  bookingType: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  meetingLink?: string;
  goals: string;
  issues: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled_student' | 'cancelled_expert' | 'no_show' | 'reschedule_needed';
  postConsultationNotes?: string;
}

export const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    http.get('/bookings/my-bookings')
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể tải danh sách lịch hẹn');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn tư vấn này?');
    if (!confirmCancel) return;

    try {
      await http.put(`/bookings/${bookingId}/status`, { status: 'cancelled_student' });
      toast.success('Hủy lịch hẹn thành công');
      fetchBookings(); // Reload list
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Đã xảy ra lỗi khi hủy lịch');
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 font-semibold uppercase text-[10px]">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 font-semibold uppercase text-[10px]">Đã xác nhận</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 font-semibold uppercase text-[10px]">Đã hoàn thành</Badge>;
      case 'cancelled_student':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-500 font-semibold uppercase text-[10px]">Học viên hủy</Badge>;
      case 'cancelled_expert':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-500 font-semibold uppercase text-[10px]">Chuyên gia hủy</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20 dark:text-red-400 font-semibold uppercase text-[10px]">Vắng mặt</Badge>;
      case 'reschedule_needed':
        return <Badge variant="outline" className="border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 font-semibold uppercase text-[10px]">Cần đổi lịch</Badge>;
      default:
        return <Badge variant="outline" className="font-semibold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Lịch Hẹn Của Tôi</h1>
        <p className="text-sm text-muted-foreground">Theo dõi danh sách các buổi tư vấn đã đặt và xem ghi chú từ chuyên gia.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-[200px]" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-card space-y-4">
          <p className="text-muted-foreground text-sm">Bạn chưa đăng ký lịch hẹn tư vấn nào.</p>
          <Button onClick={() => window.location.href = '/experts'} size="sm">
            Đặt lịch ngay bây giờ
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const exp = booking.expertId;
            const canCancel = ['pending', 'confirmed'].includes(booking.status);

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
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Chuyên gia: {exp?.displayName || exp?.email?.split('@')[0]}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        {exp?.title || 'Cố vấn Student Success'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed border-b pb-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lịch hẹn:</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="size-3.5 text-primary" />
                        <span>Ngày {booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Clock className="size-3.5 text-primary" />
                        <span>Lúc {formatTimeRange(booking.time)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chủ đề & Hình thức:</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.bookingType}</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Video className="size-3.5 text-primary" />
                        <span className="capitalize">{booking.mode === 'online' ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tham gia cuộc họp:</p>
                      {booking.mode === 'online' && booking.status !== 'cancelled_student' && booking.status !== 'cancelled_expert' ? (
                        <a 
                          href={booking.meetingLink || 'https://meet.google.com/abc-defg-hij'} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block truncate max-w-[200px]"
                        >
                          {booking.meetingLink || 'https://meet.google.com/abc-defg-hij'}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium">Gặp tại văn phòng MindX</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400 shrink-0 uppercase tracking-wider">Mục tiêu:</span>
                      <span className="text-muted-foreground">{booking.goals}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400 shrink-0 uppercase tracking-wider">Vấn đề:</span>
                      <span className="text-muted-foreground">{booking.issues}</span>
                    </div>
                  </div>

                  {/* Post consultation notes */}
                  {booking.postConsultationNotes && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-950/40 rounded-lg p-3 text-xs space-y-1 animate-fadeIn">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle className="size-3.5 text-emerald-500" /> Nhận xét từ chuyên gia sau buổi tư vấn:
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 italic font-medium leading-relaxed">
                        "{booking.postConsultationNotes}"
                      </p>
                    </div>
                  )}

                  {canCancel && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-xs text-destructive border-destructive hover:bg-destructive/10 font-semibold"
                      >
                        <XCircle className="size-3.5 mr-1" /> Hủy lịch hẹn
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

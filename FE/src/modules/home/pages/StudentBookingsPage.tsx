import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, Info, RefreshCw, AlertTriangle } from 'lucide-react';
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
  availableSlots?: { date: string; time: string; booked: boolean }[];
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

  // Reschedule form state (for responding to expert's reschedule request)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newMode, setNewMode] = useState<'online' | 'offline'>('online');
  const [expertSlots, setExpertSlots] = useState<{ date: string; time: string; booked: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const getDaysFromToday = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

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
    const confirmCancel = window.confirm(
      'Bạn có chắc chắn muốn hủy lịch hẹn tư vấn này?\n\nLưu ý: Học viên chỉ được đặt lại tối đa 1 lần sau khi hủy lịch.'
    );
    if (!confirmCancel) return;

    try {
      await http.put(`/bookings/${bookingId}/status`, { status: 'cancelled_student' });
      toast.success('Hủy lịch hẹn thành công');
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Đã xảy ra lỗi khi hủy lịch');
    }
  };

  const handleOpenReschedule = async (booking: Booking) => {
    setReschedulingId(booking._id);
    setNewDate('');
    setNewTime('09:00');
    setNewMode(booking.mode);
    setLoadingSlots(true);
    try {
      const res = await http.get(`/profile/expert/${booking.expertId._id}`);
      setExpertSlots(res.data?.availableSlots ?? []);
    } catch {
      setExpertSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmitReschedule = async (bookingId: string) => {
    if (!newDate || !newTime) {
      toast.error('Vui lòng chọn ngày và giờ mới');
      return;
    }
    try {
      await http.put(`/bookings/${bookingId}/reschedule`, { date: newDate, time: newTime, mode: newMode });
      toast.success('Đã gửi yêu cầu đổi lịch thành công! Chuyên gia sẽ xác nhận sớm nhất có thể.');
      setReschedulingId(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể gửi yêu cầu đổi lịch');
    }
  };

  // Get available (not booked) slots for a given date
  const availableDates = [...new Set(
    expertSlots.filter(s => !s.booked).map(s => s.date)
  )].sort();
  const availableTimesForDate = expertSlots
    .filter(s => s.date === newDate && !s.booked)
    .map(s => s.time)
    .sort();

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
        return <Badge variant="outline" className="border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 font-semibold uppercase text-[10px] animate-pulse">⚠ Cần đổi lịch</Badge>;
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

      {/* Guidelines Alert Banner */}
      <div className="bg-slate-50 dark:bg-slate-900 border rounded-2xl p-4 flex gap-3 text-xs text-muted-foreground leading-relaxed shadow-sm">
        <Info className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">Quy định và Điều kiện thay đổi lịch hẹn:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><b>Đặt lịch mới</b>: Phải đặt trước ngày hẹn tối thiểu <b>3 ngày</b>.</li>
            <li><b>Đổi lịch hẹn</b>: Được phép đổi sang khung giờ khác tối thiểu <b>2 ngày</b> trước giờ hẹn cũ.</li>
            <li><b>Hủy lịch hẹn</b>: Được phép hủy tối thiểu <b>1 ngày</b> trước giờ hẹn.</li>
            <li><b>Chính sách đặt lại</b>: Nếu học viên tự hủy lịch, chỉ được đặt lại <b>tối đa 1 lần nữa</b> (sau đó tài khoản sẽ tạm khóa đặt lịch và cần liên hệ hỗ trợ).</li>
          </ul>
        </div>
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
            const daysDiff = getDaysFromToday(booking.date);

            const isRescheduleNeeded = booking.status === 'reschedule_needed';
            const isBookingActive = ['pending', 'confirmed'].includes(booking.status);
            const canCancel = (isBookingActive || isRescheduleNeeded) && daysDiff >= 1;
            const canReschedule = isBookingActive && daysDiff >= 2;
            const isReschedulingThis = reschedulingId === booking._id;

            return (
              <Card key={booking._id} className={`border hover:shadow-md transition-all duration-300 overflow-hidden bg-card ${isRescheduleNeeded ? 'ring-2 ring-purple-400/60' : ''}`}>
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
                  {/* Expert reschedule request banner */}
                  {isRescheduleNeeded && (
                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-800 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="size-5 text-purple-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
                          Chuyên gia đã yêu cầu đổi lịch hẹn này
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-400">
                          Vui lòng chọn một khung giờ mới phù hợp từ lịch của chuyên gia, hoặc hủy lịch hẹn nếu không thể sắp xếp.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed border-b pb-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lịch hẹn hiện tại:</p>
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
                      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chủ đề & Hình thức:</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{booking.bookingType}</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
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

                  {/* ─── Reschedule inline form (for reschedule_needed status) ─── */}
                  {isRescheduleNeeded && (
                    <div className="border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 space-y-4 bg-purple-50/50 dark:bg-purple-950/10">
                      {!isReschedulingThis ? (
                        <div className="flex flex-wrap justify-end gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleOpenReschedule(booking)}
                            className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <RefreshCw className="size-3.5 mr-1.5" /> Chọn lịch mới
                          </Button>
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold"
                            >
                              <XCircle className="size-3.5 mr-1" /> Hủy lịch hẹn
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Chọn lịch mới:</p>
                          {loadingSlots ? (
                            <p className="text-xs text-muted-foreground animate-pulse">Đang tải lịch trống của chuyên gia...</p>
                          ) : availableDates.length === 0 ? (
                            <p className="text-xs text-red-500 font-semibold">Hiện tại chuyên gia không có lịch trống. Vui lòng liên hệ hỗ trợ hoặc hủy lịch.</p>
                          ) : (
                            <>
                              {/* Date picker */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày tư vấn mới</label>
                                <div className="flex flex-wrap gap-2">
                                  {availableDates.map(d => (
                                    <button
                                      key={d}
                                      onClick={() => { setNewDate(d); setNewTime(''); }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        newDate === d
                                          ? 'bg-purple-600 text-white border-purple-600'
                                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Time picker */}
                              {newDate && (
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khung giờ</label>
                                  {availableTimesForDate.length === 0 ? (
                                    <p className="text-xs text-red-400">Không còn giờ trống cho ngày này</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {availableTimesForDate.map(t => (
                                        <button
                                          key={t}
                                          onClick={() => setNewTime(t)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            newTime === t
                                              ? 'bg-purple-600 text-white border-purple-600'
                                              : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                                          }`}
                                        >
                                          {formatTimeRange(t)}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Mode picker */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hình thức</label>
                                <div className="flex gap-2">
                                  {(['online', 'offline'] as const).map(m => (
                                    <button
                                      key={m}
                                      onClick={() => setNewMode(m)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                                        newMode === m
                                          ? 'bg-purple-600 text-white border-purple-600'
                                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                                      }`}
                                    >
                                      {m === 'online' ? 'Online' : 'Offline'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-purple-200 dark:border-purple-800/40">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReschedulingId(null)}
                              className="text-xs font-semibold"
                            >
                              Huỷ bỏ
                            </Button>
                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold"
                              >
                                <XCircle className="size-3.5 mr-1" /> Hủy lịch hẹn
                              </Button>
                            )}
                            <Button
                              size="sm"
                              disabled={!newDate || !newTime}
                              onClick={() => handleSubmitReschedule(booking._id)}
                              className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                            >
                              <RefreshCw className="size-3.5 mr-1.5" /> Xác nhận đổi lịch
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Normal active booking actions ─── */}
                  {isBookingActive && (
                    <div className="flex justify-end gap-3 pt-3 border-t">
                      {canReschedule ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/experts/${exp?._id}?rescheduleBookingId=${booking._id}`}
                          className="text-xs text-primary border-primary/30 hover:bg-primary/5 font-semibold"
                        >
                          <RefreshCw className="size-3.5 mr-1" /> Đổi lịch hẹn
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="text-xs opacity-50 cursor-not-allowed font-semibold"
                          title="Chỉ được đổi lịch trước tối thiểu 2 ngày"
                        >
                          <RefreshCw className="size-3.5 mr-1" /> Đổi lịch (Quá hạn)
                        </Button>
                      )}

                      {canCancel ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 font-semibold"
                        >
                          <XCircle className="size-3.5 mr-1" /> Hủy lịch hẹn
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="text-xs opacity-50 cursor-not-allowed font-semibold"
                          title="Chỉ được hủy lịch trước tối thiểu 1 ngày"
                        >
                          <XCircle className="size-3.5 mr-1" /> Hủy lịch (Quá hạn)
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
    </div>
  );
};

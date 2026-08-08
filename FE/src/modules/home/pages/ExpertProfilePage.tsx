import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Award, Compass, Heart, Calendar, CheckCircle2, Clock, RefreshCw, Loader2, Star, MessageSquare } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { formatTimeRange, formatSlotDayOfWeek, formatSlotDayAndMonth } from '@/shared/lib/utils';

interface Timeslot {
  date: string;
  time: string;
  booked: boolean;
}

interface Review {
  _id: string;
  studentId?: { displayName?: string; avatarUrl?: string };
  rating: number;
  comment?: string;
  createdAt: string;
  bookingId?: { bookingType?: string };
}

interface Expert {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  experienceYears?: number;
  specialties?: string[];
  achievements?: string[];
  consultingStyle?: string;
  availableSlots?: Timeslot[];
  consultingType?: string[];
  ratingAverage?: number;
  reviewCount?: number;
}

export const ExpertProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const rescheduleBookingId = searchParams.get('rescheduleBookingId') || '';

  const [expert, setExpert] = useState<Expert | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Timeslot | null>(null);
  const [activeDate, setActiveDate] = useState<string>('');
  const [rescheduling, setRescheduling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    http.get(`/profile/experts/${id}`)
      .then((res) => {
        setExpert(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể tìm thấy thông tin chuyên gia');
      })
      .finally(() => setLoading(false));

    http.get(`/reviews/expert/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, [id]);

  const getDaysFromToday = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Group slots by date (Only show slots >= 3 days in advance)
  const slotsGroupedByDate: { [key: string]: Timeslot[] } = {};
  if (expert && expert.availableSlots) {
    expert.availableSlots.forEach((slot) => {
      if (getDaysFromToday(slot.date) >= 3) {
        if (!slotsGroupedByDate[slot.date]) {
          slotsGroupedByDate[slot.date] = [];
        }
        slotsGroupedByDate[slot.date].push(slot);
      }
    });
  }

  // Set initial activeDate
  useEffect(() => {
    const dates = Object.keys(slotsGroupedByDate).sort();
    if (dates.length > 0 && !activeDate) {
      setActiveDate(dates[0]);
    }
  }, [expert, slotsGroupedByDate, activeDate]);

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Đang tải hồ sơ chuyên gia...</div>;
  }

  if (!expert) {
    return (
      <div className="text-center py-20 border rounded-2xl bg-card space-y-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin chuyên gia này.</p>
        <Link to="/experts">
          <Button size="sm">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const handleReschedule = async (slot: Timeslot) => {
    setRescheduling(true);
    try {
      await http.put(`/bookings/${rescheduleBookingId}/reschedule`, {
        date: slot.date,
        time: slot.time
      });
      toast.success('Yêu cầu đổi lịch thành công! Vui lòng chờ chuyên gia xác nhận.');
      navigate('/my-bookings');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Đã xảy ra lỗi khi đổi lịch hẹn.');
    } finally {
      setRescheduling(false);
    }
  };

  const handleProceedBooking = () => {
    if (!selectedSlot) {
      toast.warning('Vui lòng chọn một khung giờ còn trống trước khi tiếp tục');
      return;
    }

    if (getDaysFromToday(selectedSlot.date) < 3) {
      toast.error('Ngày tư vấn được chọn phải đặt trước tối thiểu 3 ngày tính từ hôm nay.');
      return;
    }

    if (rescheduleBookingId) {
      handleReschedule(selectedSlot);
    } else {
      navigate(`/booking/${expert._id}?date=${selectedSlot.date}&time=${selectedSlot.time}`);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 pb-12">
      {/* Left panel: Info */}
      <div className="lg:col-span-8 space-y-6">
        {/* Main Profile Header */}
        <section className="bg-card rounded-2xl border p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
          <div className="relative size-28 sm:size-32 rounded-2xl overflow-hidden shrink-0 border bg-neutral-100 dark:bg-neutral-900 mx-auto sm:mx-0">
            <img
              src={expert.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
              alt={expert.displayName}
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="space-y-4 text-center sm:text-left flex-1">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{expert.displayName}</h1>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">{expert.title || 'SS Consultant'}</p>
              
              {/* Rating average badge */}
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-amber-500 pt-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span>{expert.ratingAverage ? expert.ratingAverage.toFixed(1) : '5.0'} / 5.0</span>
                <span className="text-muted-foreground font-normal">({expert.reviewCount || reviews.length} lượt đánh giá)</span>
              </div>

              {expert.experienceYears && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground font-medium pt-1">
                  <Briefcase className="size-4 text-slate-400" />
                  <span>{expert.experienceYears} năm kinh nghiệm tư vấn định hướng</span>
                </div>
              )}
            </div>

            {expert.specialties && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                {expert.specialties.map((spec) => (
                  <span key={spec} className="inline-flex text-[10px] font-bold bg-primary/10 text-primary py-0.5 px-2.5 rounded-full uppercase">
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bio & Details */}
        <section className="bg-card rounded-2xl border p-6 space-y-6 shadow-sm">
          {/* Bio */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight border-b pb-2 flex items-center gap-2">
              <Compass className="size-5 text-primary" /> Giới thiệu chuyên gia
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {expert.bio || 'Chuyên gia tư vấn định hướng phát triển nghề nghiệp cho học viên MindX.'}
            </p>
          </div>

          {/* Achievements */}
          {expert.achievements && expert.achievements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold tracking-tight border-b pb-2 flex items-center gap-2">
                <Award className="size-5 text-primary" /> Thành tựu nổi bật
              </h2>
              <ul className="space-y-2.5">
                {expert.achievements.map((ach, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Style & Mode */}
          <div className="grid gap-6 sm:grid-cols-2">
            {expert.consultingStyle && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="size-4 text-rose-400 fill-current" /> Phong cách tư vấn
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{expert.consultingStyle}</p>
              </div>
            )}
            
            {expert.consultingType && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="size-4 text-indigo-400" /> Hình thức & Địa điểm
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><b className="capitalize">{expert.consultingType.join(' / ')}</b></p>
                  <p className="text-slate-400">Online: Qua Google Meet / Zoom</p>
                  <p className="text-slate-400">Offline: Tại các cơ sở MindX</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Student Reviews Section */}
        <section className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight border-b pb-2 flex items-center gap-2">
            <MessageSquare className="size-5 text-primary" /> Đánh giá từ học viên ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">Chuyên gia chưa có đánh giá trực tiếp nào từ học viên.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="border-b last:border-0 pb-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span>{rev.studentId?.displayName || 'Học viên ẩn danh'}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">• {rev.bookingId?.bookingType || 'Tư vấn'}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right panel: Timeslots Selector Calendar */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="shadow-md border-primary/10 sticky top-24">
          <CardHeader className="bg-primary/5 border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="size-4.5 text-primary" /> Chọn lịch tư vấn rảnh
            </CardTitle>
            <CardDescription className="text-xs">
              Lựa chọn ngày và khung giờ để đăng ký tư vấn trực tiếp 1-1.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {rescheduleBookingId && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1 shadow-sm">
                <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <RefreshCw className="size-3.5 animate-spin" /> Đang thực hiện đổi lịch hẹn
                </p>
                <p className="opacity-90 leading-relaxed">
                  Chọn một khung giờ mới khả dụng của chuyên gia để thực hiện đổi lịch. Lịch hẹn cũ của bạn sẽ được giải phóng tự động sau khi đổi thành công.
                </p>
              </div>
            )}

            {Object.keys(slotsGroupedByDate).length === 0 ? (
              <p className="text-xs text-center py-8 text-muted-foreground">Hiện chưa có lịch rảnh nào khả dụng.</p>
            ) : (
              <div className="space-y-4">
                {/* Horizontal Date Selection Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-dashed">
                  {Object.keys(slotsGroupedByDate).sort().map((dateStr) => {
                    const isActive = activeDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setActiveDate(dateStr);
                          setSelectedSlot(null);
                        }}
                        className={`flex flex-col items-center shrink-0 min-w-[70px] py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-102 font-bold'
                            : 'bg-card text-foreground hover:bg-primary/5 hover:border-primary/20 border-border'
                        }`}
                      >
                        <span className="opacity-80 text-[10px]">{formatSlotDayOfWeek(dateStr)}</span>
                        <span className="text-xs font-bold mt-0.5">{formatSlotDayAndMonth(dateStr)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Timeslots Grid for the Active Date */}
                {activeDate && slotsGroupedByDate[activeDate] && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Chọn giờ tư vấn (Thời lượng: 2 tiếng):
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {slotsGroupedByDate[activeDate].map((slot) => {
                        const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={slot.booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all relative ${
                              slot.booked
                                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-800 cursor-not-allowed line-through opacity-60'
                                : isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20 font-bold'
                                : 'bg-card text-foreground hover:bg-primary/5 hover:border-primary/30 border-border hover:shadow-sm'
                            }`}
                          >
                            <Clock className={`size-3.5 mb-1 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                            <span>{formatTimeRange(slot.time)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSlot && (
              <div className="bg-neutral-50 dark:bg-neutral-900 border rounded-lg p-3 text-xs space-y-1.5 animate-fadeIn">
                <p className="text-slate-400">Khung giờ đã chọn:</p>
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary shrink-0" />
                  <span>{formatTimeRange(selectedSlot.time)} ngày {formatSlotDayAndMonth(selectedSlot.date)} ({formatSlotDayOfWeek(selectedSlot.date)})</span>
                </p>
              </div>
            )}

            <Button
              className="w-full font-semibold bg-brand-brown hover:bg-[#4E2505] text-white dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-300 transition-colors duration-200"
              onClick={handleProceedBooking}
              disabled={!selectedSlot || rescheduling}
            >
              {rescheduling && <Loader2 className="size-4 animate-spin mr-2 shrink-0" />}
              {rescheduleBookingId ? 'Xác nhận đổi lịch hẹn' : 'Tiến hành đặt lịch'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

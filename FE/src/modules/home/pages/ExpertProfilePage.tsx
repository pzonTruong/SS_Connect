import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, Award, Compass, Heart, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface Timeslot {
  date: string;
  time: string;
  booked: boolean;
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
}

export const ExpertProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Timeslot | null>(null);
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
  }, [id]);

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

  // Group slots by date
  const slotsGroupedByDate: { [key: string]: Timeslot[] } = {};
  if (expert.availableSlots) {
    expert.availableSlots.forEach((slot) => {
      if (!slotsGroupedByDate[slot.date]) {
        slotsGroupedByDate[slot.date] = [];
      }
      slotsGroupedByDate[slot.date].push(slot);
    });
  }

  // Format date string to display nicely, e.g. "Thứ 5, 06/08"
  const formatSlotDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[d.getDay()];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${dayName}, ${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  const handleProceedBooking = () => {
    if (!selectedSlot) {
      toast.warning('Vui lòng chọn một khung giờ còn trống trước khi tiếp tục');
      return;
    }
    navigate(`/booking/${expert._id}?date=${selectedSlot.date}&time=${selectedSlot.time}`);
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
              {expert.experienceYears && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground font-medium">
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
            {Object.keys(slotsGroupedByDate).length === 0 ? (
              <p className="text-xs text-center py-8 text-muted-foreground">Hiện chưa có lịch rảnh nào khả dụng.</p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {Object.keys(slotsGroupedByDate).sort().map((dateStr) => (
                  <div key={dateStr} className="space-y-1.5">
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      {formatSlotDate(dateStr)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-1.5">
                      {slotsGroupedByDate[dateStr].map((slot) => (
                        <button
                          key={slot.time}
                          disabled={slot.booked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`text-center text-xs py-1.5 rounded-lg border font-semibold transition-all ${
                            slot.booked
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-800 cursor-not-allowed line-through'
                              : selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-card text-foreground hover:bg-primary/10 hover:border-primary/40'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="bg-neutral-50 dark:bg-neutral-900 border rounded-lg p-3 text-xs space-y-1 animate-fadeIn">
                <p className="text-slate-400">Khung giờ đã chọn:</p>
                <p className="font-bold text-primary">
                  {selectedSlot.time} ngày {selectedSlot.date}
                </p>
              </div>
            )}

            <Button
              className="w-full font-semibold bg-brand-brown hover:bg-[#4E2505] text-white dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-300 transition-colors duration-200"
              onClick={handleProceedBooking}
              disabled={!selectedSlot}
            >
              Tiến hành đặt lịch
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

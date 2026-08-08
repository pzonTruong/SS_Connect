import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Mail, Phone, BookOpen, GraduationCap, Target, HelpCircle, Link as LinkIcon, Compass, FileText, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { formatTimeRange } from '@/shared/lib/utils';
import { http } from '@/shared/api/http';
import { authApi } from '@/modules/auth/api/auth.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

const bookingSchema = z.object({
  studentName: z.string().min(1, 'Họ tên là bắt buộc'),
  studentEmail: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  studentPhone: z.string().min(8, 'Số điện thoại tối thiểu 8 số'),
  course: z.string().min(1, 'Khóa học là bắt buộc'),
  major: z.string().min(1, 'Chuyên ngành/ngành học là bắt buộc'),
  goals: z.string().min(10, 'Mục tiêu tư vấn tối thiểu 10 ký tự'),
  issues: z.string().min(10, 'Vấn đề đang gặp tối thiểu 10 ký tự'),
  cvLink: z.string().url('Link phải hợp lệ').or(z.literal('')).optional(),
  bookingType: z.string().min(1, 'Loại buổi tư vấn là bắt buộc'),
  mode: z.enum(['online', 'offline']),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof bookingSchema>;

const BOOKING_TYPES = [
  'Tư vấn sửa CV',
  'Tư vấn định hướng nghề nghiệp',
  'Tư vấn tìm job phù hợp',
  'Tư vấn portfolio/GitHub/LinkedIn',
  'Tư vấn chuẩn bị phỏng vấn',
  'Tư vấn lộ trình học thêm',
  'Tư vấn sau khi fail phỏng vấn'
];

interface Expert {
  _id: string;
  displayName: string;
  email: string;
  title?: string;
  availableSlots?: {
    date: string;
    time: string;
    booked: boolean;
  }[];
}

export const BookingPage = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedTime, setSelectedTime] = useState(searchParams.get('time') || '');

  const [expert, setExpert] = useState<Expert | null>(null);
  const [loadingExpert, setLoadingExpert] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Student constraints state
  const [cancellationWarnings, setCancellationWarnings] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Prevent duplicate redirect alerts in development Strict Mode double-render
  const redirectingRef = useRef(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      mode: 'online',
      bookingType: 'Tư vấn sửa CV'
    }
  });

  // Validate selectedDate is at least 3 days in advance
  const getDaysFromToday = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };
  const isDateValid = !selectedDate || getDaysFromToday(selectedDate) >= 3;

  useEffect(() => {
    if (!expertId) return;

    // Fetch Expert info
    setLoadingExpert(true);
    http.get(`/profile/experts/${expertId}`)
      .then((res) => {
        setExpert(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không tìm thấy thông tin chuyên gia');
      })
      .finally(() => setLoadingExpert(false));

    // Pre-populate student info from logged-in session and fetch cancellation limits
    authApi.getMe()
      .then((res) => {
        const u = res.data;
        if (u) {
          if (u.role !== 'user') {
            if (!redirectingRef.current) {
              redirectingRef.current = true;
              toast.error('Chỉ tài khoản học viên mới được phép đặt lịch hẹn tư vấn.');
              navigate('/experts');
            }
            return;
          }
          setValue('studentName', u.displayName || '');
          setValue('studentEmail', u.email || '');
          setValue('studentPhone', u.phone || '');
          setCancellationWarnings(u.cancellationWarnings || 0);
          setIsBlocked(u.isBlockedFromBooking || (u.cancellationWarnings && u.cancellationWarnings >= 2) || false);
        }
      })
      .catch(() => {});
  }, [expertId, setValue, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Khung giờ hoặc ngày tư vấn chưa được lựa chọn. Vui lòng quay lại hồ sơ chuyên gia.');
      return;
    }

    if (isBlocked) {
      toast.error('Tài khoản của bạn đã bị khóa đặt lịch do hủy lịch quá giới hạn.');
      return;
    }

    if (!isDateValid) {
      toast.error('Ngày tư vấn đã chọn phải đặt trước tối thiểu 3 ngày.');
      return;
    }

    setSubmitting(true);
    try {
      await http.post('/bookings', {
        ...values,
        expertId,
        date: selectedDate,
        time: selectedTime
      });

      toast.success('Đặt lịch hẹn thành công!');
      navigate(`/booking-success?date=${selectedDate}&time=${selectedTime}&expertName=${encodeURIComponent(expert?.displayName || '')}&mode=${values.mode}&expertId=${expertId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Đã xảy ra lỗi khi đặt lịch hẹn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  });

  if (loadingExpert) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse">Đang tải biểu mẫu đăng ký đặt lịch...</div>;
  }

  if (!expert) {
    return (
      <div className="text-center py-20 border rounded-2xl bg-card space-y-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin chuyên gia cố vấn này.</p>
        <Link to="/experts">
          <Button size="sm">Xem danh sách chuyên gia</Button>
        </Link>
      </div>
    );
  }

  // Group slots by date (Only show slots >= 3 days in advance)
  const slotsGroupedByDate: { [key: string]: any[] } = {};
  if (expert && expert.availableSlots) {
    expert.availableSlots.forEach((slot: any) => {
      if (getDaysFromToday(slot.date) >= 3) {
        if (!slotsGroupedByDate[slot.date]) {
          slotsGroupedByDate[slot.date] = [];
        }
        slotsGroupedByDate[slot.date].push(slot);
      }
    });
  }
  const availableDates = Object.keys(slotsGroupedByDate).sort();

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Selected Slot Header info */}
      <section className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 shadow-inner">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Thông tin lịch hẹn</p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-900 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>Ngày: {selectedDate || 'Chưa chọn'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              <span>Giờ: {selectedTime ? formatTimeRange(selectedTime) : 'Chưa chọn'} (Thời lượng: 2 tiếng)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="size-4 text-primary animate-pulse" />
              <span>
                Chuyên gia:{' '}
                <Link to={`/experts/${expert._id}`} className="text-primary hover:underline hover:text-primary-hover font-bold">
                  {expert.displayName}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Box for 1 cancellation warning */}
      {!isBlocked && cancellationWarnings === 1 && (
        <div className="bg-amber-55/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900 rounded-2xl p-5 text-amber-800 dark:text-amber-300 space-y-2 shadow-sm">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="size-4.5 text-amber-500 shrink-0" /> Cảnh báo giới hạn đặt lịch
          </h4>
          <p className="text-xs leading-relaxed opacity-90">
            Bạn đã hủy lịch tư vấn trước đó 1 lần. Theo quy chế, sau khi hủy, bạn chỉ có <b>tối đa 1 lần đặt lại lịch</b>. 
            Nếu bạn tiếp tục hủy buổi tư vấn này, hệ thống sẽ tự động <b>khóa quyền đặt lịch</b> của bạn.
          </p>
        </div>
      )}

      {/* Form or Blocked State */}
      {isBlocked ? (
        <Card className="shadow-lg border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardHeader className="bg-destructive/10 border-b border-destructive/10 pb-4">
            <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <XCircle className="size-5 shrink-0" /> Quyền đặt lịch của bạn hiện đã bị khóa
            </CardTitle>
            <CardDescription className="text-destructive/80 font-medium">
              Đã vượt quá số lần tự hủy lịch cho phép (tối đa 1 lần đặt lại sau khi hủy).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nhằm đảm bảo thời gian hỗ trợ công bằng cho tất cả học viên và tối ưu hóa thời gian của các chuyên gia tư vấn, Student Success Hub áp dụng giới hạn đặt lại lịch sau khi hủy. Tài khoản của bạn hiện đang tạm khóa tính năng này.
            </p>
            <div className="bg-card border rounded-xl p-4 text-xs space-y-2 text-muted-foreground">
              <p className="font-bold text-foreground">Để được hỗ trợ mở khóa và xếp lịch hẹn:</p>
              <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                <li>Vui lòng liên hệ trực tiếp với Cán bộ hỗ trợ học viên (Student Success) tại cơ sở MindX của bạn.</li>
                <li>Hoặc gửi thông tin giải trình về lý do bất khả kháng tới email <span className="font-bold text-primary">support@mindx.edu.vn</span> để bộ phận kỹ thuật hỗ trợ kích hoạt lại tài khoản.</li>
              </ul>
            </div>
            <div className="pt-2 flex gap-4">
              <Link to="/experts" className="flex-1">
                <Button variant="outline" className="w-full font-semibold text-xs">Quay lại danh sách chuyên gia</Button>
              </Link>
              <Link to="/my-bookings" className="flex-1">
                <Button variant="default" className="w-full font-semibold text-xs bg-brand-navy text-white hover:bg-slate-900">Xem lịch hẹn của tôi</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="size-5.5 text-primary" /> Điền thông tin đăng ký
            </CardTitle>
            <CardDescription>
              Cung cấp đầy đủ thông tin để chuyên gia hỗ trợ bạn đạt kết quả tư vấn tốt nhất.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Slots Section */}
              <div id="slots-section" className="bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-sm text-primary flex items-center gap-1.5 border-b pb-2">
                  <Calendar className="size-4.5 text-primary" /> Chọn Ngày và Khung Giờ Tư Vấn
                </h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateSelect" className="font-semibold">Ngày Tư Vấn</Label>
                    <select
                      id="dateSelect"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">-- Chọn ngày --</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSelect" className="font-semibold">Khung Giờ Tư Vấn</Label>
                    <select
                      id="timeSelect"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDate}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">-- Chọn giờ --</option>
                      {selectedDate &&
                        slotsGroupedByDate[selectedDate]?.map((slot: any) => (
                          <option key={slot.time} value={slot.time} disabled={slot.booked}>
                            {formatTimeRange(slot.time)} {slot.booked ? '(Đã được đặt)' : '(Còn trống)'}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {!isDateValid && selectedDate && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-fadeIn">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>Ngày tư vấn đã chọn phải đặt trước tối thiểu 3 ngày tính từ hôm nay. Vui lòng chọn ngày khác.</span>
                  </div>
                )}
              </div>

              {/* Student metadata */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentName" className="font-semibold">Họ và tên của bạn</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="studentName" className="pl-9" placeholder="Nguyễn Văn A" {...register('studentName')} />
                  </div>
                  {errors.studentName && <p className="text-xs text-destructive">{errors.studentName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentEmail" className="font-semibold">Địa chỉ Email nhận thông báo</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="studentEmail" className="pl-9" type="email" placeholder="student@example.com" {...register('studentEmail')} />
                  </div>
                  {errors.studentEmail && <p className="text-xs text-destructive">{errors.studentEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentPhone" className="font-semibold">Số điện thoại liên hệ</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="studentPhone" className="pl-9" placeholder="09xxxxxxxx" {...register('studentPhone')} />
                  </div>
                  {errors.studentPhone && <p className="text-xs text-destructive">{errors.studentPhone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="font-semibold">Khóa học hiện tại ở MindX</Label>
                  <div className="relative">
                    <BookOpen className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="course" className="pl-9" placeholder="Vd: Web Fullstack K90" {...register('course')} />
                  </div>
                  {errors.course && <p className="text-xs text-destructive">{errors.course.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major" className="font-semibold">Chuyên ngành / Ngành học của bạn</Label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="major" className="pl-9" placeholder="Vd: Công nghệ thông tin / Kinh tế đối ngoại" {...register('major')} />
                </div>
                {errors.major && <p className="text-xs text-destructive">{errors.major.message}</p>}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bookingType" className="font-semibold">Chủ đề cần tư vấn</Label>
                  <select
                    id="bookingType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('bookingType')}
                  >
                    {BOOKING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.bookingType && <p className="text-xs text-destructive">{errors.bookingType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode" className="font-semibold">Hình thức gặp mặt</Label>
                  <select
                    id="mode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('mode')}
                  >
                    <option value="online">Online (Làm việc qua Google Meet)</option>
                    <option value="offline">Offline (Gặp trực tiếp tại cơ sở MindX)</option>
                  </select>
                  {errors.mode && <p className="text-xs text-destructive">{errors.mode.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="font-semibold">Mục tiêu bạn muốn đạt được sau buổi tư vấn</Label>
                <div className="relative">
                  <Target className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Textarea id="goals" className="pl-9 min-h-[80px]" placeholder="Chi tiết mong muốn của bạn..." {...register('goals')} />
                </div>
                {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issues" className="font-semibold">Các vấn đề cụ thể bạn đang gặp phải cần chuyên gia gỡ rối</Label>
                <div className="relative">
                  <HelpCircle className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Textarea id="issues" className="pl-9 min-h-[80px]" placeholder="Các khó khăn hiện tại..." {...register('issues')} />
                </div>
                {errors.issues && <p className="text-xs text-destructive">{errors.issues.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvLink" className="font-semibold">Đường dẫn CV / Portfolio / LinkedIn (nếu có)</Label>
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="cvLink" className="pl-9" placeholder="https://drive.google.com/... hoặc https://linkedin.com/in/..." {...register('cvLink')} />
                </div>
                {errors.cvLink && <p className="text-xs text-destructive">{errors.cvLink.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-semibold">Ghi chú thêm cho chuyên gia (nếu có)</Label>
                <Textarea id="notes" className="min-h-[80px]" placeholder="Lời nhắn hoặc lưu ý nhỏ..." {...register('notes')} />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full font-bold text-white bg-brand-brown hover:bg-[#4E2505] dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-300 shadow-md py-6 mt-4 transition-colors duration-200"
              >
                {submitting && <Loader2 className="size-4 animate-spin shrink-0" />}
                Xác nhận Đăng ký & Gửi Lịch Hẹn
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

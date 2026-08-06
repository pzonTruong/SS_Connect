import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Mail, Phone, MapPin, Copy, Check, 
  MessageSquare, Send, ChevronDown, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

// Validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Tên phải chứa ít nhất 2 ký tự' }),
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  role: z.enum(['student', 'parent', 'expert', 'other']),
  subject: z.string().min(5, { message: 'Tiêu đề phải chứa ít nhất 5 ký tự' }),
  message: z.string().min(10, { message: 'Nội dung tin nhắn phải chứa ít nhất 10 ký tự' })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactPage = () => {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'student',
      subject: '',
      message: ''
    }
  });

  const copyEmail = () => {
    navigator.clipboard.writeText('contact@studentsuccess.edu.vn');
    setCopied(true);
    toast.success('Đã sao chép địa chỉ email vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Submitted Contact Form Data:', data);
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Gửi lời nhắn thành công! Đội ngũ liên hệ sẽ phản hồi bạn sớm nhất.');
  };

  const handleResetForm = () => {
    reset();
    setIsSubmitted(false);
  };

  const faqData = [
    {
      q: 'Làm thế nào để tôi đặt lịch hẹn với một chuyên gia?',
      a: 'Bạn chỉ cần truy cập trang "Experts", tìm kiếm chuyên gia phù hợp với nhu cầu của mình (học thuật, tâm lý, hướng nghiệp) và bấm nút "Đặt lịch". Hệ thống sẽ hỗ trợ bạn chọn khung giờ trống và xác nhận lịch hẹn tức thì.'
    },
    {
      q: 'Các buổi tham vấn và hỗ trợ có mất phí không?',
      a: 'Tất cả dịch vụ tư vấn và hỗ trợ học tập tại Student Success Connect đều hoàn toàn MIỄN PHÍ dành riêng cho sinh viên của nhà trường.'
    },
    {
      q: 'Tôi có thể hủy hoặc thay đổi thời gian lịch hẹn không?',
      a: 'Có. Bạn có thể vào phần "Dashboard" cá nhân (Mục "My Bookings"), chọn lịch hẹn muốn đổi và nhấn nút "Hủy lịch" hoặc "Đổi giờ" ít nhất 2 tiếng trước giờ hẹn bắt đầu.'
    },
    {
      q: 'Làm sao để tôi đăng ký trở thành một chuyên gia (Expert)?',
      a: 'Chúng tôi luôn chào đón các cựu sinh viên xuất sắc, giảng viên và các chuyên gia trong ngành. Bạn có thể đăng ký tài khoản mới và chọn vai trò là "Expert", sau đó điền thông tin hồ sơ và đợi đội ngũ quản trị viên kiểm duyệt, kích hoạt.'
    },
    {
      q: 'Tôi có thể liên hệ trực tiếp với văn phòng hỗ trợ ở đâu?',
      a: 'Văn phòng Student Success Department đặt tại Tầng 2, Tòa nhà A1, Đại học Giao thông Vận tải. Thời gian làm việc từ Thứ Hai đến Thứ Sáu (8:00 - 17:00).'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Header Section */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-brand-blue dark:text-sky-400 border border-slate-100 dark:border-slate-800">
          <Sparkles className="size-3.5" />
          <span>Liên hệ với chúng tôi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Kết Nối Với Chúng Tôi
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Đội ngũ Student Success luôn sẵn sàng giải đáp mọi thắc mắc và đồng hành cùng bạn trên con đường phát triển. Hãy gửi câu hỏi hoặc ghé thăm văn phòng của chúng tôi.
        </p>
      </section>

      {/* Grid: Info Cards and Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-white">
            Thông tin liên hệ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Email Card (Interactive copy) */}
            <Card 
              onClick={copyEmail}
              className="group cursor-pointer border-slate-100 dark:border-slate-850 hover:border-brand-blue/30 dark:hover:border-sky-500/30 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900/40"
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:bg-brand-blue group-hover:text-white dark:group-hover:bg-sky-500 dark:group-hover:text-slate-950 transition-colors duration-300 text-slate-600 dark:text-slate-300">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white select-all">
                    contact@studentsuccess.edu.vn
                  </p>
                  <p className="text-xs text-slate-500">Bấm để sao chép địa chỉ email</p>
                </div>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card className="border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow bg-white dark:bg-slate-900/40">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                  <Phone className="size-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điện thoại</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    +84 (024) 3766 4078
                  </p>
                  <p className="text-xs text-slate-500">Thứ Hai - Thứ Sáu, 8:00 - 17:00</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow bg-white dark:bg-slate-900/40">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300">
                  <MapPin className="size-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Văn phòng</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Phòng 202, Nhà A1
                  </p>
                  <p className="text-xs text-slate-500">Đại học Giao thông Vận tải, Cầu Giấy, Hà Nội</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <Card className="border-slate-100 dark:border-slate-850 shadow-md bg-white dark:bg-slate-900/30 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
                      <MessageSquare className="size-5 text-brand-blue dark:text-sky-400" />
                      Gửi tin nhắn cho chúng tôi
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Chúng tôi sẽ tiếp nhận và trả lời bạn qua email trong vòng 24 giờ làm việc.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Họ và tên *</label>
                      <Input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        {...register('name')}
                        className={`rounded-xl border ${errors.name ? 'border-destructive focus-visible:ring-destructive/20 focus:border-destructive' : 'border-slate-200 dark:border-slate-850'}`}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email của bạn *</label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...register('email')}
                        className={`rounded-xl border ${errors.email ? 'border-destructive focus-visible:ring-destructive/20 focus:border-destructive' : 'border-slate-200 dark:border-slate-850'}`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    {/* Role selector */}
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bạn là *</label>
                      <select
                        {...register('role')}
                        className={`w-full h-10 px-3 text-sm rounded-xl border bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ring ${errors.role ? 'border-destructive' : 'border-slate-200 dark:border-slate-850'}`}
                      >
                        <option value="student" className="bg-white dark:bg-slate-900">Sinh viên</option>
                        <option value="parent" className="bg-white dark:bg-slate-900">Phụ huynh</option>
                        <option value="expert" className="bg-white dark:bg-slate-900">Chuyên gia</option>
                        <option value="other" className="bg-white dark:bg-slate-900">Khác</option>
                      </select>
                      {errors.role && (
                        <p className="text-[11px] text-destructive font-medium">{errors.role.message}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiêu đề liên hệ *</label>
                      <Input
                        type="text"
                        placeholder="Cần hỗ trợ về..."
                        {...register('subject')}
                        className={`rounded-xl border ${errors.subject ? 'border-destructive focus-visible:ring-destructive/20 focus:border-destructive' : 'border-slate-200 dark:border-slate-850'}`}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-destructive font-medium">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nội dung tin nhắn *</label>
                    <Textarea
                      placeholder="Nhập nội dung bạn muốn chia sẻ chi tiết..."
                      rows={5}
                      {...register('message')}
                      className={`rounded-xl border ${errors.message ? 'border-destructive focus-visible:ring-destructive/20 focus:border-destructive' : 'border-slate-200 dark:border-slate-850'}`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-destructive font-medium">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-navy hover:bg-[#071930] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold py-5 rounded-xl transition duration-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="size-4 rounded-full border-2 border-slate-300 border-t-brand-navy dark:border-t-white animate-spin" />
                        Đang gửi tin nhắn...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        Gửi lời nhắn
                        <Send className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                /* Success Feedback Pane */
                <div className="text-center py-8 space-y-6 animate-in fade-in duration-500">
                  <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
                    <Check className="size-8 stroke-[3]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-brand-navy dark:text-white">Cảm ơn lời nhắn của bạn!</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Chúng tôi đã nhận được thông tin liên hệ. Thành viên từ phòng hỗ trợ Student Success sẽ kiểm tra và gửi phản hồi cho bạn qua hòm thư điện tử sớm nhất có thể.
                    </p>
                  </div>

                  <Button 
                    onClick={handleResetForm}
                    variant="outline"
                    className="rounded-xl font-bold px-6 py-4 cursor-pointer"
                  >
                    Gửi thêm tin nhắn khác
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <section id="faq" className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            Câu Hỏi Thường Gặp (FAQs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến từ các bạn sinh viên khác.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqData.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-brand-navy dark:text-white transition-all cursor-pointer focus:outline-none"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`size-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-blue dark:text-sky-400' : ''}`} />
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-slate-50 dark:border-slate-850' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/30 dark:bg-slate-900/20">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Styled Location Map Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            Vị Trí Văn Phòng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dễ dàng tìm đường đến gặp chúng tôi tại khuôn viên Trường Đại học Giao thông Vận tải.
          </p>
        </div>

        <div className="h-[350px] sm:h-[450px] rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-md relative bg-slate-100 dark:bg-slate-950">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814156637!2d105.801944!3d21.028731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab424a50fff9%3A0xbe7a9b015112e43c!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBHaWFvIHRow7RuZyB24bqtbiB04bqjaSAoVVRDKQ!5e0!3m2!1svi!2s!4v1625000000000!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            title="Bản đồ văn phòng Student Success"
            className="filter grayscale-[15%] contrast-[105%] dark:invert-[90%] dark:hue-rotate-[180deg]"
          />
        </div>
      </section>
    </div>
  );
};

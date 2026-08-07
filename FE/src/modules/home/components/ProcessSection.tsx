import { Search, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export const ProcessSection = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Tìm Chuyên Gia Hoặc AI Match',
      desc: 'Khám phá danh sách Mentor hoặc nhập thắc mắc để Gemini AI tự động gợi ý Chuyên gia phù hợp nhất.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Calendar,
      title: '2. Đặt Lịch Tư Vấn 1-1',
      desc: 'Chọn ngày và khung giờ trống khả dụng trong tuần để lên lịch gặp trực tiếp Online hoặc Offline.',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: MessageSquare,
      title: '3. Nhận Định Hướng & Đánh Giá',
      desc: 'Trao đổi giải đáp trực tiếp, nhận tài liệu định hướng và gửi phản hồi đánh giá chất lượng buổi tư vấn.',
      gradient: 'from-purple-500 to-pink-600'
    },
  ];

  return (
    <section id="process" className="py-12 md:py-16 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Quy Trình Đơn Giản - Hiệu Quả Tối Đa
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Chỉ với 3 bước dễ dàng để có một buổi tư vấn chất lượng cùng Chuyên gia MindX
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line (Only visible on medium/large screens) */}
        <div className="absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-900/60 dark:via-indigo-900/60 dark:to-purple-900/60 hidden md:block z-0" />

        <div className="grid gap-6 md:grid-cols-3 relative z-10">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={idx} 
                className="border border-slate-200/80 dark:border-slate-800 bg-card hover:shadow-xl dark:hover:border-slate-700 transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                  {/* Icon Circle */}
                  <div className={`size-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="size-6 text-white" />
                  </div>
                  
                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

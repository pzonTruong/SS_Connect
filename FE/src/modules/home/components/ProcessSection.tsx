import { Search, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export const ProcessSection = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Chọn chuyên gia',
      desc: 'Khám phá danh sách các chuyên gia giàu kinh nghiệm, phù hợp với định hướng nghề nghiệp của bạn.',
    },
    {
      icon: Calendar,
      title: '2. Đặt lịch',
      desc: 'Chọn thời gian thuận tiện nhất cho bạn để thực hiện buổi tư vấn 1-1.',
    },
    {
      icon: MessageSquare,
      title: '3. Nhận tư vấn',
      desc: 'Trò chuyện trực tuyến, nhận phản hồi chuyên sâu và lập kế hoạch hành động.',
    },
  ];

  return (
    <section id="process" className="py-12 md:py-16 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Quy trình đơn giản - Hiệu quả tối đa
        </h2>
      </div>

      <div className="relative">
        {/* Connecting Line (Only visible on medium/large screens) */}
        <div className="absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block z-0" />

        <div className="grid gap-6 md:grid-cols-3 relative z-10">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={idx} 
                className="border-0 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.08)] dark:hover:bg-slate-850 transition-all duration-300 rounded-2xl overflow-hidden"
              >
                <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                  {/* Icon Circle */}
                  <div className="size-14 rounded-full bg-brand-blue flex items-center justify-center text-white mb-5 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <IconComponent className="size-5" />
                  </div>
                  
                  {/* Title & Desc */}
                  <h3 className="text-lg font-bold text-brand-navy dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
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

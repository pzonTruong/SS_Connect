import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="py-6 md:py-12">
      <div className="grid gap-12 lg:grid-cols-12 items-center">
        {/* Left text content */}
        <div className="lg:col-span-6 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.25] text-brand-navy dark:text-white">
            Định Hướng Sự Nghiệp
            <br className="hidden sm:block" />
            Cùng Chuyên Gia
          </h1>
          
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            Kết nối trực tiếp với các chuyên gia hàng đầu trong ngành để nhận những lời khuyên thiết thực, xây dựng lộ trình nghề nghiệp rõ ràng và tự tin bước vào thế giới công việc.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/experts">
              <Button className="bg-[#5B2C06] hover:bg-[#4E2505] text-white font-bold text-sm px-6 py-3 h-auto rounded-[4px] transition duration-200 shadow-sm">
                Tìm chuyên gia ngay
              </Button>
            </Link>
            <a href="#process">
              <Button variant="outline" className="border border-brand-navy/30 dark:border-slate-800 text-brand-navy dark:text-slate-200 font-bold text-sm px-6 py-3 h-auto rounded-[4px] hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-200">
                Tìm hiểu thêm
              </Button>
            </a>
          </div>
        </div>
        
        {/* Right illustration / photo */}
        <div className="lg:col-span-6">
          <div className="relative rounded-[32px] overflow-hidden shadow-sm aspect-[4/3] bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" 
              alt="Định hướng sự nghiệp cùng chuyên gia" 
              className="object-cover w-full h-full hover:scale-[1.02] transition-transform duration-500" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

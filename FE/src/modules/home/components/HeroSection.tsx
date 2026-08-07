import { Sparkles } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="py-8 md:py-14 relative">
      {/* Background soft glow decoration */}
      <div className="absolute top-10 left-10 size-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 size-72 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid gap-12 lg:grid-cols-12 items-center">
        {/* Left text content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-xs animate-fadeIn">
            <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Nền Tảng Đặt Lịch Tư Vấn 1-1 Student Success</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            Định Hướng Sự Nghiệp <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Cùng Chuyên Gia MindX
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
            Kết nối 1-1 trực tiếp với các cố vấn hàng đầu. Nhận tư vấn chuyên sâu về sửa CV, Portfolio, phỏng vấn thử & lộ trình phát triển sự nghiệp cá nhân hóa.
          </p>
        </div>
        
        {/* Right illustration / photo */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" 
              alt="Định hướng sự nghiệp cùng chuyên gia" 
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

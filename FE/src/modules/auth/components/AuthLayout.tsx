import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

const navItems = [
  { to: '/login', label: 'Đăng nhập' },
  { to: '/register', label: 'Đăng ký' },
  { to: '/forgot-password', label: 'Quên mật khẩu' }
];

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 md:p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="grid w-full gap-6 md:grid-cols-12 items-stretch">
        {/* Left marketing banner */}
        <div className="hidden md:flex md:col-span-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-slate-800 text-white p-10 flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mb-8 inline-flex size-12 items-center justify-center rounded-xl bg-white/10 text-indigo-300 backdrop-blur-md border border-white/10 shadow-inner">
              <Compass className="size-6 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Mở Khóa Tiềm Năng<br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                Nghề Nghiệp Của Bạn
              </span>
            </h1>
            
            <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
              Kết nối trực tiếp với các chuyên gia tư vấn hàng đầu tại Student Success để sửa CV, hoàn thiện Portfolio, luyện phỏng vấn và hoạch định lộ trình thăng tiến tối ưu nhất.
            </p>

            <div className="mt-8 space-y-3.5">
              {[
                'Đặt lịch 1-1 nhanh chóng & tiện lợi',
                'Xem đánh giá & profile chi tiết của chuyên gia',
                'Nhận thông báo lịch hẹn qua email tự động',
                'Hỗ trợ hình thức tư vấn Online hoặc Offline'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="size-4.5 text-indigo-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2 mt-8 pt-6 border-t border-white/10">
            <Sparkles className="size-4 text-indigo-400" />
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Đồng hành cùng học viên MindX vươn tầm sự nghiệp
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center space-y-6">
          <nav className="inline-flex rounded-lg border bg-muted/40 p-1 self-start">

            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition',
                  location.pathname === item.to && 'bg-background text-foreground shadow-sm'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Outlet />
        </div>
      </section>
    </main>
  );
};

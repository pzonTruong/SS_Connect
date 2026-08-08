import { Compass } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { cn } from '@/shared/lib/utils';

export const AuthLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const showTabs = isLoginPage || isRegisterPage;

  return (
    <main className="relative flex min-h-screen w-full bg-background items-stretch overflow-hidden">
      {/* Dark/Light mode toggle */}
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <section className="grid w-full grid-cols-1 md:grid-cols-12 min-h-screen">
        {/* Left minimal marketing panel */}
        <div className="hidden md:flex md:col-span-6 lg:col-span-6 bg-slate-900 text-white p-10 lg:p-14 flex-col justify-between relative overflow-hidden">
          {/* Background image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40 pointer-events-none" />

          {/* Top Logo Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-indigo-300">
              <Compass className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Student Success</span>
          </div>

          {/* Bottom Minimal Heading */}
          <div className="relative z-10 max-w-lg mb-4 space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Mở Khóa Tiềm Năng<br />Nghề Nghiệp
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Kết nối với các chuyên gia cố vấn hàng đầu để định hướng tương lai và đạt được mục tiêu học tập, nghề nghiệp của bạn.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6 flex items-center justify-center p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl border border-border/60 transition-all duration-300">
              {/* Minimal Line Tabs */}
              {showTabs && (
                <div className="flex border-b border-border/80 mb-6">
                  <Link
                    to="/login"
                    className={cn(
                      "flex-1 text-center pb-3 text-sm font-medium transition-all relative",
                      isLoginPage
                        ? "text-foreground font-semibold border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className={cn(
                      "flex-1 text-center pb-3 text-sm font-medium transition-all relative",
                      isRegisterPage
                        ? "text-foreground font-semibold border-b-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}

              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};




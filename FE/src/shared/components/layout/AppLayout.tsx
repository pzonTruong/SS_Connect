import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Monitor, Settings, LayoutDashboard, User, History } from 'lucide-react';
import logoImg from '@/assets/ssConnect_favicon.png';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { cn, getTheme, setTheme, type Theme } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { Footer } from './Footer';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

const themes: Theme[] = ['light', 'dark', 'system'];
const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
  system: <Monitor className="size-4" />,
};
const themeLabels: Record<Theme, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System',
};

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/experts', label: 'Experts' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
];

export const AppLayout = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  useEffect(() => {
    setLoading(true);
    authApi.getMe()
      .then((res) => {
        setUser(res.data as CurrentUser);
        localStorage.setItem('user_role', res.data.role);
      })
      .catch(() => {
        tokenStore.clear();
        localStorage.removeItem('user_role');
        const isPublicRoute =
          location.pathname === '/' ||
          location.pathname === '/experts' ||
          location.pathname.startsWith('/experts/');
        if (!isPublicRoute) {
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    tokenStore.clear();
    localStorage.removeItem('user_role');
    setUser(null);
    navigate('/login');
  };

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    setTheme(next);
    setCurrentTheme(next);
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin-dashboard'
      : user?.role === 'expert'
      ? '/expert-dashboard'
      : '/my-bookings';

  const initials =
    user?.displayName?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    '??';

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-200 font-sans">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-card backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 gap-4">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0"
          >
            <img src={logoImg} alt="Student Success" className="h-9 w-9 object-contain rounded-lg transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Student Success
              </span>
              <span className="text-[11px] font-semibold text-brand-blue dark:text-sky-400 tracking-wider uppercase leading-tight">
                Connect
              </span>
            </div>
          </Link>

          {/* ── Centered Nav links ── */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-semibold'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2.5 shrink-0">
            {loading ? (
              <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <>
                {/* Book Now — hidden for admin & expert */}
                {user.role !== 'admin' && user.role !== 'expert' && (
                  <Link to="/experts" className="hidden sm:block">
                    <Button className="bg-brand-brown hover:bg-[#4E2505] text-white font-semibold text-xs px-4 py-2 rounded-md transition duration-200">
                      Book Now
                    </Button>
                  </Link>
                )}

                {/* ── Settings Dropdown ── */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5
                      hover:bg-slate-100 dark:hover:bg-slate-800/70
                      border border-transparent hover:border-slate-200 dark:hover:border-slate-700
                      transition-all duration-150 outline-none"
                  >
                    <Avatar className="size-9 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
                      <AvatarFallback className="bg-brand-navy/10 text-brand-navy dark:bg-slate-800 dark:text-white font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col text-left min-w-0">
                      <span className="text-sm font-semibold max-w-[130px] truncate text-slate-900 dark:text-slate-100 leading-snug">
                        {user.displayName || user.email.split('@')[0]}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize leading-snug">
                        {user.role}
                      </span>
                    </div>
                    <Settings className="hidden lg:block size-4 text-slate-400 flex-shrink-0" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-60 mt-2 p-1.5">
                    {/* User info header */}
                    <div className="px-3 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-slate-200 dark:border-slate-700">
                          <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
                          <AvatarFallback className="bg-brand-navy/10 text-brand-navy dark:bg-slate-700 dark:text-white text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
                            {user.displayName || user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <DropdownMenuItem
                      onClick={() => navigate(dashboardPath)}
                      className="gap-3 py-2.5 px-3 rounded-lg"
                    >
                      <LayoutDashboard className="size-4 text-brand-blue flex-shrink-0" />
                      <span className="font-medium text-sm">Dashboard</span>
                    </DropdownMenuItem>
                    {user?.role === 'user' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/consultation-history')}
                        className="gap-3 py-2.5 px-3 rounded-lg"
                      >
                        <History className="size-4 text-brand-blue flex-shrink-0" />
                        <span className="font-medium text-sm">Lịch sử tư vấn</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="gap-3 py-2.5 px-3 rounded-lg"
                    >
                      <User className="size-4 text-brand-blue flex-shrink-0" />
                      <span className="font-medium text-sm">Hồ sơ cá nhân</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/settings')}
                      className="gap-3 py-2.5 px-3 rounded-lg"
                    >
                      <Settings className="size-4 text-brand-blue flex-shrink-0" />
                      <span className="font-medium text-sm">Cài đặt hệ thống</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1.5" />

                    {/* Theme toggle */}
                    <DropdownMenuItem onClick={cycleTheme} className="gap-3 py-2.5 px-3 rounded-lg">
                      <span className="flex-shrink-0 text-slate-500">{themeIcons[currentTheme]}</span>
                      <span className="font-medium text-sm">{themeLabels[currentTheme]}</span>
                      <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Toggle
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1.5" />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="gap-3 py-2.5 px-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="size-4 flex-shrink-0" />
                      <span className="font-medium text-sm">Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest controls */
              <>
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/experts">
                  <Button className="bg-brand-brown hover:bg-[#4E2505] text-white font-semibold text-xs px-4 py-2 rounded-md transition duration-200">
                    Book Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile Navigation bar ── */}
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-around py-2.5 px-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors px-2',
                location.pathname === to
                  ? 'text-brand-navy dark:text-white'
                  : 'text-slate-400'
              )}
            >
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

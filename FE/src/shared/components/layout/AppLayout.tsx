import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Footer } from './Footer';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

export const AppLayout = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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

  const initials = user?.displayName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-200 font-sans">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-card backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-brand-navy dark:text-white">
            <span>Student Success Connect</span>
          </Link>

          {/* Centered Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={cn(
                'text-sm font-semibold transition-all duration-200 pb-1.5 border-b-2',
                location.pathname === '/'
                  ? 'border-brand-navy text-brand-navy dark:border-white dark:text-white'
                  : 'border-transparent text-slate-505 hover:text-brand-navy dark:hover:text-slate-200'
              )}
            >
              Home
            </Link>
            <Link
              to="/experts"
              className={cn(
                'text-sm font-semibold transition-all duration-200 pb-1.5 border-b-2',
                location.pathname === '/experts'
                  ? 'border-brand-navy text-brand-navy dark:border-white dark:text-white'
                  : 'border-transparent text-slate-505 hover:text-brand-navy dark:hover:text-slate-200'
              )}
            >
              Experts
            </Link>
            <Link
              to="/resources"
              className={cn(
                'text-sm font-semibold transition-all duration-200 pb-1.5 border-b-2',
                location.pathname === '/resources'
                  ? 'border-brand-navy text-brand-navy dark:border-white dark:text-white'
                  : 'border-transparent text-slate-505 hover:text-brand-navy dark:hover:text-slate-200'
              )}
            >
              Resources
            </Link>
            <Link
              to="/contact"
              className={cn(
                'text-sm font-semibold transition-all duration-200 pb-1.5 border-b-2',
                location.pathname === '/contact'
                  ? 'border-brand-navy text-brand-navy dark:border-white dark:text-white'
                  : 'border-transparent text-slate-505 hover:text-brand-navy dark:hover:text-slate-200'
              )}
            >
              Contact
            </Link>
          </nav>

          {/* User controls / CTA */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {loading ? (
              <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Book Now Button for logged in user (hidden for Admin) */}
                {user.role !== 'admin' && (
                  <Link to="/experts">
                    <Button className="hidden sm:inline-flex bg-brand-brown hover:bg-[#4E2505] text-white font-semibold text-xs px-5 py-2.5 rounded-md transition duration-200">
                      Book Now
                    </Button>
                  </Link>
                )}

                <Link to="/profile" className="hover:opacity-90 transition-opacity ml-1" title="Hồ sơ cá nhân">
                  <Avatar className="size-9 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-850 text-brand-navy dark:text-white font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Dashboard & Profile Shortcuts */}
                <div className="hidden lg:flex flex-col text-left">
                  <Link to="/profile" className="hover:underline">
                    <span className="text-xs font-semibold max-w-[120px] truncate block text-slate-900 dark:text-slate-100">
                      {user.displayName || user.email.split('@')[0]}
                    </span>
                  </Link>
                  <div className="flex gap-1.5 text-[10px] items-center">
                    <Link
                      to={
                        user.role === 'admin'
                          ? '/admin-dashboard'
                          : user.role === 'expert'
                          ? '/expert-dashboard'
                          : '/my-bookings'
                      }
                      className="text-brand-blue hover:underline font-semibold"
                    >
                      Dashboard
                    </Link>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <Link
                      to="/profile"
                      className="text-brand-blue hover:underline font-semibold"
                    >
                      Hồ sơ
                    </Link>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  title="Đăng xuất"
                  className="text-slate-500 hover:text-destructive hover:bg-destructive/10 size-8"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs text-slate-600 dark:text-slate-300">
                    Đăng nhập
                  </Button>
                </Link>
                 <Link to="/experts">
                  <Button className="bg-brand-brown hover:bg-[#4E2505] text-white font-semibold text-xs px-5 py-2.5 rounded-md transition duration-200">
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-around py-2.5 px-4">
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
              location.pathname === '/'
                ? 'text-brand-navy dark:text-white'
                : 'text-slate-400'
            )}
          >
            <span>Home</span>
          </Link>
          <Link
            to="/experts"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
              location.pathname === '/experts'
                ? 'text-brand-navy dark:text-white'
                : 'text-slate-400'
            )}
          >
            <span>Experts</span>
          </Link>
          <Link
            to="/resources"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
              location.pathname === '/resources'
                ? 'text-brand-navy dark:text-white'
                : 'text-slate-400'
            )}
          >
            <span>Resources</span>
          </Link>
          <Link
            to="/contact"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
              location.pathname === '/contact'
                ? 'text-brand-navy dark:text-white'
                : 'text-slate-400'
            )}
          >
            <span>Contact</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};


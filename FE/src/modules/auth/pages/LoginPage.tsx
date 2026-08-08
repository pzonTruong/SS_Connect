import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Loader2, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { tokenStore } from '../store/token.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email: values.email, password: values.password });
      const token = response.data?.token as string | undefined;
      if (!token) {
        toast.error('Phản hồi không hợp lệ từ máy chủ.');
        return;
      }
      tokenStore.set(token);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Chào mừng trở lại</h2>
        <p className="text-xs text-muted-foreground">Đăng nhập để tiếp tục hành trình của bạn.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" className="text-xs font-medium text-muted-foreground">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="login-email" className="pl-9 h-10" placeholder="nguyen.van.a@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">Mật khẩu</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              className="pl-9 pr-9 h-10"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button className="w-full font-semibold shadow-md mt-6 h-11 text-sm bg-slate-950 text-white hover:bg-slate-900 dark:bg-primary dark:hover:bg-primary/90" type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 size-4" />
          )}
          Đăng Nhập
        </Button>
      </form>
    </div>
  );
};



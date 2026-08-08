import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail, Eye, EyeOff, ArrowLeft, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

const requestSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
});

const resetSchema = z.object({
  token: z.string().min(1, 'Vui lòng nhập mã Reset Token'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmNewPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
});

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const navigate = useNavigate();

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onRequestToken = requestForm.handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setStep('reset');
      toast.success('Mã Reset token đã được gửi tới Email của bạn.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  });

  const onResetPassword = resetForm.handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.resetPassword(email, values.token, values.newPassword);
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Mã Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-5">
      {/* Visual Stepper Header */}
      <div className="border-b bg-muted/30 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 px-6 sm:px-8 py-3 mb-4 rounded-t-2xl">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
              step === 'request' ? "bg-slate-950 text-white dark:bg-primary dark:text-primary-foreground" : "bg-primary/20 text-primary"
            )}>
              {step === 'reset' ? <CheckCircle2 className="size-3.5 text-primary" /> : '1'}
            </div>
            <span className={cn("text-xs font-medium", step === 'request' ? "text-foreground font-semibold" : "text-muted-foreground")}>
              1. Yêu cầu mã
            </span>
          </div>

          <div className="h-0.5 w-10 bg-border rounded-full" />

          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
              step === 'reset' ? "bg-slate-950 text-white dark:bg-primary dark:text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
            <span className={cn("text-xs font-medium", step === 'reset' ? "text-foreground font-semibold" : "text-muted-foreground")}>
              2. Đặt mật khẩu
            </span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1 mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {step === 'request' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
        </h2>
        <p className="text-xs text-muted-foreground">
          {step === 'request' ? (
            'Nhập email của bạn để nhận mã khôi phục mật khẩu.'
          ) : (
            <>
              Nhập mã token đã gửi tới <span className="font-semibold text-primary">{email}</span> và mật khẩu mới.
            </>
          )}
        </p>
      </div>

      {step === 'request' ? (
        <form className="space-y-4" onSubmit={onRequestToken}>
          <div className="space-y-1.5">
            <Label htmlFor="fp-email" className="text-xs font-medium text-muted-foreground">Email tài khoản</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="fp-email" className="pl-9 h-10" placeholder="nguyen.van.a@example.com" {...requestForm.register('email')} />
            </div>
            {requestForm.formState.errors.email && (
              <p className="text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
            )}
          </div>

          <Button className="w-full font-semibold shadow-md mt-6 h-11 text-sm bg-slate-950 text-white hover:bg-slate-900 dark:bg-primary dark:hover:bg-primary/90" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Gửi mã khôi phục
          </Button>

          <div className="text-center pt-3 border-t border-border/50">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="size-3.5" /> Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onResetPassword}>
          {/* Token field */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-token" className="text-xs font-medium text-muted-foreground">Mã Reset Token</Label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="reset-token" className="pl-9 h-10" placeholder="Dán mã Token từ email" {...resetForm.register('token')} />
            </div>
            {resetForm.formState.errors.token && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.token.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">Mật khẩu mới</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                className="pl-9 pr-9 h-10"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...resetForm.register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-new-password" className="text-xs font-medium text-muted-foreground">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-new-password"
                className="pl-9 pr-9 h-10"
                type={showConfirmNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...resetForm.register('confirmNewPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showConfirmNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {resetForm.formState.errors.confirmNewPassword && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.confirmNewPassword.message}</p>
            )}
          </div>

          <Button className="w-full font-semibold shadow-md mt-6 h-11 text-sm bg-slate-950 text-white hover:bg-slate-900 dark:bg-primary dark:hover:bg-primary/90" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Xác nhận & Đặt lại mật khẩu
          </Button>

          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
            <button
              type="button"
              onClick={() => { setStep('request'); resetForm.reset(); }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="size-3.5" /> Thử lại với email khác
            </button>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};



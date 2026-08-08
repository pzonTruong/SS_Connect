import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail, Eye, EyeOff, GraduationCap, Award, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { OtpInput } from '@/shared/components/ui/otp-input';
import { cn } from '@/shared/lib/utils';

const registerSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập Email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  role: z.enum(['user', 'expert']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [registeredValues, setRegisteredValues] = useState<FormValues | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Resend OTP countdown timer
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    }
  });

  const selectedRole = watch('role');
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'verify' && resendCountdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const onRegisterSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.register({ email: values.email, password: values.password, role: values.role });
      setRegisteredValues(values);
      setStep('verify');
      setResendCountdown(60);
      setCanResend(false);
      toast.success('Mã OTP đã được gửi thành công đến email của bạn.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Đã có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  });

  const handleResendOtp = async () => {
    if (!registeredValues || !canResend || resending) return;
    setResending(true);
    try {
      await authApi.register({
        email: registeredValues.email,
        password: registeredValues.password,
        role: registeredValues.role
      });
      toast.success('Mã OTP mới đã được gửi lại vào email của bạn.');
      setResendCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredValues || otp.length !== 6) return;
    setLoading(true);
    try {
      await authApi.verifyRegisterOtp(registeredValues.email, otp);
      toast.success('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Mã OTP không đúng hoặc đã hết hạn');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'verify' ? (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Xác nhận OTP</h2>
            <p className="text-xs text-muted-foreground">Mã xác nhận 6 chữ số đã được gửi tới địa chỉ</p>
            <div className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">{registeredValues?.email}</span>
              <button
                type="button"
                onClick={() => { setStep('register'); setOtp(''); }}
                className="ml-1 text-xs text-muted-foreground hover:text-primary underline"
              >
                (Đổi email)
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onVerifySubmit}>
            <div className="flex justify-center">
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <Button className="w-full font-semibold shadow-md h-11 text-sm bg-slate-950 text-white hover:bg-slate-900 dark:bg-primary dark:hover:bg-primary/90" type="submit" disabled={otp.length !== 6 || loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Xác thực & Tạo tài khoản
            </Button>

            <div className="flex flex-col items-center space-y-2 pt-2 text-xs border-t border-border/50">
              <span className="text-muted-foreground">Chưa nhận được mã OTP?</span>
              <button
                type="button"
                disabled={!canResend || resending}
                onClick={handleResendOtp}
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium transition",
                  canResend && !resending
                    ? "text-primary hover:underline cursor-pointer"
                    : "text-muted-foreground opacity-60 cursor-not-allowed"
                )}
              >
                {resending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    Đang gửi lại...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3" />
                    {canResend ? "Gửi lại mã OTP" : `Gửi lại mã sau (${resendCountdown}s)`}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('register'); setOtp(''); }}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition pt-1"
              >
                <ArrowLeft className="size-3" /> Quay lại nhập thông tin
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-1 mb-3">
            <h2 className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</h2>
            <p className="text-xs text-muted-foreground">Bắt đầu hành trình định hướng sự nghiệp của bạn.</p>
          </div>

          <form className="space-y-3.5" onSubmit={onRegisterSubmit}>
            {/* Role Selection Cards */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bạn đăng ký làm:
              </Label>
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setValue('role', 'user')}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200",
                    selectedRole === 'user'
                      ? "border-slate-950 bg-slate-950/5 ring-1 ring-slate-950 dark:border-primary dark:bg-primary/10 dark:ring-primary shadow-xs"
                      : "border-border hover:border-slate-400 hover:bg-accent/40"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg shrink-0 transition-colors",
                    selectedRole === 'user' ? "bg-slate-950 text-white dark:bg-primary dark:text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <GraduationCap className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs leading-tight">Học viên</div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">Tư vấn 1-1</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'expert')}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200",
                    selectedRole === 'expert'
                      ? "border-slate-950 bg-slate-950/5 ring-1 ring-slate-950 dark:border-primary dark:bg-primary/10 dark:ring-primary shadow-xs"
                      : "border-border hover:border-slate-400 hover:bg-accent/40"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg shrink-0 transition-colors",
                    selectedRole === 'expert' ? "bg-slate-950 text-white dark:bg-primary dark:text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Award className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs leading-tight">Chuyên gia</div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">Cố vấn SS</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9 h-10" placeholder="nguyen.van.a@example.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Mật khẩu</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">Xác nhận mật khẩu</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  className="pl-9 pr-9 h-10"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button className="w-full font-semibold shadow-md mt-5 h-11 text-sm bg-slate-950 text-white hover:bg-slate-900 dark:bg-primary dark:hover:bg-primary/90" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Tiếp tục & Gửi mã OTP
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};



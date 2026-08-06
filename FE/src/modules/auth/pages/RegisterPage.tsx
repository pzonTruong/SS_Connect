import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { OtpInput } from '@/shared/components/ui/otp-input';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'expert']),
});

type FormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    }
  });
  const navigate = useNavigate();

  const onRegisterSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.register({ email: values.email, password: values.password, role: values.role });
      setEmail(values.email);
      setStep('verify');
      toast.success('Mã OTP đã được gửi đến email của bạn.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  });

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await authApi.verifyRegisterOtp(email, otp);
      toast.success('Xác thực tài khoản thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Mã OTP không hợp lệ');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Xác nhận OTP</CardTitle>
          <CardDescription>
            Nhập mã OTP 6 số đã được gửi đến <span className="font-semibold text-primary">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onVerifySubmit}>
            <OtpInput value={otp} onChange={setOtp} />
            <Button className="w-full font-semibold shadow-sm" type="submit" disabled={otp.length !== 6 || loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Xác thực tài khoản
            </Button>
            <button
              type="button"
              onClick={() => { setStep('register'); setOtp(''); }}
              className="block w-full text-center text-sm text-muted-foreground transition hover:text-foreground"
            >
              Quay lại đăng ký
            </button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
        <CardDescription>Bắt đầu hành trình định hướng sự nghiệp tại SS Connect.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onRegisterSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" className="pl-9" placeholder="student@example.com" {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" className="pl-9" type="password" placeholder="Tối thiểu 6 ký tự" {...register('password')} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Bạn đăng ký với vai trò là:</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('role')}
            >
              <option value="user">Học viên MindX (Student)</option>
              <option value="expert">Chuyên gia tư vấn (SS Expert)</option>
            </select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <Button className="w-full font-semibold shadow-sm mt-6" type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Đăng ký và gửi mã OTP
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

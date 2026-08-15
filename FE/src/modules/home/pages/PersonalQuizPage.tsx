import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ExternalLink, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { authApi } from '@/modules/auth/api/auth.api';
import { toast } from 'sonner';

export const PersonalQuizPage = () => {
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.getMe()
      .then((res) => {
        if (res.data?.role === 'user') {
          setIsStudent(true);
        } else {
          toast.error('Chỉ tài khoản học viên mới có thể thực hiện Personal Quiz.');
          navigate('/', { replace: true });
        }
      })
      .catch(() => {
        toast.error('Vui lòng đăng nhập tài khoản học viên để làm Personal Quiz.');
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe7QQ_AWfahslM5goYZOBrcqUK5FqztjZwHbxWFNOAw9QGlxw/viewform?embedded=true";
  const directFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe7QQ_AWfahslM5goYZOBrcqUK5FqztjZwHbxWFNOAw9QGlxw/viewform";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-8 rounded-full border-4 border-brand-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isStudent) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2545] to-slate-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-300 border border-white/10">
            <Sparkles className="size-4" />
            <span>Personal Quiz & Evaluation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Khảo Sát & Bài Trắc Nghiệm Cá Nhân
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Thực hiện bài trắc nghiệm nhanh để giúp cố vấn hiểu rõ hơn về nhu cầu, định hướng học tập và kỹ năng của bạn. Kết quả khảo sát được đồng bộ tự động trực tiếp vào hệ thống cơ sở dữ liệu.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href={directFormUrl} target="_blank" rel="noreferrer">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition">
                Mở Google Form tab mới
                <ExternalLink className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Info Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-6 space-y-2">
            <div className="size-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <HelpCircle className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Dễ dàng & Nhanh chóng</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Các câu hỏi được thiết kế ngắn gọn, giúp bạn hoàn thành bài trắc nghiệm chỉ trong 3-5 phút.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-6 space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Tự động hứng dữ liệu</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Câu trả lời của bạn sẽ được gửi thẳng vào Google Sheet quản lý kết quả khảo sát của Student Success.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-6 space-y-2">
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Bảo mật thông tin</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Thông tin của học viên được giữ kín và chỉ dành riêng cho công tác hỗ trợ & tư vấn học tập.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Form Section */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="size-5 text-brand-blue" />
            Biểu Mẫu Personal Quiz Làm Trực Tiếp
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Bạn có thể điền thông tin và trả lời trực tiếp bên dưới mà không cần rời khỏi trang web.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden min-h-[650px] flex items-center justify-center border border-slate-100 dark:border-slate-850">
            <iframe
              src={formUrl}
              width="100%"
              height="750"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Personal Quiz Form"
              className="w-full min-h-[750px] border-0"
            >
              Đang tải biểu mẫu trắc nghiệm...
            </iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

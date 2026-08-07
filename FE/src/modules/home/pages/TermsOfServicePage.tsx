import { FileCheck, Users, Calendar, AlertCircle, Scale, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export const TermsOfServicePage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-brand-blue dark:text-sky-400 border border-slate-100 dark:border-slate-800">
          <Scale className="size-3.5" />
          <span>Điều khoản dịch vụ</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Điều Khoản Sử Dụng
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Quy định và điều khoản sử dụng ứng dụng cho sinh viên, giảng viên và chuyên gia tham gia nền tảng Student Success Connect.
        </p>
        <p className="text-xs text-slate-400">
          Cập nhật lần cuối: Tháng 8, 2026
        </p>
      </section>

      {/* Terms Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-sky-400">
              <Users className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Tài khoản & Vai trò</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Cung cấp thông tin chính xác và chịu trách nhiệm về mọi hoạt động trên tài khoản cá nhân.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Calendar className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Quy định đặt lịch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tham gia đúng giờ, hủy hoặc đổi lịch báo trước tối thiểu 2 tiếng để đảm bảo tính chuyên nghiệp.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Quy chuẩn ứng xử</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tôn trọng lẫn nhau trong mọi buổi tư vấn, không sử dụng ngôn từ xúc phạm hay sai lệch.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
        <CardContent className="p-6 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <FileCheck className="size-5 text-brand-blue dark:text-sky-400" />
              1. Chấp nhận các Điều khoản
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Bằng việc truy cập hoặc sử dụng ứng dụng Student Success Connect, bạn đồng ý tuân thủ các Điều khoản sử dụng này. Nếu không đồng ý với bất kỳ phần nào của điều khoản, vui lòng không tiếp tục truy cập nền tảng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <Users className="size-5 text-brand-blue dark:text-sky-400" />
              2. Đăng ký và Trách nhiệm Tài khoản
            </h2>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Bạn phải cung cấp thông tin trung thực, chính xác và đầy đủ khi tạo tài khoản.</li>
              <li>Bạn có trách nhiệm bảo mật mật khẩu và thông tin đăng nhập của mình.</li>
              <li>Thông báo ngay lập tức cho Quản trị viên nếu phát hiện bất kỳ hành vi truy cập trái phép nào vào tài khoản của bạn.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <Calendar className="size-5 text-brand-blue dark:text-sky-400" />
              3. Quy định về Đặt lịch và Tư vấn
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Để hệ thống hoạt động hiệu quả và tôn trọng thời gian của các chuyên gia:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Sinh viên cần có mặt đúng thời gian cuộc hẹn đã đăng ký trực tuyến hoặc trực tiếp.</li>
              <li>Trong trường hợp bận đột xuất, sinh viên cần thực hiện Thao tác "Hủy lịch" trên hệ thống ít nhất 2 giờ trước khi buổi tư vấn bắt đầu.</li>
              <li>Việc vắng mặt không lý do quá 3 lần có thể dẫn đến việc tạm khóa quyền đặt lịch trực tuyến trong 30 ngày.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <AlertCircle className="size-5 text-brand-blue dark:text-sky-400" />
              4. Hành vi bị Cấm
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Khi tham gia nền tảng, người dùng cam kết KHÔNG thực hiện các hành vi sau:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Sử dụng ngôn từ quấy rối, xúc phạm, phân biệt đối xử hoặc đe dọa người khác.</li>
              <li>Phát tán thông tin giả mạo, nội dung độc hại hoặc vi phạm pháp luật.</li>
              <li>Cố ý can thiệp, phá hoại hoặc khai thác lỗ hổng kỹ thuật của hệ thống.</li>
              <li>Ghi âm, ghi hình buổi tư vấn khi chưa có sự đồng ý của đối phương.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-brand-navy dark:text-white">Thay đổi Điều khoản</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ban quản trị Student Success Connect có quyền cập nhật hoặc điều chỉnh Điều khoản sử dụng này vào bất kỳ lúc nào. Mọi thay đổi sẽ được thông báo công khai trên ứng dụng.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

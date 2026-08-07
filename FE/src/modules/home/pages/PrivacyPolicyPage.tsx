import { ShieldCheck, Lock, Eye, FileText, UserCheck, Bell } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-brand-blue dark:text-sky-400 border border-slate-100 dark:border-slate-800">
          <ShieldCheck className="size-3.5" />
          <span>Bảo mật & Quyền riêng tư</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Chính Sách Quyền Riêng Tư
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Student Success Connect cam kết bảo vệ thông tin cá nhân và quyền riêng tư của sinh viên, giảng viên và các chuyên gia tham gia nền tảng.
        </p>
        <p className="text-xs text-slate-400">
          Cập nhật lần cuối: Tháng 8, 2026
        </p>
      </section>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-blue-50 dark:bg-blue-950/40 text-brand-blue dark:text-sky-400">
              <Lock className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Bảo mật thông tin</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dữ liệu của bạn được mã hóa và lưu trữ an toàn theo tiêu chuẩn bảo mật hiện đại.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Eye className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Không chia sẻ bên thứ 3</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Thông tin cá nhân tuyệt đối không bị bán hoặc chia sẻ thương mại với bất kỳ đơn vị nào.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <CardContent className="p-5 space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-5" />
            </div>
            <h3 className="font-bold text-base text-brand-navy dark:text-white">Quyền kiểm soát</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bạn có quyền xem, chỉnh sửa hoặc yêu cầu xóa dữ liệu thông tin cá nhân của mình bất kỳ lúc nào.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
        <CardContent className="p-6 sm:p-10 space-y-8 text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <FileText className="size-5 text-brand-blue dark:text-sky-400" />
              1. Thu thập thông tin cá nhân
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Khi bạn đăng ký tài khoản và sử dụng hệ thống Student Success Connect, chúng tôi có thể thu thập các thông tin sau:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Thông tin nhận dạng cá nhân: Họ tên, email sinh viên/chuyên gia, số điện thoại, mã số sinh viên.</li>
              <li>Thông tin hồ sơ chuyên gia: Trình độ chuyên môn, kinh nghiệm, lịch làm việc, chuyên ngành tư vấn.</li>
              <li>Dữ liệu cuộc hẹn: Lịch sử đặt lịch tham vấn, nội dung ghi chú cuộc hẹn và các đánh giá/phản hồi.</li>
              <li>Dữ liệu kỹ thuật: Địa chỉ IP, loại trình duyệt, nhật ký truy cập hệ thống để đảm bảo an ninh mạng.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <ShieldCheck className="size-5 text-brand-blue dark:text-sky-400" />
              2. Mục đích sử dụng thông tin
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Thông tin thu thập được sử dụng duy nhất cho các mục đích hỗ trợ học tập và phát triển sinh viên:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Xác thực tài khoản và quản lý thông tin đăng nhập của người dùng.</li>
              <li>Kết nối sinh viên với các chuyên gia tư vấn (học thuật, tâm lý, hướng nghiệp).</li>
              <li>Gửi thông báo nhắc nhở lịch hẹn, xác nhận đặt lịch thành công qua Email.</li>
              <li>Nâng cao chất lượng dịch vụ tư vấn và cải thiện trải nghiệm người dùng trên hệ thống.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <Lock className="size-5 text-brand-blue dark:text-sky-400" />
              3. Bảo mật và Lưu trữ dữ liệu
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức nghiêm ngặt nhằm bảo vệ dữ liệu cá nhân khỏi truy cập trái phép, mất mát hoặc tiết lộ:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Mật khẩu của người dùng được mã hóa an toàn (hashing) trước khi lưu vào cơ sở dữ liệu.</li>
              <li>Giao tiếp giữa thiết bị người dùng và máy chủ được mã hóa qua giao thức HTTPS/SSL.</li>
              <li>Chỉ những cán bộ/chuyên gia được phân quyền mới có thể truy cập thông tin tư vấn theo thẩm quyền.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-navy dark:text-white flex items-center gap-2">
              <Bell className="size-5 text-brand-blue dark:text-sky-400" />
              4. Quyền của người dùng
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Người dùng có đầy đủ các quyền đối với dữ liệu cá nhân của mình trên nền tảng:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2 text-slate-600 dark:text-slate-400">
              <li>Truy cập và cập nhật thông tin cá nhân trong trang Quản lý hồ sơ (Profile).</li>
              <li>Yêu cầu tạm khóa hoặc xóa hoàn toàn tài khoản và dữ liệu cá nhân khỏi hệ thống.</li>
              <li>Gửi khiếu nại về bất kỳ hành vi vi phạm bảo mật dữ liệu nào tới Ban quản trị Student Success Department.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-brand-navy dark:text-white">Liên hệ về bảo mật</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nếu bạn có bất kỳ thắc mắc hoặc góp ý nào liên quan đến Chính sách quyền riêng tư này, vui lòng liên hệ bộ phận hỗ trợ qua email: <span className="font-semibold text-brand-blue dark:text-sky-400">privacy@studentsuccess.edu.vn</span>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { HelpCircle, ChevronDown, Search, MessageSquare } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'booking' | 'expert' | 'account';
}

export const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'all', name: 'Tất cả câu hỏi' },
    { id: 'general', name: 'Chung' },
    { id: 'booking', name: 'Đặt lịch tư vấn' },
    { id: 'expert', name: 'Chuyên gia & Cố vấn' },
    { id: 'account', name: 'Tài khoản & Bảo mật' },
  ];

  const faqs: FaqItem[] = [
    {
      category: 'general',
      question: 'Student Success Connect là gì?',
      answer: 'Student Success Connect là nền tảng kết nối trực tuyến giữa sinh viên và các chuyên gia, cố vấn học tập, cựu sinh viên nhằm tư vấn học thuật, định hướng nghề nghiệp và hỗ trợ tâm lý sinh viên.'
    },
    {
      category: 'booking',
      question: 'Làm thế nào để tôi đặt lịch hẹn với một chuyên gia?',
      answer: 'Bạn chỉ cần truy cập trang "Danh sách chuyên gia", chọn chuyên gia phù hợp với nhu cầu, bấm nút "Đặt lịch", lựa chọn khung giờ còn trống và xác nhận. Hệ thống sẽ tự động gửi thông báo xác nhận lịch hẹn cho bạn.'
    },
    {
      category: 'booking',
      question: 'Dịch vụ tư vấn trên nền tảng có mất phí không?',
      answer: 'Tất cả các dịch vụ tư vấn và hỗ trợ học tập tại Student Success Connect đều hoàn toàn MIỄN PHÍ dành riêng cho sinh viên của nhà trường.'
    },
    {
      category: 'booking',
      question: 'Tôi có thể hủy hoặc đổi lịch hẹn đã đặt không?',
      answer: 'Có. Bạn có thể truy cập mục "Lịch tư vấn của tôi" (My Bookings), chọn lịch hẹn tương ứng và nhấn nút "Hủy lịch" hoặc "Đổi giờ" trước thời gian diễn ra buổi tư vấn ít nhất 2 tiếng.'
    },
    {
      category: 'expert',
      question: 'Các chuyên gia trên Student Success Connect là ai?',
      answer: 'Đội ngũ chuyên gia gồm các giảng viên giàu kinh nghiệm, cựu sinh viên thành đạt, cố vấn tâm lý học đường và đại diện các doanh nghiệp đối tác uy tín.'
    },
    {
      category: 'expert',
      question: 'Làm sao để đăng ký trở thành Chuyên gia (Expert) trên ứng dụng?',
      answer: 'Bạn có thể đăng ký tài khoản mới và chọn vai trò là "Expert". Sau khi hoàn thiện thông tin hồ sơ và minh chứng chuyên môn, đội ngũ Quản trị viên sẽ xét duyệt và kích hoạt tài khoản của bạn.'
    },
    {
      category: 'account',
      question: 'Tôi quên mật khẩu tài khoản thì phải làm sao?',
      answer: 'Tại trang Đăng nhập, bạn nhấn vào liên kết "Quên mật khẩu?", nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi cho bạn hướng dẫn khôi phục mật khẩu chi tiết.'
    },
    {
      category: 'account',
      question: 'Thông tin cá nhân của tôi có được bảo mật không?',
      answer: 'Có. Student Success Connect cam kết tuân thủ nghiêm ngặt Chính sách quyền riêng tư. Dữ liệu cá nhân và nội dung tư vấn của bạn được mã hóa an toàn và chỉ phục vụ mục đích hỗ trợ học tập.'
    },
    {
      category: 'general',
      question: 'Tôi có thể liên hệ trực tiếp với văn phòng ở đâu?',
      answer: 'Văn phòng Student Success Department đặt tại Phòng 202, Nhà A1, Trường Đại học Giao thông Vận tải. Thời gian làm việc: 8:00 - 17:00 từ Thứ Hai đến Thứ Sáu.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-brand-blue dark:text-sky-400 border border-slate-100 dark:border-slate-800">
          <HelpCircle className="size-3.5" />
          <span>Trung tâm trợ giúp</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-navy dark:text-white">
          Câu Hỏi Thường Gặp (FAQ)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Giải đáp thắc mắc phổ biến về dịch vụ tư vấn, quy trình đặt lịch và tài khoản trên Student Success Connect.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto pt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input 
            type="text"
            placeholder="Tìm kiếm câu hỏi (ví dụ: đặt lịch, hủy lịch, chi phí...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-visible:ring-brand-blue"
          />
        </div>
      </section>

      {/* Quick Access Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-brand-navy text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card 
                key={idx}
                className="border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-brand-navy dark:text-white transition-all cursor-pointer focus:outline-none"
                >
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown 
                    className={`size-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-brand-blue dark:text-sky-400' : ''
                    }`} 
                  />
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-slate-100 dark:border-slate-800' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 space-y-3">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy câu hỏi phù hợp với từ khóa "{searchQuery}"</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Still Have Questions CTA */}
      <Card className="border-brand-blue/20 dark:border-sky-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900/80">
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-brand-navy dark:bg-white text-white dark:text-slate-950 flex items-center justify-center mx-auto">
            <MessageSquare className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-brand-navy dark:text-white">Bạn vẫn cần thêm sự trợ giúp?</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Đội ngũ Student Success luôn sẵn sàng giải đáp thắc mắc riêng của bạn.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild className="bg-brand-navy hover:bg-[#071930] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold px-6 rounded-xl">
              <Link to="/contact">Gửi câu hỏi ngay</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

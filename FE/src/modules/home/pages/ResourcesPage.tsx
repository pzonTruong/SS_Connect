import { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Download, ExternalLink, Bookmark, 
  Clock, Sparkles, FileText, Compass, Heart, GraduationCap, Briefcase, HelpCircle
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';

import { authApi } from '@/modules/auth/api/auth.api';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'career' | 'personal' | 'tools';
  tags: string[];
  duration: string;
  updatedAt: string;
  downloadUrl?: string;
  readUrl?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RESOURCES_DATA: Resource[] = [
  {
    id: 'res-quiz-1',
    title: 'Personal Quiz - Đánh giá năng lực & Định hướng học tập cá nhân',
    description: 'Bài trắc nghiệm đánh giá cá nhân giúp xác định mục tiêu học tập, kỹ năng còn thiếu và hỗ trợ nhận tư vấn chuyên sâu. Kết quả được lưu tự động.',
    category: 'personal',
    tags: ['Personal Quiz', 'Định hướng', 'Trắc nghiệm', 'Nổi bật'],
    duration: '5 - 10 phút',
    updatedAt: '11/08/2026',
    readUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe7QQ_AWfahslM5goYZOBrcqUK5FqztjZwHbxWFNOAw9QGlxw/viewform',
    icon: HelpCircle
  },
  {
    id: 'res-1',
    title: 'Phương pháp ôn thi hiệu quả (Feynman & Pomodoro)',
    description: 'Lộ trình chi tiết áp dụng phương pháp học chủ động Feynman kết hợp quản trị thời gian Pomodoro giúp sinh viên bứt phá điểm số học phần.',
    category: 'academic',
    tags: ['Học tập', 'Phương pháp', 'Mẹo ôn thi'],
    duration: '10 phút đọc',
    updatedAt: '12/07/2026',
    readUrl: 'https://topcv.vn/phuong-phap-pomodoro',
    icon: GraduationCap
  },
  {
    id: 'res-2',
    title: 'Kinh nghiệm viết bài nghiên cứu khoa học sinh viên',
    description: 'Cẩm nang hướng dẫn từ chọn đề tài, lập dàn ý, tìm kiếm tài liệu tham khảo uy tín (Scopus, Google Scholar) đến trình bày báo cáo.',
    category: 'academic',
    tags: ['Nghiên cứu', 'Bài viết', 'Đại học'],
    duration: '15 phút đọc',
    updatedAt: '28/06/2026',
    readUrl: 'https://scholar.google.com/?hl=vi',
    icon: BookOpen
  },
  {
    id: 'res-3',
    title: 'Mẫu CV chuẩn ATS tối giản cho sinh viên mới tốt nghiệp',
    description: 'Tải xuống tệp tin mẫu CV chuyên nghiệp được thiết kế tối giản, kiểm chứng vượt qua các bộ lọc tự động của nhà tuyển dụng lớn.',
    category: 'career',
    tags: ['CV', 'Tuyển dụng', 'Tải xuống'],
    duration: 'Tệp Word/Docs',
    updatedAt: '01/08/2026',
    downloadUrl: 'https://www.topcv.vn/mau-cv',
    icon: Briefcase
  },
  {
    id: 'res-4',
    title: 'Bộ kịch bản trả lời phỏng vấn theo phương pháp STAR',
    description: 'Tổng hợp 30 câu hỏi hành vi phổ biến và hướng dẫn trả lời chi tiết theo cấu trúc: Situation (Tình huống) - Task (Nhiệm vụ) - Action (Hành động) - Result (Kết quả).',
    category: 'career',
    tags: ['Phỏng vấn', 'Kỹ năng', 'Sự nghiệp'],
    duration: '20 phút đọc',
    updatedAt: '15/07/2026',
    readUrl: 'https://www.vietnamworks.com/hrinsider/phuong-phap-star-la-gi-cach-chuyen-nghiep-de-chinh-phuc-nha-tuyen-dung.html',
    icon: Compass
  },
  {
    id: 'res-5',
    title: 'Cẩm nang chăm sóc sức khỏe tinh thần mùa thi cử',
    description: 'Các bài tập thở ngắn, mẹo dinh dưỡng và cách quản lý stress hiệu quả giúp bạn giữ vững phong độ và bình tĩnh trong phòng thi.',
    category: 'personal',
    tags: ['Sức khỏe', 'Tâm lý', 'Cân bằng'],
    duration: '8 phút đọc',
    updatedAt: '05/06/2026',
    readUrl: 'https://suckhoedoisong.vn/cham-soc-suc-khoe-tam-ly-cho-hoc-sinh-mua-thi-169230528151527357.htm',
    icon: Heart
  },
  {
    id: 'res-6',
    title: 'Bảng tính Excel quản lý tài chính sinh viên thông minh',
    description: 'Công cụ lập ngân sách, theo dõi chi tiêu, tiết kiệm hàng tháng với biểu đồ trực quan, thiết kế dành riêng cho ngân sách sinh viên.',
    category: 'tools',
    tags: ['Excel', 'Quản lý tài chính', 'Công cụ'],
    duration: 'Bảng tính Excel',
    updatedAt: '10/05/2026',
    downloadUrl: 'https://templates.office.com/vi-vn/ng%C3%A2n-s%C3%A1ch',
    icon: FileText
  },
  {
    id: 'res-7',
    title: 'Template Notion quản lý học tập & đồ án học kỳ',
    description: 'Không gian làm việc đồng bộ hóa bài tập cá nhân, lịch thi, tài liệu nghiên cứu và tiến độ dự án nhóm trên nền tảng Notion.',
    category: 'tools',
    tags: ['Notion', 'Template', 'Quản lý dự án'],
    duration: 'Notion Template',
    updatedAt: '20/07/2026',
    downloadUrl: 'https://www.notion.so/templates/category/students',
    icon: FileText
  },
  {
    id: 'res-8',
    title: 'Tài liệu hướng dẫn tối ưu hồ sơ LinkedIn chuyên nghiệp',
    description: 'Cách viết phần giới thiệu thu hút, tối ưu từ khóa tìm kiếm và cách tiếp cận các nhà tuyển dụng tiềm năng một cách lịch sự.',
    category: 'career',
    tags: ['LinkedIn', 'Cá nhân', 'Mạng lưới'],
    duration: '12 phút đọc',
    updatedAt: '30/07/2026',
    readUrl: 'https://glints.com/vn/blog/cach-tao-tai-khoan-linkedin-chuyen-nghiep/',
    icon: Briefcase
  },
  {
    id: 'res-9',
    title: 'Tổng hợp 500+ Thuật ngữ Tiếng Anh chuyên ngành IT & Software',
    description: 'Từ điển thuật ngữ lập trình và phát triển phần mềm thiết yếu cho sinh viên ngành Công nghệ thông tin.',
    category: 'academic',
    tags: ['Tiếng Anh', 'Công nghệ', 'Thuật ngữ'],
    duration: '25 phút đọc',
    updatedAt: '05/08/2026',
    readUrl: 'https://developer.mozilla.org/en-US/docs/Glossary',
    icon: GraduationCap
  },
  {
    id: 'res-10',
    title: 'Mẫu Slide Powerpoint / Canva thuyết trình đồ án tốt nghiệp',
    description: 'Bộ sưu tập mẫu slide thuyết trình chuyên nghiệp, chuẩn phong cách hiện đại giúp bài bảo vệ đồ án ấn tượng hơn.',
    category: 'tools',
    tags: ['Slide', 'Canva', 'Thuyết trình'],
    duration: 'Template Canva/PPT',
    updatedAt: '08/08/2026',
    downloadUrl: 'https://www.canva.com/vi_vn/thuyet-trinh/mau/education/',
    icon: Sparkles
  }
];

export const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestTopic, setRequestTopic] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    authApi.getMe()
      .then((res) => setUserRole(res.data?.role || null))
      .catch(() => setUserRole(null));
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem('ss_connect_bookmarked_resources');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading bookmarks', e);
      }
    }
  }, []);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(item => item !== id);
      toast.success('Đã xóa khỏi danh sách lưu trữ');
    } else {
      updated = [...bookmarkedIds, id];
      toast.success('Đã lưu tài liệu thành công!');
    }
    setBookmarkedIds(updated);
    localStorage.setItem('ss_connect_bookmarked_resources', JSON.stringify(updated));
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail || !requestTopic) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    
    // Simulate sending request
    toast.success('Yêu cầu tài liệu của bạn đã được ghi nhận. Chúng tôi sẽ phản hồi sớm!');
    
    // Reset state
    setRequestName('');
    setRequestEmail('');
    setRequestTopic('');
    setRequestDesc('');
    setIsDialogOpen(false);
  };

  const filteredResources = RESOURCES_DATA.filter(res => {
    if (res.id === 'res-quiz-1' && userRole !== 'user') {
      return false;
    }

    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (selectedCategory === 'bookmarked') {
      return matchesSearch && bookmarkedIds.includes(res.id);
    }
    
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B2545] dark:via-slate-900 to-slate-950 px-6 py-16 sm:px-12 sm:py-24 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-brand-brown/10 blur-3xl" />
        
        <div className="relative max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-300 border border-white/10">
            <Sparkles className="size-3.5" />
            <span>Thư viện tài liệu học tập & kỹ năng</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Tài Nguyên Thành Công
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Tổng hợp các tài liệu hướng dẫn học thuật, cẩm nang phát triển kỹ năng mềm, mẫu CV chuẩn và công cụ quản lý giúp hành trình đại học của bạn trở nên dễ dàng hơn.
          </p>

          {/* Premium Search Input Container */}
          <div className="relative max-w-md mx-auto pt-4 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors duration-200 size-5" />
            <Input 
              type="text"
              placeholder="Tìm kiếm tài liệu, biểu mẫu, từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/15 border-white/10 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-300 shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* Tabs and Content Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'academic', label: 'Học thuật' },
              { id: 'career', label: 'Sự nghiệp' },
              { id: 'personal', label: 'Phát triển cá nhân' },
              { id: 'tools', label: 'Công cụ & Biểu mẫu' },
              { id: 'bookmarked', label: `Đã lưu (${bookmarkedIds.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-brand-navy text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/5'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Hiển thị {filteredResources.length} tài nguyên
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = resource.icon;
              const isSaved = bookmarkedIds.includes(resource.id);
              
              return (
                <Card 
                  key={resource.id}
                  className="group relative flex flex-col justify-between overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100/40 dark:hover:shadow-black/20"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:bg-brand-navy group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950 transition-all duration-300 text-brand-navy dark:text-slate-200">
                        <IconComponent className="size-5 sm:size-6" />
                      </div>
                      
                      {/* Bookmark button */}
                      <button
                        onClick={() => toggleBookmark(resource.id)}
                        className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSaved 
                            ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30 dark:border-rose-900/50' 
                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                        }`}
                        title={isSaved ? "Xóa khỏi danh sách lưu" : "Lưu tài liệu"}
                      >
                        <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-brand-blue dark:group-hover:text-sky-400 transition-colors duration-200">
                        {resource.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resource.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-slate-800/80 my-2" />

                    {/* Actions & Meta */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {resource.duration}
                      </span>
                      
                      {resource.downloadUrl ? (
                        <a
                          href={resource.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-brown hover:bg-[#4E2505] rounded-lg transition duration-200"
                        >
                          <Download className="size-3.5" />
                          Tải xuống
                        </a>
                      ) : (
                        <a
                          href={resource.readUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-navy hover:bg-[#071930] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-lg transition duration-200"
                        >
                          Đọc ngay
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 bg-slate-50/20 dark:bg-slate-900/10">
            <BookOpen className="size-12 mx-auto text-slate-350 dark:text-slate-650" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Không tìm thấy tài nguyên nào</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {selectedCategory === 'bookmarked' 
                ? 'Bạn chưa lưu tài liệu nào. Hãy nhấn biểu tượng bookmark trên thẻ tài liệu để lưu lại!'
                : 'Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục tài liệu khác.'}
            </p>
          </div>
        )}
      </section>

      {/* Request Resource CTA Section */}
      <section className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-[#E9F0F8]/40 dark:bg-slate-900/20 p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white tracking-tight">
              Bạn chưa tìm thấy tài nguyên mình cần?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Đội ngũ Student Success luôn cố gắng cập nhật những tài liệu hữu ích nhất. Gửi yêu cầu của bạn và chúng tôi sẽ cố gắng tìm kiếm, biên soạn hoặc giới thiệu chuyên gia phù hợp giúp đỡ bạn.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-brand-navy hover:bg-[#071930] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold px-6 py-5 rounded-xl transition duration-200">
                  Gửi yêu cầu tài liệu
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-brand-navy dark:text-white">Yêu Cầu Tài Liệu</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Hãy cho chúng tôi biết bạn đang tìm kiếm tài liệu hoặc biểu mẫu nào.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestSubmit} className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Họ và tên *</label>
                    <Input 
                      required 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      value={requestName} 
                      onChange={(e) => setRequestName(e.target.value)}
                      className="rounded-lg border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email liên hệ *</label>
                    <Input 
                      required 
                      type="email" 
                      placeholder="email@example.com" 
                      value={requestEmail} 
                      onChange={(e) => setRequestEmail(e.target.value)}
                      className="rounded-lg border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chủ đề / Tên tài liệu *</label>
                    <Input 
                      required 
                      type="text" 
                      placeholder="Mẫu lập kế hoạch công việc hàng ngày..." 
                      value={requestTopic} 
                      onChange={(e) => setRequestTopic(e.target.value)}
                      className="rounded-lg border-slate-200 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả chi tiết (Tùy chọn)</label>
                    <textarea 
                      placeholder="Vui lòng mô tả chi tiết nội dung tài liệu bạn muốn nhận..." 
                      value={requestDesc} 
                      onChange={(e) => setRequestDesc(e.target.value)}
                      rows={3}
                      className="w-full text-sm rounded-lg p-2.5 bg-transparent border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-slate-900 dark:text-white"
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-brand-navy hover:bg-[#071930] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold rounded-lg transition"
                    >
                      Gửi yêu cầu
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
};

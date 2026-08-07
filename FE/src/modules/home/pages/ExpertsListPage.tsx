import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Briefcase, Star } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { AiRecommendBox } from '../components/AiRecommendBox';

interface Expert {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  experienceYears?: number;
  specialties?: string[];
  consultingType?: string[];
  ratingAverage?: number;
  reviewCount?: number;
}

const SPECIALTY_OPTIONS = [
  'Tất cả lĩnh vực',
  'Định hướng nghề nghiệp',
  'Sửa CV',
  'Portfolio',
  'Phỏng vấn',
  'Job matching',
  'Web Development',
  'Data Analysis',
  'Business Analysis'
];

export const ExpertsListPage = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả lĩnh vực');
  const userRole = localStorage.getItem('user_role');

  useEffect(() => {
    http.get('/profile/experts')
      .then((res) => {
        setExperts(res.data);
        setFilteredExperts(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch experts:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let result = experts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.displayName.toLowerCase().includes(q) ||
          (exp.title && exp.title.toLowerCase().includes(q)) ||
          (exp.bio && exp.bio.toLowerCase().includes(q))
      );
    }

    if (selectedSpecialty !== 'Tất cả lĩnh vực') {
      result = result.filter(
        (exp) => exp.specialties && exp.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredExperts(result);
  }, [search, selectedSpecialty, experts]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-brand-navy to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-2xl text-white p-8 sm:p-12 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Đội Ngũ Chuyên Gia Tư Vấn</h1>
          <p className="text-sm text-slate-350 dark:text-slate-400 leading-relaxed">
            Xem danh sách các cố vấn Student Success, nghiên cứu lĩnh vực chuyên môn của từng chuyên gia và lựa chọn người phù hợp nhất để đồng hành giải quyết các thắc mắc của bạn.
          </p>
        </div>
      </section>

      {/* AI Recommendation Banner */}
      <AiRecommendBox
        expertsMap={experts.reduce((map, e) => ({ ...map, [e._id]: e }), {})}
      />

      {/* Search & Filter tools */}
      <section className="grid gap-4 sm:flex sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc chức danh chuyên gia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SPECIALTY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Experts grid listing */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-[340px]" />
          ))}
        </div>
      ) : filteredExperts.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-card space-y-3">
          <p className="text-muted-foreground text-base">Không tìm thấy chuyên gia nào phù hợp với bộ lọc hiện tại.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setSelectedSpecialty('Tất cả lĩnh vực'); }}>
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExperts.map((exp) => (
            <Card key={exp._id} className="flex flex-col h-full border hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden bg-card">
              <div className="p-5 flex gap-4 border-b bg-neutral-50/50 dark:bg-neutral-900/10">
                <Avatar className="size-16 border shrink-0">
                  <img src={exp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} alt={exp.displayName} className="object-cover w-full h-full" />
                </Avatar>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-base leading-tight hover:text-primary transition-colors flex items-center justify-between">
                    <Link to={`/experts/${exp._id}`}>{exp.displayName}</Link>
                  </h3>
                  <p className="text-xs font-semibold text-primary/95 uppercase tracking-wider">{exp.title || 'SS Consultant'}</p>
                  
                  {/* Rating display */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{exp.ratingAverage ? exp.ratingAverage.toFixed(1) : '5.0'}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">({exp.reviewCount || 0} đánh giá)</span>
                  </div>

                  {exp.experienceYears && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                      <Briefcase className="size-3 text-slate-400" />
                      <span>{exp.experienceYears} năm kinh nghiệm</span>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {exp.bio || 'Chuyên gia tư vấn định hướng phát triển nghề nghiệp cho học viên MindX.'}
                </p>

                <div className="space-y-3">
                  {/* Specialties tags */}
                  {exp.specialties && exp.specialties.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lĩnh vực tư vấn:</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.specialties.map((spec) => (
                          <span key={spec} className="inline-flex text-[9px] font-semibold bg-secondary text-secondary-foreground py-0.5 px-2 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consulting Type (online/offline) */}
                  {exp.consultingType && exp.consultingType.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hình thức:</span>
                      <span className="capitalize">{exp.consultingType.join(' & ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t mt-auto">
                  <Link to={`/experts/${exp._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-bold text-xs py-2 rounded-lg transition-all duration-200 shadow-xs">
                      Xem chi tiết
                    </Button>
                  </Link>
                  {userRole !== 'admin' && userRole !== 'expert' && (
                    <Link to={`/booking/${exp._id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs font-semibold bg-brand-brown hover:bg-[#4E2505] text-white dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-300 transition-colors duration-200">
                        Đặt lịch
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Avatar placeholder
const Avatar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

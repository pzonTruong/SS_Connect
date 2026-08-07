import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface Expert {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  experienceYears?: number;
  specialties?: string[];
}

interface FeaturedExpertsProps {
  experts: Expert[];
  loading: boolean;
}

const FALLBACK_EXPERTS: Expert[] = [
  {
    _id: 'fallback-1',
    displayName: 'Nguyễn Thu Hà',
    email: 'expert1@ssconnect.dev',
    title: 'Marketing Strategy',
    bio: '10+ năm kinh nghiệm tại các tập đoàn đa quốc gia. Chuyên tư vấn xây dựng thương hiệu cá nhân...',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    experienceYears: 10,
  },
  {
    _id: 'fallback-2',
    displayName: 'Trần Minh Hoàng',
    email: 'expert2@ssconnect.dev',
    title: 'Software Engineering',
    bio: 'Tech Lead tại TechCorp. Sẵn sàng hỗ trợ các bạn sinh viên IT thiết lập lộ trình học tập hiệu quả...',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
    experienceYears: 8,
  },
  {
    _id: 'fallback-3',
    displayName: 'Lê Ngọc Mai',
    email: 'expert3@ssconnect.dev',
    title: 'UX/UI Design',
    bio: 'Product Designer đam mê tạo ra các trải nghiệm người dùng tuyệt vời. Từng tư vấn xây dựng...',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    experienceYears: 6,
  },
  {
    _id: 'fallback-4',
    displayName: 'Phạm Quốc Bảo',
    email: 'expert4@ssconnect.dev',
    title: 'Finance & Banking',
    bio: 'Giám đốc tài chính với tầm nhìn chiến lược. Hỗ trợ sinh viên ngành tài chính ngân hàng chuẩn bị...',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80',
    experienceYears: 12,
  },
];

export const FeaturedExperts = ({ experts, loading }: FeaturedExpertsProps) => {
  // Use backend experts if available, otherwise display fallback mockup data
  const displayExperts = experts.length > 0 ? experts.slice(0, 4) : FALLBACK_EXPERTS;
  const userRole = localStorage.getItem('user_role');

  return (
    <section className="py-12 md:py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white">
            Chuyên Gia Nổi Bật
          </h2>
        </div>
        <Link 
          to="/experts" 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:opacity-85 transition-opacity"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Grid */}
      {loading && experts.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-0 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto mb-4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayExperts.map((exp) => {
            const isFallback = exp._id.startsWith('fallback-');
            const bookingPath = isFallback ? '/experts' : `/booking/${exp._id}`;
            const profilePath = isFallback ? '/experts' : `/experts/${exp._id}`;

            return (
              <Card 
                key={exp._id} 
                className="border-0 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_4px_25px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-2xl overflow-hidden group"
              >
                <CardContent className="pt-8 pb-6 px-5 text-center flex flex-col h-full justify-between items-center">
                  <div>
                    {/* Avatar frame */}
                    <div className="size-24 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 mx-auto mb-4 bg-slate-50 dark:bg-slate-950">
                      <img
                        src={exp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'}
                        alt={exp.displayName}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-550"
                      />
                    </div>
                    
                    {/* Name */}
                    <h3 className="text-base font-bold text-brand-navy dark:text-white mb-1 tracking-tight">
                      {exp.displayName}
                    </h3>
                    
                    {/* Subtitle / Role */}
                    <p className="text-xs font-semibold text-brand-blue tracking-wide mb-4">
                      {exp.title || 'SS Consultant'}
                    </p>
                    
                    {/* Short Bio */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 h-9 mb-6">
                      {exp.bio || 'Chuyên gia tư vấn định hướng phát triển nghề nghiệp cho học viên MindX.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full mt-4">
                    <Link to={profilePath} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-bold text-xs py-2 rounded-lg transition-all duration-200 shadow-xs"
                      >
                        Profile
                      </Button>
                    </Link>
                    {userRole !== 'admin' && userRole !== 'expert' && (
                      <Link to={bookingPath} className="flex-1">
                        <Button 
                          className="w-full bg-brand-brown text-white font-bold text-xs py-2 rounded-md transition-all duration-200"
                        >
                          Book Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

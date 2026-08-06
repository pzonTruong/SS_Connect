import { useEffect, useState } from 'react';
import { http } from '@/shared/api/http';
import { HeroSection } from '../components/HeroSection';
import { ProcessSection } from '../components/ProcessSection';
import { FeaturedExperts } from '../components/FeaturedExperts';

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

export const HomePage = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/profile/experts')
      .then((res) => {
        setExperts(res.data.slice(0, 4)); // Show top 4
      })
      .catch((err) => {
        console.error('Failed to fetch experts:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Simple booking process */}
      <ProcessSection />

      {/* Featured Experts */}
      <FeaturedExperts experts={experts} loading={loading} />
    </div>
  );
};

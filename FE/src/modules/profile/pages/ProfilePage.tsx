import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { AvatarUpload } from '@/modules/profile/components/AvatarUpload';
import { ProfileEditForm } from '@/modules/profile/components/ProfileEditForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import type { CurrentUser } from '@/modules/auth/types/auth.types';


export const ProfilePage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data as CurrentUser);
    } catch {
      tokenStore.clear();
      navigate('/logout');
    }
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hồ Sơ Cá Nhân</h1>
          <p className="text-sm text-muted-foreground">Quản lý thông tin tài khoản và thông tin cá nhân của bạn.</p>
        </div>
        <Link to="/settings">
          <Button variant="outline" size="sm" className="gap-2 font-medium">
            <Settings className="size-4 text-indigo-600" />
            Cài đặt hệ thống & Thông báo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left column — avatar */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="flex flex-col items-center gap-4 p-6 shadow-sm">
            <AvatarUpload
              currentAvatarUrl={user?.avatarUrl}
              userInitials={initials}
              onUploadSuccess={(newUrl) => setUser((prev) => prev ? { ...prev, avatarUrl: newUrl } : prev)}
            />
            <div className="text-center">
              {user?.displayName && (
                <p className="font-semibold text-foreground text-base">{user.displayName}</p>
              )}
              <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {user?.role === 'expert' ? 'Chuyên gia SS' : user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
              </span>
            </div>
          </Card>
        </div>

        {/* Right column — edit form */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Chỉnh Sửa Thông Tin Cá Nhân</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <ProfileEditForm
                role={user.role}
                defaultValues={{
                  displayName: user.displayName ?? '',
                  bio: user.bio ?? '',
                  phone: user.phone ?? '',
                  title: user.title ?? '',
                  experienceYears: user.experienceYears ?? 0,
                  specialties: user.specialties ? user.specialties.join(', ') : '',
                  achievements: user.achievements ? user.achievements.join('\n') : '',
                  consultingStyle: user.consultingStyle ?? '',
                  consultingType: user.consultingType ?? ['online'],
                }}
                onSuccess={fetchUser}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Đang tải thông tin…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

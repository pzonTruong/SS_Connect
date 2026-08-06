import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { profileApi } from '@/modules/profile/api/profile.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const schema = z.object({
  displayName: z.string().max(60, 'Tối đa 60 ký tự').optional(),
  bio: z.string().max(500, 'Tối đa 500 ký tự').optional(),
  phone: z.string().max(20, 'Tối đa 20 ký tự').optional(),
  
  // Expert fields
  title: z.string().max(100, 'Tối đa 100 ký tự').optional(),
  experienceYears: z.union([z.number(), z.string()]).optional(),
  specialties: z.string().optional(),
  achievements: z.string().optional(),
  consultingStyle: z.string().optional(),
  consultingType: z.array(z.enum(['online', 'offline'])).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProfileEditFormProps {
  role?: 'user' | 'expert' | 'admin';
  defaultValues: FormValues;
  onSuccess: () => void;
}

export const ProfileEditForm = ({ role, defaultValues, onSuccess }: ProfileEditFormProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const bioValue = watch('bio') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      if (role === 'expert') {
        const payload = {
          displayName: values.displayName?.trim() || undefined,
          bio: values.bio?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          title: values.title?.trim() || undefined,
          experienceYears: values.experienceYears !== undefined ? Number(values.experienceYears) : undefined,
          specialties: values.specialties
            ? values.specialties.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          achievements: values.achievements
            ? values.achievements.split('\n').map((a) => a.trim()).filter(Boolean)
            : [],
          consultingStyle: values.consultingStyle?.trim() || undefined,
          consultingType: values.consultingType || [],
        };
        await profileApi.updateExpertDetails(payload);
      } else {
        const payload = {
          displayName: values.displayName?.trim() || undefined,
          bio: values.bio?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
        };
        await profileApi.updateProfile(payload);
      }
      toast.success('Cập nhật hồ sơ thành công.');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="displayName">Họ và Tên</Label>
        <Input
          id="displayName"
          placeholder="Nhập họ tên của bạn"
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Giới thiệu bản thân (Bio)</Label>
          <span className="text-xs text-muted-foreground">{bioValue.length}/500</span>
        </div>
        <textarea
          id="bio"
          rows={3}
          placeholder="Chia sẻ một chút về bản thân bạn..."
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          placeholder="Ví dụ: 0912345678"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {role === 'expert' && (
        <div className="space-y-5 pt-5 border-t border-border">
          <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Thông Tin Chuyên Gia / SS</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Chức danh / Lĩnh vực chuyên môn</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Software Engineering, Product Designer"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Số năm kinh nghiệm</Label>
              <Input
                id="experienceYears"
                type="number"
                placeholder="Ví dụ: 5"
                {...register('experienceYears')}
              />
              {errors.experienceYears && (
                <p className="text-xs text-destructive">{errors.experienceYears.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Các thế mạnh hỗ trợ (Phân cách bằng dấu phẩy)</Label>
            <Input
              id="specialties"
              placeholder="Ví dụ: Định hướng lộ trình học, Sửa CV, Luyện phỏng vấn, Web Development"
              {...register('specialties')}
            />
            {errors.specialties && (
              <p className="text-xs text-destructive">{errors.specialties.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Thành tựu nổi bật (Mỗi dòng một thành tựu)</Label>
            <textarea
              id="achievements"
              rows={3}
              placeholder="Ví dụ: Tech Lead quản lý đội ngũ 15 kỹ sư phần mềm&#10;Dẫn dắt 50+ học viên trúng tuyển tại các studio hàng đầu"
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('achievements')}
            />
            {errors.achievements && (
              <p className="text-xs text-destructive">{errors.achievements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultingStyle">Phong cách tư vấn</Label>
            <textarea
              id="consultingStyle"
              rows={3}
              placeholder="Ví dụ: Chú trọng thực hành, tư duy logic sâu sắc và giải quyết vấn đề từ gốc..."
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('consultingStyle')}
            />
            {errors.consultingStyle && (
              <p className="text-xs text-destructive">{errors.consultingStyle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="block mb-1.5">Hình thức tư vấn hỗ trợ</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-350">
                <input
                  type="checkbox"
                  value="online"
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  {...register('consultingType')}
                />
                Online (Qua Google Meet)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-350">
                <input
                  type="checkbox"
                  value="offline"
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  {...register('consultingType')}
                />
                Offline (Trực tiếp tại cơ sở)
              </label>
            </div>
            {errors.consultingType && (
              <p className="text-xs text-destructive">{errors.consultingType.message}</p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full bg-brand-brown hover:bg-[#4E2505] text-white" disabled={saving}>
        {saving ? 'Đang lưu…' : 'Lưu Thay Đổi'}
      </Button>
    </form>
  );
};

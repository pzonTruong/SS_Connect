import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bell, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { profileApi } from '@/modules/profile/api/profile.api';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

interface NotificationSettingsCardProps {
  user: CurrentUser;
  onSuccess: () => void;
}

const LEAD_TIME_OPTIONS = [
  { value: 15, label: '15 phút trước buổi họp' },
  { value: 30, label: '30 phút trước buổi họp (Khuyên dùng)' },
  { value: 60, label: '1 giờ (60 phút) trước buổi họp' },
  { value: 120, label: '2 giờ (120 phút) trước buổi họp' },
  { value: 1440, label: '1 ngày (24 giờ) trước buổi họp' },
];

export const NotificationSettingsCard = ({ user, onSuccess }: NotificationSettingsCardProps) => {
  const [enabled, setEnabled] = useState<boolean>(user.reminderEnabled ?? true);
  const [leadTime, setLeadTime] = useState<number>(user.reminderLeadTimeMinutes ?? 30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(user.reminderEnabled ?? true);
    setLeadTime(user.reminderLeadTimeMinutes ?? 30);
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user.role === 'expert') {
        await profileApi.updateExpertDetails({
          reminderEnabled: enabled,
          reminderLeadTimeMinutes: leadTime,
        });
      } else {
        await profileApi.updateProfile({
          reminderEnabled: enabled,
          reminderLeadTimeMinutes: leadTime,
        });
      }
      toast.success('Cập nhật cài đặt thông báo nhắc lịch thành công!');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể cập nhật cài đặt thông báo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border/80 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Bell className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Cài Đặt Thông Báo Lịch Hẹn</CardTitle>
            <CardDescription className="text-sm">
              Tùy chỉnh thời gian nhận email nhắc nhở tự động trước mỗi buổi tư vấn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Toggle switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
          <div className="space-y-0.5">
            <Label htmlFor="reminder-toggle" className="text-base font-medium cursor-pointer">
              Bật thông báo nhắc lịch hẹn qua email
            </Label>
            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ gửi email nhắc nhở bạn chuẩn bị trước khi buổi tư vấn bắt đầu.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="reminder-toggle"
              type="checkbox"
              className="sr-only peer"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Lead time selection */}
        {enabled && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-purple-600" />
              Chọn thời gian thông báo trước buổi hẹn
            </Label>
            <div className="grid gap-2 sm:grid-cols-1">
              {LEAD_TIME_OPTIONS.map((opt) => {
                const isSelected = leadTime === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLeadTime(opt.value)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border text-left text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-sm'
                        : 'border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900 text-foreground'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="size-4 text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md shadow-purple-500/20"
        >
          {saving ? 'Đang lưu…' : 'Lưu Cài Đặt Thông Báo'}
        </Button>
      </CardContent>
    </Card>
  );
};

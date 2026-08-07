import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, Clock, CheckCircle2, Sun, Moon, Laptop, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { authApi } from '@/modules/auth/api/auth.api';
import { profileApi } from '@/modules/profile/api/profile.api';
import { getTheme, setTheme, type Theme } from '@/shared/lib/utils';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

const LEAD_TIME_PRESETS = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút (Mặc định)' },
  { value: 60, label: '1 giờ' },
  { value: 120, label: '2 giờ' },
  { value: 1440, label: '1 ngày (24 giờ)' },
];

export const SettingsPage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification state
  const [enabled, setEnabled] = useState<boolean>(true);
  const [leadTime, setLeadTime] = useState<number>(30); // in minutes

  // Custom time controls
  const [customValue, setCustomValue] = useState<number>(30);
  const [customUnit, setCustomUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');

  const navigate = useNavigate();

  useEffect(() => {
    setCurrentTheme(getTheme());

    const fetchUserData = async () => {
      try {
        const res = await authApi.getMe();
        const userData = res.data as CurrentUser;
        setUser(userData);
        setEnabled(userData.reminderEnabled ?? true);

        const minutes = userData.reminderLeadTimeMinutes ?? 30;
        setLeadTime(minutes);

        // Determine if initial minutes matches a preset
        const isPreset = LEAD_TIME_PRESETS.some((p) => p.value === minutes);
        if (!isPreset) {
          setIsCustomMode(true);
          if (minutes % 1440 === 0) {
            setCustomValue(minutes / 1440);
            setCustomUnit('days');
          } else if (minutes % 60 === 0) {
            setCustomValue(minutes / 60);
            setCustomUnit('hours');
          } else {
            setCustomValue(minutes);
            setCustomUnit('minutes');
          }
        } else {
          setCustomValue(minutes);
          setCustomUnit('minutes');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchUserData();
  }, []);

  const updateLeadTimeFromCustom = (val: number, unit: 'minutes' | 'hours' | 'days') => {
    const num = Math.max(1, val);
    setCustomValue(num);
    setCustomUnit(unit);
    const multiplier = unit === 'hours' ? 60 : unit === 'days' ? 1440 : 1;
    setLeadTime(num * multiplier);
  };

  const handlePresetSelect = (presetMinutes: number) => {
    setIsCustomMode(false);
    setLeadTime(presetMinutes);
    if (presetMinutes % 1440 === 0) {
      setCustomValue(presetMinutes / 1440);
      setCustomUnit('days');
    } else if (presetMinutes % 60 === 0) {
      setCustomValue(presetMinutes / 60);
      setCustomUnit('hours');
    } else {
      setCustomValue(presetMinutes);
      setCustomUnit('minutes');
    }
  };

  const formatDisplayTime = (totalMinutes: number): string => {
    if (totalMinutes < 60) return `${totalMinutes} phút`;
    if (totalMinutes < 1440) {
      const hrs = totalMinutes / 60;
      return Number.isInteger(hrs) ? `${hrs} giờ` : `${totalMinutes} phút (${hrs.toFixed(1)} giờ)`;
    }
    const days = totalMinutes / 1440;
    return Number.isInteger(days) ? `${days} ngày` : `${totalMinutes} phút (${days.toFixed(1)} ngày)`;
  };

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    toast.success(`Đã đổi giao diện sang: ${newTheme === 'light' ? 'Sáng' : newTheme === 'dark' ? 'Tối' : 'Theo hệ thống'}`);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    if (enabled && (leadTime < 5 || leadTime > 10080)) {
      toast.error('Thời gian nhắc nhở tối thiểu là 5 phút và tối đa là 7 ngày (10.080 phút).');
      return;
    }

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
      toast.success(`Cập nhật thông báo thành công! Nhắc trước ${formatDisplayTime(leadTime)}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể cập nhật cài đặt thông báo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Đang tải cài đặt hệ thống…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex items-center gap-3.5 border-b border-border/60 pb-5">
        <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <SettingsIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cài Đặt Hệ Thống</h1>
          <p className="text-sm text-muted-foreground">
            Tùy chỉnh thông báo nhắc nhở lịch hẹn và chế độ hiển thị giao diện cá nhân.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Meeting Notification Settings */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Bell className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Thông Báo Nhắc Lịch Hẹn Tư Vấn</CardTitle>
                <CardDescription className="text-sm">
                  Cấu hình nhận email nhắc nhở tự động linh hoạt trước khi buổi tư vấn chính thức bắt đầu
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Toggle switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="reminder-toggle" className="text-base font-medium cursor-pointer">
                  Bật thông báo nhắc lịch qua Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Gửi email thông báo tự động đến địa chỉ <span className="font-semibold text-foreground">{user?.email}</span> trước giờ họp.
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

            {/* Flexible lead time selection */}
            {enabled && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="size-4 text-purple-600" />
                  Chọn thời gian nhắc nhở trước buổi họp
                </Label>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Mốc thời gian có sẵn:</p>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_TIME_PRESETS.map((p) => {
                      const isSelected = !isCustomMode && leadTime === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => handlePresetSelect(p.value)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                              : 'border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Flexible Time Input */}
                <div className="p-4 rounded-xl border border-dashed border-purple-300 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                      ⚡ Hoặc tự nhập khoảng thời gian tùy chỉnh:
                    </span>
                    {isCustomMode && (
                      <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                        Đang áp dụng tùy chỉnh
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Nhắc trước:</span>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={customValue}
                        onChange={(e) => {
                          setIsCustomMode(true);
                          updateLeadTimeFromCustom(parseInt(e.target.value, 10) || 1, customUnit);
                        }}
                        className="w-20 px-3 py-1.5 rounded-lg border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={customUnit}
                        onChange={(e) => {
                          setIsCustomMode(true);
                          updateLeadTimeFromCustom(customValue, e.target.value as any);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="minutes">Phút</option>
                        <option value="hours">Giờ</option>
                        <option value="days">Ngày</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Live Preview Summary */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-purple-100/70 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 text-xs font-medium border border-purple-200 dark:border-purple-800">
                  <CheckCircle2 className="size-4 text-purple-600 shrink-0" />
                  <span>
                    Email nhắc nhở tự động sẽ được gửi trước buổi họp đúng <strong>{formatDisplayTime(leadTime)}</strong>.
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 shadow-md shadow-purple-500/20"
              >
                {saving ? 'Đang lưu…' : 'Lưu Cài Đặt Thông Báo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Theme Settings */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sun className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Chế Độ Giao Diện (Theme)</CardTitle>
                <CardDescription className="text-sm">
                  Chọn tông màu hiển thị ứng dụng phù hợp với sở thích của bạn
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-center ${
                  currentTheme === 'light'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                    : 'border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Sun className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Giao diện Sáng (Light)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tông màu sáng trực quan</p>
                </div>
                {currentTheme === 'light' && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Đang chọn
                  </span>
                )}
              </button>

              {/* Dark Theme */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-center ${
                  currentTheme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                    : 'border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="p-3 rounded-full bg-slate-800 text-indigo-400">
                  <Moon className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Giao diện Tối (Dark)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Dịu mắt khi làm việc ban đêm</p>
                </div>
                {currentTheme === 'dark' && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    Đang chọn
                  </span>
                )}
              </button>

              {/* System Theme */}
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-center ${
                  currentTheme === 'system'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30'
                    : 'border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Laptop className="size-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Theo hệ thống (System)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tự động theo thiết bị</p>
                </div>
                {currentTheme === 'system' && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Đang chọn
                  </span>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info card */}
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
              <span>Đang đăng nhập dưới tài khoản: <strong className="text-foreground">{user?.email}</strong> ({user?.role === 'expert' ? 'Chuyên gia' : user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'})</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Đi đến Hồ sơ cá nhân
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Calendar, AlertTriangle, RefreshCw, BarChart2, Users, Trash2, Plus, Edit } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

interface UserRecord {
  _id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'expert' | 'admin';
  phone?: string;
  isEmailVerified: boolean;
}

interface ExpertDetails {
  displayName: string;
  email: string;
  title?: string;
}

interface Booking {
  _id: string;
  studentId: { _id: string; displayName?: string; email: string };
  expertId: ExpertDetails;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  bookingType: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  meetingLink?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled_student' | 'cancelled_expert' | 'no_show' | 'reschedule_needed';
}

interface Stats {
  total: number;
  statuses: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
    reschedule: number;
  };
  dailyStats: { _id: string; count: number }[];
  expertStats: { expert: { displayName: string; title?: string }; count: number }[];
}

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'stats' | 'create-expert'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Reschedule Form State
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [rescheduleMode, setRescheduleMode] = useState<'online' | 'offline'>('online');

  // Direct Expert Form State
  const [expEmail, setExpEmail] = useState('');
  const [expPassword, setExpPassword] = useState('');
  const [expName, setExpName] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expExperience, setExpExperience] = useState(1);
  const [expSpecialties, setExpSpecialties] = useState('');
  const [expStyle, setExpStyle] = useState('');
  const [expAchievements, setExpAchievements] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await http.get('/bookings/admin/all');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải tất cả lịch tư vấn');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await http.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách tài khoản');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await http.get('/bookings/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchUsers(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await http.put(`/bookings/${bookingId}/status`, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Cập nhật thất bại');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingId) return;

    try {
      await http.put(`/bookings/admin/${reschedulingId}/reschedule`, {
        date: newDate,
        time: newTime,
        mode: rescheduleMode
      });
      toast.success('Đổi lịch tư vấn thành công!');
      setReschedulingId(null);
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Đổi lịch tư vấn thất bại');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await http.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Thay đổi vai trò người dùng thành công');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Thay đổi vai trò thất bại');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const check = window.confirm('Bạn có thực sự muốn xóa tài khoản này khỏi hệ thống?');
    if (!check) return;

    try {
      await http.delete(`/admin/users/${userId}`);
      toast.success('Xóa tài khoản thành công');
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Xóa tài khoản thất bại');
    }
  };

  const handleCreateExpert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expEmail || !expPassword || !expName) {
      toast.warning('Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên chuyên gia');
      return;
    }

    try {
      const specialtiesArray = expSpecialties.split(',').map((s) => s.trim()).filter(Boolean);
      const achievementsArray = expAchievements.split('\n').map((a) => a.trim()).filter(Boolean);

      await http.post('/admin/experts', {
        email: expEmail,
        password: expPassword,
        displayName: expName,
        title: expTitle,
        experienceYears: Number(expExperience),
        specialties: specialtiesArray,
        consultingStyle: expStyle,
        achievements: achievementsArray,
        consultingType: ['online', 'offline']
      });

      toast.success('Tạo tài khoản chuyên gia thành công!');
      setExpEmail('');
      setExpPassword('');
      setExpName('');
      setExpTitle('');
      setExpExperience(1);
      setExpSpecialties('');
      setExpStyle('');
      setExpAchievements('');
      setActiveTab('users');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể tạo chuyên gia');
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 uppercase text-[9px] font-bold">Chờ duyệt</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-blue-400 text-blue-600 bg-blue-50 uppercase text-[9px] font-bold">Đã xác nhận</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 uppercase text-[9px] font-bold">Hoàn thành</Badge>;
      case 'cancelled_student':
        return <Badge variant="outline" className="border-neutral-300 text-neutral-400 uppercase text-[9px] font-bold">Học viên hủy</Badge>;
      case 'cancelled_expert':
        return <Badge variant="outline" className="border-neutral-300 text-neutral-400 uppercase text-[9px] font-bold">Chuyên gia hủy</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="border-red-400 text-red-500 bg-red-50 uppercase text-[9px] font-bold">Vắng mặt</Badge>;
      case 'reschedule_needed':
        return <Badge variant="outline" className="border-purple-400 text-purple-600 bg-purple-50 uppercase text-[9px] font-bold">Yêu cầu đổi lịch</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] font-bold uppercase">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-muted-foreground">Đang tải trang quản trị viên hệ thống...</div>;
  }

  return (
    <div className="space-y-8 pb-12 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Bảng Quản Trị Hệ Thống</h1>
          <p className="text-sm text-muted-foreground">Tech Lead / Admin kiểm soát tất cả tài khoản, lịch hẹn tư vấn và thống kê đo lường hiệu quả.</p>
        </div>
        
        <div className="flex items-center gap-1.5 self-start">
          <Button size="sm" variant="outline" onClick={loadAllData}>
            <RefreshCw className="size-4 mr-1" /> Đồng bộ
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          size="sm"
          variant={activeTab === 'bookings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('bookings')}
          className="font-bold text-xs"
        >
          <Calendar className="size-3.5 mr-1" /> Quản lý Lịch hẹn ({bookings.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="font-bold text-xs"
        >
          <Users className="size-3.5 mr-1" /> Quản lý Tài khoản ({users.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'stats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stats')}
          className="font-bold text-xs"
        >
          <BarChart2 className="size-3.5 mr-1" /> Thống kê & Báo cáo
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'create-expert' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('create-expert')}
          className="font-bold text-xs"
        >
          <Plus className="size-3.5 mr-1" /> Thêm chuyên gia
        </Button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <section className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-xs text-center py-12 text-muted-foreground">Chưa có bản ghi đặt lịch hẹn nào.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                  <tr>
                    <th className="p-3">Học viên</th>
                    <th className="p-3">Chuyên gia</th>
                    <th className="p-3">Chủ đề</th>
                    <th className="p-3">Thời gian</th>
                    <th className="p-3">Hình thức</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{booking.studentName}</p>
                        <p className="text-[10px] text-muted-foreground">{booking.studentEmail}</p>
                        <p className="text-[10px] text-muted-foreground">{booking.studentPhone}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {booking.expertId?.displayName || 'Unknown Expert'}
                        </p>
                        <p className="text-[10px] text-primary/80 font-medium">
                          {booking.expertId?.title || 'Expert'}
                        </p>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {booking.bookingType}
                      </td>
                      <td className="p-3">
                        <p className="font-bold">{booking.date}</p>
                        <p className="font-semibold text-slate-400">{booking.time}</p>
                      </td>
                      <td className="p-3 capitalize font-semibold">{booking.mode}</td>
                      <td className="p-3">{getStatusBadge(booking.status)}</td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {/* Reschedule Button */}
                          {['pending', 'confirmed', 'reschedule_needed'].includes(booking.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReschedulingId(booking._id);
                                setNewDate(booking.date);
                                setNewTime(booking.time);
                                setRescheduleMode(booking.mode);
                              }}
                              className="h-7 text-[10px] font-bold"
                            >
                              <Edit className="size-3 mr-0.5" /> Đổi lịch
                            </Button>
                          )}
                          
                          {/* Force Cancel */}
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled_expert')}
                              className="h-7 text-[10px] font-bold text-destructive hover:bg-destructive/10 border-destructive"
                            >
                              Hủy
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reschedule Modal Box (custom inline form) */}
          {reschedulingId && (
            <Card className="border-amber-400/50 bg-amber-50/20 dark:bg-neutral-900 shadow-md">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-amber-500 animate-bounce" /> Admin đổi lịch tư vấn để giải quyết xung đột
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleReschedule} className="grid gap-4 sm:grid-cols-4 items-end text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="res-date" className="font-bold">Ngày mới:</Label>
                    <Input
                      id="res-date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="res-time" className="font-bold">Khung giờ mới:</Label>
                    <select
                      id="res-time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="res-mode" className="font-bold">Hình thức mới:</Label>
                    <select
                      id="res-mode"
                      value={rescheduleMode}
                      onChange={(e) => setRescheduleMode(e.target.value as any)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end sm:col-span-1">
                    <Button type="button" size="sm" variant="ghost" className="text-xs h-9" onClick={() => setReschedulingId(null)}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" size="sm" className="text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                      Đổi lịch & Khóa slot
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <section className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                <tr>
                  <th className="p-3">Hồ sơ người dùng</th>
                  <th className="p-3">Email liên lạc</th>
                  <th className="p-3">Vai trò hiện tại</th>
                  <th className="p-3">Phân quyền vai trò</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((userDoc) => (
                  <tr key={userDoc._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {userDoc.displayName || 'Chưa cập nhật tên'}
                    </td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                      {userDoc.email}
                    </td>
                    <td className="p-3 uppercase">
                      {userDoc.role === 'admin' ? (
                        <Badge className="bg-red-500 text-white">Admin</Badge>
                      ) : userDoc.role === 'expert' ? (
                        <Badge className="bg-indigo-600 text-white">Chuyên gia</Badge>
                      ) : (
                        <Badge variant="secondary">Học viên</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={userDoc.role}
                        onChange={(e) => handleUpdateRole(userDoc._id, e.target.value)}
                        className="flex h-8 w-28 rounded border border-input bg-background px-2 text-[11px] font-semibold"
                      >
                        <option value="user">Học viên</option>
                        <option value="expert">Chuyên gia</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(userDoc._id)}
                        className="h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <section className="space-y-8 animate-fadeIn">
          {/* Top Counters grid */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {[
              { label: 'Tổng số buổi đặt', value: stats.total, color: 'border-primary text-primary bg-primary/5' },
              { label: 'Đã hoàn thành', value: stats.statuses.completed, color: 'border-emerald-500 text-emerald-600 bg-emerald-50/50' },
              { label: 'Chờ duyệt / Xác nhận', value: stats.statuses.pending + stats.statuses.confirmed, color: 'border-blue-500 text-blue-600 bg-blue-50/50' },
              { label: 'Học viên / SS hủy', value: stats.statuses.cancelled, color: 'border-neutral-300 text-neutral-500 bg-neutral-50/50' }
            ].map((card, i) => (
              <div key={i} className={`border rounded-xl p-4 text-center ${card.color}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{card.label}</p>
                <p className="text-2xl font-extrabold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Visual Bar chart of booking counts by date */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><BarChart2 className="size-4 text-primary" /> Mật độ buổi tư vấn theo ngày</CardTitle>
                <CardDescription className="text-xs">Theo dõi số lượng booking được thực hiện trong thời gian qua.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {stats.dailyStats.length === 0 ? (
                  <p className="text-xs text-center py-8 text-muted-foreground">Chưa có dữ liệu thống kê ngày.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.dailyStats.map((item) => {
                      const maxVal = Math.max(...stats.dailyStats.map((d) => d.count), 1);
                      const widthPercentage = (item.count / maxVal) * 100;
                      return (
                        <div key={item._id} className="flex items-center gap-3 text-xs">
                          <span className="w-20 font-bold shrink-0">{item._id}</span>
                          <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-brand-blue rounded-full"
                              style={{ width: `${widthPercentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-semibold">{item.count} buổi</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Popular Experts stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Users className="size-4 text-primary" /> Hiệu suất và số lượng tư vấn theo chuyên gia</CardTitle>
                <CardDescription className="text-xs">Xếp hạng các cố vấn nhận được nhiều đăng ký tư vấn nhất.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {stats.expertStats.length === 0 ? (
                  <p className="text-xs text-center py-8 text-muted-foreground">Chưa có thống kê chuyên gia.</p>
                ) : (
                  <div className="space-y-3.5">
                    {stats.expertStats.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-2 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.expert.displayName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            {item.expert.title || 'SS Consultant'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-extrabold text-primary text-sm">{item.count} buổi</p>
                          <p className="text-[9px] text-slate-400">Đã tích lũy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Create Expert Direct Form Tab */}
      {activeTab === 'create-expert' && (
        <Card className="max-w-2xl mx-auto shadow-md border-primary/10">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="size-4.5 text-primary" /> Tạo tài khoản Chuyên gia tư vấn mới
            </CardTitle>
            <CardDescription className="text-xs">
              Tài khoản được tạo sẽ được đánh dấu xác thực tự động và hiển thị lập tức trong danh sách lựa chọn của học viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateExpert} className="space-y-5 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-email">Địa chỉ Email:</Label>
                  <Input
                    id="exp-email"
                    type="email"
                    placeholder="expert@ssconnect.dev"
                    value={expEmail}
                    onChange={(e) => setExpEmail(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="exp-pass">Mật khẩu:</Label>
                  <Input
                    id="exp-pass"
                    type="password"
                    placeholder="Nhập mật khẩu an toàn"
                    value={expPassword}
                    onChange={(e) => setExpPassword(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-name">Họ và tên chuyên gia:</Label>
                  <Input
                    id="exp-name"
                    placeholder="Nguyễn Văn B"
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="exp-title">Lĩnh vực chuyên danh (Title):</Label>
                  <Input
                    id="exp-title"
                    placeholder="Vd: Senior Product Manager / Tech Lead"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-exp">Số năm kinh nghiệm:</Label>
                  <Input
                    id="exp-exp"
                    type="number"
                    min={1}
                    value={expExperience}
                    onChange={(e) => setExpExperience(Number(e.target.value))}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exp-specs">Mảng tư vấn chuyên sâu (phân tách bằng dấu phẩy):</Label>
                  <Input
                    id="exp-specs"
                    placeholder="Vd: Sửa CV, Phỏng vấn, Định hướng nghề nghiệp"
                    value={expSpecialties}
                    onChange={(e) => setExpSpecialties(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-style">Phong cách tư vấn:</Label>
                <Input
                  id="exp-style"
                  placeholder="Vd: Thân thiện, thực tế, chỉ ra điểm sai để khắc phục"
                  value={expStyle}
                  onChange={(e) => setExpStyle(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-ach">Thành tựu nổi bật (mỗi dòng một thành tựu):</Label>
                <Textarea
                  id="exp-ach"
                  placeholder="Vd: Quản lý đội ngũ 20+ kỹ sư tại VinGroup&#10;Đã giúp 100+ học viên đỗ phỏng vấn"
                  value={expAchievements}
                  onChange={(e) => setExpAchievements(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>

              <Button type="submit" className="w-full font-bold bg-brand-brown hover:bg-[#4E2505] text-white dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-350 py-5 transition-all duration-200">
                Xác nhận tạo tài khoản chuyên gia
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

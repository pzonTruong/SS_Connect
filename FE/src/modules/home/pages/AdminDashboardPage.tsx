import { useEffect, useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Users,
  Trash2,
  Edit,
  UserX,
  UserCheck,
  Award,
  BookOpen,
  X,
  Search,
  CheckCircle,
  Clock,
  Video,
  MapPin,
  FileSpreadsheet,
  UserPlus
} from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';
import { formatTimeRange } from '@/shared/lib/utils';
import * as XLSX from 'xlsx';

interface UserRecord {
  _id: string;
  email: string;
  displayName?: string;
  role: 'user' | 'expert' | 'admin';
  phone?: string;
  isEmailVerified: boolean;
  cancellationWarnings?: number;
  isBlockedFromBooking?: boolean;
  title?: string;
  specialties?: string[];
  experienceYears?: number;
  achievements?: string[];
  consultingStyle?: string;
  bio?: string;
}

interface ExpertDetails {
  _id: string;
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
  weeklyStats: { _id: string; count: number }[];
  monthlyStats: { _id: string; count: number }[];
  expertStats: { expert: { displayName: string; title?: string }; count: number }[];
}

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'stats' | 'create-expert'>('bookings');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'expert' | 'admin'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Stats Grouping: 'day' | 'week' | 'month'
  const [statsGrouping, setStatsGrouping] = useState<'day' | 'week' | 'month'>('day');

  // Reschedule Form State (including expert reassignment)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [rescheduleMode, setRescheduleMode] = useState<'online' | 'offline'>('online');
  const [selectedRescheduleExpertId, setSelectedRescheduleExpertId] = useState('');

  // Editing User/Expert Modal State
  const [editingExpert, setEditingExpert] = useState<UserRecord | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState(1);
  const [editSpecialties, setEditSpecialties] = useState('');
  const [editAchievements, setEditAchievements] = useState('');
  const [editConsultingStyle, setEditConsultingStyle] = useState('');
  const [editCancellationWarnings, setEditCancellationWarnings] = useState(0);
  const [editIsBlocked, setEditIsBlocked] = useState(false);

  // Direct Expert Form State (Creation)
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
        mode: rescheduleMode,
        expertId: selectedRescheduleExpertId
      });
      toast.success('Cập nhật lịch tư vấn và điều phối chuyên gia thành công!');
      setReschedulingId(null);
      fetchBookings();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Điều phối lịch tư vấn thất bại');
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

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await http.put(`/admin/users/${userId}/block`);
      toast.success(res.data.message || 'Thao tác thành công');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Thao tác thất bại');
    }
  };

  const handleUpdateWarnings = async (userId: string, currentWarnings: number, diff: number) => {
    const newWarnings = Math.max(0, currentWarnings + diff);
    try {
      await http.put(`/admin/users/${userId}`, { cancellationWarnings: newWarnings });
      toast.success(`Cập nhật số lần cảnh báo thành công: ${newWarnings}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể cập nhật số lần cảnh báo');
    }
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setEditingExpert(user);
    setEditDisplayName(user.displayName || '');
    setEditPhone(user.phone || '');
    setEditBio(user.bio || '');
    setEditTitle(user.title || '');
    setEditExperienceYears(user.experienceYears || 1);
    setEditSpecialties(user.specialties?.join(', ') || '');
    setEditAchievements(user.achievements?.join('\n') || '');
    setEditConsultingStyle(user.consultingStyle || '');
    setEditCancellationWarnings(user.cancellationWarnings || 0);
    setEditIsBlocked(user.isBlockedFromBooking || false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpert) return;

    try {
      const specialtiesArray = editSpecialties.split(',').map((s) => s.trim()).filter(Boolean);
      const achievementsArray = editAchievements.split('\n').map((a) => a.trim()).filter(Boolean);

      const payload: any = {
        displayName: editDisplayName,
        phone: editPhone,
        bio: editBio
      };

      if (editingExpert.role === 'expert') {
        payload.title = editTitle;
        payload.experienceYears = Number(editExperienceYears);
        payload.specialties = specialtiesArray;
        payload.achievements = achievementsArray;
        payload.consultingStyle = editConsultingStyle;
      } else if (editingExpert.role === 'user') {
        payload.cancellationWarnings = Number(editCancellationWarnings);
        payload.isBlockedFromBooking = editIsBlocked;
      }

      await http.put(`/admin/users/${editingExpert._id}`, payload);
      toast.success('Cập nhật thông tin hồ sơ tài khoản thành công!');
      setEditingExpert(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể lưu chỉnh sửa');
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
      setUserRoleFilter('expert');
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể tạo chuyên gia');
    }
  };

  // Excel Report Generator — fully client-side via SheetJS
  const exportToExcel = () => {
    if (bookings.length === 0) {
      toast.warning('Không có bản ghi lịch hẹn để xuất báo cáo');
      return;
    }

    const getStatusLabel = (status: Booking['status']) => {
      const map: Record<string, string> = {
        pending: 'Chờ duyệt',
        confirmed: 'Đã duyệt',
        completed: 'Hoàn thành',
        cancelled_student: 'Học viên hủy',
        cancelled_expert: 'SS Hủy',
        no_show: 'Vắng mặt',
        reschedule_needed: 'Yêu cầu đổi lịch',
      };
      return map[status] ?? status;
    };

    const rows = bookings.map(b => ({
      'Học viên': b.studentName,
      'Email học viên': b.studentEmail,
      'SĐT học viên': b.studentPhone,
      'Chuyên gia': b.expertId?.displayName ?? '',
      'Email chuyên gia': b.expertId?.email ?? '',
      'Mảng tư vấn': b.expertId?.title ?? '',
      'Chủ đề tư vấn': b.bookingType,
      'Ngày tư vấn': b.date,
      'Giờ tư vấn': formatTimeRange(b.time),
      'Hình thức': b.mode === 'online' ? 'Online' : 'Offline',
      'Trạng thái': getStatusLabel(b.status),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [18, 26, 14, 20, 26, 20, 28, 12, 16, 10, 16].map(w => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo SSConnect');

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `bao_cao_lich_tu_van_ssconnect_${dateStr}.xlsx`;

    // XLSX.writeFile uses a data URL internally — works on Chrome, Edge, Firefox
    XLSX.writeFile(wb, filename, { bookType: 'xlsx', compression: true });
    toast.success('Xuất báo cáo Excel thành công!');
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 w-max"><Clock className="size-2.5 shrink-0" /> Chờ duyệt</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 w-max"><CheckCircle className="size-2.5 shrink-0" /> Đã duyệt</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 w-max"><CheckCircle className="size-2.5 shrink-0" /> Hoàn thành</Badge>;
      case 'cancelled_student':
        return <Badge variant="outline" className="border-neutral-300 text-neutral-500 bg-neutral-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full w-max">Học viên hủy</Badge>;
      case 'cancelled_expert':
        return <Badge variant="outline" className="border-neutral-300 text-neutral-500 bg-neutral-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full w-max">SS Hủy</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="border-red-400 text-red-650 bg-red-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full w-max">Vắng mặt</Badge>;
      case 'reschedule_needed':
        return <Badge variant="outline" className="border-purple-400 text-purple-700 bg-purple-50/50 uppercase text-[9px] font-bold py-0.5 px-2 rounded-full flex items-center gap-1 w-max"><Clock className="size-2.5 shrink-0" /> Yêu cầu đổi lịch</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] font-bold uppercase py-0.5 px-2 rounded-full w-max">{status}</Badge>;
    }
  };

  // Filter logic for bookings
  const filteredBookings = bookings.filter((b) => {
    // Search filter
    const matchesSearch = 
      b.studentName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.studentEmail.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.expertId?.displayName && b.expertId.displayName.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      b.bookingType.toLowerCase().includes(bookingSearch.toLowerCase());
    
    // Status filter
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter logic for users
  const filteredUsers = users.filter((u) => {
    // Search filter
    const matchesSearch = 
      (u.displayName && u.displayName.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch)) ||
      (u.title && u.title.toLowerCase().includes(userSearch.toLowerCase()));

    // Role filter
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  const expertsList = users.filter((u) => u.role === 'expert');

  if (loading) {
    return <div className="text-center py-24 animate-pulse text-slate-500 font-semibold text-sm">Đang tải thông tin quản trị hệ thống...</div>;
  }

  // Stats arrays based on grouping
  const activeStatsList = !stats
    ? []
    : statsGrouping === 'day'
    ? stats.dailyStats
    : statsGrouping === 'week'
    ? stats.weeklyStats
    : stats.monthlyStats;

  return (
    <div className="space-y-6 pb-16 text-left">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-amber-500/20">Admin Panel</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-xs font-semibold">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 mt-1">
            Student Success Center
          </h1>
          <p className="text-xs text-slate-400">Trình điều hành chung và kiểm soát dữ liệu đặt lịch, phân công nhân sự và báo cáo hiệu quả cố vấn.</p>
        </div>

        {/* Action Header controls */}
        <div className="flex items-center gap-2 shrink-0 relative z-10 self-start md:self-center">
          <button 
            onClick={exportToExcel} 
            className="inline-flex items-center justify-center rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer border-0 px-3.5 py-2.5 transition-all"
          >
            <FileSpreadsheet className="size-4 mr-1.5" /> Xuất báo cáo Excel
          </button>
          <button 
            onClick={loadAllData} 
            className="inline-flex items-center justify-center rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer border border-slate-700/50 shadow-sm px-3.5 py-2.5 transition-all"
          >
            <RefreshCw className="size-4 mr-1.5" /> Đồng bộ dữ liệu
          </button>
        </div>
      </div>

      {/* Modern Top Overview Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Tổng số lịch đặt',
            value: bookings.length,
            desc: 'Tổng số lịch hẹn toàn hệ thống',
            icon: <Calendar className="size-5 text-brand-navy dark:text-blue-400" />,
            color: 'bg-card border-slate-100 dark:border-slate-800/80 shadow-sm'
          },
          {
            title: 'Đang chờ duyệt',
            value: bookings.filter((b) => b.status === 'pending').length,
            desc: 'Lịch hẹn mới cần phê duyệt',
            icon: <Clock className="size-5 text-amber-500" />,
            color: 'bg-amber-50/10 border-amber-500/20 shadow-sm text-amber-700 dark:text-amber-500'
          },
          {
            title: 'Đội ngũ chuyên gia',
            value: users.filter((u) => u.role === 'expert').length,
            desc: 'Cố vấn đang hoạt động',
            icon: <Award className="size-5 text-indigo-500" />,
            color: 'bg-indigo-50/10 border-indigo-500/20 shadow-sm text-indigo-700 dark:text-indigo-400'
          },
          {
            title: 'Tài khoản học viên',
            value: users.filter((u) => u.role === 'user').length,
            desc: 'Tổng số học viên đã đăng ký',
            icon: <BookOpen className="size-5 text-emerald-500" />,
            color: 'bg-emerald-50/10 border-emerald-500/20 shadow-sm text-emerald-700 dark:text-emerald-400'
          }
        ].map((card, idx) => (
          <Card key={idx} className={`${card.color} border transition-all duration-200 hover:translate-y-[-2px]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.title}</span>
              <div className="p-2 rounded-lg bg-background border shadow-sm shrink-0">{card.icon}</div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-black tracking-tight">{card.value}</div>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Layout */}
      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Navigation panel */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r pr-0 lg:pr-4">
          {[
            { id: 'bookings', label: 'Quản lý lịch hẹn', icon: <Calendar className="size-4 mr-2" /> },
            { id: 'users', label: 'Tài khoản người dùng', icon: <Users className="size-4 mr-2" /> },
            { id: 'stats', label: 'Thống kê & Hiệu suất', icon: <BarChart2 className="size-4 mr-2" /> },
            { id: 'create-expert', label: 'Thêm chuyên gia', icon: <UserPlus className="size-4 mr-2" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md translate-x-1'
                  : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {/* Search & Filter bar for Bookings */}
              <div className="grid gap-3 sm:flex sm:items-center sm:justify-between bg-card p-3.5 rounded-xl border shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên học viên, email, chuyên gia, chủ đề..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-9 text-xs h-9 bg-background shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Lọc trạng thái:</span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-bold shadow-sm"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="confirmed">Đã duyệt</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="reschedule_needed">Cần đổi lịch</option>
                    <option value="cancelled_student">Học viên hủy</option>
                    <option value="cancelled_expert">SS Hủy</option>
                    <option value="no_show">Vắng mặt</option>
                  </select>
                </div>
              </div>

              {/* Bookings table */}
              {filteredBookings.length === 0 ? (
                <Card className="border-dashed py-12">
                  <CardContent className="text-center text-xs text-muted-foreground">Không tìm thấy lịch hẹn phù hợp.</CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-neutral-900/40 border-b font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px]">
                      <tr>
                        <th className="p-3.5">Học viên</th>
                        <th className="p-3.5">Chuyên gia cố vấn</th>
                        <th className="p-3.5">Nội dung tư vấn</th>
                        <th className="p-3.5">Thời gian & Hình thức</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredBookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 dark:text-slate-100">{booking.studentName}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{booking.studentEmail}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">{booking.studentPhone}</p>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {booking.expertId?.displayName || 'Unknown Expert'}
                              </p>
                              <p className="text-[10px] text-primary/85 font-semibold">
                                {booking.expertId?.title || 'Chuyên gia'}
                              </p>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-extrabold text-[12px] text-slate-900 dark:text-slate-50 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm block w-max max-w-[240px] truncate">
                              {booking.bookingType}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800 dark:text-slate-100">{booking.date}</p>
                              <p className="font-semibold text-slate-500 dark:text-slate-400">{formatTimeRange(booking.time)}</p>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                {booking.mode === 'online' ? (
                                  <>
                                    <Video className="size-3 text-blue-500" /> Online
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="size-3 text-rose-500" /> Offline
                                  </>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">{getStatusBadge(booking.status)}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex gap-1.5 justify-end">
                              {['pending', 'confirmed', 'reschedule_needed'].includes(booking.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReschedulingId(booking._id);
                                    setNewDate(booking.date);
                                    setNewTime(booking.time);
                                    setRescheduleMode(booking.mode);
                                    setSelectedRescheduleExpertId(booking.expertId?._id || '');
                                  }}
                                  className="h-7 text-[10px] font-bold border-amber-400 text-amber-700 hover:bg-amber-50 cursor-pointer shadow-sm"
                                >
                                  Điều phối
                                </Button>
                              )}
                              
                              {['pending', 'confirmed'].includes(booking.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(booking._id, 'cancelled_expert')}
                                  className="h-7 text-[10px] font-bold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
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

              {/* Reschedule inline drawer */}
              {reschedulingId && (
                <Card className="border-amber-400/60 bg-amber-50/10 dark:bg-slate-900/40 shadow-lg border-2 animate-fadeIn">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-500">
                      <AlertTriangle className="size-4 animate-bounce" /> Điều phối và Đổi cố vấn tư vấn
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Thay đổi thời gian tư vấn hoặc đổi sang chuyên gia cố vấn khác để khắc phục xung đột thời gian.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <form onSubmit={handleReschedule} className="grid gap-4 sm:grid-cols-5 items-end text-xs">
                      <div className="space-y-1.5">
                        <Label htmlFor="res-date" className="font-bold">Ngày hẹn mới:</Label>
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
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-bold"
                        >
                          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                            <option key={t} value={t}>{formatTimeRange(t)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="res-mode" className="font-bold">Hình thức:</Label>
                        <select
                          id="res-mode"
                          value={rescheduleMode}
                          onChange={(e) => setRescheduleMode(e.target.value as any)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-bold"
                        >
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="res-expert" className="font-bold text-amber-700 dark:text-amber-500">Chuyên gia cố vấn:</Label>
                        <select
                          id="res-expert"
                          value={selectedRescheduleExpertId}
                          onChange={(e) => setSelectedRescheduleExpertId(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-amber-300 bg-background px-3 py-2 text-xs font-bold text-amber-700"
                        >
                          {expertsList.map((exp) => (
                            <option key={exp._id} value={exp._id}>
                              {exp.displayName} ({exp.title || 'Cố vấn'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end sm:col-span-1">
                        <Button type="button" size="sm" variant="ghost" className="text-xs h-9 cursor-pointer" onClick={() => setReschedulingId(null)}>
                          Hủy
                        </Button>
                        <Button type="submit" size="sm" className="text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
                          Xác nhận lưu
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 2. Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Filter tools for Users */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
                
                {/* Search query input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tên, email, SĐT hoặc chức danh..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 text-xs h-9 bg-background shadow-inner"
                  />
                </div>

                {/* Sub filter tabs */}
                <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted self-start md:self-center overflow-x-auto w-max scrollbar-none">
                  {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'user', label: 'Học viên' },
                    { value: 'expert', label: 'Chuyên gia' },
                    { value: 'admin', label: 'Admin' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setUserRoleFilter(item.value as any)}
                      className={`px-3 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        userRoleFilter === item.value
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-muted-foreground/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users table */}
              {filteredUsers.length === 0 ? (
                <Card className="border-dashed py-12">
                  <CardContent className="text-center text-xs text-muted-foreground">Không tìm thấy tài khoản người dùng phù hợp.</CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-neutral-900/40 border-b font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-[10px]">
                      <tr>
                        <th className="p-3.5">Hồ sơ tài khoản</th>
                        <th className="p-3.5">Vai trò</th>
                        <th className="p-3.5">Số lần cảnh báo / Khóa booking (Học viên)</th>
                        <th className="p-3.5">Phân quyền</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((userDoc) => (
                        <tr key={userDoc._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 dark:text-slate-100">
                                {userDoc.displayName || 'Chưa cập nhật tên'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">{userDoc.email}</p>
                              {userDoc.phone && <p className="text-[10px] text-slate-500 font-semibold">{userDoc.phone}</p>}
                              {userDoc.role === 'expert' && userDoc.title && (
                                <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0 mt-1 w-max block border-primary/20 bg-primary/5 text-primary">
                                  {userDoc.title}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {userDoc.role === 'admin' ? (
                              <Badge className="bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider py-0.5 px-2.5 rounded-full">Admin</Badge>
                            ) : userDoc.role === 'expert' ? (
                              <Badge className="bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider py-0.5 px-2.5 rounded-full">Chuyên gia</Badge>
                            ) : (
                              <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider py-0.5 px-2.5 rounded-full">Học viên</Badge>
                            )}
                          </td>
                          <td className="p-3.5">
                            {userDoc.role === 'user' ? (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Số cảnh báo:</span>
                                  <Badge variant="outline" className="font-extrabold border-rose-200 bg-rose-50 text-rose-600 px-2.5">
                                    {userDoc.cancellationWarnings || 0} lần
                                  </Badge>
                                  <div className="flex gap-0.5">
                                    <button
                                      onClick={() => handleUpdateWarnings(userDoc._id, userDoc.cancellationWarnings || 0, -1)}
                                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 size-4 text-[10px] rounded flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      onClick={() => handleUpdateWarnings(userDoc._id, userDoc.cancellationWarnings || 0, 1)}
                                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 size-4 text-[10px] rounded flex items-center justify-center font-bold cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleToggleBlock(userDoc._id)}
                                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.75 rounded-md border cursor-pointer transition-all ${
                                    userDoc.isBlockedFromBooking
                                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm hover:bg-rose-600'
                                      : 'border-slate-300 hover:bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  {userDoc.isBlockedFromBooking ? (
                                    <>
                                      <UserX className="size-3" /> Đã khóa đặt lịch
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="size-3" /> Bình thường
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium">-</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={userDoc.role}
                              onChange={(e) => handleUpdateRole(userDoc._id, e.target.value)}
                              className="flex h-8 w-28 rounded border border-input bg-background px-2 text-[11px] font-bold cursor-pointer"
                            >
                              <option value="user">Học viên</option>
                              <option value="expert">Chuyên gia</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditModal(userDoc)}
                                className="h-7 text-muted-foreground hover:text-brand-brown hover:bg-amber-50 cursor-pointer font-bold"
                              >
                                <Edit className="size-3.5" /> Sửa
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(userDoc._id)}
                                className="h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Visual Bar chart of booking counts */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <BarChart2 className="size-4 text-primary" /> Lượng booking đã đặt
                      </CardTitle>
                      <CardDescription className="text-xs">Theo dõi số lượng cuộc hẹn được đặt.</CardDescription>
                    </div>

                    {/* Day / Week / Month grouping selector */}
                    <div className="flex border rounded-lg overflow-hidden w-max bg-muted p-0.5 shrink-0 self-start">
                      {[
                        { value: 'day', label: 'Ngày' },
                        { value: 'week', label: 'Tuần' },
                        { value: 'month', label: 'Tháng' }
                      ].map((btn) => (
                        <button
                          key={btn.value}
                          onClick={() => setStatsGrouping(btn.value as any)}
                          className={`px-3 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                            statsGrouping === btn.value
                              ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 hover:bg-muted-foreground/10'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {activeStatsList.length === 0 ? (
                      <p className="text-xs text-center py-8 text-slate-400">Chưa có dữ liệu thống kê.</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {activeStatsList.map((item) => {
                          const maxVal = Math.max(...activeStatsList.map((d) => d.count), 1);
                          const widthPercentage = (item.count / maxVal) * 100;
                          return (
                            <div key={item._id} className="flex items-center gap-3 text-xs">
                              <span className="w-24 font-bold text-slate-600 dark:text-slate-450 shrink-0 truncate">{item._id}</span>
                              <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div 
                                  className="h-full bg-brand-blue rounded-full"
                                  style={{ width: `${widthPercentage}%` }}
                                />
                              </div>
                              <span className="w-14 text-right font-extrabold text-slate-700">{item.count} buổi</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Popular Experts stats */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Users className="size-4 text-primary" /> Hiệu suất cố vấn chuyên gia</CardTitle>
                    <CardDescription className="text-xs">Bảng xếp hạng cố vấn nhận được nhiều buổi tư vấn nhất.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {stats.expertStats.length === 0 ? (
                      <p className="text-xs text-center py-8 text-slate-400">Chưa có dữ liệu thống kê chuyên gia.</p>
                    ) : (
                      <div className="space-y-3.5">
                        {stats.expertStats.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-2.5 text-xs">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 dark:text-slate-100">
                                {item.expert.displayName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {item.expert.title || 'Cố vấn tư vấn'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-black text-primary text-sm">{item.count} buổi</p>
                              <p className="text-[9px] text-slate-400 font-medium">Đã tích lũy</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 4. Create Expert Tab */}
          {activeTab === 'create-expert' && (
            <Card className="shadow-sm max-w-2xl border">
              <CardHeader className="border-b">
                <CardTitle className="text-md font-bold flex items-center gap-2">
                  <UserPlus className="size-4.5 text-primary" /> Tạo tài khoản Chuyên gia cố vấn mới
                </CardTitle>
                <CardDescription className="text-xs">
                  Tài khoản chuyên gia sau khi tạo sẽ được kích hoạt tự động và hiển thị lập tức trong danh sách chọn của học viên.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleCreateExpert} className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="exp-email">Địa chỉ Email đăng nhập:</Label>
                      <Input
                        id="exp-email"
                        type="email"
                        placeholder="expert@ssconnect.dev"
                        value={expEmail}
                        onChange={(e) => setExpEmail(e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="exp-pass">Mật khẩu khởi tạo:</Label>
                      <Input
                        id="exp-pass"
                        type="password"
                        placeholder="Nhập mật khẩu mặc định"
                        value={expPassword}
                        onChange={(e) => setExpPassword(e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="exp-name">Họ và tên chuyên gia:</Label>
                      <Input
                        id="exp-name"
                        placeholder="Vd: Nguyễn Thị A"
                        value={expName}
                        onChange={(e) => setExpName(e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="exp-title">Lĩnh vực tư vấn chính (Title):</Label>
                      <Input
                        id="exp-title"
                        placeholder="Vd: Senior HR Manager / Tech Lead"
                        value={expTitle}
                        onChange={(e) => setExpTitle(e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="exp-exp">Số năm kinh nghiệm làm việc:</Label>
                      <Input
                        id="exp-exp"
                        type="number"
                        min={1}
                        value={expExperience}
                        onChange={(e) => setExpExperience(Number(e.target.value))}
                        className="text-xs h-9 bg-background"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="exp-specs">Mảng hỗ trợ tư vấn (cách nhau bằng dấu phẩy):</Label>
                      <Input
                        id="exp-specs"
                        placeholder="Vd: Sửa CV, Lộ trình học, Kỹ năng phỏng vấn"
                        value={expSpecialties}
                        onChange={(e) => setExpSpecialties(e.target.value)}
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="exp-style">Phong cách tư vấn:</Label>
                    <Input
                      id="exp-style"
                      placeholder="Vd: Tận tâm, định hướng lộ trình thực tế, chi tiết"
                      value={expStyle}
                      onChange={(e) => setExpStyle(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="exp-ach">Thành tích & Khen thưởng nổi bật (mỗi dòng một mục):</Label>
                    <Textarea
                      id="exp-ach"
                      placeholder="Vd: 8+ năm dẫn dắt team Marketing tại Vinamilk&#10;Đã cố vấn định hướng cho 150+ sinh viên"
                      value={expAchievements}
                      onChange={(e) => setExpAchievements(e.target.value)}
                      className="text-xs min-h-[80px] bg-background"
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold bg-slate-900 hover:bg-slate-800 text-white py-4 transition-all duration-150 cursor-pointer mt-2 shadow">
                    Tạo tài khoản chuyên gia
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit User/Expert Modal */}
      {editingExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border shadow-2xl relative">
            
            <button
              onClick={() => setEditingExpert(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <CardHeader className="border-b">
              <CardTitle className="text-md font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Edit className="size-4.5 text-primary" /> Chỉnh sửa tài khoản: {editingExpert.email}
              </CardTitle>
              <CardDescription className="text-xs">
                Cập nhật thông tin chi tiết cho tài khoản ({editingExpert.role === 'expert' ? 'Chuyên gia' : editingExpert.role === 'admin' ? 'Admin' : 'Học viên'}).
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-5">
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-left">
                
                {/* Common User Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Họ và tên:</Label>
                    <Input
                      id="edit-name"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Số điện thoại:</Label>
                    <Input
                      id="edit-phone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">Giới thiệu bản thân (Bio):</Label>
                  <Textarea
                    id="edit-bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                </div>

                {/* Expert-only inputs */}
                {editingExpert.role === 'expert' && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h3 className="font-bold text-xs text-primary flex items-center gap-1"><Award className="size-4" /> Thông tin chuyên môn cố vấn</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-title">Lĩnh vực tư vấn chính (Title):</Label>
                        <Input
                          id="edit-title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-xs h-9"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-exp">Số năm kinh nghiệm:</Label>
                        <Input
                          id="edit-exp"
                          type="number"
                          min={0}
                          value={editExperienceYears}
                          onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                          className="text-xs h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-specs">Mảng tư vấn chuyên sâu (ngăn cách bằng dấu phẩy):</Label>
                      <Input
                        id="edit-specs"
                        value={editSpecialties}
                        onChange={(e) => setEditSpecialties(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-style">Phong cách tư vấn:</Label>
                      <Input
                        id="edit-style"
                        value={editConsultingStyle}
                        onChange={(e) => setEditConsultingStyle(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-ach">Thành tựu nổi bật (mỗi dòng một mục):</Label>
                      <Textarea
                        id="edit-ach"
                        value={editAchievements}
                        onChange={(e) => setEditAchievements(e.target.value)}
                        className="text-xs min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {/* Student-only inputs */}
                {editingExpert.role === 'user' && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h3 className="font-bold text-xs text-rose-500 flex items-center gap-1"><BookOpen className="size-4" /> Quản lý tài khoản học viên</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-warnings">Cảnh báo hủy lịch (hiện tại):</Label>
                        <Input
                          id="edit-warnings"
                          type="number"
                          min={0}
                          value={editCancellationWarnings}
                          onChange={(e) => setEditCancellationWarnings(Number(e.target.value))}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            id="edit-blocked"
                            type="checkbox"
                            checked={editIsBlocked}
                            onChange={(e) => setEditIsBlocked(e.target.checked)}
                            className="size-4 rounded accent-rose-500 border border-slate-350 cursor-pointer"
                          />
                          <Label htmlFor="edit-blocked" className="font-bold text-rose-600 dark:text-rose-400 cursor-pointer">Khóa quyền đặt lịch của học viên này</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Buttons */}
                <div className="flex gap-2 justify-end border-t pt-4 mt-6">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingExpert(null)} className="cursor-pointer">
                    Hủy bỏ
                  </Button>
                  <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

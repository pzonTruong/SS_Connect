import { useEffect, useState } from 'react';
import { Calendar, Clock, Video, Check, X, AlertCircle, Plus, Trash2, ClipboardList } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';
import { formatTimeRange } from '@/shared/lib/utils';

interface Student {
  _id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

interface Timeslot {
  date: string;
  time: string;
  booked: boolean;
}

interface Booking {
  _id: string;
  studentId: Student;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  course: string;
  major: string;
  goals: string;
  issues: string;
  cvLink?: string;
  bookingType: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  meetingLink?: string;
  googleEventHtmlLink?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled_student' | 'cancelled_expert' | 'no_show' | 'reschedule_needed';
  postConsultationNotes?: string;
}

export const ExpertDashboardPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Timeslot[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Slot Form State (Batch selection)
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00', '14:00']);

  const TIME_OPTIONS = [
    { time: '08:00', label: '08:00 - 10:00' },
    { time: '09:00', label: '09:00 - 11:00' },
    { time: '10:00', label: '10:00 - 12:00' },
    { time: '11:00', label: '11:00 - 13:00' },
    { time: '14:00', label: '14:00 - 16:00' },
    { time: '15:00', label: '15:00 - 17:00' },
    { time: '16:00', label: '16:00 - 18:00' },
    { time: '17:00', label: '17:00 - 19:00' },
    { time: '19:00', label: '19:00 - 21:00' },
    { time: '20:00', label: '20:00 - 22:00' },
  ];

  const handleAddDateInput = () => {
    if (!dateInput) return;
    if (selectedDates.includes(dateInput)) {
      toast.warning('Ngày này đã có trong danh sách chọn');
      return;
    }
    setSelectedDates([...selectedDates, dateInput]);
    setDateInput('');
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(d => d !== dateToRemove));
  };

  const toggleTimeSelection = (timeStr: string) => {
    if (selectedTimes.includes(timeStr)) {
      setSelectedTimes(selectedTimes.filter(t => t !== timeStr));
    } else {
      setSelectedTimes([...selectedTimes, timeStr]);
    }
  };

  const handleBatchAddSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 ngày tư vấn');
      return;
    }
    if (selectedTimes.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 khung giờ');
      return;
    }

    const newSlotsToAdd: Timeslot[] = [];
    let duplicateCount = 0;

    selectedDates.forEach(date => {
      selectedTimes.forEach(time => {
        const exists = availableSlots.some(s => s.date === date && s.time === time);
        if (!exists) {
          newSlotsToAdd.push({ date, time, booked: false });
        } else {
          duplicateCount++;
        }
      });
    });

    if (newSlotsToAdd.length === 0) {
      toast.warning('Tất cả các khung giờ được chọn đã tồn tại trước đó');
      return;
    }

    const updatedSlots = [...availableSlots, ...newSlotsToAdd];

    try {
      await http.put('/profile/expert-slots', { availableSlots: updatedSlots });
      toast.success(`Đã thêm thành công ${newSlotsToAdd.length} khung giờ rảnh!${duplicateCount > 0 ? ` (Bỏ qua ${duplicateCount} giờ đã trùng)` : ''}`);
      setAvailableSlots(updatedSlots);
      setSelectedDates([]);
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật lịch trình');
    }
  };
  
  // Note Form State
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await http.get('/bookings/expert-bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchMyProfileAndSlots = async () => {
    try {
      const res = await http.get('/auth/me');
      if (res.data && res.data.availableSlots) {
        setAvailableSlots(res.data.availableSlots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchMyProfileAndSlots();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string, notes?: string) => {
    try {
      await http.put(`/bookings/${bookingId}/status`, {
        status,
        postConsultationNotes: notes
      });
      toast.success('Cập nhật trạng thái lịch hẹn thành công');
      fetchBookings();
      fetchMyProfileAndSlots(); // In case slot is released
      setActiveBookingId(null);
      setNotesText('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Cập nhật thất bại');
    }
  };



  const handleDeleteSlot = async (slotToDelete: Timeslot) => {
    if (slotToDelete.booked) {
      toast.error('Không thể xóa khung giờ đã được học viên đặt');
      return;
    }

    const updatedSlots = availableSlots.filter(
      (slot) => !(slot.date === slotToDelete.date && slot.time === slotToDelete.time)
    );

    try {
      await http.put('/profile/expert-slots', { availableSlots: updatedSlots });
      toast.success('Xóa khung giờ thành công');
      setAvailableSlots(updatedSlots);
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa khung giờ');
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 font-semibold uppercase text-[10px]">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-blue-400 text-blue-600 bg-blue-50 font-semibold uppercase text-[10px]">Đã xác nhận</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-600 bg-emerald-50 font-semibold uppercase text-[10px]">Hoàn thành</Badge>;
      case 'cancelled_student':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 font-semibold uppercase text-[10px]">Học viên hủy</Badge>;
      case 'cancelled_expert':
        return <Badge variant="outline" className="border-neutral-400 text-neutral-500 bg-neutral-50 font-semibold uppercase text-[10px]">Bạn hủy</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="border-red-400 text-red-500 bg-red-50 font-semibold uppercase text-[10px]">Vắng mặt</Badge>;
      case 'reschedule_needed':
        return <Badge variant="outline" className="border-purple-400 text-purple-600 bg-purple-50 font-semibold uppercase text-[10px]">Cần đổi lịch</Badge>;
      default:
        return <Badge variant="outline" className="font-semibold uppercase text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 pb-12">
      {/* Left Column: Bookings list */}
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Danh Sách Học Viên Đăng Ký</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và phê duyệt các yêu cầu đặt lịch, ghi chú thông tin sau buổi tư vấn.</p>
        </div>

        {loadingBookings ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse h-[250px]" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-card text-muted-foreground text-sm">
            Hiện tại bạn chưa nhận được yêu cầu tư vấn nào.
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const showActionButtons = ['pending', 'confirmed'].includes(booking.status);
              const showNotesBox = activeBookingId === booking._id;

              return (
                <Card key={booking._id} className="border hover:shadow-md transition-all duration-300 overflow-hidden bg-card text-left">
                  <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/10 border-b p-4 flex flex-row flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {booking.studentName.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Học viên: {booking.studentName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Khóa học: {booking.course} • Ngành: {booking.major}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs">
                    {/* Time slot metadata */}
                    <div className="grid gap-4 sm:grid-cols-4 leading-relaxed border-b pb-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Thời gian hẹn:</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="size-3.5 text-primary" />
                          <span>Ngày {booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Clock className="size-3.5 text-primary" />
                          <span>Lúc {formatTimeRange(booking.time)} (Thời lượng: 2 tiếng)</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Chủ đề & Mode:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{booking.bookingType}</p>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Video className="size-3.5 text-primary" />
                          <span className="capitalize">{booking.mode === 'online' ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Liên hệ & Tài liệu:</span>
                        <p>SĐT: <b>{booking.studentPhone}</b></p>
                        {booking.cvLink ? (
                          <a href={booking.cvLink} target="_blank" rel="noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            Xem CV Học Viên
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Không gửi kèm CV</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tham gia cuộc họp:</span>
                        {booking.mode === 'online' && booking.status !== 'cancelled_student' && booking.status !== 'cancelled_expert' ? (
                          booking.meetingLink ? (
                            <div className="flex flex-col gap-1">
                              <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline text-xs"
                              >
                                <Video className="size-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{booking.status === 'completed' ? 'Xem lại Google Meet' : 'Tham gia Google Meet'}</span>
                              </a>
                              {booking.googleEventHtmlLink && (
                                <a
                                  href={booking.googleEventHtmlLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Liên kết quản lý lịch sự kiện trực tiếp trên Google Calendar"
                                  className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline inline-flex items-center gap-1"
                                >
                                  <Calendar className="size-3 text-slate-400" />
                                  <span>Xem trên Google Calendar</span>
                                </a>
                              )}
                            </div>
                          ) : booking.status === 'completed' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium italic">Đã hoàn thành cuộc họp</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium italic">Khởi tạo sau khi xác nhận</span>
                          )
                        ) : (
                          <span className="text-slate-400 font-medium">Gặp tại văn phòng MindX</span>
                        )}
                      </div>
                    </div>

                    {/* Booking Details goals / issues */}
                    <div className="space-y-2 leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Mục tiêu của học viên:</span>
                        <p className="text-muted-foreground">{booking.goals}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Khó khăn đang gặp:</span>
                        <p className="text-muted-foreground">{booking.issues}</p>
                      </div>
                      {booking.notes && (
                        <div>
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Ghi chú thêm:</span>
                          <p className="text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Post-session advisory notes */}
                    {booking.postConsultationNotes && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-950/40 rounded-lg p-3 space-y-1">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <ClipboardList className="size-3.5 text-emerald-500" /> Ghi chú chuyên môn đã lưu:
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 italic font-medium">
                          "{booking.postConsultationNotes}"
                        </p>
                      </div>
                    )}

                    {/* Note entry input form */}
                    {showNotesBox && (
                      <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border border-border animate-fadeIn">
                        <div className="space-y-1.5">
                          <Label htmlFor={`notes-${booking._id}`} className="font-bold text-slate-400">Ghi chú nhận xét sau tư vấn (khuyên dùng):</Label>
                          <Textarea
                            id={`notes-${booking._id}`}
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Nhập phản hồi, lỗi sai của học viên, các tài liệu cần hoàn thiện thêm..."
                            className="min-h-[70px] text-xs bg-background"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setActiveBookingId(null); setNotesText(''); }}>
                            Hủy bỏ
                          </Button>
                          <Button size="sm" className="text-xs" onClick={() => handleUpdateStatus(booking._id, 'completed', notesText)}>
                            Hoàn thành & Lưu ghi chú
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {showActionButtons && !showNotesBox && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t justify-end">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                            >
                              <Check className="size-3.5 mr-1" /> Xác nhận
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-semibold text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled_expert')}
                            >
                              <X className="size-3.5 mr-1" /> Từ chối
                            </Button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <>
                            <Button
                              size="sm"
                              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => { setActiveBookingId(booking._id); setNotesText(booking.postConsultationNotes || ''); }}
                            >
                              <Check className="size-3.5 mr-1" /> Hoàn thành
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-semibold text-amber-600 border-amber-500 hover:bg-amber-50"
                              onClick={() => handleUpdateStatus(booking._id, 'reschedule_needed')}
                            >
                              <AlertCircle className="size-3.5 mr-1" /> Yêu cầu đổi lịch
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-semibold text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => handleUpdateStatus(booking._id, 'no_show')}
                            >
                              <X className="size-3.5 mr-1" /> Học viên vắng mặt
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Available Slots Management */}
      <div className="lg:col-span-4 space-y-6">
        {/* Add available timeslots */}
        <Card className="shadow-md border-primary/10 text-left sticky top-24">
          <CardHeader className="bg-primary/5 border-b pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="size-4.5 text-primary" /> Thiết lập lịch rảnh
            </CardTitle>
            <CardDescription className="text-xs">
              Thêm các khung giờ rảnh để học viên có thể lựa chọn đặt lịch tư vấn.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <form onSubmit={handleBatchAddSlots} className="space-y-4 border-b pb-4">
              {/* Step 1: Dates selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slot-date" className="font-bold text-xs uppercase tracking-wider text-slate-500">1. Chọn các ngày tư vấn:</Label>
                  <span className="text-[10px] text-primary font-bold">Đã chọn: {selectedDates.length} ngày</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    id="slot-date"
                    type="date"
                    value={dateInput}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="text-xs h-9 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDateInput}
                    disabled={!dateInput}
                    className="h-9 px-3 text-xs font-semibold shrink-0"
                  >
                    + Thêm ngày
                  </Button>
                </div>

                {/* Date badges list */}
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDates.sort().map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => handleRemoveDate(d)}
                          className="hover:text-destructive text-primary/70 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Time slots multi-select grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-xs uppercase tracking-wider text-slate-500">2. Chọn các khung giờ rảnh:</Label>
                  <span className="text-[10px] text-primary font-bold">Đã chọn: {selectedTimes.length} giờ</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_OPTIONS.map(({ time, label }) => {
                    const isSelected = selectedTimes.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleTimeSelection(time)}
                        className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-all text-center flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                            : 'bg-card text-foreground border-border hover:bg-primary/5 hover:border-primary/30'
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <Check className="size-3 text-primary-foreground shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={selectedDates.length === 0 || selectedTimes.length === 0}
                className="w-full text-xs font-bold bg-brand-brown hover:bg-[#4E2505] text-white transition-all duration-200 h-10 shadow-xs"
              >
                <Plus className="size-4 mr-1.5" /> Tạo {selectedDates.length * selectedTimes.length > 0 ? selectedDates.length * selectedTimes.length : ''} khung giờ cùng lúc
              </Button>
            </form>

            {/* List existing available timeslots */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Khung giờ hiện tại của bạn:</h3>
              
              {availableSlots.length === 0 ? (
                <p className="text-xs text-center py-4 text-slate-400 italic">Bạn chưa tạo khung giờ rảnh nào.</p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {availableSlots
                    .sort((a, b) => {
                      if (a.date !== b.date) return a.date.localeCompare(b.date);
                      return a.time.localeCompare(b.time);
                    })
                    .map((slot, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-lg p-2 text-xs bg-neutral-50/50 dark:bg-neutral-900/10">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {slot.date} @ {formatTimeRange(slot.time)}
                          </p>
                          <p className="text-[10px]">
                            Trạng thái:{' '}
                            {slot.booked ? (
                              <span className="text-primary font-bold">Đã có học viên đặt</span>
                            ) : (
                              <span className="text-slate-400">Trống</span>
                            )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={slot.booked}
                          onClick={() => handleDeleteSlot(slot)}
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

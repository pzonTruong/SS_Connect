import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import {
  sendBookingConfirmationToStudent,
  sendBookingConfirmationToExpert,
  sendBookingNotificationToExpert,
  sendBookingCancellationToStudent,
  sendBookingCompletionToStudent,
  sendRescheduleRequestToStudent,
  sendRescheduleSubmissionToStudent
} from '../services/email.service';
import { getVietnamDateString, getDaysDifference } from '../utils/date';
import { googleCalendarService } from '../services/googleCalendar.service';

// Automatically cancels bookings that have been pending for > 24 hours without expert confirmation
export const checkAndCancelExpiredBookings = async () => {
  try {
    const cutOff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredBookings = await BookingModel.find({
      status: 'pending',
      createdAt: { $lt: cutOff }
    });

    for (const booking of expiredBookings) {
      booking.status = 'cancelled_expert';
      await booking.save();

      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';
      sendBookingCancellationToStudent(booking.studentEmail, booking, expertName).catch(console.error);

      if (expert) {
        const hasConfirmed = await BookingModel.exists({
          expertId: booking.expertId,
          date: booking.date,
          time: booking.time,
          status: 'confirmed'
        });
        if (!hasConfirmed) {
          const slotIdx = expert.availableSlots?.findIndex(
            (s) => s.date === booking.date && s.time === booking.time
          );
          if (slotIdx !== undefined && slotIdx !== -1 && expert.availableSlots![slotIdx].booked) {
            expert.availableSlots![slotIdx].booked = false;
            await expert.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndCancelExpiredBookings:', error);
  }
};

// POST /api/bookings - Book a session (student only)
export const createBooking = async (req: Request, res: Response) => {
  try {
    await checkAndCancelExpiredBookings();

    const studentId = req.user?.sub;
    const {
      studentName,
      studentEmail,
      studentPhone,
      course,
      major,
      goals,
      issues,
      cvLink,
      bookingType,
      date,
      time,
      mode,
      notes,
      expertId
    } = req.body;

    // Verify student exists
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student account not found' });
    }

    // Verify user is a student (role 'user')
    if (student.role !== 'user') {
      return res.status(403).json({ 
        message: 'Chỉ tài khoản học viên mới được phép đặt lịch hẹn tư vấn.' 
      });
    }

    // Check if student is blocked due to cancellation count
    if (student.isBlockedFromBooking || (student.cancellationWarnings && student.cancellationWarnings >= 2)) {
      return res.status(400).json({ 
        message: 'Tài khoản của bạn đã bị khóa đặt lịch do hủy lịch quá số lần cho phép (tối đa 1 lần đặt lại sau khi hủy).' 
      });
    }

    // Check if booking is made at least 3 days in advance
    const todayStr = getVietnamDateString(new Date());
    const daysDiff = getDaysDifference(date, todayStr);
    if (daysDiff < 3) {
      return res.status(400).json({ 
        message: 'Bạn chỉ được đặt lịch trước tối thiểu 3 ngày so với ngày hẹn.' 
      });
    }

    // Verify expert exists
    const expert = await UserModel.findById(expertId);
    if (!expert || expert.role !== 'expert') {
      return res.status(404).json({ message: 'Expert not found' });
    }

    // Check slot availability on expert
    const slotIndex = expert.availableSlots?.findIndex(
      (slot) => slot.date === date && slot.time === time
    );

    if (slotIndex === undefined || slotIndex === -1) {
      return res.status(400).json({ message: 'Khung giờ này không tồn tại cho chuyên gia này' });
    }

    const slot = expert.availableSlots![slotIndex];

    // Check if slot has already been confirmed by expert for another student
    const confirmedBooking = await BookingModel.findOne({
      expertId,
      date,
      time,
      status: 'confirmed'
    });

    if (slot.booked || confirmedBooking) {
      return res.status(400).json({ message: 'Khung giờ này đã được chuyên gia xác nhận cho một học viên khác' });
    }

    // Check if this student already has a pending or confirmed booking for this exact slot
    const existingStudentBooking = await BookingModel.findOne({
      studentId,
      expertId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingStudentBooking) {
      return res.status(400).json({ message: 'Bạn đã đăng ký khung giờ này với chuyên gia rồi' });
    }

    // Note: Multiple students can place pending bookings for the same slot until confirmed.
    // We do NOT set slot.booked = true when status is pending.
    // We do NOT generate meetingLink when status is pending (generated upon expert confirmation).

    // Create booking
    const meetingLink = undefined;

    const booking = new BookingModel({
      studentId,
      expertId,
      studentName,
      studentEmail,
      studentPhone,
      course,
      major,
      goals,
      issues,
      cvLink,
      bookingType,
      date,
      time,
      mode,
      meetingLink,
      notes,
      status: 'pending' // Chờ xác nhận
    });

    await booking.save();

    // Send email notification to expert
    const expertName = expert.displayName || expert.email.split('@')[0];
    sendBookingNotificationToExpert(expert.email, booking, studentName).catch(console.error);

    return res.status(201).json(booking);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/my-bookings - Get student bookings
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    await checkAndCancelExpiredBookings();
    const studentId = req.user?.sub;
    const bookings = await BookingModel.find({ studentId })
      .populate('expertId', 'displayName email avatarUrl title')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/expert-bookings - Get expert bookings
export const getExpertBookings = async (req: Request, res: Response) => {
  try {
    await checkAndCancelExpiredBookings();
    const expertId = req.user?.sub;
    const bookings = await BookingModel.find({ expertId })
      .populate('studentId', 'displayName email avatarUrl phone')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/:id/status - Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    await checkAndCancelExpiredBookings();
    const { id } = req.params;
    const { status, postConsultationNotes } = req.body;
    const userId = req.user?.sub;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify permission: student, expert, or admin
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isStudent = String(booking.studentId) === String(userId);
    const isExpert = String(booking.expertId) === String(userId);
    const isAdmin = user.role === 'admin';

    if (!isStudent && !isExpert && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized status modification' });
    }

    // If booking was in reschedule_needed, any cancellation is treated as expert/SS cancellation (cancelled_expert)
    const expertRequestedReschedule = booking.status === 'reschedule_needed';
    let targetStatus = status;
    if (expertRequestedReschedule && ['cancelled_student', 'cancelled_expert'].includes(status)) {
      targetStatus = 'cancelled_expert';
    }

    const isCancelling = ['cancelled_student', 'cancelled_expert'].includes(targetStatus);
    const wasActive = ['pending', 'confirmed'].includes(booking.status);

    if (targetStatus === 'cancelled_student' && (wasActive || expertRequestedReschedule)) {
      // Check 1-day constraint (skip time check if expert already requested reschedule)
      if (wasActive) {
        const todayStr = getVietnamDateString(new Date());
        const daysDiff = getDaysDifference(booking.date, todayStr);
        if (daysDiff < 1) {
          return res.status(400).json({
            message: 'Bạn chỉ có thể hủy lịch hẹn trước tối thiểu 1 ngày.'
          });
        }
      }

      // Only count as a warning if the student cancelled on their own initiative
      // (i.e. NOT in response to an expert-requested reschedule)
      if (!expertRequestedReschedule) {
        const student = await UserModel.findById(booking.studentId);
        if (student) {
          student.cancellationWarnings = (student.cancellationWarnings || 0) + 1;
          if (student.cancellationWarnings >= 2) {
            student.isBlockedFromBooking = true;
          }
          await student.save();
        }
      }
    }

    if (targetStatus === 'completed' && wasActive) {
      const student = await UserModel.findById(booking.studentId);
      if (student) {
        student.cancellationWarnings = 0;
        student.isBlockedFromBooking = false;
        await student.save();
      }
    }

    if (isCancelling && (wasActive || expertRequestedReschedule)) {
      const remainingConfirmed = await BookingModel.exists({
        _id: { $ne: booking._id },
        expertId: booking.expertId,
        date: booking.date,
        time: booking.time,
        status: 'confirmed'
      });

      if (!remainingConfirmed) {
        const expert = await UserModel.findById(booking.expertId);
        if (expert) {
          const slotIndex = expert.availableSlots?.findIndex(
            (slot) => slot.date === booking.date && slot.time === booking.time
          );
          if (slotIndex !== undefined && slotIndex !== -1) {
            expert.availableSlots![slotIndex].booked = false;
            await expert.save();
          }
        }
      }
    }

    const oldStatus = booking.status;

    // Apply updates
    if (targetStatus) {
      booking.status = targetStatus;
    }
    if (postConsultationNotes !== undefined) {
      booking.postConsultationNotes = postConsultationNotes;
    }

    // Delete Google Calendar event if booking is cancelled
    if (isCancelling && booking.googleEventId) {
      googleCalendarService.deleteCalendarEvent(booking.googleEventId).catch(console.error);
      booking.googleEventId = undefined;
      booking.googleEventHtmlLink = undefined;
    } else if (booking.googleEventId && targetStatus && targetStatus !== oldStatus) {
      // Sync Google Calendar event color when status changes (e.g. completed, confirmed, no_show)
      googleCalendarService.updateCalendarEventStatus(booking.googleEventId, targetStatus).catch(console.error);
    }

    await booking.save();

    // Send confirmation email to student when transitioning to confirmed
    // AND automatically cancel other pending bookings for the same slot, sending cancellation email to each competitor
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';

      // Sync with Google Calendar API & Generate Google Meet link
      try {
        const calResult = await googleCalendarService.createCalendarEvent({
          bookingId: String(booking._id),
          summary: `Tư vấn SS_Connect: ${booking.studentName} & ${expertName}`,
          description: `Buổi tư vấn ${booking.bookingType}\nLĩnh vực: ${booking.major}\nMục tiêu: ${booking.goals}\nVấn đề: ${booking.issues}`,
          date: booking.date,
          time: booking.time,
          studentEmail: booking.studentEmail,
          expertEmail: expert?.email,
          mode: booking.mode
        });

        if (calResult) {
          if (calResult.eventId) booking.googleEventId = calResult.eventId;
          if (calResult.htmlLink) booking.googleEventHtmlLink = calResult.htmlLink;
          if (calResult.meetingLink) booking.meetingLink = calResult.meetingLink;
        }
      } catch (err) {
        console.error('Lỗi sync Google Calendar:', err);
      }

      // Fallback: Generate mock Google Meet link for online bookings if Google API failed or credentials missing
      if (booking.mode === 'online' && !booking.meetingLink) {
        const p1 = Math.random().toString(36).substring(2, 5);
        const p2 = Math.random().toString(36).substring(2, 6);
        const p3 = Math.random().toString(36).substring(2, 5);
        booking.meetingLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
      }

      await booking.save();

      // 1. Lock slot on expert
      if (expert) {
        const slotIndex = expert.availableSlots?.findIndex(
          (slot) => slot.date === booking.date && slot.time === booking.time
        );
        if (slotIndex !== undefined && slotIndex !== -1) {
          expert.availableSlots![slotIndex].booked = true;
          await expert.save();
        }
      }

      // 2. Auto-cancel all competitor pending bookings for the same slot and send cancellation emails
      const competitors = await BookingModel.find({
        _id: { $ne: booking._id },
        expertId: booking.expertId,
        date: booking.date,
        time: booking.time,
        status: 'pending'
      });

      for (const competitor of competitors) {
        competitor.status = 'cancelled_expert';
        await competitor.save();
        sendBookingCancellationToStudent(competitor.studentEmail, competitor, expertName).catch(console.error);
      }

      // 3. Send confirmation email to the accepted student and expert
      sendBookingConfirmationToStudent(booking.studentEmail, booking, expertName).catch(console.error);
      if (expert) {
        sendBookingConfirmationToExpert(expert.email, booking, booking.studentName).catch(console.error);
      }
    }

    // Send cancellation/rejection email to student when expert cancels/declines directly
    if (status === 'cancelled_expert' && oldStatus !== 'cancelled_expert' && oldStatus !== 'pending') {
      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';
      sendBookingCancellationToStudent(booking.studentEmail, booking, expertName).catch(console.error);
    }

    // Send completion & review email to student when marked completed
    if (status === 'completed' && oldStatus !== 'completed') {
      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';
      sendBookingCompletionToStudent(
        booking.studentEmail,
        booking,
        expertName,
        postConsultationNotes || booking.postConsultationNotes || ''
      ).catch(console.error);
    }

    // Send reschedule proposal email to student from expert/admin
    if (status === 'reschedule_needed' && oldStatus !== 'reschedule_needed') {
      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';
      sendRescheduleRequestToStudent(booking.studentEmail, booking, expertName).catch(console.error);
    }

    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/admin/all - Get all bookings (admin only)
export const adminGetAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.find({})
      .populate('studentId', 'displayName email phone')
      .populate('expertId', 'displayName email title')
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/admin/:id/reschedule - Reschedule a booking (admin only)
export const adminRescheduleBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, mode, expertId } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    const oldExpert = await UserModel.findById(booking.expertId);
    const targetExpertId = expertId || booking.expertId;
    const isExpertChanging = String(targetExpertId) !== String(booking.expertId);

    let newExpert;
    if (isExpertChanging) {
      newExpert = await UserModel.findById(targetExpertId);
      if (!newExpert) {
        return res.status(404).json({ message: 'Không tìm thấy chuyên gia mới được chọn' });
      }
    } else {
      newExpert = oldExpert;
    }

    if (!newExpert) {
      return res.status(404).json({ message: 'Không tìm thấy chuyên gia' });
    }

    // 1. Release previous slot on old expert
    if (oldExpert) {
      const prevSlotIndex = oldExpert.availableSlots?.findIndex(
        (slot) => slot.date === booking.date && slot.time === booking.time
      );
      if (prevSlotIndex !== undefined && prevSlotIndex !== -1) {
        oldExpert.availableSlots![prevSlotIndex].booked = false;
        await oldExpert.save();
      }
    }

    // 2. Find and verify/create the new slot on new expert
    const newSlotIndex = newExpert.availableSlots?.findIndex(
      (slot) => slot.date === date && slot.time === time
    );
    if (newSlotIndex === undefined || newSlotIndex === -1) {
      // Dynamic slot override for admin: allow booking even if slot wasn't predefined
      if (!newExpert.availableSlots) {
        newExpert.availableSlots = [];
      }
      newExpert.availableSlots.push({
        date,
        time,
        booked: true
      });
    } else {
      const newSlot = newExpert.availableSlots![newSlotIndex];
      if (newSlot.booked) {
        return res.status(400).json({ message: 'Khung giờ này đã có học viên khác đặt cho chuyên gia này' });
      }
      newExpert.availableSlots![newSlotIndex].booked = true;
    }

    await newExpert.save();

    // 3. Update booking
    booking.date = date;
    booking.time = time;
    booking.expertId = targetExpertId;
    if (mode) booking.mode = mode;

    if (mode === 'online' && !booking.meetingLink) {
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      booking.meetingLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
    }

    await booking.save();
    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/admin/stats - Statistics for Admin Dashboard
export const adminGetStats = async (req: Request, res: Response) => {
  try {
    const totalBookings = await BookingModel.countDocuments();
    const pending = await BookingModel.countDocuments({ status: 'pending' });
    const confirmed = await BookingModel.countDocuments({ status: 'confirmed' });
    const completed = await BookingModel.countDocuments({ status: 'completed' });
    const cancelled = await BookingModel.countDocuments({
      status: { $in: ['cancelled_student', 'cancelled_expert'] }
    });
    const noShow = await BookingModel.countDocuments({ status: 'no_show' });
    const reschedule = await BookingModel.countDocuments({ status: 'reschedule_needed' });

    // Retrieve all dates to compute daily, weekly, monthly stats in memory
    const allBookingDates = await BookingModel.find({}).select('date').lean();

    const dailyMap: Record<string, number> = {};
    const weeklyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};

    const getMondayString = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
      } catch {
        return dateStr;
      }
    };

    for (const b of allBookingDates) {
      if (!b.date) continue;
      // Daily (YYYY-MM-DD)
      dailyMap[b.date] = (dailyMap[b.date] || 0) + 1;

      // Weekly (Monday of week YYYY-MM-DD)
      const mondayStr = getMondayString(b.date);
      weeklyMap[mondayStr] = (weeklyMap[mondayStr] || 0) + 1;

      // Monthly (YYYY-MM)
      const monthStr = b.date.substring(0, 7);
      monthlyMap[monthStr] = (monthlyMap[monthStr] || 0) + 1;
    }

    const dailyStats = Object.entries(dailyMap)
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => a._id.localeCompare(b._id))
      .slice(-30);

    const weeklyStats = Object.entries(weeklyMap)
      .map(([weekStart, count]) => ({ _id: `Tuần ${weekStart}`, count }))
      .sort((a, b) => a._id.localeCompare(b._id))
      .slice(-20);

    const monthlyStats = Object.entries(monthlyMap)
      .map(([month, count]) => ({ _id: `Tháng ${month.substring(5)}/${month.substring(0, 4)}`, count }))
      .sort((a, b) => a._id.localeCompare(b._id))
      .slice(-12);

    // Top experts stats
    const expertStats = await BookingModel.aggregate([
      {
        $group: {
          _id: '$expertId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Populate expert details
    const populatedExpertStats = await Promise.all(
      expertStats.map(async (stat) => {
        const expert = await UserModel.findById(stat._id).select('displayName email title');
        return {
          expert: expert || { displayName: 'Unknown Expert' },
          count: stat.count
        };
      })
    );

    return res.json({
      total: totalBookings,
      statuses: {
        pending,
        confirmed,
        completed,
        cancelled,
        noShow,
        reschedule
      },
      dailyStats,
      weeklyStats,
      monthlyStats,
      expertStats: populatedExpertStats
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/:id/reschedule - Student reschedule a booking
export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, mode } = req.body;
    const studentId = req.user?.sub;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (String(booking.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đổi lịch hẹn này' });
    }

    if (!['pending', 'confirmed', 'reschedule_needed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Chỉ có thể đổi lịch hẹn đang chờ, đã xác nhận hoặc đang yêu cầu đổi lịch' });
    }

    // Check if reschedule is requested at least 2 days before the original booking date
    const todayStr = getVietnamDateString(new Date());
    const originalDiff = getDaysDifference(booking.date, todayStr);
    if (originalDiff < 2) {
      return res.status(400).json({
        message: 'Bạn chỉ có thể đổi lịch hẹn trước tối thiểu 2 ngày so với ngày hẹn cũ.'
      });
    }

    // Check if the new date is at least 3 days in advance from today
    const newDiff = getDaysDifference(date, todayStr);
    if (newDiff < 3) {
      return res.status(400).json({
        message: 'Lịch hẹn mới phải được đặt trước tối thiểu 3 ngày so với hôm nay.'
      });
    }

    const expert = await UserModel.findById(booking.expertId);
    if (!expert) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin chuyên gia' });
    }

    // Release previous slot
    const prevSlotIndex = expert.availableSlots?.findIndex(
      (slot) => slot.date === booking.date && slot.time === booking.time
    );
    if (prevSlotIndex !== undefined && prevSlotIndex !== -1) {
      expert.availableSlots![prevSlotIndex].booked = false;
    }

    // Find and verify the new slot
    const newSlotIndex = expert.availableSlots?.findIndex(
      (slot) => slot.date === date && slot.time === time
    );
    if (newSlotIndex === undefined || newSlotIndex === -1) {
      return res.status(400).json({ message: 'Khung giờ mới này không khả dụng cho chuyên gia' });
    }

    const newSlot = expert.availableSlots![newSlotIndex];
    if (newSlot.booked) {
      return res.status(400).json({ message: 'Khung giờ mới đã được đặt bởi người khác' });
    }

    // Lock new slot
    expert.availableSlots![newSlotIndex].booked = true;
    await expert.save();

    // Update booking details
    booking.date = date;
    booking.time = time;
    if (mode) booking.mode = mode;
    booking.status = 'pending'; // Reset to pending for expert's approval
    booking.meetingLink = undefined; // Will be generated when expert confirms

    await booking.save();

    // Send notification emails (Student gets confirmation only after Expert approves/confirms)
    const expertName = expert.displayName || expert.email.split('@')[0];
    sendBookingNotificationToExpert(expert.email, booking, booking.studentName).catch(console.error);
    sendRescheduleSubmissionToStudent(booking.studentEmail, booking, expertName).catch(console.error);

    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/admin/export-excel - Export genuine xlsx file for admin
export const adminExportExcel = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.find().populate({
      path: 'expertId',
      select: 'displayName email title'
    }).lean();

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'Ch\u1edd duy\u1ec7t';
        case 'confirmed': return '\u0110\u00e3 duy\u1ec7t';
        case 'completed': return 'Ho\u00e0n th\u00e0nh';
        case 'cancelled_student': return 'H\u1ecdc vi\u00ean h\u1ee7y';
        case 'cancelled_expert': return 'SS H\u1ee7y';
        case 'no_show': return 'V\u1eafng m\u1eb7t';
        case 'reschedule_needed': return 'Y\u00eau c\u1ea7u \u0111\u1ed5i l\u1ecbch';
        default: return status;
      }
    };

    const formatTime = (startTime: string): string => {
      if (!startTime) return '';
      try {
        const [h, m] = startTime.split(':');
        const end = String(parseInt(h, 10) + 2).padStart(2, '0');
        return `${startTime} - ${end}:${m}`;
      } catch { return startTime; }
    };

    // Build rows as plain objects for SheetJS
    const sheetData = [
      [
        'H\u1ecdc vi\u00ean', 'Email h\u1ecdc vi\u00ean', 'S\u0110T h\u1ecdc vi\u00ean',
        'Chuy\u00ean gia', 'Email chuy\u00ean gia', 'M\u1ea3ng t\u01b0 v\u1ea5n',
        'Ch\u1ee7 \u0111\u1ec1', 'Ng\u00e0y t\u01b0 v\u1ea5n', 'Gi\u1edd t\u01b0 v\u1ea5n',
        'H\u00ecnh th\u1ee9c', 'Tr\u1ea1ng th\u00e1i'
      ],
      ...(bookings as any[]).map(b => [
        b.studentName || '',
        b.studentEmail || '',
        b.studentPhone || '',
        b.expertId?.displayName || '',
        b.expertId?.email || '',
        b.expertId?.title || '',
        b.bookingType || '',
        b.date || '',
        formatTime(b.time || ''),
        b.mode === 'online' ? 'Online' : 'Offline',
        getStatusText(b.status || '')
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto column widths
    ws['!cols'] = [20, 28, 16, 22, 28, 22, 30, 14, 18, 10, 18].map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws, 'B\u00e1o c\u00e1o SSConnect');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const dateStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bao_cao_lich_tu_van_ssconnect_${dateStr}.xlsx"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

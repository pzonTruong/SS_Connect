import { Request, Response } from 'express';
import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import {
  sendBookingConfirmationToStudent,
  sendBookingNotificationToExpert,
  sendBookingCancellationToStudent,
  sendBookingCompletionToStudent,
  sendRescheduleRequestToStudent,
  sendRescheduleSubmissionToStudent
} from '../services/email.service';
import { getVietnamDateString, getDaysDifference } from '../utils/date';

// POST /api/bookings - Book a session (student only)
export const createBooking = async (req: Request, res: Response) => {
  try {
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
    if (slot.booked) {
      return res.status(400).json({ message: 'Khung giờ này đã được đặt trước đó' });
    }

    // Lock the slot
    expert.availableSlots![slotIndex].booked = true;
    await expert.save();

    // Create booking
    let meetingLink = undefined;
    if (mode === 'online') {
      // Generate a mock Google Meet link
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      meetingLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
    }

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

    // Send emails asynchronously (Student gets confirmation only after Expert approves/confirms)
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

    // If cancelled, free up the timeslot on the expert
    const isCancelling = ['cancelled_student', 'cancelled_expert'].includes(status);
    const wasActive = ['pending', 'confirmed'].includes(booking.status);

    if (status === 'cancelled_student' && wasActive) {
      // Check 1-day constraint
      const todayStr = getVietnamDateString(new Date());
      const daysDiff = getDaysDifference(booking.date, todayStr);
      if (daysDiff < 1) {
        return res.status(400).json({
          message: 'Bạn chỉ có thể hủy lịch hẹn trước tối thiểu 1 ngày.'
        });
      }

      // Update student warnings
      const student = await UserModel.findById(booking.studentId);
      if (student) {
        student.cancellationWarnings = (student.cancellationWarnings || 0) + 1;
        if (student.cancellationWarnings >= 2) {
          student.isBlockedFromBooking = true;
        }
        await student.save();
      }
    }

    if (status === 'completed' && wasActive) {
      const student = await UserModel.findById(booking.studentId);
      if (student) {
        student.cancellationWarnings = 0;
        student.isBlockedFromBooking = false;
        await student.save();
      }
    }

    if (isCancelling && wasActive) {
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

    const oldStatus = booking.status;

    // Apply updates
    if (status) {
      booking.status = status;
    }
    if (postConsultationNotes !== undefined) {
      booking.postConsultationNotes = postConsultationNotes;
    }

    await booking.save();

    // Send confirmation email to student only when transitioning from pending to confirmed
    if (status === 'confirmed' && oldStatus === 'pending') {
      const expert = await UserModel.findById(booking.expertId);
      const expertName = expert ? (expert.displayName || expert.email.split('@')[0]) : 'Chuyên gia';
      sendBookingConfirmationToStudent(booking.studentEmail, booking, expertName).catch(console.error);
    }

    // Send cancellation/rejection email to student when expert cancels/declines
    if (status === 'cancelled_expert' && oldStatus !== 'cancelled_expert') {
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
    const { date, time, mode } = req.body;

    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const expert = await UserModel.findById(booking.expertId);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
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
      return res.status(400).json({ message: 'Khung giờ mới đã được đặt' });
    }

    // Lock new slot
    expert.availableSlots![newSlotIndex].booked = true;
    await expert.save();

    // Update booking
    booking.date = date;
    booking.time = time;
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

    // Aggregating bookings count by date for graph
    const dailyStats = await BookingModel.aggregate([
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

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

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Chỉ có thể đổi lịch hẹn đang chờ hoặc đã xác nhận' });
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

    if (mode === 'online' && !booking.meetingLink) {
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      booking.meetingLink = `https://meet.google.com/${p1}-${p2}-${p3}`;
    }

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

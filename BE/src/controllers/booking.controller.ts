import { Request, Response } from 'express';
import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import { sendBookingConfirmationToStudent, sendBookingNotificationToExpert } from '../services/email.service';

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

    // Send emails asynchronously
    const expertName = expert.displayName || expert.email.split('@')[0];
    sendBookingConfirmationToStudent(studentEmail, booking, expertName).catch(console.error);
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

    // Apply updates
    if (status) {
      booking.status = status;
    }
    if (postConsultationNotes !== undefined) {
      booking.postConsultationNotes = postConsultationNotes;
    }

    await booking.save();
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

import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getExpertBookings,
  updateBookingStatus,
  adminGetAllBookings,
  adminRescheduleBooking,
  adminGetStats
} from '../controllers/booking.controller';
import { authGuard } from '../middlewares/auth.middleware';

export const bookingRouter = Router();

// Student routes
bookingRouter.post('/', authGuard, createBooking);
bookingRouter.get('/my-bookings', authGuard, getMyBookings);

// Expert routes
bookingRouter.get('/expert-bookings', authGuard, getExpertBookings);

// Shared booking update status (student, expert, admin)
bookingRouter.put('/:id/status', authGuard, updateBookingStatus);

// Admin-only routes
bookingRouter.get('/admin/all', authGuard, adminGetAllBookings);
bookingRouter.put('/admin/:id/reschedule', authGuard, adminRescheduleBooking);
bookingRouter.get('/admin/stats', authGuard, adminGetStats);

import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getExpertBookings,
  updateBookingStatus,
  rescheduleBooking,
  adminGetAllBookings,
  adminRescheduleBooking,
  adminGetStats
} from '../controllers/booking.controller';
import { authGuard, adminGuard } from '../middlewares/auth.middleware';

export const bookingRouter = Router();

// Student routes
bookingRouter.post('/', authGuard, createBooking);
bookingRouter.get('/my-bookings', authGuard, getMyBookings);
bookingRouter.put('/:id/reschedule', authGuard, rescheduleBooking);

// Expert routes
bookingRouter.get('/expert-bookings', authGuard, getExpertBookings);

// Shared booking update status (student, expert, admin)
bookingRouter.put('/:id/status', authGuard, updateBookingStatus);

// Admin-only routes
bookingRouter.get('/admin/all', authGuard, adminGuard, adminGetAllBookings);
bookingRouter.put('/admin/:id/reschedule', authGuard, adminGuard, adminRescheduleBooking);
bookingRouter.get('/admin/stats', authGuard, adminGuard, adminGetStats);


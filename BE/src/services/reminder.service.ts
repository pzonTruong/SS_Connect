import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import { sendMeetingReminderEmail } from './email.service';

const formatLeadTimeText = (minutes: number): string => {
  if (minutes < 60) return `${minutes} phút`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ`;
  return `${Math.floor(minutes / 1440)} ngày`;
};

export const checkAndSendMeetingReminders = async () => {
  try {
    const now = new Date();

    // Find active confirmed bookings that haven't sent both reminders
    const bookings = await BookingModel.find({
      status: 'confirmed',
      $or: [
        { reminderSentStudent: { $ne: true } },
        { reminderSentExpert: { $ne: true } }
      ]
    }).populate('studentId expertId');

    for (const booking of bookings) {
      if (!booking.date || !booking.time) continue;

      // Parse booking start date & time with explicit Asia/Ho_Chi_Minh (+07:00) offset
      const meetingTime = new Date(`${booking.date}T${booking.time}:00+07:00`);
      if (isNaN(meetingTime.getTime())) continue;

      const diffMs = meetingTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Skip past meetings (give 15 minutes grace period after start)
      if (diffMinutes < -15) continue;

      let isUpdated = false;

      // 1. Process Student Reminder
      if (!booking.reminderSentStudent) {
        const student = booking.studentId as any;
        const reminderEnabled = student?.reminderEnabled ?? true;
        const leadMinutes = student?.reminderLeadTimeMinutes ?? 30;

        if (reminderEnabled && diffMinutes > 0 && diffMinutes <= leadMinutes) {
          const leadText = formatLeadTimeText(leadMinutes);
          const studentName = booking.studentName || student?.displayName || 'Học viên';
          sendMeetingReminderEmail(
            booking.studentEmail || student?.email,
            booking,
            studentName,
            leadText
          ).catch((err) => console.error('Failed to send student reminder:', err));

          booking.reminderSentStudent = true;
          isUpdated = true;
        }
      }

      // 2. Process Expert Reminder
      if (!booking.reminderSentExpert) {
        const expert = booking.expertId as any;
        if (expert) {
          const reminderEnabled = expert.reminderEnabled ?? true;
          const leadMinutes = expert.reminderLeadTimeMinutes ?? 30;

          if (reminderEnabled && diffMinutes > 0 && diffMinutes <= leadMinutes) {
            const leadText = formatLeadTimeText(leadMinutes);
            const expertName = expert.displayName || expert.email?.split('@')[0] || 'Chuyên gia';
            sendMeetingReminderEmail(
              expert.email,
              booking,
              expertName,
              leadText
            ).catch((err) => console.error('Failed to send expert reminder:', err));

            booking.reminderSentExpert = true;
            isUpdated = true;
          }
        }
      }

      if (isUpdated) {
        await booking.save();
      }
    }
  } catch (error) {
    console.error('Error checking meeting reminders:', error);
  }
};

import { checkAndCancelExpiredBookings } from '../controllers/booking.controller';

export const startReminderScheduler = (intervalMinutes = 1) => {
  console.log(`⏰ Reminder scheduler started (checking every ${intervalMinutes} minute(s))...`);
  // Run immediately on start
  checkAndSendMeetingReminders().catch(console.error);
  checkAndCancelExpiredBookings().catch(console.error);

  // Set interval loop
  setInterval(() => {
    checkAndSendMeetingReminders().catch(console.error);
    checkAndCancelExpiredBookings().catch(console.error);
  }, intervalMinutes * 60 * 1000);
};

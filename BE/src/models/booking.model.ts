import mongoose, { Schema } from 'mongoose';

export interface BookingDocument extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  course: string;
  major: string;
  goals: string;
  issues: string;
  cvLink?: string;
  bookingType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mode: 'online' | 'offline';
  meetingLink?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled_student' | 'cancelled_expert' | 'no_show' | 'reschedule_needed';
  postConsultationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<BookingDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    studentPhone: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    major: { type: String, required: true, trim: true },
    goals: { type: String, required: true, trim: true },
    issues: { type: String, required: true, trim: true },
    cvLink: { type: String, trim: true },
    bookingType: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, enum: ['online', 'offline'], required: true },
    meetingLink: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'completed',
        'cancelled_student',
        'cancelled_expert',
        'no_show',
        'reschedule_needed'
      ],
      default: 'pending'
    },
    postConsultationNotes: { type: String, trim: true }
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model<BookingDocument>('Booking', bookingSchema);

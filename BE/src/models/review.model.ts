import mongoose, { Schema } from 'mongoose';

export interface ReviewDocument extends mongoose.Document {
  bookingId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema);

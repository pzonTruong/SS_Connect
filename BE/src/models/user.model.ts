import mongoose, { Schema } from 'mongoose';

export interface Timeslot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  booked: boolean;
}

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: 'user' | 'expert' | 'admin';
  otpCode?: string;
  otpExpiresAt?: Date;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  
  // Expert fields
  title?: string;
  specialties?: string[];
  experienceYears?: number;
  achievements?: string[];
  consultingStyle?: string;
  availableSlots?: Timeslot[];
  consultingType?: ('online' | 'offline')[];
}

const timeslotSchema = new Schema<Timeslot>({
  date: { type: String, required: true },
  time: { type: String, required: true },
  booked: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'expert', 'admin'], default: 'user' },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    resetToken: { type: String },
    resetTokenExpiresAt: { type: Date },
    displayName: { type: String, trim: true },
    bio: { type: String, maxlength: 500 }, // Expanded bio max length
    avatarUrl: { type: String },
    phone: { type: String, trim: true },
    
    // Expert schemas
    title: { type: String, trim: true },
    specialties: [{ type: String, trim: true }],
    experienceYears: { type: Number },
    achievements: [{ type: String, trim: true }],
    consultingStyle: { type: String, trim: true },
    availableSlots: [timeslotSchema],
    consultingType: [{ type: String, enum: ['online', 'offline'] }]
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);


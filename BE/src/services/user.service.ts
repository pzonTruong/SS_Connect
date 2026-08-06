import crypto from 'crypto';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/hash';
import { generateOtp } from '../utils/otp';
import { sendOtpEmail, sendResetTokenEmail } from './email.service';

const otpExpiry = () => new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
const resetExpiry = () => new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

export const createUserWithOtp = async (email: string, password: string, role?: 'user' | 'expert') => {
  const existing = await UserModel.findOne({ email });
  if (existing) {
    if (!existing.isEmailVerified) {
      // User exists but has not verified email yet. Resend OTP and update password/role.
      const otp = generateOtp();
      existing.password = await hashPassword(password);
      existing.role = role || 'user';
      existing.otpCode = otp;
      existing.otpExpiresAt = otpExpiry();
      await existing.save();

      await sendOtpEmail(email, otp);
      return existing;
    }
    return null; // Verified email already exists
  }

  const otp = generateOtp();
  const user = await UserModel.create({
    email,
    password: await hashPassword(password),
    role: role || 'user',
    otpCode: otp,
    otpExpiresAt: otpExpiry()
  });

  await sendOtpEmail(email, otp);
  return user;
};

export const issueOtpForUser = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return null;

  const otp = generateOtp();
  user.otpCode = otp;
  user.otpExpiresAt = otpExpiry();
  await user.save();

  await sendOtpEmail(user.email, otp);
  return user;
};

export const issueResetToken = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) return null;

  const token = crypto.randomInt(100000, 999999).toString();
  user.resetToken = token;
  user.resetTokenExpiresAt = resetExpiry();
  await user.save();

  await sendResetTokenEmail(email, token);
  return user;
};

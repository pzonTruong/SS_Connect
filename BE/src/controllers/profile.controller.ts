import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { deleteImage, uploadImage } from '../services/cloudinary.service';
import { UpdateProfileInput } from '../validators/profile.validator';

// Fields excluded from all profile responses (role is intentionally NOT excluded — it is public)
const EXCLUDED_FIELDS = '-password -otpCode -otpExpiresAt -resetToken -resetTokenExpiresAt';

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  const { displayName, bio, phone } = req.body as UpdateProfileInput;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { displayName, bio, phone },
    { new: true, runValidators: true }
  ).select(EXCLUDED_FIELDS);

  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  if (!req.file) return res.status(400).json({ message: 'No file provided' });

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Delete old avatar from Cloudinary if it exists
  if (user.avatarUrl) {
    // Extract public ID: last two path segments joined by '/' without extension
    const parts = user.avatarUrl.split('/');
    const filename = parts[parts.length - 1].replace(/\.[^/.]+$/, '');
    const folder = parts[parts.length - 2];
    const oldPublicId = `${folder}/${filename}`;
    await deleteImage(oldPublicId).catch(() => {
      // Non-fatal: old image cleanup failure should not block the upload
    });
  }

  const { url, publicId } = await uploadImage(req.file.buffer, 'avatars');
  user.avatarUrl = url;
  await user.save();

  const updated = await UserModel.findById(userId).select(EXCLUDED_FIELDS);
  return res.json({ avatarUrl: url, publicId, user: updated });
};

// GET /api/profile/experts - Get all experts (public)
export const getExperts = async (req: Request, res: Response) => {
  try {
    const experts = await UserModel.find({ role: 'expert', isEmailVerified: true })
      .select('-password -otpCode -otpExpiresAt -resetToken -resetTokenExpiresAt');
    return res.json(experts);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/profile/experts/:id - Get single expert profile (public)
export const getExpertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expert = await UserModel.findOne({ _id: id, role: 'expert' })
      .select('-password -otpCode -otpExpiresAt -resetToken -resetTokenExpiresAt');
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    return res.json(expert);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/profile/expert-details - Update expert specific fields (expert only)
export const updateExpertDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { title, specialties, experienceYears, achievements, consultingStyle, consultingType, displayName, bio, phone } = req.body;

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'expert') {
      return res.status(403).json({ message: 'Only experts can update expert details' });
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (title !== undefined) user.title = title;
    if (specialties !== undefined) user.specialties = specialties;
    if (experienceYears !== undefined) user.experienceYears = experienceYears;
    if (achievements !== undefined) user.achievements = achievements;
    if (consultingStyle !== undefined) user.consultingStyle = consultingStyle;
    if (consultingType !== undefined) user.consultingType = consultingType;

    await user.save();
    const updated = await UserModel.findById(userId).select(EXCLUDED_FIELDS);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/profile/expert-slots - Update expert available slots (expert only)
export const updateExpertSlots = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { availableSlots } = req.body; // Array of { date: string, time: string, booked: boolean }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'expert') {
      return res.status(403).json({ message: 'Only experts can update slots' });
    }

    user.availableSlots = availableSlots;
    await user.save();
    
    return res.json({ message: 'Slots updated successfully', availableSlots: user.availableSlots });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


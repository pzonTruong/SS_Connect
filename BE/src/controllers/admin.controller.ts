import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { hashPassword } from '../utils/hash';

// GET /api/admin/users - Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).select('-password -otpCode -resetToken');
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/role - Change user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'user' | 'expert' | 'admin'

    if (!['user', 'expert', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    
    // Initialize expert fields if role changed to expert
    if (role === 'expert') {
      user.title = user.title || 'SS Consultant';
      user.specialties = user.specialties || ['CV', 'Định hướng nghề nghiệp'];
      user.experienceYears = user.experienceYears || 1;
      user.achievements = user.achievements || [];
      user.availableSlots = user.availableSlots || [];
      user.consultingType = user.consultingType || ['online', 'offline'];
    }

    await user.save();
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id - Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/experts - Create expert directly (admin only)
export const createExpert = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      displayName,
      title,
      experienceYears,
      specialties,
      consultingType,
      consultingStyle,
      achievements,
      bio,
      phone
    } = req.body;

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const expert = new UserModel({
      email,
      password: hashedPassword,
      isEmailVerified: true, // Admin creations are auto-verified
      role: 'expert',
      displayName,
      title,
      experienceYears,
      specialties: specialties || [],
      consultingType: consultingType || ['online'],
      consultingStyle,
      achievements: achievements || [],
      bio,
      phone,
      availableSlots: []
    });

    await expert.save();
    return res.status(201).json(expert);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/block - Toggle block status of student (admin only)
export const toggleBlockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }

    user.isBlockedFromBooking = !user.isBlockedFromBooking;
    await user.save();

    return res.json({
      message: `Đã ${user.isBlockedFromBooking ? 'khóa' : 'mở khóa'} quyền đặt lịch của học viên`,
      user
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id - Update user/expert profile details directly (admin only)
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      displayName,
      phone,
      bio,
      cancellationWarnings,
      isBlockedFromBooking,
      title,
      experienceYears,
      specialties,
      achievements,
      consultingStyle
    } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }

    // Common fields
    if (displayName !== undefined) user.displayName = displayName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    // Student fields
    if (cancellationWarnings !== undefined) user.cancellationWarnings = Number(cancellationWarnings);
    if (isBlockedFromBooking !== undefined) user.isBlockedFromBooking = Boolean(isBlockedFromBooking);

    // Expert fields
    if (title !== undefined) user.title = title;
    if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
    
    if (specialties !== undefined) {
      user.specialties = Array.isArray(specialties)
        ? specialties
        : String(specialties).split(',').map((s) => s.trim()).filter(Boolean);
    }
    
    if (achievements !== undefined) {
      user.achievements = Array.isArray(achievements)
        ? achievements
        : String(achievements).split('\n').map((a) => a.trim()).filter(Boolean);
    }
    
    if (consultingStyle !== undefined) user.consultingStyle = consultingStyle;

    await user.save();
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


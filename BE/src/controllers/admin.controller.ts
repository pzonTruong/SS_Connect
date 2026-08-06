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

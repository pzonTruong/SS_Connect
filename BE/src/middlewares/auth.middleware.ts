import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserModel } from '../models/user.model';

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.slice(7);
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user identifier' });
    }
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error in admin guard' });
  }
};


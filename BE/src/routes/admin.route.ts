import { Router, Request, Response, NextFunction } from 'express';
import { getAllUsers, updateUserRole, deleteUser, createExpert } from '../controllers/admin.controller';
import { authGuard } from '../middlewares/auth.middleware';
import { UserModel } from '../models/user.model';

export const adminRouter = Router();

// Middleware to verify user is admin
const adminGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.sub;
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error in admin guard' });
  }
};

adminRouter.get('/users', authGuard, adminGuard, getAllUsers);
adminRouter.put('/users/:id/role', authGuard, adminGuard, updateUserRole);
adminRouter.delete('/users/:id', authGuard, adminGuard, deleteUser);
adminRouter.post('/experts', authGuard, adminGuard, createExpert);

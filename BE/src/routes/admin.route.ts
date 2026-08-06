import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createExpert,
  toggleBlockUser,
  updateUserProfile
} from '../controllers/admin.controller';
import { authGuard, adminGuard } from '../middlewares/auth.middleware';

export const adminRouter = Router();

adminRouter.get('/users', authGuard, adminGuard, getAllUsers);
adminRouter.put('/users/:id/role', authGuard, adminGuard, updateUserRole);
adminRouter.delete('/users/:id', authGuard, adminGuard, deleteUser);
adminRouter.post('/experts', authGuard, adminGuard, createExpert);
adminRouter.put('/users/:id/block', authGuard, adminGuard, toggleBlockUser);
adminRouter.put('/users/:id', authGuard, adminGuard, updateUserProfile);


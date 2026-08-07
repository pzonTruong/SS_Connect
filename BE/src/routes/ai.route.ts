import { Router } from 'express';
import { recommendExperts } from '../controllers/ai.controller';
import { authGuard } from '../middlewares/auth.middleware';

export const aiRouter = Router();

aiRouter.post('/recommend-experts', authGuard, recommendExperts);

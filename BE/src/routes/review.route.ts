import { Router } from 'express';
import { createReview, getExpertReviews, getMyReviews } from '../controllers/review.controller';
import { authGuard } from '../middlewares/auth.middleware';

export const reviewRouter = Router();

reviewRouter.post('/', authGuard, createReview);
reviewRouter.get('/my-reviews', authGuard, getMyReviews);
reviewRouter.get('/expert/:expertId', getExpertReviews);

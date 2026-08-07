import { Request, Response } from 'express';
import { ReviewModel } from '../models/review.model';
import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';

// POST /api/reviews - Create a review for a completed booking (student only)
export const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ ID buổi tư vấn và điểm đánh giá.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5 sao.' });
    }

    // Check if booking exists and belongs to student
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin buổi tư vấn.' });
    }

    if (String(booking.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá buổi tư vấn này.' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá những buổi tư vấn đã hoàn thành.' });
    }

    if (booking.isReviewed) {
      return res.status(400).json({ message: 'Buổi tư vấn này đã được đánh giá trước đó.' });
    }

    // Create review
    const review = new ReviewModel({
      bookingId: booking._id,
      studentId,
      expertId: booking.expertId,
      rating,
      comment: comment ? comment.trim() : ''
    });

    await review.save();

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    // Recalculate average rating & review count for expert
    const expertId = booking.expertId;
    const reviews = await ReviewModel.find({ expertId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 5.0;

    await UserModel.findByIdAndUpdate(expertId, {
      ratingAverage: avgRating,
      reviewCount: reviews.length
    });

    return res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Buổi tư vấn này đã được đánh giá trước đó.' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/expert/:expertId - Get all reviews for an expert
export const getExpertReviews = async (req: Request, res: Response) => {
  try {
    const { expertId } = req.params;
    const reviews = await ReviewModel.find({ expertId })
      .populate('studentId', 'displayName avatarUrl')
      .populate('bookingId', 'bookingType date')
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/my-reviews - Get student's submitted reviews
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    const reviews = await ReviewModel.find({ studentId })
      .populate('expertId', 'displayName title avatarUrl')
      .populate('bookingId', 'bookingType date')
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

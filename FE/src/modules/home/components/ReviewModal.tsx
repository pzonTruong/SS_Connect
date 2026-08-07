import { useState } from 'react';
import { Star } from 'lucide-react';
import { http } from '@/shared/api/http';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  expertName: string;
  bookingType: string;
  onSuccess: () => void;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  bookingId,
  expertName,
  bookingType,
  onSuccess
}: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)');
      return;
    }

    setSubmitting(true);
    try {
      await http.post('/reviews', {
        bookingId,
        rating,
        comment
      });
      toast.success('Cảm ơn bạn đã gửi đánh giá cho buổi tư vấn!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-6 text-foreground relative">
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold tracking-tight">Đánh Giá Buổi Tư Vấn</h2>
          <p className="text-xs text-muted-foreground">
            Chuyên gia: <span className="font-semibold text-foreground">{expertName}</span> ({bookingType})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star selector */}
          <div className="space-y-2 text-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Mức độ hài lòng của bạn
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`size-8 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 min-h-[18px]">
              {rating === 5 && ' Rất hài lòng'}
              {rating === 4 && ' Hài lòng'}
              {rating === 3 && ' Bình thường'}
              {rating === 2 && ' Chưa hài lòng'}
              {rating === 1 && ' Rất không hài lòng'}
            </p>
          </div>

          {/* Comment text area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Nhận xét chi tiết (Không bắt buộc)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm hoặc cảm nhận của bạn về buổi tư vấn này..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 text-xs font-semibold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 text-xs font-semibold bg-brand-brown hover:bg-[#4E2505] text-white"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

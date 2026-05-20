'use client';

import { useCallback, useEffect, useState } from 'react';
import { Star, ShieldCheck } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  canReview: boolean;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewsResponse>({
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
    canReview: false,
  });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      cache: 'no-store',
    });
    if (!res.ok) return;
    const nextData = await res.json();
    setData(nextData);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });

    if (res.ok) {
      setComment('');
      setMessage('Đánh giá của bạn đã được lưu.');
      fetchReviews();
    } else {
      const error = await res.json().catch(() => ({}));
      setMessage(error.error || 'Không thể gửi đánh giá lúc này.');
    }

    setSubmitting(false);
  };

  const renderStars = (value: number, interactive = false) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index + 1 <= value;
        const star = (
            <Star
              className={`h-5 w-5 ${
                active ? 'fill-[#f4b740] text-[#f4b740]' : 'text-[#d8c7ba]'
              }`}
            />
        );
        return interactive ? (
          <button
            key={index}
            type="button"
            onClick={() => setRating(index + 1)}
            className="transition hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={index}>{star}</span>
        );
      })}
    </div>
  );

  return (
    <section className="mt-8 rounded-[2rem] border border-white/75 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e6532f]">
            Review thật
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#181411]">
            Đánh giá từ người đã mua
          </h2>
        </div>
        <div className="rounded-2xl bg-[#181411] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            {renderStars(Math.round(data.averageRating))}
          </div>
          <p className="mt-1 text-sm text-white/70">
            {data.averageRating.toFixed(1)} / 5 từ {data.reviewCount} đánh giá
          </p>
        </div>
      </div>

      {data.canReview ? (
        <form onSubmit={submitReview} className="mb-6 rounded-3xl border border-[#ead8ca] bg-white/76 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="font-bold text-[#352820]">Chấm điểm sản phẩm</label>
            {renderStars(rating, true)}
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="field-control min-h-28 resize-none"
            placeholder="Chia sẻ cảm nhận sau khi dùng sản phẩm..."
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#665c55]">
              <ShieldCheck className="h-4 w-4 text-[#e6532f]" />
              Chỉ đơn đã giao mới được đánh giá.
            </p>
            <button type="submit" disabled={submitting} className="btn-primary py-2.5">
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
          {message && <p className="mt-3 text-sm font-semibold text-[#b9381c]">{message}</p>}
        </form>
      ) : (
        <div className="mb-6 rounded-3xl border border-[#ead8ca] bg-white/65 p-4 text-sm font-semibold text-[#665c55]">
          Mua và nhận hàng thành công để viết đánh giá xác thực cho sản phẩm này.
        </div>
      )}

      <div className="space-y-3">
        {data.reviews.length === 0 ? (
          <div className="rounded-3xl bg-white/62 p-6 text-center text-[#665c55]">
            Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ sau khi nhận hàng.
          </div>
        ) : (
          data.reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-[#ead8ca] bg-white/72 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <p className="font-black text-[#181411]">
                    {review.user.name || review.user.email || 'Khách hàng KShop'}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#9a8576]">
                    Đã mua hàng · {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="mt-3 leading-7 text-[#665c55]">{review.comment}</p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Review } from '../../types';
import { MessageSquare, Send, ThumbsUp, CheckCircle, Filter, Star, Sparkles } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: number;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  reviews,
  onAddReview,
}) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '4.9';

  // Calculate star distributions
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : stars === 5 ? 85 : 15;
    return { stars, count, percentage };
  });

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    onAddReview({
      productId,
      author: author.trim(),
      rating: newRating,
      comment: comment.trim(),
    });

    setAuthor('');
    setComment('');
    setNewRating(5);
    setIsSubmitting(false);
  };

  const toggleLike = (id: string) => {
    setLikedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-8 font-arabic" dir="rtl">
      {/* 1. Review Summary & Distribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FCFAF7] p-6 sm:p-8 rounded-3xl border border-[#F0EAE1]">
        {/* Left/Main Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-l border-[#F0EAE1]">
          <span className="text-5xl sm:text-6xl font-black text-[#111111] mb-2 font-mono">
            {avgRating}
          </span>
          <StarRating rating={Number(avgRating)} size="lg" />
          <span className="text-xs font-bold text-neutral-500 mt-2">
            بناءً على {totalReviews} تقييماً معتمداً
          </span>
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-[#008F68]/10 text-[#008F68] rounded-full text-[11px] font-black">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>98% يوصون بهذا المقتنى</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {starCounts.map(({ stars, count, percentage }, idx) => (
            <button
              key={`star-breakdown-${stars}-${idx}`}
              type="button"
              onClick={() => setFilterRating(filterRating === stars ? null : stars)}
              className={`flex items-center gap-3 text-xs w-full group text-right p-1 rounded-xl transition-all cursor-pointer ${
                filterRating === stars ? 'bg-white shadow-2xs font-black' : 'hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-1 w-16 shrink-0 font-bold text-[#111111]">
                <span>{stars} نجوم</span>
                <Star className="w-3 h-3 text-[#FFC700] fill-[#FFC700]" />
              </div>

              <div className="flex-1 h-2.5 bg-[#EFECE5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#008F68] rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-10 text-left font-mono text-neutral-500 text-[11px] shrink-0">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter indicator */}
      {filterRating && (
        <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#E8E3D8] text-xs">
          <span className="font-black text-[#111111]">
            تصفية التقييمات: {filterRating} نجوم فقط ({filteredReviews.length})
          </span>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className="text-[#008F68] font-bold hover:underline cursor-pointer"
          >
            عرض كافة التقييمات
          </button>
        </div>
      )}

      {/* 2. Reviews List & Add Review Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Reviews List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {filteredReviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E3D8] text-neutral-500 text-xs font-bold">
              لا توجد تقييمات مطابقة لهذا الفلتر.
            </div>
          ) : (
            filteredReviews.map((rev, idx) => {
              const isLiked = likedReviews[rev.id] || false;
              return (
                <div
                  key={`rev-item-${rev.id || idx}-${idx}`}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-3 shadow-2xs hover:border-neutral-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-xs font-black text-[#008F68]">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-[#111111] text-sm">{rev.author}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FCFAF7] text-[#008F68] border border-[#E8E3D8] rounded-full">
                            مقتنٍ معتمد ✓
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  <StarRating rating={rev.rating} size="sm" />

                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-arabic">
                    {rev.comment}
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                    <button
                      type="button"
                      onClick={() => toggleLike(rev.id)}
                      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold ${
                        isLiked ? 'text-[#008F68]' : 'hover:text-[#111111]'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#008F68]' : ''}`} />
                      <span>{isLiked ? 'مفيد (١)' : 'تقييم مفيد'}</span>
                    </button>
                    <span className="text-[10px]">تم الشراء من متجر فخامة</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Review Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-4 shadow-2xs sticky top-24"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#111111] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#008F68]" />
                <span>إضافة تقييمك للمقتنى</span>
              </h3>
              <Sparkles className="w-4 h-4 text-[#FFC700]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-[#111111]">درجة التقييم</span>
              <StarRating
                rating={newRating}
                size="lg"
                interactive
                onRatingChange={setNewRating}
              />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-black text-[#111111]">اسمك الكامل</label>
              <input
                type="text"
                placeholder="مثال: عبدالله الراجحي"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] text-[#111111] text-xs px-4 py-3 focus:outline-none focus:border-[#008F68] focus:ring-1 focus:ring-[#008F68]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-black text-[#111111]">رأيك وملاحظاتك الفنية</label>
              <textarea
                rows={4}
                placeholder="شاركنا تجربتك في دقة التصنيع، جودة المواد والأداء..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] text-[#111111] text-xs p-3.5 focus:outline-none focus:border-[#008F68] focus:ring-1 focus:ring-[#008F68] leading-relaxed"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="w-full mt-2"
            >
              نشر التقييم المعتمد
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../types';
import { fetchProductReviews } from '../api';

export function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      fetchProductReviews(productId)
        .then(data => {
          setReviews(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [productId]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2) : '0.00';
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingCounts[r.rating as keyof typeof ratingCounts] !== undefined) {
      ratingCounts[r.rating as keyof typeof ratingCounts]++;
    }
  });
  return (
    <div className="w-full bg-[#f8f5f2] py-16 px-4 md:px-12 mt-12 border-t border-surface-light">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/3">
          <h2 className="text-2xl font-bold font-serif text-typography-primary mb-4">Customer Reviews</h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-brand-navy">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-typography-primary">{averageRating} out of 5 based on {totalReviews} reviews</span>
          </div>
          
          <div className="space-y-2 mt-6">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating as keyof typeof ratingCounts];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 justify-end text-typography-primary font-medium">
                    {rating} <Star className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-navy" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-typography-muted">{count}</div>
                </div>
              );
            })}
          </div>

          <button className="mt-8 text-xs font-bold uppercase tracking-widest text-typography-primary border-b border-typography-primary pb-1 hover:text-brand-pink hover:border-brand-pink transition-colors">
            Write a Review
          </button>
        </div>

        {/* Right Side: Reviews List */}
        <div className="w-full md:w-2/3 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-typography-muted text-sm uppercase tracking-widest font-light">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-light/50">
                  <div className="flex text-brand-navy mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-surface-light'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-typography-primary text-sm">{review.author_name}</span>
                    {review.is_verified_buyer && (
                      <span className="text-xs text-typography-muted bg-surface-offWhite px-2 py-0.5 rounded-md">Verified Buyer</span>
                    )}
                  </div>
                  <p className="text-xs text-typography-muted mb-4">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="text-sm text-typography-primary mb-4 leading-relaxed">{review.content}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-surface-light">
                      <img src={img} alt="Review" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-4 text-xs text-typography-muted">
                {review.size && <span>Size: {review.size}</span>}
                {review.color && <span>Color: {review.color}</span>}
              </div>
            </div>
              ))}
              
              <div className="flex justify-center mt-8 gap-2">
                 <button className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-light text-typography-primary bg-white hover:bg-surface-offWhite">1</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

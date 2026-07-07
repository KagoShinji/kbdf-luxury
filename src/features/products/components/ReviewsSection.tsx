import { Star } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
  images?: string[];
  size?: string;
  color?: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Jane Doe',
    date: 'Oct 15, 2023',
    rating: 5,
    content: 'Super comfortable and stylish. Really elevates any casual outfit I wear! 😍 True to size fit.',
    images: ['/placeholder.png', '/placeholder.png'],
    size: '38',
    color: 'Black'
  },
  {
    id: '2',
    author: 'Sarah Jenkins',
    date: 'Oct 12, 2023',
    rating: 5,
    content: 'Obsessed! So glad I managed to snag a pair before they sold out. They look way more expensive than they are.',
    images: ['/placeholder.png'],
    size: '37',
    color: 'Black'
  },
  {
    id: '3',
    author: 'Maria C.',
    date: 'Oct 10, 2023',
    rating: 4,
    content: 'Love the design, but took a couple of wears to break in fully. Very chic.',
    images: ['/placeholder.png'],
    size: '39',
    color: 'Beige'
  }
];

export function ReviewsSection() {
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
            <span className="text-sm font-semibold text-typography-primary">4.89 out of 5 based</span>
          </div>
          
          <div className="space-y-2 mt-6">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = rating === 5 ? 120 : rating === 4 ? 20 : rating === 3 ? 8 : rating === 2 ? 2 : 1;
              const percentage = (count / 151) * 100;
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
          {mockReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-light/50">
              <div className="flex text-brand-navy mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-typography-primary text-sm">{review.author}</span>
                <span className="text-xs text-typography-muted bg-surface-offWhite px-2 py-0.5 rounded-md">Verified Buyer</span>
              </div>
              <p className="text-xs text-typography-muted mb-4">{review.date}</p>
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
             <button className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-light text-typography-primary hover:bg-surface-offWhite">2</button>
             <button className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-light text-typography-primary hover:bg-surface-offWhite">3</button>
             <span className="flex items-center justify-center">...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

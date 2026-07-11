import { ProductCard } from './ProductCard';
import type { Product } from '../types';

interface ProductCarouselProps {
  title: string;
  products?: Product[];
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-surface-white py-16 px-4 md:px-12 border-t border-surface-light">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold font-serif text-typography-primary mb-8">{title}</h2>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar border-y border-surface-light md:border-l md:border-y-0 md:grid md:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product, idx) => (
            <div key={product.id} className="shrink-0 w-[75vw] sm:w-[50vw] md:w-auto snap-center border-r border-surface-light bg-white">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

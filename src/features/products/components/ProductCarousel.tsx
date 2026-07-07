import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCard {
  id: string;
  title: string;
  price: number;
  image: string;
  brand: string;
  slug: string;
}

const mockProducts: ProductCard[] = [
  { id: '1', title: 'Audrey Wedge Slides', price: 1499, image: '/placeholder.png', brand: 'CLN', slug: 'audrey-wedge-slides' },
  { id: '2', title: 'Luna Pointed Flats', price: 1299, image: '/placeholder.png', brand: 'CLN', slug: 'luna-pointed-flats' },
  { id: '3', title: 'Stella Block Heels', price: 1599, image: '/placeholder.png', brand: 'CLN', slug: 'stella-block-heels' },
  { id: '4', title: 'Nova Chunky Sneakers', price: 1899, image: '/placeholder.png', brand: 'CLN', slug: 'nova-chunky-sneakers' },
];

export function ProductCarousel({ title }: { title: string }) {
  return (
    <div className="w-full bg-surface-white py-16 px-4 md:px-12 border-t border-surface-light">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold font-serif text-typography-primary mb-8">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((product) => (
            <div key={product.id} className="group relative border border-surface-light p-2 rounded-2xl hover:shadow-lg transition-all bg-white">
              <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-typography-muted hover:text-brand-pink transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              
              <Link to={`/product/${product.slug}`} className="block">
                <div className="aspect-[4/5] bg-surface-offWhite rounded-xl overflow-hidden mb-4">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="px-2 pb-2">
                  <p className="text-[10px] text-brand-peach font-bold uppercase tracking-widest mb-1">{product.brand}</p>
                  <h3 className="text-sm font-bold text-typography-primary truncate">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-brand-navy">₱{product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

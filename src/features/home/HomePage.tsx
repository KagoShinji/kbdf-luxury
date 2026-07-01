import { FadeUp } from "../../ui/Motion/FadeUp";
import { ProductGrid } from "../products/components/ProductGrid";
import { Link } from "react-router-dom";

function HomeHero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] bg-surface-light pt-[100px]">
      <img 
        src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop" 
        alt="Hero Banner" 
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-24">
        <FadeUp>
          <h1 className="text-4xl md:text-6xl font-serif italic text-typography-primary max-w-lg leading-tight tracking-tight">
            Payday Special Offer
          </h1>
          <Link to="/shop" className="mt-6 text-xs font-medium uppercase tracking-widest text-brand-navy border-b-2 border-brand-pink pb-1 inline-block w-max hover:text-brand-pink transition-colors">
            Shop Now
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function CategoryStrip() {
  const categories = [
    { img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80" },
    { img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80" },
    { img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80" },
    { img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80" },
    { img: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500&q=80" },
    { img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80" },
  ];

  return (
    <section className="w-full bg-surface-offWhite py-2 border-b border-surface-light overflow-x-auto no-scrollbar">
      <div className="flex gap-2 px-2 min-w-max">
        {categories.map((cat, i) => (
          <Link key={i} to="/shop" className="group cursor-pointer w-[120px] md:w-[160px]">
            <div className="w-full aspect-square bg-surface-offWhite overflow-hidden">
              <img src={cat.img} alt="Category" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EditorialGrid() {
  const gridImages = [
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
    "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600",
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600"
  ];
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-[4/5] md:aspect-auto bg-surface-offWhite overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000" alt="New In" />
          <div className="absolute bottom-8 left-8">
            <h2 className="text-3xl font-serif text-typography-primary mb-2 drop-shadow-sm">New In</h2>
            <p className="text-[10px] tracking-widest uppercase text-brand-pink mb-4 font-bold drop-shadow-sm">Discover the latest arrivals</p>
            <Link to="/shop" className="text-[10px] uppercase tracking-widest text-typography-primary border-b-2 border-brand-coral pb-1 font-bold hover:text-brand-coral transition-colors">Shop Now</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gridImages.map((src, i) => (
            <div key={i} className="aspect-square bg-surface-offWhite overflow-hidden group">
               <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Product" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCollections() {
  const collections = [
    { title: "All Flats", img: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800" },
    { title: "Tote Bags", img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800" },
    { title: "Sneakers", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800" },
  ];
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((col, i) => (
          <div key={i} className="relative aspect-[3/4] bg-surface-offWhite group overflow-hidden border-b-4 border-brand-peach">
            <img src={col.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={col.title} />
            <div className="absolute bottom-6 left-6">
              <span className="text-white text-sm font-medium tracking-wide drop-shadow-md">{col.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialSlider() {
  return (
    <section className="py-24 bg-surface-white overflow-hidden">
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-end border-b border-surface-light pb-4">
        <h2 className="text-xl md:text-2xl font-serif text-typography-primary">What Our Customers Say</h2>
        <div className="flex gap-2">
           <button className="w-8 h-8 rounded-full border border-surface-light flex items-center justify-center text-typography-muted hover:text-typography-primary transition-colors">&lt;</button>
           <button className="w-8 h-8 rounded-full border border-surface-light flex items-center justify-center text-typography-muted hover:text-typography-primary transition-colors">&gt;</button>
        </div>
      </div>
      <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar max-w-[1600px] mx-auto">
        {[1,2,3,4].map(i => (
          <div key={i} className="min-w-[280px] md:min-w-[340px] bg-surface-offWhite p-8 flex flex-col justify-between aspect-square border border-surface-light">
             <div>
               <div className="flex gap-1 text-brand-peach mb-6 text-sm">★★★★★</div>
               <p className="text-sm font-serif italic text-typography-primary leading-relaxed">"The bag is absolutely gorgeous! It arrived in perfect condition and the packaging was so luxurious. Will definitely order again."</p>
             </div>
             <div className="flex items-end justify-between mt-8">
                <span className="text-[10px] tracking-widest uppercase text-typography-muted font-medium">Sarah T.</span>
                <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200" className="w-16 h-16 object-cover" alt="product" />
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LifestyleBanner() {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] bg-brand-navy">
      <img 
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000" 
        alt="Lifestyle Banner" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-16">
        <FadeUp>
          <h2 className="text-2xl md:text-4xl font-serif text-white max-w-lg leading-tight mb-4 drop-shadow-md">
            Where style meets <span className="text-brand-peach italic">value</span> - shoes, bags, and wallets that make you stand out.
          </h2>
          <Link to="/shop" className="text-[10px] uppercase tracking-widest text-brand-pink border-b-2 border-brand-pink pb-1 inline-block w-max hover:text-white transition-colors">
            Shop Now
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function SocialGrid() {
  const socials = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    "https://images.unsplash.com/photo-1485230895905-ef0e1261d15c?w=400",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400"
  ];
  return (
    <section className="py-24 bg-surface-white">
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto mb-10 flex justify-between items-end border-b border-surface-light pb-4">
        <h2 className="text-lg md:text-xl font-sans tracking-[0.2em] font-light text-typography-primary uppercase">As Seen On @kbdf.ph</h2>
      </div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar w-full">
        {socials.map((src, i) => (
          <a key={i} href="#" className="relative min-w-[200px] md:min-w-[20%] aspect-square group overflow-hidden block flex-1">
             <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Instagram Post" />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">@kbdf.ph</span>
             </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="w-full min-h-screen bg-surface-white flex flex-col">
      <HomeHero />
      <CategoryStrip />
      <div className="mt-8 border-t border-surface-light pt-12">
        <ProductGrid />
      </div>
      <EditorialGrid />
      <FeaturedCollections />
      <TestimonialSlider />
      <LifestyleBanner />
      <SocialGrid />
    </div>
  );
}

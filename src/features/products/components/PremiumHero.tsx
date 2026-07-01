import { FadeUp } from "../../../ui/Motion/FadeUp";
import { Button } from "../../../ui/Button/Button";

export function PremiumHero() {
  return (
    <section 
      className="relative w-full h-[100vh] flex flex-col items-center justify-end pb-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="flex flex-col items-center z-10 text-center text-surface-white">
        <FadeUp delay={0.1}>
          <h2 className="text-xs md:text-sm tracking-[0.25em] uppercase mb-4">
            New Collection
          </h2>
        </FadeUp>
        
        <FadeUp delay={0.2}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight mb-8 font-medium">
            KBDF Rentals
          </h1>
        </FadeUp>
        
        <FadeUp delay={0.4}>
          <button className="bg-surface-white text-typography-primary rounded-none px-8 py-3 text-xs uppercase tracking-widest hover:bg-surface-offWhite transition-colors">
            Discover
          </button>
        </FadeUp>
      </div>
    </section>
  );
}

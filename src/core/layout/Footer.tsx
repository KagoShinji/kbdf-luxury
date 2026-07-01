export function Footer() {
  return (
    <footer className="bg-surface-offWhite text-typography-primary py-24 px-6 md:px-12 border-t border-surface-light mt-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-sans tracking-[0.15em] uppercase font-bold mb-6 text-typography-primary">KBDF</h2>
          <p className="text-typography-muted max-w-sm text-xs leading-relaxed">
            Experience the "Quiet Luxury". We curate the finest selection of premium bags, watches, and preloved fashion items.
          </p>
        </div>
        
        <div>
          <h3 className="text-[10px] tracking-widest uppercase font-medium mb-6 text-typography-primary">Explore</h3>
          <ul className="space-y-4 text-xs text-typography-muted">
            <li><a href="#" className="hover:text-typography-primary transition-colors">Bags</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">Wallets</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">Watches</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">Preloved</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] tracking-widest uppercase font-medium mb-6 text-typography-primary">Assistance</h3>
          <ul className="space-y-4 text-xs text-typography-muted">
            <li><a href="#" className="hover:text-typography-primary transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">Authenticity Guarantee</a></li>
            <li><a href="#" className="hover:text-typography-primary transition-colors">FAQ</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-typography-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-typography-muted">
        <p>© {new Date().getFullYear()} KBDF Luxury Bags & Preloved Items. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0 uppercase tracking-widest text-[10px]">
          <a href="#" className="hover:text-typography-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-typography-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

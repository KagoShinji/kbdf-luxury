import { FadeUp } from "../../ui/Motion/FadeUp";

export function ContactPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
            Client Services
          </h1>
          <div className="w-12 h-px bg-typography-primary mb-6"></div>
          <p className="max-w-md text-xs tracking-wider text-typography-muted">
            We invite you to reach out for styling advice or any inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <FadeUp delay={0.1}>
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] mb-8 border-b border-surface-light pb-4 text-typography-primary">
                Send a Message
              </h2>
              <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-muted">Name</label>
                  <input type="text" className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-typography-primary transition-colors text-sm text-typography-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-muted">Email</label>
                  <input type="email" className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-typography-primary transition-colors text-sm text-typography-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-muted">Message</label>
                  <textarea rows={4} className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-typography-primary transition-colors text-sm text-typography-primary resize-none"></textarea>
                </div>
                <button type="button" className="bg-typography-primary text-surface-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-typography-muted transition-colors w-max mt-4">
                  Submit
                </button>
              </form>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="flex flex-col gap-12">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6 border-b border-surface-light pb-4 text-typography-primary">
                  Boutique Details
                </h2>
                <div className="flex flex-col gap-4 text-sm font-light text-typography-primary">
                  <p>KBDF Flagship Store<br/>123 Luxury Avenue<br/>Metro Manila, Philippines</p>
                  <p className="mt-4"><span className="text-[10px] uppercase tracking-widest text-typography-muted block mb-1">Telephone</span>+63 2 8123 4567</p>
                  <p><span className="text-[10px] uppercase tracking-widest text-typography-muted block mb-1">Email</span>clientcare@kbdf.com</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6 border-b border-surface-light pb-4 text-typography-primary">
                  Opening Hours
                </h2>
                <div className="flex flex-col gap-2 text-sm font-light text-typography-primary">
                  <div className="flex justify-between max-w-xs"><span>Monday - Friday</span><span>10:00 AM - 9:00 PM</span></div>
                  <div className="flex justify-between max-w-xs"><span>Saturday</span><span>10:00 AM - 10:00 PM</span></div>
                  <div className="flex justify-between max-w-xs"><span>Sunday</span><span>11:00 AM - 8:00 PM</span></div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

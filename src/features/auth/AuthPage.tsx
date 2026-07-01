import { useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="pt-24 min-h-screen bg-surface-white flex">
      {/* Left side Image */}
      <div className="hidden lg:block w-1/2 relative bg-surface-offWhite">
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200" 
          alt="Luxury Fashion" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-serif text-white uppercase tracking-[0.2em] drop-shadow-md">
            KBDF
          </h1>
        </div>
      </div>
      
      {/* Right side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-typography-primary mb-4">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-xs uppercase tracking-widest text-typography-muted font-bold">
                {isLogin ? "Sign in to access your luxury profile." : "Join us to experience quiet luxury."}
              </p>
            </div>

            <form className="flex flex-col gap-8">
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Full Name</label>
                  <input type="text" className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Email Address</label>
                <input type="email" className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Password</label>
                <input type="password" className="w-full border-b border-surface-light py-2 bg-transparent outline-none focus:border-brand-pink transition-colors text-sm text-typography-primary" />
              </div>
              
              <button type="button" className="bg-brand-navy text-surface-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-brand-pink transition-colors w-full mt-4 font-bold">
                {isLogin ? "Sign In" : "Register"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[10px] uppercase tracking-widest text-brand-navy border-b border-brand-navy pb-1 font-bold hover:text-brand-pink hover:border-brand-pink transition-colors"
              >
                {isLogin ? "Create an account instead" : "Already have an account? Sign in"}
              </button>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

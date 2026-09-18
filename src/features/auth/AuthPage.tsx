import { useState, useEffect } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { useUserAuth } from "../../core/context/UserAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, ShieldCheck, PackageCheck, Zap } from "lucide-react";
import { useTenant } from "../../core/context/TenantContext";
import { supabase } from "../../lib/supabase/supabaseClient";

export function AuthPage() {
  const { user, signInWithGoogle } = useUserAuth();
  const navigate = useNavigate();
  const { tenant } = useTenant();

  const settings = (tenant?.store_settings as any) || {};
  const authBgUrl = settings.branding?.auth_bg_url;

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Route customer to profile setup if new, or directly to shop if profile exists
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('customer_profiles')
        .select('phone, province, street_address')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }: any) => {
          if (!data || !data.phone || !data.province || !data.street_address) {
            navigate("/orders?tab=profile&welcome=google");
          } else {
            navigate("/shop");
          }
        })
        .catch(() => {
          navigate("/orders?tab=profile");
        });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err.message || 'Failed to connect with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-surface-white flex">
      {/* Left side: Luxury Brand Visual */}
      <div className="hidden lg:block w-1/2 relative bg-surface-offWhite overflow-hidden">
        {authBgUrl && (
          <img
            src={authBgUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt="KBDF Luxury Lifestyle"
          />
        )}
        <div className={`absolute inset-0 ${authBgUrl ? 'bg-gradient-to-t from-black/80 via-black/40 to-black/30' : 'bg-brand-navy/10 mix-blend-multiply'}`}></div>

        <div className="absolute inset-0 flex flex-col justify-between p-16 text-white z-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#fb7a90] bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 inline-block mb-4">
              Luxury Boutique
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-sans tracking-[0.12em] uppercase font-bold text-white drop-shadow-lg">
              {tenant?.name || "KBDF LUXURY"}
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] font-light text-white/90 max-w-md leading-relaxed">
              Bringing you the finest selection in designer shoes, bags, and luxury accessories.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/60 tracking-wider">
            <span>• 100% Authentic Goods</span>
            <span>• Nationwide PH Delivery</span>
            <span>• Flexible Installments</span>
          </div>
        </div>
      </div>

      {/* Right side: Modern One-Click Google Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="max-w-md w-full">
          <FadeUp delay={0.1}>
            <div className="text-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-pink block mb-2">
                Member Access
              </span>
              <h2 className="text-3xl md:text-4xl font-sans tracking-wide uppercase font-bold text-typography-primary mb-3">
                Sign In
              </h2>
              <p className="text-xs text-typography-muted leading-relaxed max-w-sm mx-auto">
                Sign in with your Google account to access your orders, track installments, and enjoy instant one-click checkout.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200/80 rounded-2xl flex items-start gap-3 text-red-600 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Sign In Card */}
            <div className="bg-surface-offWhite border border-surface-light rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              {/* Feature Highlights */}
              <div className="space-y-3.5 pb-2">
                <div className="flex items-center gap-3 text-xs text-typography-primary">
                  <div className="w-8 h-8 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">One-Click Access</p>
                    <p className="text-[11px] text-typography-muted">No passwords to create or remember</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-typography-primary">
                  <div className="w-8 h-8 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center flex-shrink-0">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Live Order & Installment Tracking</p>
                    <p className="text-[11px] text-typography-muted">Real-time status updates on all purchases</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-typography-primary">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Secure Google Authentication</p>
                    <p className="text-[11px] text-typography-muted">Protected by Google's industry-standard security</p>
                  </div>
                </div>
              </div>

              {/* Primary Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="group relative flex items-center justify-center gap-3.5 bg-white hover:bg-gray-50 text-gray-800 hover:text-black w-full py-4 px-6 text-xs uppercase tracking-widest font-bold rounded-2xl border border-gray-200 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.88-1.5 2.2l3.43 2.66c2-1.84 3.12-4.56 3.12-7.69z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.43-2.66c-.95.64-2.17 1.02-3.5 1.02-2.7 0-5-1.82-5.81-4.28L1.69 18.43C3.69 22.42 7.8 24 12 24z" />
                      <path fill="#FBBC05" d="M6.19 15.17A7.17 7.17 0 0 1 5.75 12c0-1.1.2-2.17.58-3.17L2.1 5.7A11.95 11.95 0 0 0 0 12c0 2.29.66 4.43 1.81 6.25l4.38-3.08z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.94 1.19 15.22 0 12 0 7.8 0 3.69 2.58 1.69 6.57l4.5 3.5c.81-2.46 3.11-4.28 5.81-4.28z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms & Privacy Notice */}
            <div className="mt-8 text-center text-[11px] text-typography-muted leading-relaxed max-w-xs mx-auto">
              By signing in with Google, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-typography-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-typography-primary transition-colors">
                Privacy Policy
              </Link>.
            </div>

            {/* Return to Store Link */}
            <div className="mt-6 text-center">
              <Link
                to="/shop"
                className="text-[10px] uppercase tracking-widest text-brand-navy hover:text-brand-pink font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>← Continue Browsing Collections</span>
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

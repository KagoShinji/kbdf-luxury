import { useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { ArrowRight, Search } from "lucide-react";

export function TrackPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      alert("Tracking details not found for: " + trackingCode);
    }, 1500);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <FadeUp delay={0.1}>
          <div className="mb-12 flex flex-col items-center text-center">
            <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
              Track Order
            </h1>
            <div className="w-12 h-px bg-typography-primary mb-6"></div>
            <p className="max-w-md text-xs tracking-wider text-typography-muted uppercase">
              Enter your tracking code below
            </p>
          </div>

          <form onSubmit={handleTrack} className="max-w-xl mx-auto flex flex-col items-center gap-8">
            <div className="w-full flex items-center border-b border-surface-light pb-2">
              <Search className="w-4 h-4 text-typography-muted mr-4" strokeWidth={1} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Tracking Number"
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-typography-primary tracking-widest uppercase placeholder:text-typography-muted/50"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !trackingCode}
              className="bg-typography-primary text-surface-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-typography-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 group"
            >
              <span>{isSearching ? "Searching..." : "Track"}</span>
              {!isSearching && (
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
              )}
            </button>
          </form>
        </FadeUp>
      </div>
    </div>
  );
}

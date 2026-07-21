import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string | null) => void;
  resetTrigger?: number;
  options?: {
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
  };
}

export function Turnstile({ onVerify, resetTrigger = 0, options }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const siteKey = isLocalhost ? "1x00000000000000000000AA" : (import.meta.env.VITE_TURNSTILE_SITE_KEY || "");

  // Render/Mount Turnstile
  useEffect(() => {
    if (!siteKey) return;

    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initializeTurnstile = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              onVerify(null);
            },
            "error-callback": () => {
              onVerify(null);
            },
            theme: options?.theme || "auto",
            size: options?.size || "normal",
          });
          widgetIdRef.current = id;
        } catch (e) {
          console.error("Failed to render Turnstile widget:", e);
        }
      }
    };

    if (window.turnstile) {
      initializeTurnstile();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          initializeTurnstile();
          clearInterval(interval);
        }
      }, 100);

      script.addEventListener("load", initializeTurnstile);
      return () => {
        clearInterval(interval);
        script.removeEventListener("load", initializeTurnstile);
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.error("Failed to remove Turnstile widget:", e);
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, options]);

  // Handle Reset Triggers
  useEffect(() => {
    if (widgetIdRef.current && window.turnstile && resetTrigger > 0) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {
        console.error("Failed to reset Turnstile widget:", e);
      }
      onVerify(null);
    }
  }, [resetTrigger, onVerify]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center my-3 w-full">
      <div ref={containerRef} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile widget. Renders nothing when no public site key is set,
// so the reservation flow works unchanged in local/unconfigured environments
// (the server skips verification to match). When configured, it issues a token
// to the parent via `onToken`, cleared on expiry/error so stale tokens are never
// submitted.

// Disabled outside production: the site key is bound to the live domain, so
// localhost throws Cloudflare error 110200. Skipping the widget locally keeps
// the dev reservation flow working (the server skips verification to match).
const ENABLED =
  process.env.NODE_ENV === "production" &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
    },
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** True only in production with a site key set (so callers can gate submit). */
export const isTurnstileEnabled = ENABLED;

export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ENABLED || !SITE_KEY) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
          theme: "auto",
        });
      })
      .catch(() => {
        /* Network/script failure — leave the token empty; server decides. */
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* already gone */
        }
        widgetIdRef.current = null;
      }
    };
  }, [onToken]);

  if (!ENABLED) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}

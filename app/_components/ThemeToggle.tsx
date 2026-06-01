"use client";

import { useSyncExternalStore } from "react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Theme = "light" | "dark";

// The `data-theme` attribute on <html> is external state (set pre-paint by the
// head script in app/layout.tsx, mutated by `apply` below). Subscribe to it
// with useSyncExternalStore so we don't need a post-mount setState dance.
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getThemeServerSnapshot(): Theme {
  return "light";
}

function SunIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

type Props = {
  locale: Locale;
};

export default function ThemeToggle({ locale }: Props) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  const apply = (next: Theme) => {
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      window.localStorage.setItem("bm:theme", next);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        {t(locale, "atmosphere")}
      </span>
      <div
        role="group"
        aria-label={t(locale, "atmosphere")}
        className="inline-flex rounded-full border border-border bg-surface p-1 shadow-[var(--shadow-card)]"
      >
        <button
          type="button"
          onClick={() => apply("light")}
          aria-pressed={theme === "light"}
          suppressHydrationWarning
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
            theme === "light"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <SunIcon />
          {t(locale, "themeLight")}
        </button>
        <button
          type="button"
          onClick={() => apply("dark")}
          aria-pressed={theme === "dark"}
          suppressHydrationWarning
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
            theme === "dark"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <MoonIcon />
          {t(locale, "themeDark")}
        </button>
      </div>
    </div>
  );
}

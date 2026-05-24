"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, t } from "@/lib/i18n";
import type { Locale, Restaurant } from "@/lib/types";

type Props = {
  restaurant: Restaurant;
};

export default function HomeHero({ restaurant }: Props) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const handleEnter = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("bm:locale", locale);
      } catch {
        // ignore
      }
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col">
      {restaurant.cover && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={restaurant.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.18]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="text-[11px] uppercase tracking-[0.24em] text-muted">
          {t(locale, "poweredBy")}
        </span>

        <h1 className="font-display mt-6 text-5xl font-medium leading-[1.05] sm:text-6xl">
          {restaurant.name}
        </h1>

        <p className="mt-5 max-w-xs text-base leading-relaxed text-muted">
          {restaurant.tagline[locale] || restaurant.tagline.en}
        </p>

        <div className="mt-12 w-full">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {t(locale, "chooseLanguage")}
          </p>
          <div className="mt-3 inline-flex w-full rounded-full border border-border bg-surface p-1">
            {LOCALES.map((l) => {
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href={`/${restaurant.slug}?lang=${locale}`}
          onClick={handleEnter}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-4 text-base font-medium text-background shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
        >
          {t(locale, "goToMenu")}
          <svg
            className="ml-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <footer className="px-6 pb-8 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
        Braga Menu · {new Date().getFullYear()}
      </footer>
    </main>
  );
}

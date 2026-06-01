"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  localized,
  t,
} from "@/lib/i18n";
import type { Locale, MenuCategory, Restaurant } from "@/lib/types";
import RestaurantHeader from "./RestaurantHeader";
import ProductCard from "./ProductCard";

type Props = {
  restaurant: Restaurant;
  categories: MenuCategory[];
};

export default function MenuView({ restaurant, categories }: Props) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [activeKey, setActiveKey] = useState<string>(categories[0]?.key ?? "");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollLockUntil = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get("lang");
    const stored = (() => {
      try {
        return window.localStorage.getItem("bm:locale");
      } catch {
        return null;
      }
    })();
    const next = (queryLang || stored) as Locale | null;
    if (next && LOCALES.includes(next)) setLocale(next);
  }, []);

  const handleLocaleChange = useCallback((next: Locale) => {
    setLocale(next);
    try {
      window.localStorage.setItem("bm:locale", next);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < scrollLockUntil.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-category-key");
          if (id) setActiveKey(id);
        }
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const registerSection = useCallback((key: string) => {
    return (el: HTMLElement | null) => {
      if (el) sectionRefs.current.set(key, el);
      else sectionRefs.current.delete(key);
    };
  }, []);

  const scrollToCategory = useCallback((key: string) => {
    const el = sectionRefs.current.get(key);
    if (!el) return;
    setActiveKey(key);
    scrollLockUntil.current = Date.now() + 700;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const navItems = useMemo(
    () =>
      categories.map((c) => ({
        key: c.key,
        label: localized(c.label, locale),
      })),
    [categories, locale],
  );

  return (
    <main className="min-h-dvh pb-24">
      <TopBar
        locale={locale}
        onLocaleChange={handleLocaleChange}
        restaurantName={restaurant.name}
      />

      <RestaurantHeader restaurant={restaurant} locale={locale} />

      {categories.length > 0 && (
        <nav
          aria-label={t(locale, "menu")}
          className="sticky top-[3.25rem] z-30 mt-8 border-y border-border bg-background/85 backdrop-blur"
        >
          <div className="mx-auto max-w-2xl px-2 sm:px-4">
            <ul className="scrollbar-none flex gap-1 overflow-x-auto py-2.5">
              {navItems.map((item) => {
                const active = item.key === activeKey;
                return (
                  <li key={item.key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollToCategory(item.key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-foreground text-background"
                          : "text-muted hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        {categories.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted">
            {t(locale, "loadError")}
          </p>
        ) : (
          categories.map((category) => (
            <section
              key={category.key}
              ref={registerSection(category.key)}
              data-category-key={category.key}
              id={`category-${category.key}`}
              className="scroll-mt-nav pt-12 first:pt-10"
            >
              <header className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  {localized(category.label, locale)}
                </h2>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  {category.items.length}
                </span>
              </header>

              {category.items.length === 0 ? (
                <p className="text-sm text-muted">{t(locale, "empty")}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {category.items.map((item) => (
                    <ProductCard key={item.id} item={item} locale={locale} />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </main>
  );
}

function TopBar({
  locale,
  onLocaleChange,
  restaurantName,
}: {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  restaurantName: string;
}) {
  return (
    <div className="sticky top-0 z-40 flex h-[3.25rem] items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <Link
        href="/"
        className="text-xs font-medium uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
      >
        ← {restaurantName}
      </Link>

      <div
        role="group"
        aria-label="Language"
        className="inline-flex rounded-full border border-border bg-surface p-0.5"
      >
        {LOCALES.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onLocaleChange(l)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
              aria-pressed={active}
              title={LOCALE_LABELS[l]}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

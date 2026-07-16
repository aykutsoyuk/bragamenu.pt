"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { Locale, MenuItem } from "@/lib/types";
import { localized, t } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics/track";
import Badge from "./Badge";

type Props = {
  item: MenuItem;
  locale: Locale;
  restaurantSlug: string;
};

export default function ProductCard({ item, locale, restaurantSlug }: Props) {
  const title = localized(item.title, locale);
  const description = localized(item.description, locale);
  const [imgFailed, setImgFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const showImage = item.image && !imgFailed;
  const panelId = useId();

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      trackEvent({ restaurantId: restaurantSlug, eventType: "dish_open", dishId: item.id, language: locale });
    }
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] transition-colors ${
        item.available ? "" : "opacity-60"
      }`}
    >
      <button
        type="button"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full gap-4 p-4 text-left sm:p-5"
      >
        {showImage && (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-subtle sm:h-28 sm:w-28">
            <Image
              src={item.image as string}
              alt={title}
              loading="lazy"
              fill
              sizes="(max-width: 640px) 96px, 112px"
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAOfn5////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={() => setImgFailed(true)}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-medium leading-tight tracking-tight sm:text-xl">
              {title}
            </h3>
            {item.price && (
              <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                €{item.price}
              </span>
            )}
          </div>

          {description && (
            <p className={`mt-1.5 text-sm leading-relaxed text-muted ${expanded ? "" : "line-clamp-3"}`}>
              {description}
            </p>
          )}

          {(item.vegan || item.vegetarian || item.spicy || !item.available) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.vegan && <Badge variant="vegan" label={t(locale, "badgeVegan")} />}
              {!item.vegan && item.vegetarian && (
                <Badge variant="vegetarian" label={t(locale, "badgeVegetarian")} />
              )}
              {item.spicy && <Badge variant="spicy" label={t(locale, "badgeSpicy")} />}
              {!item.available && (
                <Badge variant="unavailable" label={t(locale, "badgeUnavailable")} />
              )}
            </div>
          )}
        </div>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
            {showImage && (
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-subtle sm:h-64">
                <Image
                  src={item.image as string}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {item.calories && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted">{t(locale, "dishCalories")}</dt>
                  <dd className="mt-0.5">{item.calories}</dd>
                </div>
              )}
              {item.allergens && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted">{t(locale, "dishAllergens")}</dt>
                  <dd className="mt-0.5">{localized(item.allergens, locale)}</dd>
                </div>
              )}
              {item.winePairing && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted">{t(locale, "dishWinePairing")}</dt>
                  <dd className="mt-0.5">{localized(item.winePairing, locale)}</dd>
                </div>
              )}
              {item.dessertPairing && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted">{t(locale, "dishDessertPairing")}</dt>
                  <dd className="mt-0.5">{localized(item.dessertPairing, locale)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}

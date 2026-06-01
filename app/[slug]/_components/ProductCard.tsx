"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale, MenuItem } from "@/lib/types";
import { localized, t } from "@/lib/i18n";
import Badge from "./Badge";

type Props = {
  item: MenuItem;
  locale: Locale;
};

export default function ProductCard({ item, locale }: Props) {
  const title = localized(item.title, locale);
  const description = localized(item.description, locale);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = item.image && !imgFailed;

  return (
    <article
      className={`group relative flex gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors sm:p-5 ${
        item.available ? "" : "opacity-60"
      }`}
    >
      {showImage && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-subtle sm:h-28 sm:w-28">
          <Image
            loading="eager"
            src={item.image as string}
            alt={title}
            fill
            sizes="(max-width: 640px) 96px, 112px"
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
          <p className="mt-1.5 text-sm leading-relaxed text-muted line-clamp-3">
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
    </article>
  );
}

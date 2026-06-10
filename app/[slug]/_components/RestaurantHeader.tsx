import Image from "next/image";
import type { Locale, Restaurant } from "@/lib/types";
import { t } from "@/lib/i18n";
import ReservationButton from "@/components/reservation/ReservationButton";

type Props = {
  restaurant: Restaurant;
  locale: Locale;
};

function InstagramIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8.5 8.5 0 0 1-12.7 7.4L3 21l1.7-5A8.5 8.5 0 1 1 21 12z" />
      <path d="M8.5 10c.6 2 2.5 3.9 4.5 4.5l1.4-1.3a1 1 0 0 1 1-.2l2.1.7c.4.1.6.5.5.9-.4 1.6-2 2.7-3.6 2.4-3.4-.6-6.1-3.3-6.7-6.7-.3-1.6.8-3.2 2.4-3.6.4-.1.8.1.9.5l.7 2.1a1 1 0 0 1-.2 1L9.2 11" />
    </svg>
  );
}

export default function RestaurantHeader({ restaurant, locale }: Props) {
  return (
    <header className="relative overflow-hidden">
      {restaurant.cover && (
        <div className="relative h-44 w-full sm:h-56">
          <Image
            src={restaurant.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />
        </div>
      )}

      <div className="mx-auto -mt-12 max-w-2xl px-5 sm:-mt-14 sm:px-6">
        <div className="flex flex-col items-start gap-4">
          {restaurant.logo ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] sm:h-20 sm:w-20">
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] sm:h-20 sm:w-20">
              <span className="font-display text-2xl">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              {restaurant.name}
            </h1>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
              {restaurant.tagline[locale] || restaurant.tagline.en}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReservationButton restaurantName={restaurant.name} locale={locale} />
            {restaurant.instagram && (
                <a
                  href={restaurant.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-subtle"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              )}
              {restaurant.whatsapp && (
                <a
                  href={restaurant.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-subtle"
                >
                  <WhatsAppIcon />
                  {t(locale, "contact")}
                </a>
              )}
          </div>
        </div>
      </div>
    </header>
  );
}

import type { Locale, Restaurant, RestaurantRecord } from "./types";
import type { SheetCtx } from "./googleSheets";
import data from "../data/restaurants.json";

// Sensitive operational fields are NOT in JSON — they live in env vars to keep
// secrets out of the repository. Pattern: <VAR>_<SLUG_UPPERCASE>
type JsonRow = Omit<RestaurantRecord, "sheetId" | "menuUrl" | "dashboardKey">;
const rawRegistry = data as Record<string, JsonRow>;

function env(prefix: string, slug: string): string {
  return process.env[`${prefix}_${slug.toUpperCase()}`] ?? "";
}

function hydrate(row: JsonRow): RestaurantRecord {
  return {
    ...row,
    sheetId: env("SHEET_ID", row.slug),
    menuUrl: env("MENU_URL", row.slug),
    dashboardKey: env("DASHBOARD_KEY", row.slug),
  };
}

/** Returns the full restaurant record, or null for unknown slugs. */
export function getRestaurant(slug: string): RestaurantRecord | null {
  const row = rawRegistry[slug];
  if (!row) return null;
  return hydrate(row);
}

/** Strips secret/operational fields for safe use in client components. */
export function toBranding(r: RestaurantRecord): Restaurant {
  return {
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    logo: r.logo,
    cover: r.cover,
    instagram: r.instagram,
    whatsapp: r.whatsapp,
  };
}

/** Builds the SheetCtx for a restaurant (used by the data layer). */
export function toSheetCtx(r: RestaurantRecord): SheetCtx {
  return {
    sheetId: r.sheetId,
    notificationEmail: r.notificationEmail,
    phone: r.phone,
    language: r.language as Locale | undefined,
    timezone: r.timezone,
  };
}

export const defaultRestaurantSlug = "braga";

/** All registered restaurants (used by the cron to iterate tenants). */
export function getAllRestaurants(): RestaurantRecord[] {
  return Object.values(rawRegistry).map(hydrate);
}

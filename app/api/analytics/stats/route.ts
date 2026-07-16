import { NextResponse, type NextRequest } from "next/server";
import { resolveDashboard, keyFromRequest } from "@/lib/dashboard/auth";
import { queryEvents } from "@/lib/analytics/supabase";
import { fetchMenu } from "@/lib/sheets";
import { localized } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const RANGES = new Set(["today", "week", "month"]);

function sinceFor(range: string): Date {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === "week") start.setDate(start.getDate() - 6);
  if (range === "month") start.setDate(start.getDate() - 29);
  return start;
}

export async function GET(request: NextRequest) {
  const { slug } = Object.fromEntries(request.nextUrl.searchParams) as { slug?: string };
  const result = resolveDashboard(slug ?? "", keyFromRequest(request));
  if (result instanceof Response) return result;
  const { restaurant } = result;

  const range = request.nextUrl.searchParams.get("range") ?? "today";
  if (!RANGES.has(range)) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }

  const rows = await queryEvents({ restaurantId: restaurant.slug, since: sinceFor(range) });

  const menuOpens = rows.filter((r) => r.event_type === "menu_open");
  const dishOpens = rows.filter((r) => r.event_type === "dish_open" && r.dish_id);

  const languageCounts = new Map<string, number>();
  for (const r of menuOpens) {
    const lang = r.language ?? "unknown";
    languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + 1);
  }
  const totalOpens = menuOpens.length;
  const languages = Array.from(languageCounts.entries())
    .map(([language, count]) => ({
      language,
      count,
      percentage: totalOpens > 0 ? Math.round((count / totalOpens) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const dishCounts = new Map<string, number>();
  for (const r of dishOpens) {
    const id = r.dish_id as string;
    dishCounts.set(id, (dishCounts.get(id) ?? 0) + 1);
  }

  let titleById = new Map<string, string>();
  if (dishCounts.size > 0 && restaurant.menuUrl) {
    try {
      const items = await fetchMenu(restaurant.menuUrl);
      const locale: Locale = (restaurant.language as Locale) ?? "en";
      titleById = new Map(items.map((item) => [item.id, localized(item.title, locale)]));
    } catch {
      // Menu unavailable — fall back to raw dish ids below.
    }
  }

  const ranked = Array.from(dishCounts.entries())
    .map(([dishId, count]) => ({ dishId, title: titleById.get(dishId) ?? dishId, count }))
    .sort((a, b) => b.count - a.count);

  const topDishes = ranked.slice(0, 10);
  const leastDishes = ranked.slice(-10).reverse();

  return NextResponse.json({ totalOpens, languages, topDishes, leastDishes });
}

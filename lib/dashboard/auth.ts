import type { NextRequest } from "next/server";
import { getRestaurant, toSheetCtx } from "@/lib/restaurants";
import type { RestaurantRecord } from "@/lib/types";
import type { SheetCtx } from "@/lib/googleSheets";

export interface DashboardContext {
  restaurant: RestaurantRecord;
  ctx: SheetCtx;
}

/**
 * Resolves the restaurant from the route param and verifies the dashboard key.
 * Reads the key from ?key= (GET) or body.key (non-GET, pre-parsed).
 * Returns a DashboardContext on success, or a Response to return to the client.
 */
export function resolveDashboard(
  slug: string,
  key: string | null | undefined,
): DashboardContext | Response {
  const restaurant = getRestaurant(slug);
  if (!restaurant) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!key || key !== restaurant.dashboardKey) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { restaurant, ctx: toSheetCtx(restaurant) };
}

export function keyFromRequest(request: NextRequest): string | null {
  return request.nextUrl.searchParams.get("key");
}

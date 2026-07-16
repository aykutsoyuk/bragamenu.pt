import { NextResponse, type NextRequest } from "next/server";
import { getRestaurant } from "@/lib/restaurants";
import { insertEvent } from "@/lib/analytics/supabase";

const EVENT_TYPES = new Set(["menu_open", "dish_open"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const restaurantId = String(body.restaurantId ?? "");
  const eventType = String(body.eventType ?? "");
  if (!restaurantId || !EVENT_TYPES.has(eventType) || !getRestaurant(restaurantId)) {
    return NextResponse.json({ ok: true });
  }

  await insertEvent({
    restaurantId,
    eventType: eventType as "menu_open" | "dish_open",
    dishId: typeof body.dishId === "string" ? body.dishId : undefined,
    language: typeof body.language === "string" ? body.language : undefined,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
  });

  return NextResponse.json({ ok: true });
}

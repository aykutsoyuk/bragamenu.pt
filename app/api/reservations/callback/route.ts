import { NextResponse, type NextRequest } from "next/server";
import { validateCallbackInput } from "@/lib/reservations";
import { fetchRestaurantConfig, fallbackRestaurantConfig } from "@/lib/googleSheets";
import { sendCallbackRequest, isEmailConfigured } from "@/lib/email";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp } from "@/lib/security/clientIp";
import { getRestaurant, toSheetCtx } from "@/lib/restaurants";

// POST /api/reservations/callback
// Fail-safe path used when the reservation system can't reach Google Sheets.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = String((body as { slug?: string })?.slug ?? "").trim();
  const restaurant = slug ? getRestaurant(slug) : null;
  if (!restaurant) {
    return NextResponse.json({ error: "unknown_restaurant" }, { status: 404 });
  }
  const ctx = toSheetCtx(restaurant);

  const token = String((body as { turnstileToken?: string })?.turnstileToken ?? "");
  const turnstile = await verifyTurnstile(token, clientIp(request));
  if (!turnstile.success) {
    return NextResponse.json({ error: "verification_failed" }, { status: 403 });
  }

  const validated = validateCallbackInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  let config;
  try {
    config = await fetchRestaurantConfig(ctx);
  } catch {
    config = fallbackRestaurantConfig(ctx);
  }

  try {
    const result = await sendCallbackRequest(validated.value, config);
    if (isEmailConfigured() && !result.sent) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[callback] notification email failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

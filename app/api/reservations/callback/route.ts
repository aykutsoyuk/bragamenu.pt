import { NextResponse, type NextRequest } from "next/server";
import { validateCallbackInput } from "@/lib/reservations";
import { fetchRestaurantConfig, fallbackRestaurantConfig } from "@/lib/googleSheets";
import { sendCallbackRequest, isEmailConfigured } from "@/lib/email";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp } from "@/lib/security/clientIp";

// POST /api/reservations/callback
// Fail-safe path used when the reservation system can't reach Google Sheets. The
// customer leaves their details and we email the restaurant directly — the email
// is the record, since the sheet is unreachable.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = String((body as { turnstileToken?: string })?.turnstileToken ?? "");
  const turnstile = await verifyTurnstile(token, clientIp(request));
  if (!turnstile.success) {
    return NextResponse.json({ error: "verification_failed" }, { status: 403 });
  }

  const validated = validateCallbackInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Try the live config, but fall back to env-derived contact details — the sheet
  // being down is exactly why this endpoint exists.
  let config;
  try {
    config = await fetchRestaurantConfig();
  } catch {
    config = fallbackRestaurantConfig();
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

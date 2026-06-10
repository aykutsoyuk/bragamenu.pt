import { NextResponse, type NextRequest } from "next/server";
import { validateLargeGroupInput } from "@/lib/reservations";
import { fetchRestaurantConfig } from "@/lib/googleSheets";
import { sendLargeGroupRequest, isEmailConfigured } from "@/lib/email";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp } from "@/lib/security/clientIp";

// POST /api/reservations/large-group
// Captures contact details for parties too large to auto-book and emails the
// restaurant so they can arrange the visit directly. Nothing is written to the
// sheet — the owner records it manually if they accept it.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ip = clientIp(request);

  const limit = await checkRateLimit(ip, { key: "reservations" });
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const token = String((body as { turnstileToken?: string })?.turnstileToken ?? "");
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.success) {
    return NextResponse.json({ error: "verification_failed" }, { status: 403 });
  }

  const validated = validateLargeGroupInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Unlike a booking there is no sheet record to fall back on, so when email is
  // actually configured a delivery failure must surface as an error. When email
  // is unconfigured (local/demo) we still report success so the flow completes.
  try {
    const config = await fetchRestaurantConfig();
    const result = await sendLargeGroupRequest(validated.value, config);
    if (isEmailConfigured() && !result.sent) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[large-group] notification email failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

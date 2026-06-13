import { NextResponse, type NextRequest } from "next/server";
import { validateManualReviewInput } from "@/lib/reservations";
import { fetchRestaurantConfig } from "@/lib/googleSheets";
import { sendManualReviewRequest, isEmailConfigured } from "@/lib/email";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp } from "@/lib/security/clientIp";

// POST /api/reservations/manual-review
// Captures contact details for parties that can't be auto-assigned a table (but
// fit within total capacity) and emails the restaurant so the owner can decide
// whether to combine tables. Nothing is written to the sheet.
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

  const validated = validateManualReviewInput(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // Unlike a booking there is no sheet record to fall back on, so when email is
  // actually configured a delivery failure must surface as an error. When email
  // is unconfigured (local/demo) we still report success so the flow completes.
  try {
    const config = await fetchRestaurantConfig();
    const result = await sendManualReviewRequest(validated.value, config);
    if (isEmailConfigured() && !result.sent) {
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[manual-review] notification email failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

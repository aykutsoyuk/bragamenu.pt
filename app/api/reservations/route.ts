import { NextResponse, type NextRequest } from "next/server";
import type { ReservationInput } from "@/types/reservation";
import { createReservation } from "@/lib/reservations";
import { fetchRestaurantConfig } from "@/lib/googleSheets";
import { sendReservationRequest } from "@/lib/email";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp } from "@/lib/security/clientIp";

/** Resolves the public origin for email action links, honouring proxies. */
function resolveBaseUrl(request: NextRequest): string {
  const configured = process.env.RESERVATION_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (proto && host) return `${proto}://${host}`;
  return request.nextUrl.origin;
}

// POST /api/reservations — create a pending reservation request.
export async function POST(request: NextRequest) {
  let body: Partial<ReservationInput> & { turnstileToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ip = clientIp(request);

  // Rate limit before doing any work (5 / IP / hour; no-op when unconfigured).
  const limit = await checkRateLimit(ip, { key: "reservations" });
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Bot protection (skipped when Turnstile is unconfigured).
  const turnstile = await verifyTurnstile(String(body.turnstileToken ?? ""), ip);
  if (!turnstile.success) {
    return NextResponse.json({ error: "verification_failed" }, { status: 403 });
  }

  const input: ReservationInput = {
    name: String(body.name ?? ""),
    phone: String(body.phone ?? ""),
    email: String(body.email ?? ""),
    people: Number(body.people),
    date: String(body.date ?? ""),
    time: String(body.time ?? ""),
  };

  let result;
  try {
    result = await createReservation(input);
  } catch (err) {
    console.error("[reservations] create failed:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!result.ok) {
    const status = result.reason === "invalid" ? 400 : 409;
    return NextResponse.json({ error: result.reason }, { status });
  }

  const { reservation } = result;

  // Notify the restaurant. Email delivery is best-effort: a failure here must not
  // undo a reservation that is already recorded in the sheet.
  try {
    const config = await fetchRestaurantConfig();
    await sendReservationRequest(reservation, config, resolveBaseUrl(request));
  } catch (err) {
    console.error("[reservations] notification email failed:", err);
  }

  return NextResponse.json(
    {
      ok: true,
      reservation: {
        reservation_id: reservation.reservation_id,
        date: reservation.date,
        time: reservation.time,
        people: reservation.people,
        name: reservation.name,
        status: reservation.status,
      },
    },
    { status: 201 },
  );
}

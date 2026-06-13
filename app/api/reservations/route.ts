import { NextResponse, type NextRequest } from "next/server";
import type { ReservationInput } from "@/types/reservation";
import { createReservation } from "@/lib/reservations";
import { fetchRestaurantConfig, fallbackPhone } from "@/lib/googleSheets";
import { sendReservationRequest } from "@/lib/email";
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

  // Bot protection (skipped when Turnstile is unconfigured or in local dev).
  const turnstile = await verifyTurnstile(String(body.turnstileToken ?? ""), clientIp(request));
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
    customer_language: body.customer_language === "pt" ? "pt" : "en",
  };

  let result;
  try {
    result = await createReservation(input);
  } catch (err) {
    // Sheets unreachable → fail-safe mode (never silently drop the booking).
    console.error("[reservations] create failed:", err);
    return NextResponse.json(
      { error: "service_unavailable", phone: fallbackPhone() },
      { status: 503 },
    );
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

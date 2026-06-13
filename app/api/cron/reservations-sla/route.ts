import { NextResponse, type NextRequest } from "next/server";
import {
  RESERVATION_RESPONSE_TIMEOUT_HOURS,
  SLA_NOTIFY_WINDOW_HOURS,
} from "@/lib/reservations/constants";
import { fetchReservations, fetchRestaurantConfig } from "@/lib/googleSheets";
import { sendSlaTimeoutNotice } from "@/lib/email";

// GET /api/reservations-sla (wired via vercel.json cron)
// Notifies customers whose pending request has gone unanswered past the SLA.
// Dedupe is heuristic: a reservation is caught once, as its age crosses into
// [timeout, timeout + window). Keep the cron cadence ≤ the window.
//
// Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET
// is set. We require it in production; locally (no secret) it's open for testing.

const HOUR_MS = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let reservations;
  let config;
  try {
    [reservations, config] = await Promise.all([
      fetchReservations(),
      fetchRestaurantConfig(),
    ]);
  } catch (err) {
    console.error("[sla] load failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const now = Date.now();
  const minAgeMs = RESERVATION_RESPONSE_TIMEOUT_HOURS * HOUR_MS;
  const maxAgeMs = (RESERVATION_RESPONSE_TIMEOUT_HOURS + SLA_NOTIFY_WINDOW_HOURS) * HOUR_MS;

  const due = reservations.filter((r) => {
    if (r.status !== "pending" || !r.email || !r.created_at) return false;
    const created = Date.parse(r.created_at);
    if (Number.isNaN(created)) return false;
    const age = now - created;
    return age >= minAgeMs && age < maxAgeMs;
  });

  let notified = 0;
  for (const reservation of due) {
    try {
      const result = await sendSlaTimeoutNotice(reservation, config);
      if (result.sent) notified += 1;
    } catch (err) {
      console.error(`[sla] notice failed for ${reservation.reservation_id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, due: due.length, notified });
}

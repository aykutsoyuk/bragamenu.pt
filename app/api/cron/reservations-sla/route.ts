import { NextResponse, type NextRequest } from "next/server";
import {
  RESERVATION_RESPONSE_TIMEOUT_HOURS,
  SLA_NOTIFY_WINDOW_HOURS,
} from "@/lib/reservations/constants";
import { fetchReservations, fetchRestaurantConfig } from "@/lib/googleSheets";
import { sendSlaTimeoutNotice } from "@/lib/email";
import { getAllRestaurants, toSheetCtx } from "@/lib/restaurants";

// GET /api/reservations-sla (wired via vercel.json cron)
// Notifies customers whose pending request has gone unanswered past the SLA.
// Iterates all registered restaurants. Keep cron cadence ≤ SLA_NOTIFY_WINDOW_HOURS.

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

  const now = Date.now();
  const minAgeMs = RESERVATION_RESPONSE_TIMEOUT_HOURS * HOUR_MS;
  const maxAgeMs = (RESERVATION_RESPONSE_TIMEOUT_HOURS + SLA_NOTIFY_WINDOW_HOURS) * HOUR_MS;

  let totalDue = 0;
  let totalNotified = 0;

  for (const restaurant of getAllRestaurants()) {
    const ctx = toSheetCtx(restaurant);
    let reservations;
    let config;
    try {
      [reservations, config] = await Promise.all([
        fetchReservations(ctx),
        fetchRestaurantConfig(ctx),
      ]);
    } catch (err) {
      console.error(`[sla] load failed for ${restaurant.slug}:`, err);
      continue;
    }

    const due = reservations.filter((r) => {
      if (r.status !== "pending" || !r.email || !r.created_at) return false;
      const created = Date.parse(r.created_at);
      if (Number.isNaN(created)) return false;
      const age = now - created;
      return age >= minAgeMs && age < maxAgeMs;
    });

    totalDue += due.length;
    for (const reservation of due) {
      try {
        const result = await sendSlaTimeoutNotice(reservation, config);
        if (result.sent) totalNotified += 1;
      } catch (err) {
        console.error(`[sla] notice failed for ${reservation.reservation_id}:`, err);
      }
    }
  }

  return NextResponse.json({ ok: true, due: totalDue, notified: totalNotified });
}

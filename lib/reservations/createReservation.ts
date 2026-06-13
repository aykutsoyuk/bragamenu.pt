import crypto from "node:crypto";
import type { Reservation, ReservationInput } from "@/types/reservation";
import {
  appendReservation,
  fetchOpeningHours,
  isSheetsConfigured,
} from "@/lib/googleSheets";
import { assignTable } from "./assignTable";
import { BOOKING_WINDOW_DAYS } from "./constants";
import { computeSlots } from "./getAvailableSlots";
import {
  loadAvailabilityContext,
  occupiedTableIdsAt,
} from "./getAvailableTables";
import { addDays, nowInRestaurant } from "./time";
import { validateReservationInput } from "./validation";

export type CreateReservationResult =
  | { ok: true; reservation: Reservation; persisted: boolean }
  | { ok: false; reason: "invalid" | "closed" | "unavailable" };

/**
 * Validates the request, re-checks availability at submit time (guarding against
 * a slot taken since the guest last loaded it), assigns the best-fit table, and
 * appends the reservation as `pending`. Availability is recomputed here rather
 * than trusting the client, so this is the single authority for table holds.
 */
export async function createReservation(
  raw: ReservationInput,
): Promise<CreateReservationResult> {
  const validated = validateReservationInput(raw);
  if (!validated.ok) return { ok: false, reason: "invalid" };
  const input = validated.value;

  // Enforce the booking window (today .. +N days) in the restaurant timezone.
  const now = nowInRestaurant();
  const maxDate = addDays(now.date, BOOKING_WINDOW_DAYS);
  if (input.date < now.date || input.date > maxDate) {
    return { ok: false, reason: "invalid" };
  }

  const [openingHours, ctx] = await Promise.all([
    fetchOpeningHours(),
    loadAvailabilityContext(),
  ]);

  // The requested time must be a real seating for that day (and still future).
  const slots = computeSlots(input.date, input.people, openingHours, ctx);
  if (!slots.open) return { ok: false, reason: "closed" };
  const isBookable = slots.available.some((s) => s.time === input.time);
  if (!isBookable) return { ok: false, reason: "unavailable" };

  // Re-run best-fit against live occupancy for the exact slot.
  const occupied = occupiedTableIdsAt(
    ctx.reservations,
    ctx.tables,
    input.date,
    input.time,
    input.people,
  );
  const table = assignTable(input.people, ctx.tables, occupied);
  if (!table) return { ok: false, reason: "unavailable" };

  const reservation: Reservation = {
    reservation_id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    people: input.people,
    date: input.date,
    time: input.time,
    assigned_table: table.table_id,
    status: "pending",
    customer_language: input.customer_language ?? "en",
  };

  // No-op (returns false) when Sheets is unconfigured so the demo flow completes.
  const persisted = isSheetsConfigured()
    ? await appendReservation(reservation)
    : false;

  return { ok: true, reservation, persisted };
}

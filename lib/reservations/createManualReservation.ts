import crypto from "node:crypto";
import type { Reservation } from "@/types/reservation";
import { appendReservation, isSheetsConfigured, type SheetCtx } from "@/lib/googleSheets";
import { assignTable } from "./assignTable";
import { occupiedTableIdsAt, loadAvailabilityContext } from "./getAvailableTables";

export interface ManualBookingInput {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
  time: string;
}

export type CreateManualResult =
  | { ok: true; reservation: Reservation; persisted: boolean }
  | { ok: false; reason: "no_table" | "invalid" };

/**
 * Owner-created reservation: always status=confirmed, auto-assigns best-fit table.
 * Does NOT validate date/time against opening hours — the owner is trusted.
 */
export async function createManualReservation(
  ctx: SheetCtx,
  input: ManualBookingInput,
): Promise<CreateManualResult> {
  if (!input.name || !input.date || !input.time || input.people < 1) {
    return { ok: false, reason: "invalid" };
  }

  const availCtx = await loadAvailabilityContext(ctx);

  const occupied = occupiedTableIdsAt(
    availCtx.reservations,
    availCtx.tables,
    input.date,
    input.time,
    input.people,
  );
  const table = assignTable(input.people, availCtx.tables, occupied);
  if (!table) return { ok: false, reason: "no_table" };

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
    status: "confirmed",
    customer_language: "en",
  };

  const persisted = isSheetsConfigured()
    ? await appendReservation(ctx, reservation)
    : false;

  return { ok: true, reservation, persisted };
}

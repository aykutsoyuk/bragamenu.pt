import type { Reservation } from "@/types/reservation";
import { isSheetsConfigured, type SheetCtx } from "./auth";
import { updateRange } from "./client";
import {
  SHEET_TABS,
  columnLetter,
  fetchReservationHeaders,
  fetchReservations,
} from "./fetchSheet";

/** Fields the dashboard is allowed to edit (reservation_id is never editable). */
export type ReservationPatch = Partial<
  Pick<Reservation, "name" | "phone" | "people" | "date" | "time" | "assigned_table">
>;

export interface UpdateReservationResult {
  reservation: Reservation;
}

/**
 * Locates a reservation by id and overwrites all columns in its row with the
 * merged values, ensuring no field is accidentally blanked. Header order is
 * resolved from the live sheet so column reordering is safe.
 */
export async function updateReservation(
  ctx: SheetCtx,
  reservationId: string,
  patch: ReservationPatch,
): Promise<UpdateReservationResult | null> {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  const [reservations, headers] = await Promise.all([
    fetchReservations(ctx),
    fetchReservationHeaders(ctx),
  ]);
  const existing = reservations.find((r) => r.reservation_id === reservationId);
  if (!existing) return null;

  const updated: Reservation = { ...existing, ...patch };

  const row = headers.map((header) => {
    const value = updated[header as keyof Reservation];
    return value === undefined || value === null ? "" : String(value);
  });

  const lastCol = columnLetter(headers.length - 1);
  const rowNumber = existing._rowNumber;
  await updateRange(
    ctx.sheetId,
    `${SHEET_TABS.reservations}!A${rowNumber}:${lastCol}${rowNumber}`,
    row,
  );

  return { reservation: updated };
}

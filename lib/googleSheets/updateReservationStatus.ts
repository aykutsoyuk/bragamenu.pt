import type { Reservation, ReservationStatus } from "@/types/reservation";
import { isSheetsConfigured } from "./auth";
import { updateRange } from "./client";
import {
  SHEET_TABS,
  columnLetter,
  fetchReservationHeaders,
  fetchReservations,
} from "./fetchSheet";

export interface UpdateResult {
  reservation: Reservation;
  /** True when the status actually changed (false if it was already set). */
  changed: boolean;
}

/**
 * Locates a reservation by id and flips its status. Writes *only* the single
 * status cell — its column is resolved from the live header row, so the update
 * is correct regardless of column order and never disturbs the other fields.
 * Returns null when no matching reservation exists.
 */
export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
): Promise<UpdateResult | null> {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  const [reservations, headers] = await Promise.all([
    fetchReservations(),
    fetchReservationHeaders(),
  ]);
  const existing = reservations.find((r) => r.reservation_id === reservationId);
  if (!existing) return null;

  const updated: Reservation = { ...existing, status };
  if (existing.status === status) {
    return { reservation: updated, changed: false };
  }

  const statusIndex = headers.indexOf("status");
  if (statusIndex === -1) {
    throw new Error('The reservations sheet has no "status" column.');
  }

  const col = columnLetter(statusIndex);
  const rowNumber = existing._rowNumber;
  await updateRange(
    `${SHEET_TABS.reservations}!${col}${rowNumber}:${col}${rowNumber}`,
    [status],
  );

  return { reservation: updated, changed: true };
}

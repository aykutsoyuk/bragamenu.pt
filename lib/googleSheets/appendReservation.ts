import type { Reservation } from "@/types/reservation";
import { isSheetsConfigured } from "./auth";
import { appendRow } from "./client";
import {
  RESERVATION_COLUMNS,
  SHEET_TABS,
  columnLetter,
  fetchReservationHeaders,
} from "./fetchSheet";

export async function appendReservation(reservation: Reservation): Promise<boolean> {
  if (!isSheetsConfigured()) return false;

  const headers = await fetchReservationHeaders();
  // Fall back to the documented order if the header row is somehow empty.
  const order = headers.length > 0 ? headers : [...RESERVATION_COLUMNS];

  const row = order.map((header) => {
    const value = reservation[header as keyof Reservation];
    return value === undefined || value === null ? "" : String(value);
  });

  const lastCol = columnLetter(order.length - 1);
  await appendRow(`${SHEET_TABS.reservations}!A:${lastCol}`, row);
  return true;
}

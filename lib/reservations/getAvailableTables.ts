import type { Reservation, Table } from "@/types/reservation";
import { fetchReservations, fetchTables } from "@/lib/googleSheets";
import { assignTable } from "./assignTable";
import { reservationDurationFor } from "./constants";
import { timeToMinutes } from "./time";

// A reservation occupies its assigned table for its whole duration window. Both
// pending and confirmed bookings hold the table; rejected ones release it.
const OCCUPYING_STATUSES: ReadonlySet<Reservation["status"]> = new Set([
  "pending",
  "confirmed",
]);

/** Do two half-open minute intervals [aStart, aStart+aDur) and [bStart, …) overlap? */
function intervalsOverlap(
  aStart: number,
  aDur: number,
  bStart: number,
  bDur: number,
): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

/**
 * Table ids unavailable for a party of `people` seeking the slot at `(date, time)`.
 *
 * A reservation blocks its table when its hold window
 * `[start, start + durationFor(its party))` overlaps the request's window
 * `[time, time + durationFor(people))` — so a later booking blocks an earlier
 * request whose meal would run into it, and vice-versa. Rows with an explicit
 * `assigned_table` hold that table directly; owner-entered manual rows (no table)
 * that overlap are best-fit allocated a still-free table (largest party first,
 * matching `assignTable`) so their capacity is reserved.
 */
export function occupiedTableIdsAt(
  reservations: Reservation[],
  tables: Table[],
  date: string,
  time: string,
  people: number,
): Set<string> {
  const reqStart = timeToMinutes(time);
  const reqDur = reservationDurationFor(people);
  const taken = new Set<string>();
  const manualParties: number[] = [];

  for (const r of reservations) {
    if (r.date !== date || !r.time) continue;
    if (!OCCUPYING_STATUSES.has(r.status)) continue;
    const rStart = timeToMinutes(r.time);
    const rDur = reservationDurationFor(r.people > 0 ? r.people : 1);
    if (!intervalsOverlap(reqStart, reqDur, rStart, rDur)) continue;
    if (r.assigned_table) {
      taken.add(r.assigned_table);
    } else if (r.people > 0) {
      manualParties.push(r.people);
    }
  }

  for (const party of manualParties.sort((a, b) => b - a)) {
    const table = assignTable(party, tables, taken);
    if (table) taken.add(table.table_id);
  }

  return taken;
}

/** Capacity of the largest single table, or 0 when there are no tables. */
export function maxTableCapacity(tables: Table[]): number {
  return tables.reduce((max, t) => Math.max(max, t.capacity), 0);
}

/** Sum of all table capacities — the most the restaurant could ever seat. */
export function totalCapacity(tables: Table[]): number {
  return tables.reduce((sum, t) => sum + t.capacity, 0);
}

export interface AvailabilityContext {
  tables: Table[];
  reservations: Reservation[];
}

/** Loads tables and reservations once so slot calculation can reuse them. */
export async function loadAvailabilityContext(): Promise<AvailabilityContext> {
  const [tables, reservations] = await Promise.all([
    fetchTables(),
    fetchReservations(),
  ]);
  return { tables, reservations };
}

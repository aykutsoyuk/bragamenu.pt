import type { Reservation, Table } from "@/types/reservation";
import { fetchReservations, fetchTables } from "@/lib/googleSheets";
import { assignTable } from "./assignTable";

// A reservation occupies its assigned table at its exact (date, time). Both
// pending and confirmed bookings hold the table; rejected ones release it.
const OCCUPYING_STATUSES: ReadonlySet<Reservation["status"]> = new Set([
  "pending",
  "confirmed",
]);

/**
 * Table ids already taken at a given date/time by occupying reservations.
 *
 * Rows with an explicit `assigned_table` hold that table directly. Owner-entered
 * manual rows often omit the table but still seat a party — these are best-fit
 * allocated a still-free table (largest party first, matching `assignTable`) so
 * their capacity is reserved and the engine won't double-book over them.
 */
export function occupiedTableIdsAt(
  reservations: Reservation[],
  tables: Table[],
  date: string,
  time: string,
): Set<string> {
  const taken = new Set<string>();
  const manualParties: number[] = [];

  for (const r of reservations) {
    if (r.date !== date || r.time !== time) continue;
    if (!OCCUPYING_STATUSES.has(r.status)) continue;
    if (r.assigned_table) {
      taken.add(r.assigned_table);
    } else if (r.people > 0) {
      manualParties.push(r.people);
    }
  }

  for (const people of manualParties.sort((a, b) => b - a)) {
    const table = assignTable(people, tables, taken);
    if (table) taken.add(table.table_id);
  }

  return taken;
}

/** Capacity of the largest single table, or 0 when there are no tables. */
export function maxTableCapacity(tables: Table[]): number {
  return tables.reduce((max, t) => Math.max(max, t.capacity), 0);
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

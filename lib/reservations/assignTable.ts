import type { Table } from "@/types/reservation";

/**
 * Best-fit table allocation: among tables that (a) can seat the party and
 * (b) are not already occupied, pick the one with the smallest capacity.
 * Ties break on table_id so the result is fully deterministic.
 *
 * Returns null when no single table can accommodate the party.
 */
export function assignTable(
  people: number,
  tables: Table[],
  occupiedTableIds: ReadonlySet<string>,
): Table | null {
  const candidates = tables
    .filter((t) => t.capacity >= people && !occupiedTableIds.has(t.table_id))
    .sort((a, b) =>
      a.capacity !== b.capacity
        ? a.capacity - b.capacity
        : a.table_id.localeCompare(b.table_id),
    );

  return candidates[0] ?? null;
}

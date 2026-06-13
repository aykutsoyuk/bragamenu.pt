import type { OpeningHours, Table, TimeSlot } from "@/types/reservation";
import { fetchOpeningHours } from "@/lib/googleSheets";
import { assignTable } from "./assignTable";
import {
  BOOKING_WINDOW_DAYS,
  LAST_SEATING_BEFORE_CLOSE_MINUTES,
  SLOT_INTERVAL_MINUTES,
} from "./constants";
import {
  loadAvailabilityContext,
  maxTableCapacity,
  occupiedTableIdsAt,
  totalCapacity,
  type AvailabilityContext,
} from "./getAvailableTables";
import {
  addDays,
  isValidDate,
  minutesToTime,
  nowInRestaurant,
  timeToMinutes,
  weekdayOf,
} from "./time";

export interface SlotsResult {
  /** All seatings the kitchen serves that day (for messaging context). */
  open: boolean;
  /** Slots with a best-fit table free for this party size. */
  available: TimeSlot[];
  /** True when the day is open but every slot is full for this party. */
  full: boolean;
  /**
   * True when no single table can seat the party but the restaurant's total
   * capacity could (tables might be combined) — routed to manual review instead
   * of auto-rejecting.
   */
  manualReview: boolean;
}

/**
 * Generates the candidate seatings for one weekday's opening hours. The last
 * seating is `LAST_SEATING_BEFORE_CLOSE_MINUTES` before close so guests can eat.
 */
function generateSeatings(hours: OpeningHours): string[] {
  const start = timeToMinutes(hours.open);
  const lastSeating = timeToMinutes(hours.close) - LAST_SEATING_BEFORE_CLOSE_MINUTES;
  const seatings: string[] = [];
  for (let t = start; t <= lastSeating; t += SLOT_INTERVAL_MINUTES) {
    seatings.push(minutesToTime(t));
  }
  return seatings;
}

/**
 * Computes bookable time slots for a party on a date using best-fit allocation.
 * Past slots (when the date is today) are excluded. Pure given its inputs aside
 * from reading the current clock for the today filter.
 */
export function computeSlots(
  date: string,
  people: number,
  openingHours: OpeningHours[],
  ctx: AvailabilityContext,
): SlotsResult {
  // A party no single table can seat — but that total capacity could fit by
  // combining tables — is routed to manual review, not auto-rejected. Short-
  // circuit before any date/availability work.
  const maxCapacity = maxTableCapacity(ctx.tables);
  const total = totalCapacity(ctx.tables);
  if (maxCapacity > 0 && people > maxCapacity && people <= total) {
    return { open: false, available: [], full: false, manualReview: true };
  }

  const now = nowInRestaurant();
  // Reject dates outside the bookable window (past, or too far ahead).
  if (date < now.date || date > addDays(now.date, BOOKING_WINDOW_DAYS)) {
    return { open: false, available: [], full: false, manualReview: false };
  }

  // A weekday may have several opening_hours rows — e.g. a lunch service
  // 12:00–15:00 and a dinner service 19:00–23:00, with the kitchen closed in
  // between. Each row is an independent service window; the gaps between them
  // are simply not generated, so a mid-day break needs no special flag — just
  // omit those hours from the sheet.
  const weekday = weekdayOf(date);
  const intervals = openingHours.filter((h) => h.day === weekday);
  if (intervals.length === 0) {
    return { open: false, available: [], full: false, manualReview: false };
  }

  const isToday = date === now.date;

  // Collect distinct seating times across all service windows, in time order.
  const times = new Set<string>();
  for (const interval of intervals) {
    for (const time of generateSeatings(interval)) times.add(time);
  }
  const orderedTimes = Array.from(times).sort(
    (a, b) => timeToMinutes(a) - timeToMinutes(b),
  );

  const available: TimeSlot[] = [];
  for (const time of orderedTimes) {
    if (isToday && timeToMinutes(time) <= now.minutes) continue;
    const occupied = occupiedTableIdsAt(ctx.reservations, ctx.tables, date, time, people);
    const table: Table | null = assignTable(people, ctx.tables, occupied);
    if (table) available.push({ time, table });
  }

  return { open: true, available, full: available.length === 0, manualReview: false };
}

/** End-to-end slot lookup: loads hours, tables, and reservations, then computes. */
export async function getAvailableSlots(
  date: string,
  people: number,
): Promise<SlotsResult> {
  if (!isValidDate(date) || people < 1) {
    return { open: false, available: [], full: false, manualReview: false };
  }
  const [openingHours, ctx] = await Promise.all([
    fetchOpeningHours(),
    loadAvailabilityContext(),
  ]);
  return computeSlots(date, people, openingHours, ctx);
}

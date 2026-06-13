// Tunable, deterministic parameters for the reservation engine. No randomness,
// no external configuration — changing booking behaviour means changing these.

/** Minutes between consecutive bookable times. */
export const SLOT_INTERVAL_MINUTES = 30;

/**
 * How long a party holds its table, by party size. A booking occupies its table
 * for this whole window, so availability uses interval overlap rather than exact
 * start-time matching.
 */
export const RESERVATION_DURATION_MINUTES = {
  /** 1–2 guests. */
  small: 120,
  /** 3–4 guests. */
  medium: 150,
  /** 5+ guests. */
  large: 180,
} as const;

/** Table-hold duration (minutes) for a party of the given size. */
export function reservationDurationFor(people: number): number {
  if (people <= 2) return RESERVATION_DURATION_MINUTES.small;
  if (people <= 4) return RESERVATION_DURATION_MINUTES.medium;
  return RESERVATION_DURATION_MINUTES.large;
}

/**
 * How long the restaurant has to act on a pending request before the customer is
 * sent a "still awaiting response" notice. Configurable via env.
 */
export const RESERVATION_RESPONSE_TIMEOUT_HOURS =
  Number(process.env.RESERVATION_RESPONSE_TIMEOUT_HOURS) || 24;

/**
 * Width of the SLA catch window (hours). The cron notifies a pending reservation
 * once, as its age crosses into [timeout, timeout + this). Keep it ≥ the cron
 * cadence so a delayed run still catches the booking; larger values trade a small
 * duplicate-notice risk for resilience to missed runs.
 */
export const SLA_NOTIFY_WINDOW_HOURS =
  Number(process.env.SLA_NOTIFY_WINDOW_HOURS) || 2;

/**
 * How far before closing the last seating is offered. Guests still need time to
 * eat, so we stop offering slots this many minutes before `close`.
 */
export const LAST_SEATING_BEFORE_CLOSE_MINUTES = 90;

/** How many days ahead (including today) a guest may book. */
export const BOOKING_WINDOW_DAYS = 30;

/** Largest party the UI offers as quick-pick chips. */
export const MAX_PARTY_SIZE = 12;

/** IANA timezone used to interpret "now" when filtering out past slots. */
export const RESTAURANT_TIMEZONE = process.env.RESERVATION_TIMEZONE || "Europe/Lisbon";

export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

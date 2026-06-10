// Tunable, deterministic parameters for the reservation engine. No randomness,
// no external configuration — changing booking behaviour means changing these.

/** Minutes between consecutive bookable times. */
export const SLOT_INTERVAL_MINUTES = 30;

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

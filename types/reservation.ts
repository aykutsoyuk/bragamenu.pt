// Domain types for the reservation module.
// Mirrors the column layout of the Google Sheets that back this feature.

import type { Locale } from "@/lib/types";

export type ReservationStatus = "pending" | "confirmed" | "rejected";

/** Sheet: restaurant_config (single row). */
export interface RestaurantConfig {
  restaurant_name: string;
  notification_email: string;
  phone: string;
  whatsapp: string;
  /** Language for restaurant-facing emails (defaults to "en"). */
  restaurant_language: Locale;
}

/** Sheet: tables — one row per physical table. */
export interface Table {
  table_id: string;
  capacity: number;
}

/** Sheet: opening_hours — one row per weekday the restaurant serves. */
export interface OpeningHours {
  /** Lowercased weekday name, e.g. "monday". */
  day: string;
  /** "HH:MM" 24h. */
  open: string;
  /** "HH:MM" 24h. */
  close: string;
}

/** Sheet: reservations — one row per booking request. */
export interface Reservation {
  reservation_id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  people: number;
  /** "YYYY-MM-DD". */
  date: string;
  /** "HH:MM" 24h. */
  time: string;
  assigned_table: string;
  status: ReservationStatus;
  /** Website language at booking time — used for customer-facing emails. */
  customer_language: Locale;
}

/** A bookable time on a given date, plus the table best-fit allocation would use. */
export interface TimeSlot {
  /** "HH:MM" 24h. */
  time: string;
  /** The table that would be assigned, or null when the slot is full. */
  table: Table | null;
}

/** Payload the client sends to create a reservation. */
export interface ReservationInput {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
  time: string;
  /** Website language at booking time; defaults to "en" when omitted. */
  customer_language?: Locale;
}

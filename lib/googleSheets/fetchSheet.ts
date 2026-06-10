import type {
  OpeningHours,
  Reservation,
  ReservationStatus,
  RestaurantConfig,
  Table,
} from "@/types/reservation";
import { isSheetsConfigured } from "./auth";
import { readValues } from "./client";

// Reads each backing sheet and maps its header row onto typed objects. When the
// Sheets integration is not configured we fall back to deterministic demo data
// so the reservation flow remains fully explorable in local development.

export const SHEET_TABS = {
  config: "restaurant_config",
  tables: "tables",
  reservations: "reservations",
  openingHours: "opening_hours",
} as const;

/** Header order of the reservations sheet — also the append/update column order. */
export const RESERVATION_COLUMNS = [
  "reservation_id",
  "created_at",
  "name",
  "phone",
  "email",
  "people",
  "date",
  "time",
  "assigned_table",
  "status",
] as const;

type Row = Record<string, string>;

/**
 * Reads a whole tab (columns A:Z) and returns objects keyed by the header row,
 * lowercased and trimmed. Empty rows are skipped.
 */
export async function fetchSheet(tab: string): Promise<Row[]> {
  const values = await readValues(`${tab}!A:Z`);
  if (values.length < 2) return [];

  const headers = values[0].map((h) => h.trim().toLowerCase());
  return values
    .slice(1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const obj: Row = {};
      headers.forEach((key, i) => {
        if (key) obj[key] = (row[i] ?? "").trim();
      });
      return obj;
    });
}

/**
 * Reads the reservations tab's header row (lowercased, trimmed), preserving its
 * physical column order. Writes resolve column positions from this rather than
 * assuming a fixed layout, so reordering columns in the sheet never lands data
 * under the wrong header.
 */
export async function fetchReservationHeaders(): Promise<string[]> {
  const values = await readValues(`${SHEET_TABS.reservations}!1:1`);
  return (values[0] ?? []).map((h) => h.trim().toLowerCase());
}

/** Bijective base-26 column reference: 0 → "A", 25 → "Z", 26 → "AA". */
export function columnLetter(index: number): string {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

function toStatus(value: string): ReservationStatus {
  const v = value.trim().toLowerCase();
  if (v === "confirmed" || v === "rejected") return v;
  return "pending";
}

function toInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

// Google Sheets, read with UNFORMATTED_VALUE, returns time-formatted cells as a
// fraction of a day (0.875 → 21:00) and date-formatted cells as a serial day
// number (days since 1899-12-30). Because opening hours and tables are entered
// through the sheet UI, those cells are frequently auto-typed. Normalise both
// numeric forms back to the "HH:MM" / "YYYY-MM-DD" strings the engine expects;
// values already in string form pass through untouched.
const SHEET_EPOCH_UTC = Date.UTC(1899, 11, 30);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parseSheetTime(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const hm = s.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${pad2(Number(hm[1]))}:${hm[2]}`;
  const n = Number(s);
  if (Number.isFinite(n)) {
    const minutes = Math.round((n - Math.floor(n)) * 1440) % 1440;
    return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
  }
  return s;
}

function parseSheetDate(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Manually-entered day-first dates, e.g. "08.06.2026" or "8/6/2026".
  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const [, d, mo, y] = dmy;
    return `${y}-${pad2(Number(mo))}-${pad2(Number(d))}`;
  }
  const n = Number(s);
  // Serial dates are well above 59 (1900-02-28); smaller numbers are times.
  if (Number.isFinite(n) && n > 59) {
    const d = new Date(SHEET_EPOCH_UTC + Math.floor(n) * 86_400_000);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  return s;
}

export async function fetchRestaurantConfig(): Promise<RestaurantConfig> {
  if (!isSheetsConfigured()) return DEMO_CONFIG;
  const rows = await fetchSheet(SHEET_TABS.config);
  const row = rows[0] ?? {};
  return {
    restaurant_name: row.restaurant_name || DEMO_CONFIG.restaurant_name,
    notification_email: row.notification_email || DEMO_CONFIG.notification_email,
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
  };
}

export async function fetchTables(): Promise<Table[]> {
  if (!isSheetsConfigured()) return DEMO_TABLES;
  const rows = await fetchSheet(SHEET_TABS.tables);
  return rows
    .map((r) => ({ table_id: r.table_id, capacity: toInt(r.capacity) }))
    .filter((t) => t.table_id && t.capacity > 0);
}

export async function fetchOpeningHours(): Promise<OpeningHours[]> {
  if (!isSheetsConfigured()) return DEMO_HOURS;
  const rows = await fetchSheet(SHEET_TABS.openingHours);
  return rows
    .map((r) => ({
      day: r.day.trim().toLowerCase(),
      open: parseSheetTime(r.open),
      close: parseSheetTime(r.close),
    }))
    .filter((h) => h.day && h.open && h.close);
}

/** A reservation row paired with its 1-based sheet row number (for updates). */
export interface ReservationRow extends Reservation {
  _rowNumber: number;
}

export async function fetchReservations(): Promise<ReservationRow[]> {
  if (!isSheetsConfigured()) return [];
  const rows = await fetchSheet(SHEET_TABS.reservations);
  // Row 1 is the header, so the first data row lives at sheet row 2.
  return rows
    .map((r, i) => ({
      reservation_id: r.reservation_id,
      created_at: r.created_at,
      name: r.name,
      phone: r.phone,
      email: r.email,
      people: toInt(r.people),
      date: parseSheetDate(r.date),
      time: parseSheetTime(r.time),
      assigned_table: r.assigned_table,
      status: toStatus(r.status),
      _rowNumber: i + 2,
    }))
    // Keep system bookings (have an id) and owner-entered manual rows, which may
    // omit the id but still hold a table via their date/time. Both occupy seats.
    .filter((r) => r.reservation_id || (r.date && r.time));
}

// ---------------------------------------------------------------------------
// Demo fallbacks (used only when the Sheets integration is unconfigured).
// ---------------------------------------------------------------------------

const DEMO_CONFIG: RestaurantConfig = {
  restaurant_name: "Casa de Braga",
  notification_email: "reservas@example.com",
  phone: "+351 912 000 000",
  whatsapp: "https://wa.me/351912000000",
};

const DEMO_TABLES: Table[] = [
  { table_id: "T1", capacity: 2 },
  { table_id: "T2", capacity: 2 },
  { table_id: "T3", capacity: 4 },
  { table_id: "T4", capacity: 4 },
  { table_id: "T5", capacity: 6 },
  { table_id: "T6", capacity: 8 },
];

const DEMO_HOURS: OpeningHours[] = [
  { day: "monday", open: "12:00", close: "23:00" },
  { day: "tuesday", open: "12:00", close: "23:00" },
  { day: "wednesday", open: "12:00", close: "23:00" },
  { day: "thursday", open: "12:00", close: "23:00" },
  { day: "friday", open: "12:00", close: "23:30" },
  { day: "saturday", open: "12:00", close: "23:30" },
  { day: "sunday", open: "12:00", close: "22:00" },
];

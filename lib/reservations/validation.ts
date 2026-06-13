import type { Locale } from "@/lib/types";
import type { ReservationInput } from "@/types/reservation";
import { MAX_PARTY_SIZE } from "./constants";
import { isValidDate, isValidTime } from "./time";

// Single source of truth for reservation input validation. Schema-style, but
// dependency-free to match the rest of this codebase — each parser coerces the
// raw request into a typed value or returns a stable error code the API layer
// maps to a status. Client input is never trusted; everything is re-checked here.

// Stricter than a bare "something@something.tld": domain labels may not start or
// end with a hyphen, and the TLD must be ≥2 letters. Consecutive/edge dots in the
// local part are rejected by an explicit guard in validateEmail (the regex alone
// can't express "no '..'"), cutting down on typo'd/fake addresses.
export const EMAIL_RE =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

const NAME_MAX = 120;
const PHONE_MAX = 40;
const EMAIL_MAX = 160;
const PHONE_MIN_DIGITS = 6;

/** A manual-review enquiry: same contact fields as a booking, minus a fixed time. */
export interface ManualReviewInput {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
  customer_language: Locale;
}

/** A fail-safe callback request: like a booking but the time is optional. */
export interface CallbackInput {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
  time: string;
  customer_language: Locale;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateName(value: unknown): string | null {
  const name = asString(value);
  if (name.length < 2 || name.length > NAME_MAX) return null;
  return name;
}

function validatePhone(value: unknown): string | null {
  const phone = asString(value);
  if (phone.length > PHONE_MAX) return null;
  if (phone.replace(/\D/g, "").length < PHONE_MIN_DIGITS) return null;
  return phone;
}

function validateEmail(value: unknown): string | null {
  const email = asString(value);
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return null;
  // The regex can't forbid consecutive or edge dots in the local part.
  const local = email.slice(0, email.indexOf("@"));
  if (email.includes("..") || local.startsWith(".") || local.endsWith(".")) {
    return null;
  }
  return email;
}

/** Coerces an optional language hint to a supported locale (default "en"). */
function toLocale(value: unknown): Locale {
  return typeof value === "string" && value.trim().toLowerCase().startsWith("pt")
    ? "pt"
    : "en";
}

function validatePeople(value: unknown): number | null {
  const people = Math.trunc(Number(value));
  if (!Number.isFinite(people) || people < 1 || people > MAX_PARTY_SIZE) {
    return null;
  }
  return people;
}

/** Validates the contact fields common to bookings, manual-review and callbacks. */
function validateContact(
  raw: Record<string, unknown>,
): { name: string; phone: string; email: string } | null {
  const name = validateName(raw.name);
  const phone = validatePhone(raw.phone);
  const email = validateEmail(raw.email);
  if (name === null || phone === null || email === null) return null;
  return { name, phone, email };
}

export function validateReservationInput(
  raw: unknown,
): ValidationResult<ReservationInput> {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const contact = validateContact(obj);
  const people = validatePeople(obj.people);
  const date = asString(obj.date);
  const time = asString(obj.time);

  if (!contact) return { ok: false, error: "invalid_contact" };
  if (people === null) return { ok: false, error: "invalid_people" };
  if (!isValidDate(date)) return { ok: false, error: "invalid_date" };
  if (!isValidTime(time)) return { ok: false, error: "invalid_time" };

  return {
    ok: true,
    value: { ...contact, people, date, time, customer_language: toLocale(obj.customer_language) },
  };
}

export function validateManualReviewInput(
  raw: unknown,
): ValidationResult<ManualReviewInput> {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const contact = validateContact(obj);
  const people = validatePeople(obj.people);
  const date = asString(obj.date);

  if (!contact) return { ok: false, error: "invalid_contact" };
  if (people === null) return { ok: false, error: "invalid_people" };
  if (!isValidDate(date)) return { ok: false, error: "invalid_date" };

  return {
    ok: true,
    value: { ...contact, people, date, customer_language: toLocale(obj.customer_language) },
  };
}

export function validateCallbackInput(
  raw: unknown,
): ValidationResult<CallbackInput> {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const contact = validateContact(obj);
  const people = validatePeople(obj.people);
  const date = asString(obj.date);
  const time = asString(obj.time);

  if (!contact) return { ok: false, error: "invalid_contact" };
  if (people === null) return { ok: false, error: "invalid_people" };
  if (!isValidDate(date)) return { ok: false, error: "invalid_date" };
  // Time is optional for callbacks, but must be valid when provided.
  if (time && !isValidTime(time)) return { ok: false, error: "invalid_time" };

  return {
    ok: true,
    value: { ...contact, people, date, time, customer_language: toLocale(obj.customer_language) },
  };
}

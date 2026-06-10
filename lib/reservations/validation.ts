import type { ReservationInput } from "@/types/reservation";
import { MAX_PARTY_SIZE } from "./constants";
import { isValidDate, isValidTime } from "./time";

// Single source of truth for reservation input validation. Schema-style, but
// dependency-free to match the rest of this codebase — each parser coerces the
// raw request into a typed value or returns a stable error code the API layer
// maps to a status. Client input is never trusted; everything is re-checked here.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX = 120;
const PHONE_MAX = 40;
const EMAIL_MAX = 160;
const PHONE_MIN_DIGITS = 6;

/** A large-group enquiry: same contact fields as a booking, minus a time. */
export interface LargeGroupInput {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
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
  return email;
}

function validatePeople(value: unknown): number | null {
  const people = Math.trunc(Number(value));
  if (!Number.isFinite(people) || people < 1 || people > MAX_PARTY_SIZE) {
    return null;
  }
  return people;
}

/** Validates the contact fields common to bookings and large-group enquiries. */
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

  return { ok: true, value: { ...contact, people, date, time } };
}

export function validateLargeGroupInput(
  raw: unknown,
): ValidationResult<LargeGroupInput> {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const contact = validateContact(obj);
  const people = validatePeople(obj.people);
  const date = asString(obj.date);

  if (!contact) return { ok: false, error: "invalid_contact" };
  if (people === null) return { ok: false, error: "invalid_people" };
  if (!isValidDate(date)) return { ok: false, error: "invalid_date" };

  return { ok: true, value: { ...contact, people, date } };
}

import crypto from "node:crypto";
import type { ReservationStatus } from "@/types/reservation";

// Confirm / reject links arrive over email with no session, so each action is
// authenticated by an HMAC token bound to the reservation id, the action, and
// the restaurant slug. Only "confirmed" and "rejected" are valid actions.

export type ReservationAction = Extract<
  ReservationStatus,
  "confirmed" | "rejected"
>;

function secret(): string {
  // Falls back to the Sheets private key (always set in production) so that a
  // missing RESERVATION_SECRET doesn't silently disable link verification.
  const value =
    process.env.RESERVATION_SECRET ||
    process.env.GOOGLE_PRIVATE_KEY ||
    "";
  if (!value) {
    throw new Error("RESERVATION_SECRET is not configured.");
  }
  return value;
}

function sign(reservationId: string, action: ReservationAction, slug: string): string {
  return crypto
    .createHmac("sha256", secret())
    .update(`${reservationId}:${action}:${slug}`)
    .digest("base64url");
}

export function createActionToken(
  reservationId: string,
  action: ReservationAction,
  slug: string,
): string {
  return sign(reservationId, action, slug);
}

export function verifyActionToken(
  reservationId: string,
  action: ReservationAction,
  token: string,
  slug: string,
): boolean {
  const expected = sign(reservationId, action, slug);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";
import { getReservationCopy } from "./copy";
import ReservationChat from "./ReservationChat";

type Props = {
  restaurantName: string;
  locale: Locale;
  /**
   * "pill"  — compact accent pill, for the menu header actions row.
   * "block" — full-width prominent button, for the home reception screen.
   */
  variant?: "pill" | "block";
};

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

/**
 * Prominent "Reservation" entry point. On mobile it reads as the primary action
 * (filled accent pill); it opens the concierge chat sheet.
 */
export default function ReservationButton({
  restaurantName,
  locale,
  variant = "pill",
}: Props) {
  const [open, setOpen] = useState(false);
  const copy = getReservationCopy(locale);

  const className =
    variant === "block"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-4 text-base font-medium text-foreground shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
      : "inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <CalendarIcon />
        {copy.buttonLabel}
      </button>

      <ReservationChat
        open={open}
        onClose={() => setOpen(false)}
        restaurantName={restaurantName}
        locale={locale}
      />
    </>
  );
}

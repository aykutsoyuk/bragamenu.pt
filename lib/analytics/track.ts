"use client";

import type { Locale } from "@/lib/types";

const SESSION_KEY = "bm:session";

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "unknown";
  }
}

type TrackEventInput = {
  restaurantId: string;
  eventType: "menu_open" | "dish_open";
  dishId?: string;
  language: Locale;
};

export function trackEvent(input: TrackEventInput): void {
  try {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, sessionId: getSessionId() }),
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget — analytics must never break the menu.
    });
  } catch {
    // ignore
  }
}

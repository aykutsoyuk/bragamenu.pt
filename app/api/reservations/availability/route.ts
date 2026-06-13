import { NextResponse, type NextRequest } from "next/server";
import { getAvailableSlots, isValidDate } from "@/lib/reservations";
import { MAX_PARTY_SIZE } from "@/lib/reservations/constants";
import { fallbackPhone } from "@/lib/googleSheets";

// POST /api/reservations/availability
// Body: { people: number, date: "YYYY-MM-DD" }
// Returns the bookable time slots for that party on that date.
export async function POST(request: NextRequest) {
  let body: { people?: unknown; date?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const people = Math.trunc(Number(body.people));
  const date = typeof body.date === "string" ? body.date.trim() : "";

  if (!Number.isFinite(people) || people < 1 || people > MAX_PARTY_SIZE) {
    return NextResponse.json({ error: "invalid_people" }, { status: 400 });
  }
  if (!isValidDate(date)) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  try {
    const result = await getAvailableSlots(date, people);
    // Only the time strings are sent to the client; table assignment stays server-side.
    return NextResponse.json({
      open: result.open,
      full: result.full,
      manualReview: result.manualReview,
      slots: result.available.map((s) => s.time),
    });
  } catch (err) {
    // Sheets unreachable → fail-safe mode. Never fall back to demo/fake
    // availability in a configured deployment; tell the client to offer the
    // call/callback options instead, with a Sheet-independent phone number.
    console.error("[availability] failed:", err);
    return NextResponse.json(
      { error: "service_unavailable", phone: fallbackPhone() },
      { status: 503 },
    );
  }
}

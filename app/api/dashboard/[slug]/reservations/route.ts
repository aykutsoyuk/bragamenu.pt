import { NextResponse, type NextRequest } from "next/server";
import { fetchReservations } from "@/lib/googleSheets";
import { createManualReservation } from "@/lib/reservations/createManualReservation";
import { nowInRestaurant } from "@/lib/reservations";
import { resolveDashboard, keyFromRequest } from "@/lib/dashboard/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const result = resolveDashboard(slug, keyFromRequest(request));
  if (result instanceof Response) return result;
  const { ctx } = result;

  try {
    const today = nowInRestaurant().date;
    const all = await fetchReservations(ctx);
    const todayReservations = all
      .filter((r) => r.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
    return NextResponse.json({ reservations: todayReservations });
  } catch (err) {
    console.error("[dashboard/reservations] fetch failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = resolveDashboard(slug, String(body.key ?? ""));
  if (result instanceof Response) return result;
  const { ctx } = result;

  const input = {
    name: String(body.name ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    email: String(body.email ?? "").trim(),
    people: Number(body.people),
    date: String(body.date ?? "").trim(),
    time: String(body.time ?? "").trim(),
  };

  if (!input.name || !input.date || !input.time || !(input.people >= 1)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const createResult = await createManualReservation(ctx, input);
    if (!createResult.ok) {
      const status = createResult.reason === "no_table" ? 409 : 400;
      return NextResponse.json({ error: createResult.reason }, { status });
    }
    return NextResponse.json({ reservation: createResult.reservation }, { status: 201 });
  } catch (err) {
    console.error("[dashboard/reservations] create failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

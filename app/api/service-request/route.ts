import { NextResponse, type NextRequest } from "next/server";
import { createServiceRequest } from "@/lib/serviceRequests";
import { getRestaurant, toSheetCtx } from "@/lib/restaurants";

// POST /api/service-request — customer creates a waiter call or bill request.
// No authentication — this is triggered by guests scanning a QR code.
export async function POST(request: NextRequest) {
  let body: { slug?: unknown; table?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const table = typeof body.table === "string" ? body.table.trim() : String(body.table ?? "").trim();
  const type = typeof body.type === "string" ? body.type.trim() : "";

  const restaurant = slug ? getRestaurant(slug) : null;
  if (!restaurant) {
    return NextResponse.json({ error: "unknown_restaurant" }, { status: 404 });
  }

  if (!table || !type) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const ctx = toSheetCtx(restaurant);

  try {
    const serviceRequest = await createServiceRequest(ctx, { table, type });
    return NextResponse.json({ ok: true, id: serviceRequest.id }, { status: 201 });
  } catch (err) {
    console.error("[service-request] create failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

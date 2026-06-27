import { NextResponse, type NextRequest } from "next/server";
import { updateReservation } from "@/lib/googleSheets";
import { resolveDashboard, keyFromRequest } from "@/lib/dashboard/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const key = String(body.key ?? keyFromRequest(request) ?? "");
  const result = resolveDashboard(slug, key);
  if (result instanceof Response) return result;
  const { ctx } = result;

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.phone !== undefined) patch.phone = String(body.phone).trim();
  if (body.people !== undefined) patch.people = Number(body.people);
  if (body.date !== undefined) patch.date = String(body.date).trim();
  if (body.time !== undefined) patch.time = String(body.time).trim();
  if (body.assigned_table !== undefined) patch.assigned_table = String(body.assigned_table).trim();

  try {
    const updateResult = await updateReservation(ctx, id, patch);
    if (!updateResult) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ reservation: updateResult.reservation });
  } catch (err) {
    console.error("[dashboard/reservations/patch] failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

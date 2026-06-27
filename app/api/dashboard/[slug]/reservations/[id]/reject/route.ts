import { NextResponse, type NextRequest } from "next/server";
import { updateReservationStatus } from "@/lib/googleSheets";
import { resolveDashboard } from "@/lib/dashboard/auth";

export async function POST(
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

  const key = String(body.key ?? "");
  const result = resolveDashboard(slug, key);
  if (result instanceof Response) return result;
  const { ctx } = result;

  try {
    const updateResult = await updateReservationStatus(ctx, id, "rejected");
    if (!updateResult) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ reservation: updateResult.reservation });
  } catch (err) {
    console.error("[dashboard/reject] failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

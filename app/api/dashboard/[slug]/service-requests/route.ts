import { NextResponse, type NextRequest } from "next/server";
import { listRecentServiceRequests } from "@/lib/serviceRequests";
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
    const requests = await listRecentServiceRequests(ctx);
    return NextResponse.json({ requests });
  } catch (err) {
    console.error("[dashboard/service-requests] fetch failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
}

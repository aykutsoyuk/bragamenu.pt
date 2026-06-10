// Best-effort client IP from proxy headers. Vercel/most platforms set
// `x-forwarded-for` (client is the first hop). Falls back to "unknown" so the
// rate limiter still buckets requests rather than throwing.
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

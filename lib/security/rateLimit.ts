// Per-IP rate limiting backed by Upstash Redis over its REST API (no SDK) to
// match this codebase's dependency-free style. Fixed-window counter: INCR the
// per-IP key and, only on the first hit (EXPIRE … NX), start the window TTL so
// later requests don't extend it.
//
// Graceful degradation: when the Upstash env vars are unset, every request is
// allowed (the limiter is a no-op). It also fails *open* on transient Upstash
// errors — a rate limiter outage must never block legitimate bookings.

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_SECONDS = 3600; // 1 hour

export interface RateLimitOptions {
  /** Logical bucket name, e.g. "reservations". */
  key: string;
  limit?: number;
  windowSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** True when limiting was skipped (unconfigured) or failed open. */
  skipped: boolean;
  remaining: number;
  limit: number;
}

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isRateLimitConfigured(): boolean {
  return upstashConfig() !== null;
}

export async function checkRateLimit(
  ip: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const limit = opts.limit ?? DEFAULT_LIMIT;
  const windowSeconds = opts.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
  const cfg = upstashConfig();
  if (!cfg) return { allowed: true, skipped: true, remaining: limit, limit };

  const redisKey = `ratelimit:${opts.key}:${ip}`;
  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, String(windowSeconds), "NX"],
      ]),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[ratelimit] Upstash failed (${res.status}) — failing open`);
      return { allowed: true, skipped: true, remaining: limit, limit };
    }

    const json = (await res.json()) as Array<{ result?: number; error?: string }>;
    const count = Number(json[0]?.result ?? 0);
    const remaining = Math.max(0, limit - count);
    return { allowed: count <= limit, skipped: false, remaining, limit };
  } catch (err) {
    console.error("[ratelimit] Upstash threw — failing open:", err);
    return { allowed: true, skipped: true, remaining: limit, limit };
  }
}

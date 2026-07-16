// Minimal Supabase client over the PostgREST API — no SDK dependency. Reads
// and writes are no-ops (logged) when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// are unset so analytics never breaks the menu or dashboard.

export type AnalyticsEventType = "menu_open" | "dish_open";

export interface AnalyticsEvent {
  restaurantId: string;
  eventType: AnalyticsEventType;
  dishId?: string;
  language?: string;
  sessionId?: string;
}

export interface AnalyticsEventRow {
  event_type: AnalyticsEventType;
  dish_id: string | null;
  language: string | null;
}

function config(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function isAnalyticsConfigured(): boolean {
  return config() !== null;
}

export async function insertEvent(event: AnalyticsEvent): Promise<void> {
  const cfg = config();
  if (!cfg) {
    console.warn(`[analytics] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY unset — skipped "${event.eventType}" for ${event.restaurantId}`);
    return;
  }

  try {
    const res = await fetch(`${cfg.url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        restaurant_id: event.restaurantId,
        event_type: event.eventType,
        dish_id: event.dishId ?? null,
        language: event.language ?? null,
        session_id: event.sessionId ?? null,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[analytics] Supabase insert failed (${res.status}): ${detail}`);
    }
  } catch (err) {
    console.error("[analytics] Supabase insert threw:", err);
  }
}

export async function queryEvents(params: { restaurantId: string; since: Date }): Promise<AnalyticsEventRow[]> {
  const cfg = config();
  if (!cfg) return [];

  try {
    const qs = new URLSearchParams({
      restaurant_id: `eq.${params.restaurantId}`,
      created_at: `gte.${params.since.toISOString()}`,
      select: "event_type,dish_id,language",
      limit: "20000",
    });
    const res = await fetch(`${cfg.url}/rest/v1/analytics_events?${qs}`, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[analytics] Supabase query failed (${res.status}): ${detail}`);
      return [];
    }
    return (await res.json()) as AnalyticsEventRow[];
  } catch (err) {
    console.error("[analytics] Supabase query threw:", err);
    return [];
  }
}

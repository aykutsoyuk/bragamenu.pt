// Cloudflare Turnstile server-side verification, over the REST endpoint (no SDK)
// to match this codebase's dependency-free style. Reusable across any endpoint
// that needs bot protection.
//
// Graceful degradation: when TURNSTILE_SECRET_KEY is unset the check is skipped
// (returns success), so local development and unconfigured deployments still
// work — exactly like the Sheets/Resend integrations.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileResult {
  success: boolean;
  /** True when verification was skipped because no secret is configured. */
  skipped: boolean;
  error?: string;
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/** Verifies a Turnstile token issued to the client. */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  // Skip entirely outside production: site keys are bound to the live domain, so
  // localhost can't produce a valid token (Cloudflare error 110200). This lets
  // local dev run without Turnstile even when the secret is present in .env.
  if (process.env.NODE_ENV !== "production") return { success: true, skipped: true };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { success: true, skipped: true };
  if (!token) return { success: false, skipped: false, error: "missing_token" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" });
    if (!res.ok) {
      return { success: false, skipped: false, error: `http_${res.status}` };
    }

    const json = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (json.success) return { success: true, skipped: false };
    return {
      success: false,
      skipped: false,
      error: json["error-codes"]?.join(",") || "verification_failed",
    };
  } catch (err) {
    console.error("[turnstile] verify threw:", err);
    return { success: false, skipped: false, error: "network" };
  }
}

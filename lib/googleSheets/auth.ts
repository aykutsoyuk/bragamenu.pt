import crypto from "node:crypto";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const JWT_LIFETIME_SECONDS = 3600;
// Refresh a minute early so a token never expires mid-request.
const EXPIRY_SKEW_SECONDS = 60;

export interface SheetsCredentials {
  email: string;
  privateKey: string;
  sheetId: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Reads service-account credentials from the environment. Returns null when the
 * feature is not configured so callers can degrade gracefully (e.g. fall back to
 * demo data in development).
 */
export function getCredentials(): SheetsCredentials | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  // Private keys are usually stored with literal "\n" sequences in env vars.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!email || !sheetId || !privateKey) return null;
  return { email, privateKey, sheetId };
}

export function isSheetsConfigured(): boolean {
  return getCredentials() !== null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function buildAssertion(creds: SheetsCredentials, nowSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: creds.email,
      scope: SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: nowSeconds,
      exp: nowSeconds + JWT_LIFETIME_SECONDS,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signingInput)
    .sign(creds.privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

/**
 * Returns a valid OAuth2 access token for the Sheets API, minting a new one only
 * when the cache is empty or stale. Throws if credentials are missing or the
 * token exchange fails.
 */
export async function getAccessToken(): Promise<string> {
  const creds = getCredentials();
  if (!creds) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - EXPIRY_SKEW_SECONDS > nowSeconds) {
    return cachedToken.value;
  }

  const assertion = buildAssertion(creds, nowSeconds);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) {
    throw new Error("Google token exchange returned no access_token.");
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: nowSeconds + (json.expires_in ?? JWT_LIFETIME_SECONDS),
  };
  return cachedToken.value;
}

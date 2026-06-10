import { getAccessToken, getCredentials } from "./auth";

// Thin wrapper over the Google Sheets API v4 `values` endpoints. Each function
// handles auth, request shaping, and error surfacing so higher layers can work
// in terms of plain 2D string arrays.

const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function spreadsheetUrl(sheetId: string, suffix: string): string {
  return `${API_BASE}/${encodeURIComponent(sheetId)}${suffix}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Reads a rectangular range as rows of cell strings. Missing trailing cells are
 * returned as-is by the API (short rows), so callers must tolerate ragged rows.
 */
export async function readValues(range: string): Promise<string[][]> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Sheets credentials are not configured.");

  const url = spreadsheetUrl(
    creds.sheetId,
    `/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`,
  );
  const res = await fetch(url, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Sheets read failed for "${range}" (${res.status}): ${detail}`);
  }
  const json = (await res.json()) as { values?: unknown[][] };
  return (json.values ?? []).map((row) => row.map((cell) => String(cell ?? "")));
}

/** Appends a single row to the end of the given sheet/table. */
export async function appendRow(range: string, row: string[]): Promise<void> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Sheets credentials are not configured.");

  const url = spreadsheetUrl(
    creds.sheetId,
    `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
  );
  const res = await fetch(url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ values: [row] }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Sheets append failed for "${range}" (${res.status}): ${detail}`);
  }
}

/** Overwrites the cells at an exact range (e.g. "reservations!A5:J5"). */
export async function updateRange(range: string, row: string[]): Promise<void> {
  const creds = getCredentials();
  if (!creds) throw new Error("Google Sheets credentials are not configured.");

  const url = spreadsheetUrl(
    creds.sheetId,
    `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
  );
  const res = await fetch(url, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ values: [row] }),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Sheets update failed for "${range}" (${res.status}): ${detail}`);
  }
}

import crypto from "node:crypto";
import { appendRow } from "@/lib/googleSheets/client";
import { fetchSheet, isSheetsConfigured, type SheetCtx } from "@/lib/googleSheets";
import { SHEET_TABS } from "@/lib/googleSheets/fetchSheet";

export interface ServiceRequest {
  id: string;
  table: string;
  type: string;
  created_at: string;
}

const ALLOWED_TYPES = new Set(["call_waiter", "bill"]);

export async function createServiceRequest(
  ctx: SheetCtx,
  input: { table: string; type: string },
): Promise<ServiceRequest> {
  if (!ALLOWED_TYPES.has(input.type)) {
    throw new Error(`Invalid service request type: ${input.type}`);
  }
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets credentials are not configured.");
  }

  const request: ServiceRequest = {
    id: crypto.randomUUID(),
    table: input.table,
    type: input.type,
    created_at: new Date().toISOString(),
  };

  await appendRow(
    ctx.sheetId,
    `${SHEET_TABS.serviceRequests}!A:D`,
    [request.id, request.table, request.type, request.created_at],
  );

  return request;
}

export async function listRecentServiceRequests(
  ctx: SheetCtx,
  windowMs = 15 * 60 * 1000,
): Promise<ServiceRequest[]> {
  if (!isSheetsConfigured()) return [];

  const rows = await fetchSheet(ctx, SHEET_TABS.serviceRequests);
  const cutoff = Date.now() - windowMs;

  return rows
    .map((r) => ({
      id: r.id,
      table: r.table,
      type: r.type,
      created_at: r.created_at,
    }))
    .filter((r) => {
      if (!r.id || !r.created_at) return false;
      const ts = Date.parse(r.created_at);
      return !Number.isNaN(ts) && ts >= cutoff;
    })
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

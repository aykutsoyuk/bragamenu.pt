"use client";

import type { ServiceRequest } from "@/lib/serviceRequests";

const TYPE_LABELS: Record<string, string> = {
  call_waiter: "Call Waiter",
  bill: "Request Bill",
};

const TYPE_EMOJI: Record<string, string> = {
  call_waiter: "🔔",
  bill: "🧾",
};

export default function ServiceRequestCard({ request: r }: { request: ServiceRequest }) {
  const label = TYPE_LABELS[r.type] ?? r.type;
  const emoji = TYPE_EMOJI[r.type] ?? "🔔";
  const time = new Date(r.created_at).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="font-medium leading-tight">
            Table {r.table} — {label}
          </p>
          <p className="mt-0.5 text-xs text-muted">{time}</p>
        </div>
      </div>
    </div>
  );
}

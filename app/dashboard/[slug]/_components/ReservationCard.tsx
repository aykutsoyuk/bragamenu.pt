"use client";

import type { Reservation } from "@/types/reservation";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "text-emerald-400 border-emerald-800/40",
  pending: "bg-amber-700/10 text-amber-400 border-amber-800/40",
  rejected: "bg-red-950/40 text-red-400 border-red-800/40",
  cancelled: "bg-zinc-900/40 text-zinc-500 border-zinc-800/40",
};

const STATUS_LABEL: Record<string, { en: string; pt: string }> = {
  confirmed: { en: "Confirmed", pt: "Confirmado" },
  pending: { en: "Pending", pt: "Pendente" },
  rejected: { en: "Rejected", pt: "Rejeitado" },
  cancelled: { en: "Cancelled", pt: "Cancelado" },
};

type Props = {
  reservation: Reservation & { _rowNumber?: number };
  lang: "en" | "pt";
  onEdit: () => void;
  onCancel: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
};

const T = {
  en: { people: (n: number) => `${n} ${n === 1 ? "person" : "people"}`, table: "T", edit: "Edit", cancel: "Cancel", confirm: "Confirm", reject: "Reject" },
  pt: { people: (n: number) => `${n} ${n === 1 ? "pessoa" : "pessoas"}`, table: "M", edit: "Editar", cancel: "Cancelar", confirm: "Confirmar", reject: "Rejeitar" },
};

export default function ReservationCard({ reservation: r, lang, onEdit, onCancel, onConfirm, onReject }: Props) {
  const isCancelled = r.status === "cancelled" || r.status === "rejected";
  const isPending = r.status === "pending";
  const statusStyle = STATUS_STYLE[r.status] ?? STATUS_STYLE.pending;
  const t = T[lang];

  return (
    <div className={`rounded-2xl border p-4 transition-opacity ${isCancelled ? "opacity-50 border-border bg-surface/50" : "border-border bg-surface"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium leading-tight truncate">{r.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {r.time} · {t.people(r.people)} · {t.table}{r.assigned_table || "—"}
          </p>
          {r.phone && (
            <a href={`tel:${r.phone}`} className="mt-0.5 block text-xs text-blue-400 hover:underline">
              {r.phone}
            </a>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyle}`}>
          {STATUS_LABEL[r.status]?.[lang] ?? r.status}
        </span>
      </div>

      {!isCancelled && (
        <div className="mt-3 flex items-center gap-2">
          {isPending && onConfirm && onReject ? (
            <>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-full border border-emerald-800/50 bg-green-700/10 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-green-700/40"
              >
                {t.confirm}
              </button>
              <button
                type="button"
                onClick={onReject}
                className="flex-1 rounded-full border border-red-900/50 bg-red-700/10 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-700/40"
              >
                {t.reject}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                title={t.edit}
                className="flex items-center justify-center rounded-full border border-border bg-background p-2 text-muted transition-colors hover:text-foreground hover:bg-subtle"
              >
                {/* Pencil icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onCancel}
                title={t.cancel}
                className="flex items-center justify-center rounded-full border border-red-900/50 bg-red-950/20 p-2 text-red-400 transition-colors hover:bg-red-950/40"
              >
                {/* Trash icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

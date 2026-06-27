"use client";

import { useState } from "react";
import type { Reservation } from "@/types/reservation";
import { ModalShell } from "./NewReservationModal";

type Props = {
  reservation: Reservation;
  onSave: (patch: Partial<Reservation>) => Promise<void>;
  onClose: () => void;
};

export default function EditReservationModal({ reservation: r, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: r.name,
    phone: r.phone,
    people: r.people,
    date: r.date,
    time: r.time,
    assigned_table: r.assigned_table,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: form.name,
        phone: form.phone,
        people: Number(form.people),
        date: form.date,
        time: form.time,
        assigned_table: form.assigned_table,
      });
    } catch {
      setError("Service temporarily unavailable. Please contact restaurant staff.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit Reservation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-surface px-3 py-2">
          <p className="text-[11px] uppercase tracking-wider text-muted">Reservation ID</p>
          <p className="mt-0.5 font-mono text-xs text-foreground">{r.reservation_id}</p>
        </div>

        <Field label="Customer Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="People">
            <input
              type="number"
              min={1}
              max={20}
              value={form.people}
              onChange={(e) => set("people", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Time">
            <input
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Assigned Table">
          <input
            type="text"
            value={form.assigned_table}
            onChange={(e) => set("assigned_table", e.target.value)}
            className={inputCls}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-semibold text-background disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

const inputCls =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

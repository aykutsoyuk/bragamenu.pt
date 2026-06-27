"use client";

import { useState } from "react";

type Input = {
  name: string;
  phone: string;
  email: string;
  people: number;
  date: string;
  time: string;
};

type Props = {
  today: string;
  onSave: (input: Input) => Promise<void>;
  onClose: () => void;
};

export default function NewReservationModal({ today, onSave, onClose }: Props) {
  const [form, setForm] = useState<Input>({
    name: "",
    phone: "",
    email: "",
    people: 2,
    date: today,
    time: "19:00",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Input, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.time || form.people < 1) {
      setError("Name, date, time, and people are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg === "no_table"
          ? "No table available for that time. Try a different time."
          : "Service temporarily unavailable. Please contact restaurant staff.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="New Reservation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Customer Name *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Maria Silva"
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+351 912 000 000"
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="maria@example.com"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="People *">
            <input
              type="number"
              min={1}
              max={20}
              value={form.people}
              onChange={(e) => set("people", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Date *">
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Time *">
            <input
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <p className="text-xs text-muted">
          Table will be auto-assigned. Status will be set to Confirmed.
        </p>

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
            {saving ? "Saving…" : "Add Reservation"}
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

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";

type Props = {
  slug: string;
  table: string;
  locale: Locale;
};

type Status = "idle" | "sending" | "sent" | "error";

const LABELS: Record<Locale, { callWaiter: string; requestBill: string; sent: string; error: string }> = {
  en: {
    callWaiter: "Call Waiter",
    requestBill: "Request Bill",
    sent: "Request sent!",
    error: "Unable to send request. Please contact restaurant staff directly.",
  },
  pt: {
    callWaiter: "Chamar Empregado",
    requestBill: "Pedir Conta",
    sent: "Pedido enviado!",
    error: "Não foi possível enviar. Por favor contacte o pessoal do restaurante.",
  },
};

export default function ServiceRequestButtons({ slug, table, locale }: Props) {
  const [callStatus, setCallStatus] = useState<Status>("idle");
  const [billStatus, setBillStatus] = useState<Status>("idle");
  const labels = LABELS[locale] ?? LABELS.en;

  const send = async (type: "call_waiter" | "bill", setStatus: (s: Status) => void) => {
    if (callStatus === "sending" || billStatus === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, table, type }),
      });
      if (res.status === 201) {
        setStatus("sent");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const errorMsg =
    callStatus === "error"
      ? labels.error
      : billStatus === "error"
        ? labels.error
        : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">
        Table {table}
      </p>
      <div className="flex gap-2">
        <ServiceBtn
          label={callStatus === "sent" ? labels.sent : labels.callWaiter}
          icon="🔔"
          busy={callStatus === "sending"}
          done={callStatus === "sent"}
          onClick={() => send("call_waiter", setCallStatus)}
        />
        <ServiceBtn
          label={billStatus === "sent" ? labels.sent : labels.requestBill}
          icon="🧾"
          busy={billStatus === "sending"}
          done={billStatus === "sent"}
          onClick={() => send("bill", setBillStatus)}
        />
      </div>
      {errorMsg && (
        <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}

function ServiceBtn({
  label,
  icon,
  busy,
  done,
  onClick,
}: {
  label: string;
  icon: string;
  busy: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || done}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        done
          ? "border-emerald-800/50 bg-emerald-950/30 text-emerald-400"
          : "border-border bg-background text-foreground hover:bg-subtle"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

"use client";

import { useState } from "react";

type Lang = "en" | "pt";

const T = {
  en: {
    title: "Let's get your restaurant online",
    sub: "First 7 days free. No credit card. Setup in 72 hours.",
    name: "Your name",
    email: "Email address",
    restaurant: "Restaurant name",
    message: "Tell us about your restaurant",
    send: "Send message",
    sending: "Sending…",
    success: "Message sent! We'll get back to you within 24 hours.",
    error: "Something went wrong. Please try emailing us directly at hello@menuqr.pt.",
    required: "Name, email and message are required.",
  },
  pt: {
    title: "Vamos colocar o seu restaurante online",
    sub: "Primeiros 7 dias grátis. Sem cartão de crédito. Configuração em 72 horas.",
    name: "O seu nome",
    email: "Endereço de email",
    restaurant: "Nome do restaurante",
    message: "Fale-nos sobre o seu restaurante",
    send: "Enviar mensagem",
    sending: "A enviar…",
    success: "Mensagem enviada! Respondemos em até 24 horas.",
    error: "Algo correu mal. Por favor envie um email para hello@menuqr.pt.",
    required: "Nome, email e mensagem são obrigatórios.",
  },
};

export default function ContactForm({ lang = "en" }: { lang?: Lang }) {
  const t = T[lang];
  const [fields, setFields] = useState({ name: "", email: "", restaurant: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "validation">("idle");

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) {
      setStatus("validation");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-800/40 bg-emerald-950/20 px-8 py-12 text-center">
        <p className="text-2xl">✓</p>
        <p className="mt-3 text-base font-medium text-foreground">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.name} value={fields.name} onChange={set("name")} type="text" required />
        <Field label={t.email} value={fields.email} onChange={set("email")} type="email" required />
      </div>
      <Field label={t.restaurant} value={fields.restaurant} onChange={set("restaurant")} type="text" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">{t.message}</label>
        <textarea
          rows={4}
          value={fields.message}
          onChange={set("message")}
          required
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/40 focus:outline-none"
        />
      </div>

      {(status === "validation") && (
        <p className="text-xs text-red-400">{t.required}</p>
      )}
      {(status === "error") && (
        <p className="text-xs text-red-400">{t.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-foreground py-4 text-base font-semibold text-background transition-opacity disabled:opacity-60 hover:opacity-90"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/40 focus:outline-none"
      />
    </div>
  );
}

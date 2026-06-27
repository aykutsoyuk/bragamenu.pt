"use client";

import { useState } from "react";
import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "FAQ",
    h2: "Common questions",
    items: [
      { q: "Does my customer need to download an app?", a: "No. Customers scan a QR code and the menu opens directly in their browser. No app, no sign-up, no friction." },
      { q: "How do I update my menu?", a: "Your menu lives in a Google Sheet. Edit a cell and changes appear on the menu within 5 minutes. You don't need to contact us." },
      { q: "How are reservations managed?", a: "Reservation requests arrive by email and appear in your dashboard. You confirm, edit, or cancel from there. Guests get email confirmation automatically." },
      { q: "Is there a contract or minimum commitment?", a: "No contract. Cancel any time from your account. You are billed monthly." },
      { q: "How long does setup take?", a: "We target 72 hours from receiving your menu to your QR codes being ready to print. Most setups are faster." },
    ],
  },
  pt: {
    tag: "Perguntas Frequentes",
    h2: "Perguntas comuns",
    items: [
      { q: "O meu cliente precisa de instalar uma app?", a: "Não. Os clientes leem o QR code e o menu abre diretamente no browser. Sem app, sem registo, sem fricção." },
      { q: "Como atualizo o meu menu?", a: "O seu menu vive num Google Sheet. Edite uma célula e as alterações aparecem no menu em 5 minutos. Não precisa de nos contactar." },
      { q: "Como são geridas as reservas?", a: "Os pedidos de reserva chegam por email e aparecem no seu dashboard. Confirma, edita ou cancela a partir daí. Os clientes recebem confirmação automática por email." },
      { q: "Existe contrato ou compromisso mínimo?", a: "Sem contrato. Cancele quando quiser. A faturação é mensal." },
      { q: "Quanto tempo demora a instalação?", a: "O objetivo é 72 horas desde que recebemos o seu menu até os QR codes estarem prontos a imprimir. A maioria é mais rápido." },
    ],
  },
};

export default function FAQ({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(null);
  const t = T[lang];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{t.tag}</p>
        <h2 className="font-display mx-auto mb-16 text-center text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {t.h2}
        </h2>

        <div className="flex flex-col divide-y divide-border">
          {t.items.map((item, i) => (
            <div key={item.q}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-6 py-6 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-base font-medium text-foreground">{item.q}</span>
                <span className="mt-0.5 shrink-0 text-muted">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <p className="pb-6 text-sm leading-relaxed text-muted">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

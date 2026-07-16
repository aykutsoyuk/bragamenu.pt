"use client";

import { useState } from "react";
import Hero from "./Hero";
import Problem from "./Problem";
import Solution from "./Solution";
import HowItWorks from "./HowItWorks";
import DashboardPreview from "./DashboardPreview";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import ContactForm from "./ContactForm";

export type Lang = "en" | "pt";

const NAV_T = {
  en: { pricing: "Pricing", demo: "View Demo", start: "Get Started", contact: "Contact" },
  pt: { pricing: "Preços", demo: "Ver Demo", start: "Começar", contact: "Contacto" },
};

const CONTACT_T = {
  en: { title: "Let's get your restaurant online", sub: "First 7 days free. No credit card. Setup in 72 hours." },
  pt: { title: "Vamos colocar o seu restaurante online", sub: "Primeiros 7 dias grátis. Sem cartão. Configuração em 72 horas." },
};

export default function LandingShell() {
  const [lang, setLang] = useState<Lang>("pt");
  const nav = NAV_T[lang];
  const contactT = CONTACT_T[lang];

  return (
    <div className="min-h-dvh">
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight text-foreground">MenuQR</span>
        <div className="flex items-center gap-3">
          <a
            href="/casa-de-braga"
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
          >
            {nav.demo}
          </a>
          <a href="#pricing" className="hidden text-sm text-muted hover:text-foreground sm:block">
            {nav.pricing}
          </a>
          <a href="#contact" className="hidden text-sm text-muted hover:text-foreground sm:block">
            {nav.contact}
          </a>
          {/* Language toggle */}
          <div className="ml-1 inline-flex rounded-full border border-border bg-surface p-0.5">
            {(["pt", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  lang === l ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main>
        <Hero lang={lang} />
        <Problem lang={lang} />
        <Solution lang={lang} />
        <HowItWorks lang={lang} />
        <DashboardPreview lang={lang} />
        <Pricing lang={lang} />
        <FAQ lang={lang} />

        {/* Contact section */}
        <section id="contact" className="px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
              {nav.contact}
            </p>
            <h2 className="font-display mb-4 text-center text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {contactT.title}
            </h2>
            <p className="mb-10 text-center text-base text-muted">{contactT.sub}</p>
            <ContactForm lang={lang} />
          </div>
        </section>

        <FinalCTA lang={lang} />
      </main>
    </div>
  );
}

import type { Lang } from "./LandingShell";

const T = {
  en: {
    badge: "Digital Menus & Reservations",
    h1a: "Stop Losing Reservations.",
    h1b: "Help Tourists Understand Your Menu.",
    sub: "Built for restaurants in Portugal. Guests browse your menu in their language, book a table, and call the waiter — all from their phone. You manage everything from one dashboard.",
    demo: "View Live Demo",
    book: "Start Free — 7 Days",
    noApp: "No app required",
    setup: "Setup in 72 hours",
    free: "First 7 days free",
  },
  pt: {
    badge: "Menus Digitais & Reservas",
    h1a: "Pare de Perder Reservas.",
    h1b: "Ajude os Turistas a Perceber o Seu Menu.",
    sub: "Feito para restaurantes em Portugal. Os seus clientes consultam o menu no idioma deles, fazem reservas e chamam o empregado — tudo pelo telemóvel. Gere tudo a partir de um único painel.",
    demo: "Ver Demo",
    book: "Comece Grátis — 7 Dias",
    noApp: "Sem app necessária",
    setup: "Configuração em 72 horas",
    free: "Primeiros 7 dias grátis",
  },
};

export default function Hero({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 text-center sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted">
          {t.badge}
        </div>

        <h1 className="font-display mt-8 text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-6xl">
          {t.h1a}{" "}
          <span className="text-muted">{t.h1b}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {t.sub}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            {t.book}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            href="/braga"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-subtle sm:w-auto"
          >
            {t.demo}
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          {[t.noApp, t.setup, t.free].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

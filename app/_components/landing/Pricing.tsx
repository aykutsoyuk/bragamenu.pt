import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "Pricing",
    h2: "Simple pricing. No setup fee. Cancel any time.",
    sub: "Launch offer — first 7 days free. No credit card required.",
    built: "🇵🇹 Built specifically for restaurants in Portugal.",
    month: "/month",
    plans: [
      {
        name: "Starter",
        price: "€19",
        description: "Everything a small restaurant needs to go digital today.",
        badge: null,
        features: ["Digital menu (English + Portuguese)", "QR code generation", "Easy menu updates", "No app required", "Technical support"],
        cta: "Get Started",
        highlight: false,
      },
      {
        name: "Business",
        price: "€29",
        description: "For restaurants that want the full experience and live dashboard.",
        badge: "Most Popular",
        features: ["Everything in Starter", "Digital menu (up to 10 languages)", "Online reservations", "Email notifications", "Call Waiter + Request Bill", "Live dashboard (tablet-optimized)", "Priority support"],
        cta: "Get Business",
        highlight: true,
      },
    ],
  },
  pt: {
    tag: "Preços",
    h2: "Preços simples. Sem taxa de instalação. Cancele quando quiser.",
    sub: "Oferta de lançamento — primeiros 7 dias grátis. Sem cartão de crédito.",
    built: "🇵🇹 Criado especificamente para restaurantes em Portugal.",
    month: "/mês",
    plans: [
      {
        name: "Starter",
        price: "€19",
        description: "Tudo o que um pequeno restaurante precisa para ir digital hoje.",
        badge: null,
        features: ["Menu digital (Inglês + Português)", "Geração de QR codes", "Atualizações fáceis de menu", "Sem app necessária", "Suporte técnico"],
        cta: "Começar",
        highlight: false,
      },
      {
        name: "Business",
        price: "€29",
        description: "Para restaurantes que querem a experiência completa com dashboard ao vivo.",
        badge: "Mais Popular",
        features: ["Tudo do Starter", "Menu digital (até 10 idiomas)", "Reservas online", "Notificações por email", "Chamar Empregado + Pedir Conta", "Dashboard ao vivo (otimizado para tablet)", "Suporte prioritário"],
        cta: "Obter Business",
        highlight: true,
      },
    ],
  },
};

export default function Pricing({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{t.tag}</p>
        <h2 className="font-display mx-auto mb-4 max-w-2xl text-center text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {t.h2}
        </h2>
        <p className="mx-auto mb-4 max-w-xl text-center text-base text-muted">{t.sub}</p>
        <p className="mx-auto mb-16 max-w-xl text-center text-sm font-medium text-foreground">{t.built}</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {t.plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ${plan.highlight ? "bg-foreground text-background" : "border border-border bg-surface text-foreground"}`}
            >
              <div className="mb-1 flex items-center gap-3">
                <p className={`text-[11px] uppercase tracking-[0.2em] ${plan.highlight ? "text-background/50" : "text-muted"}`}>
                  {plan.name}
                </p>
                {plan.badge && (
                  <span className="rounded-full bg-background/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-background/80">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="mb-4 flex items-end gap-1">
                <span className={`text-5xl font-semibold tracking-tight ${plan.highlight ? "text-background" : "text-foreground"}`}>
                  {plan.price}
                </span>
                <span className={`mb-2 text-sm ${plan.highlight ? "text-background/60" : "text-muted"}`}>{t.month}</span>
              </div>
              <p className={`mb-8 text-sm leading-relaxed ${plan.highlight ? "text-background/60" : "text-muted"}`}>
                {plan.description}
              </p>
              <ul className="mb-10 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-background/80" : "text-muted"}`}>
                    <span className={plan.highlight ? "text-background" : "text-foreground"}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`block w-full rounded-full py-4 text-center text-base font-semibold transition-opacity hover:opacity-80 ${
                  plan.highlight ? "bg-background text-foreground" : "bg-foreground text-background"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

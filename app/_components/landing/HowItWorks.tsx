import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "How it works",
    h2: "Up and running in 72 hours. No technical knowledge required.",
    steps: [
      { n: "01", title: "You share your menu", body: "Export your menu as a Google Sheet or send us a PDF. We format it and set up your digital menu in 24 hours." },
      { n: "02", title: "We create your QR codes", body: "One QR code per table, sized correctly for printing. We send them as a print-ready PDF." },
      { n: "03", title: "Guests scan and use it", body: "From day one, customers can see your menu, reserve a table, call a waiter, and request the bill from their phone." },
      { n: "04", title: "You update it any time", body: "Edit your Google Sheet and changes appear on the menu within 5 minutes. No code. No waiting. No reprinting." },
    ],
  },
  pt: {
    tag: "Como funciona",
    h2: "Pronto a funcionar em 72 horas. Sem conhecimentos técnicos necessários.",
    steps: [
      { n: "01", title: "Partilha o seu menu", body: "Exporte o seu menu como Google Sheet ou envie-nos um PDF. Formatamos e criamos o seu menu digital em 24 horas." },
      { n: "02", title: "Criamos os seus QR codes", body: "Um QR code por mesa, no tamanho certo para imprimir. Enviamos um PDF pronto a imprimir." },
      { n: "03", title: "Os clientes leem e usam", body: "Desde o primeiro dia, os clientes podem ver o menu, reservar, chamar o empregado e pedir a conta." },
      { n: "04", title: "Atualiza quando quiser", body: "Edite o Google Sheet e as alterações aparecem no menu em 5 minutos. Sem código. Sem espera. Sem reimprimir." },
    ],
  },
};

export default function HowItWorks({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{t.tag}</p>
        <h2 className="font-display mx-auto mb-16 max-w-2xl text-center text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {t.h2}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, i) => (
            <div key={step.n} className="relative">
              {i < t.steps.length - 1 && (
                <div className="absolute right-0 top-5 hidden h-px w-full translate-x-1/2 bg-border lg:block" />
              )}
              <div className="relative rounded-3xl border border-border bg-surface p-8">
                <span className="mb-5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{step.n}</span>
                <h3 className="mb-3 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

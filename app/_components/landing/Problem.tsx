import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "The problem",
    h2: "Every restaurant in Portugal faces these four problems every day.",
    cards: [
      { icon: "📵", title: "Missed reservations", body: "Tourists can't call in a foreign language. They move on to the restaurant next door — and you never know." },
      { icon: "🗺️", title: "Menus they can't read", body: "A paper menu in Portuguese means guesswork. Customers order less, complain more, and don't come back." },
      { icon: "🖨️", title: "Outdated printed menus", body: "Every price change costs money. Seasonal dishes appear nowhere. You're stuck with a menu from two years ago." },
      { icon: "🙋", title: "Constant interruptions", body: "Waiters spend half their shift answering 'Can I have the bill?' Guests wait. Service quality drops." },
    ],
  },
  pt: {
    tag: "O problema",
    h2: "Todos os restaurantes em Portugal enfrentam estes quatro problemas todos os dias.",
    cards: [
      { icon: "📵", title: "Reservas perdidas", body: "Os turistas não conseguem telefonar em língua estrangeira. Vão ao restaurante ao lado — e você nunca fica a saber." },
      { icon: "🗺️", title: "Menus que não percebem", body: "Um menu em papel português significa adivinhar. Os clientes pedem menos, reclamam mais e não voltam." },
      { icon: "🖨️", title: "Menus impressos desatualizados", body: "Cada alteração de preço custa dinheiro. Os pratos sazonais não aparecem em lado nenhum. Está preso a um menu de dois anos atrás." },
      { icon: "🙋", title: "Interrupções constantes", body: "Os empregados passam metade do turno a responder 'Posso ter a conta?' Os clientes esperam. A qualidade do serviço cai." },
    ],
  },
};

export default function Problem({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{t.tag}</p>
        <h2 className="font-display mx-auto mb-16 max-w-2xl text-center text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {t.h2}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.cards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-border bg-surface p-8">
              <div className="mb-4 text-3xl">{card.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

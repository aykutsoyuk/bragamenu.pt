import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "The solution",
    h2: "A QR code on each table. Everything your guests need — in their language.",
    sub: "No app. No sign-up. Guests scan, browse, reserve, call a waiter, and request the bill — from their phone, in English or Portuguese.",
    features: [
      { icon: "📱", title: "Scan to see the full menu", body: "Guests scan a QR code on the table. The menu opens instantly in their browser — no app needed." },
      { icon: "🌐", title: "English & Portuguese", body: "One tap switches the entire menu language. Every item name and description is translated." },
      { icon: "📅", title: "Reserve directly from the menu", body: "Guests pick a date, time, and party size. You get notified by email. No phone tag." },
      { icon: "🔔", title: "Call the waiter from the table", body: "One tap sends a notification to your staff. No shouting across the room. No interruptions mid-conversation." },
    ],
  },
  pt: {
    tag: "A solução",
    h2: "Um QR code em cada mesa. Tudo o que os seus clientes precisam — na língua deles.",
    sub: "Sem app. Sem registo. Os clientes leem, navegam, reservam, chamam o empregado e pedem a conta — do telemóvel, em inglês ou português.",
    features: [
      { icon: "📱", title: "Ler para ver o menu completo", body: "Os clientes leem o QR code da mesa. O menu abre instantaneamente no browser — sem app necessária." },
      { icon: "🌐", title: "Inglês e Português", body: "Um toque muda toda a língua do menu. Todos os nomes e descrições são traduzidos." },
      { icon: "📅", title: "Reservar diretamente do menu", body: "Os clientes escolhem data, hora e número de pessoas. É notificado por email. Sem chamadas." },
      { icon: "🔔", title: "Chamar o empregado da mesa", body: "Um toque envia uma notificação ao pessoal. Sem gritar pela sala. Sem interrupções." },
    ],
  },
};

export default function Solution({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="overflow-hidden bg-foreground px-6 py-24 text-background">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-background/50">{t.tag}</p>
        <h2 className="font-display mx-auto mb-4 max-w-2xl text-center text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {t.h2}
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-base text-background/60">{t.sub}</p>

        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20">
          {/* Phone mockup */}
          <div className="relative shrink-0">
            <div className="relative h-[540px] w-[270px] rounded-[44px] border-[6px] border-background/20 bg-background/10 shadow-2xl">
              <div className="absolute inset-x-0 top-0 flex h-8 items-center justify-between rounded-t-[38px] px-6">
                <span className="text-[10px] text-background/60">9:41</span>
                <div className="h-4 w-16 rounded-full bg-background/20" />
              </div>
              <div className="absolute inset-x-2 bottom-2 top-8 overflow-hidden rounded-[38px] bg-[#0c0a08] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[9px] font-medium uppercase tracking-widest text-[#888]">Casa de Braga</span>
                  <div className="flex gap-1">
                    <span className="rounded-full bg-[#1c1c1e] px-2 py-0.5 text-[8px] text-white">EN</span>
                    <span className="rounded-full px-2 py-0.5 text-[8px] text-[#888]">PT</span>
                  </div>
                </div>
                <div className="mb-3 flex gap-2">
                  <div className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#2a2a2a] py-1.5 text-[9px] text-white">
                    <span>🔔</span> Call Waiter
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#2a2a2a] py-1.5 text-[9px] text-white">
                    <span>🧾</span> Request Bill
                  </div>
                </div>
                <p className="mb-2 text-[8px] uppercase tracking-[0.2em] text-[#888]">Starters</p>
                {[
                  { name: "Bacalhau à Brás", price: "€14", desc: "Salted cod, potatoes, eggs" },
                  { name: "Caldo Verde", price: "€6", desc: "Kale broth, chouriço" },
                  { name: "Pão com Azeite", price: "€3", desc: "Bread, olive oil" },
                ].map((item) => (
                  <div key={item.name} className="mb-2 rounded-xl border border-[#1c1c1e] bg-[#111] p-2.5">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-semibold text-white">{item.name}</span>
                      <span className="text-[10px] font-medium text-white">{item.price}</span>
                    </div>
                    <span className="text-[8px] text-[#888]">{item.desc}</span>
                  </div>
                ))}
                <button className="mt-3 w-full rounded-full bg-white py-2 text-[10px] font-semibold text-black">
                  Make a Reservation
                </button>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-8">
            {t.features.map((f) => (
              <div key={f.title} className="flex gap-5">
                <div className="mt-1 shrink-0 text-2xl">{f.icon}</div>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-background">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-background/60">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

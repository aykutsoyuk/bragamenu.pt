import type { Lang } from "./LandingShell";

const T = {
  en: {
    tag: "Live dashboard",
    h2: "See everything happening in your restaurant. Live.",
    sub: "A private dashboard refreshes every 5 seconds. New requests trigger a sound notification so staff never miss them.",
    date: "Today — Thursday, 26 Jun",
    live: "Live",
    resToday: "Reservations today",
    pending: "Pending confirmation",
    openReq: "Open requests",
    activeReq: "Active Requests",
    todaysRes: "Today's Reservations",
    minAgo: (n: number) => `${n} min ago`,
    confirmed: "confirmed",
    pendingLabel: "pending",
    people: "pax",
  },
  pt: {
    tag: "Dashboard em tempo real",
    h2: "Veja tudo o que acontece no seu restaurante. Em tempo real.",
    sub: "Um dashboard privado atualiza de 5 em 5 segundos. Novos pedidos ativam uma notificação sonora para que a equipa nunca falhe.",
    date: "Hoje — Quinta, 26 Jun",
    live: "Ao vivo",
    resToday: "Reservas hoje",
    pending: "A aguardar confirmação",
    openReq: "Pedidos abertos",
    activeReq: "Pedidos Ativos",
    todaysRes: "Reservas de Hoje",
    minAgo: (n: number) => `há ${n} min`,
    confirmed: "confirmado",
    pendingLabel: "pendente",
    people: "pax",
  },
};

export default function DashboardPreview({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="overflow-hidden bg-foreground px-6 py-24 text-background">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-background/50">{t.tag}</p>
        <h2 className="font-display mx-auto mb-4 max-w-2xl text-center text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {t.h2}
        </h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-base text-background/60">{t.sub}</p>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-[28px] border-[6px] border-background/20 bg-background/10 p-2 shadow-2xl">
            <div className="overflow-hidden rounded-[20px] bg-[#0c0a08] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#888]">Casa de Braga</p>
                  <p className="text-base font-semibold text-white">{t.date}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-900/40 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-emerald-400">{t.live}</span>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                  { label: t.resToday, value: "12" },
                  { label: t.pending, value: "3" },
                  { label: t.openReq, value: "2" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-[#111] p-4">
                    <p className="mb-1 text-[9px] uppercase tracking-widest text-[#888]">{s.label}</p>
                    <p className="text-2xl font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#888]">{t.activeReq}</p>
              <div className="mb-4 flex flex-col gap-2">
                {[
                  { table: "7", type: "Call Waiter", icon: "🔔", ago: t.minAgo(2) },
                  { table: "12", type: "Request Bill", icon: "🧾", ago: t.minAgo(5) },
                ].map((r) => (
                  <div key={r.table + r.type} className="flex items-center gap-3 rounded-2xl bg-[#111] p-4">
                    <span className="text-xl">{r.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">Table {r.table}</p>
                      <p className="text-[10px] text-[#888]">{r.type}</p>
                    </div>
                    <span className="text-[10px] text-[#666]">{r.ago}</span>
                  </div>
                ))}
              </div>

              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#888]">{t.todaysRes}</p>
              <div className="flex flex-col gap-2">
                {[
                  { time: "12:30", name: "Silva, João", people: 4, table: "3", status: t.confirmed },
                  { time: "13:00", name: "Smith, James", people: 2, table: "—", status: t.pendingLabel },
                  { time: "19:30", name: "Ferreira, Ana", people: 6, table: "8", status: t.confirmed },
                ].map((r) => (
                  <div key={r.time + r.name} className="flex items-center gap-4 rounded-2xl bg-[#111] px-4 py-3">
                    <span className="w-10 text-[11px] font-medium text-[#888]">{r.time}</span>
                    <span className="flex-1 text-[11px] font-medium text-white">{r.name}</span>
                    <span className="text-[10px] text-[#888]">{r.people} {t.people}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      r.status === t.confirmed ? "bg-emerald-900/40 text-emerald-400" : "bg-amber-900/40 text-amber-400"
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

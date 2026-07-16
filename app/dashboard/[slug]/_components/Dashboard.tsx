"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Reservation } from "@/types/reservation";
import type { ServiceRequest } from "@/lib/serviceRequests";
import type { ReservationRow } from "@/lib/googleSheets";
import NewReservationModal from "./NewReservationModal";
import EditReservationModal from "./EditReservationModal";
import ReservationCard from "./ReservationCard";
import ServiceRequestCard from "./ServiceRequestCard";

type Lang = "en" | "pt";

const T = {
  en: {
    dashboard: "Dashboard",
    needAction: "Need Action",
    todaysReservations: "Today's Reservations",
    activeRequests: "Active Service Requests",
    noRequests: "No active requests.",
    noPending: "No pending reservations.",
    noReservations: "No reservations today.",
    newReservation: "+ New Reservation",
    reservationsToday: "Today",
    pending: "Pending",
    requests: "Requests",
    dismiss: "Dismiss",
    error: "Service temporarily unavailable. Please contact restaurant staff.",
    confirmQ: "Confirm this reservation?",
    rejectQ: "Reject this reservation?",
    cancelQ: "Cancel this reservation?",
    analytics: "Analytics",
    rangeToday: "Today",
    rangeWeek: "This Week",
    rangeMonth: "This Month",
    totalOpens: "Menu Opens",
    languageUsage: "Language Usage",
    mostViewed: "Most Viewed Dishes",
    leastViewed: "Least Viewed Dishes",
    noAnalytics: "No analytics data yet.",
  },
  pt: {
    dashboard: "Dashboard",
    needAction: "Ação Necessária",
    todaysReservations: "Reservas de Hoje",
    activeRequests: "Pedidos de Serviço Ativos",
    noRequests: "Sem pedidos ativos.",
    noPending: "Sem reservas pendentes.",
    noReservations: "Sem reservas hoje.",
    newReservation: "+ Nova Reserva",
    reservationsToday: "Hoje",
    pending: "Pendente",
    requests: "Pedidos",
    dismiss: "Fechar",
    error: "Serviço temporariamente indisponível. Por favor contacte o pessoal do restaurante.",
    confirmQ: "Confirmar esta reserva?",
    rejectQ: "Rejeitar esta reserva?",
    cancelQ: "Cancelar esta reserva?",
    analytics: "Análises",
    rangeToday: "Hoje",
    rangeWeek: "Esta Semana",
    rangeMonth: "Este Mês",
    totalOpens: "Aberturas do Menu",
    languageUsage: "Uso de Idiomas",
    mostViewed: "Pratos Mais Vistos",
    leastViewed: "Pratos Menos Vistos",
    noAnalytics: "Ainda sem dados de análise.",
  },
};

type AnalyticsRange = "today" | "week" | "month";

type AnalyticsStats = {
  totalOpens: number;
  languages: { language: string; count: number; percentage: number }[];
  topDishes: { dishId: string; title: string; count: number }[];
  leastDishes: { dishId: string; title: string; count: number }[];
};

type Props = {
  slug: string;
  dashboardKey: string;
  restaurantName: string;
  initialReservations: ReservationRow[];
  initialRequests: ServiceRequest[];
  today: string;
};

const POLL_INTERVAL_MS = 5000;

export default function Dashboard({
  slug,
  dashboardKey,
  restaurantName,
  initialReservations,
  initialRequests,
  today,
}: Props) {
  const [lang, setLang] = useState<Lang>("pt");
  const [reservations, setReservations] = useState<ReservationRow[]>(initialReservations);
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [showNew, setShowNew] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>("today");
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const seenResIds = useRef(new Set(initialReservations.map((r) => r.reservation_id)));
  const seenReqIds = useRef(new Set(initialRequests.map((r) => r.id)));
  const apiBase = `/api/dashboard/${slug}`;
  const authParam = `key=${encodeURIComponent(dashboardKey)}`;
  const t = T[lang];

  const playDing = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
      osc.onended = () => ctx.close();
    } catch {
      // Audio not available.
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const [resRes, reqRes] = await Promise.all([
        fetch(`${apiBase}/reservations?${authParam}`),
        fetch(`${apiBase}/service-requests?${authParam}`),
      ]);
      if (resRes.ok) {
        const data = (await resRes.json()) as { reservations: ReservationRow[] };
        let hasNew = false;
        for (const r of data.reservations) {
          if (!seenResIds.current.has(r.reservation_id)) {
            seenResIds.current.add(r.reservation_id);
            hasNew = true;
          }
        }
        if (hasNew) playDing();
        setReservations(data.reservations);
      }
      if (reqRes.ok) {
        const data = (await reqRes.json()) as { requests: ServiceRequest[] };
        let hasNew = false;
        for (const r of data.requests) {
          if (!seenReqIds.current.has(r.id)) {
            seenReqIds.current.add(r.id);
            hasNew = true;
          }
        }
        if (hasNew) playDing();
        setRequests(data.requests);
      }
    } catch {
      // Silently ignore poll failures; UI retains last known state.
    }
  }, [apiBase, authParam, playDing]);

  useEffect(() => {
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/analytics/stats?slug=${slug}&range=${analyticsRange}&${authParam}`);
        if (!res.ok) return;
        const data = (await res.json()) as AnalyticsStats;
        if (!cancelled) setAnalytics(data);
      } catch {
        // Analytics is best-effort; ignore failures.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authParam, analyticsRange, slug]);

  const postAction = useCallback(
    async (path: string) => {
      const res = await fetch(`${apiBase}/reservations/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: dashboardKey }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await poll();
    },
    [apiBase, dashboardKey, poll],
  );

  const handleConfirm = useCallback(
    async (id: string) => {
      if (!confirm(t.confirmQ)) return;
      try { await postAction(`${id}/confirm`); }
      catch { setError(t.error); }
    },
    [postAction, t],
  );

  const handleReject = useCallback(
    async (id: string) => {
      if (!confirm(t.rejectQ)) return;
      try { await postAction(`${id}/reject`); }
      catch { setError(t.error); }
    },
    [postAction, t],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      if (!confirm(t.cancelQ)) return;
      try { await postAction(`${id}/cancel`); }
      catch { setError(t.error); }
    },
    [postAction, t],
  );

  const handleSaveNew = useCallback(
    async (input: { name: string; phone: string; email: string; people: number; date: string; time: string }) => {
      const res = await fetch(`${apiBase}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, key: dashboardKey }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? String(res.status));
      }
      setShowNew(false);
      await poll();
    },
    [apiBase, dashboardKey, poll],
  );

  const handleSaveEdit = useCallback(
    async (id: string, patch: Partial<Reservation>) => {
      const res = await fetch(`${apiBase}/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, key: dashboardKey }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? String(res.status));
      }
      setEditTarget(null);
      await poll();
    },
    [apiBase, dashboardKey, poll],
  );

  const pendingReservations = reservations.filter((r) => r.status === "pending");
  const otherReservations = reservations.filter((r) => r.status !== "pending");
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed");

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{t.dashboard}</p>
            <h1 className="font-display text-xl font-medium leading-tight">{restaurantName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">{today}</span>
            <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
              {(["pt", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    lang === l ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label={t.reservationsToday} value={confirmedReservations.length} />
          <StatCard label={t.pending} value={pendingReservations.length} highlight={pendingReservations.length > 0} />
          <StatCard label={t.requests} value={requests.length} highlight={requests.length > 0} />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
            <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 underline">
              {t.dismiss}
            </button>
          </div>
        )}

        {/* Section B — Active Service Requests */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {t.activeRequests}
          </h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted">{t.noRequests}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((r) => <ServiceRequestCard key={r.id} request={r} />)}
            </div>
          )}
        </section>

        {/* Need Action — pending reservations */}
        {pendingReservations.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t.needAction}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {pendingReservations.map((r) => (
                <ReservationCard
                  key={r.reservation_id}
                  reservation={r}
                  lang={lang}
                  onEdit={() => setEditTarget(r)}
                  onCancel={() => handleCancel(r.reservation_id)}
                  onConfirm={() => handleConfirm(r.reservation_id)}
                  onReject={() => handleReject(r.reservation_id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section A — Today's Reservations (confirmed / cancelled / rejected) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t.todaysReservations}
            </h2>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-transform hover:scale-[1.02]"
            >
              {t.newReservation}
            </button>
          </div>
          {otherReservations.length === 0 ? (
            <p className="text-sm text-muted">{t.noReservations}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {otherReservations.map((r) => (
                <ReservationCard
                  key={r.reservation_id}
                  reservation={r}
                  lang={lang}
                  onEdit={() => setEditTarget(r)}
                  onCancel={() => handleCancel(r.reservation_id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Analytics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t.analytics}
            </h2>
            <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
              {(
                [
                  ["today", t.rangeToday],
                  ["week", t.rangeWeek],
                  ["month", t.rangeMonth],
                ] as [AnalyticsRange, string][]
              ).map(([range, label]) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setAnalyticsRange(range)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    analyticsRange === range ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!analytics ? (
            <p className="text-sm text-muted">{t.noAnalytics}</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="mb-3 text-[11px] uppercase tracking-wider text-muted">{t.mostViewed}</h3>
                  {analytics.topDishes.length === 0 ? (
                    <p className="text-sm text-muted">{t.noAnalytics}</p>
                  ) : (
                    <ol className="space-y-1.5 text-sm">
                      {analytics.topDishes.map((d) => (
                        <li key={d.dishId} className="flex items-center justify-between">
                          <span className="truncate">{d.title}</span>
                          <span className="shrink-0 tabular-nums text-muted">{d.count}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="mb-3 text-[11px] uppercase tracking-wider text-muted">{t.leastViewed}</h3>
                  {analytics.leastDishes.length === 0 ? (
                    <p className="text-sm text-muted">{t.noAnalytics}</p>
                  ) : (
                    <ol className="space-y-1.5 text-sm">
                      {analytics.leastDishes.map((d) => (
                        <li key={d.dishId} className="flex items-center justify-between">
                          <span className="truncate">{d.title}</span>
                          <span className="shrink-0 tabular-nums text-muted">{d.count}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              <StatCard label={t.totalOpens} value={analytics.totalOpens} />

              <div className="rounded-2xl border border-border bg-surface p-4">
                <h3 className="mb-3 text-[11px] uppercase tracking-wider text-muted">{t.languageUsage}</h3>
                {analytics.languages.length === 0 ? (
                  <p className="text-sm text-muted">{t.noAnalytics}</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.languages.map((l) => (
                      <div key={l.language}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="uppercase">{l.language}</span>
                          <span className="text-muted">{l.percentage}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
                          <div className="h-full rounded-full bg-foreground" style={{ width: `${l.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {showNew && (
        <NewReservationModal today={today} onSave={handleSaveNew} onClose={() => setShowNew(false)} />
      )}
      {editTarget && (
        <EditReservationModal
          reservation={editTarget}
          onSave={(patch) => handleSaveEdit(editTarget.reservation_id, patch)}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-amber-700/50 bg-amber-600/20" : "border-border bg-surface"}`}>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

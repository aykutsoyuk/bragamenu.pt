"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/types";
import { MAX_PARTY_SIZE } from "@/lib/reservations/constants";
import ReservationMessage, { TypingIndicator } from "./ReservationMessage";
import ReservationSummary from "./ReservationSummary";
import TurnstileWidget, { isTurnstileEnabled } from "./TurnstileWidget";
import { getReservationCopy } from "./copy";

type Props = {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  locale: Locale;
  /** Static contact link (e.g. wa.me URL) shown in fail-safe mode. */
  restaurantWhatsapp?: string | null;
};

type Step =
  | "people"
  | "date"
  | "slots"
  | "name"
  | "phone"
  | "email"
  | "summary"
  | "submitting"
  | "done"
  | "error"
  | "failsafe";

type Message = { id: number; role: "assistant" | "user"; content: ReactNode };

const QUICK_GUESTS = [1, 2, 3, 4, 5, 6, 7, 8];
const DATE_CHIP_COUNT = 14;
const TYPING_MS = 650;

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  pt: "pt-PT",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function toDateValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default function ReservationChat({
  open,
  onClose,
  restaurantName,
  locale,
  restaurantWhatsapp,
}: Props) {
  const copy = getReservationCopy(locale);
  const intlLocale = INTL_LOCALE[locale];

  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("people");
  const [typing, setTyping] = useState(false);

  // Collected reservation data.
  const [people, setPeople] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [textValue, setTextValue] = useState("");
  const [showMoreGuests, setShowMoreGuests] = useState(false);
  // No single table fits → collect contact details for the owner to review.
  const [manualReview, setManualReview] = useState(false);
  // Whether the current date is full but could be offered for manual review.
  const [canManualReview, setCanManualReview] = useState(false);
  // Fail-safe mode (Sheets unreachable): collect a callback request instead.
  const [callbackMode, setCallbackMode] = useState(false);
  const [failsafePhone, setFailsafePhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const idRef = useRef(0);
  const mountedRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const nextId = () => ++idRef.current;

  const longDate = useCallback(
    (value: string): string => {
      const [y, m, d] = value.split("-").map(Number);
      return new Intl.DateTimeFormat(intlLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(y, m - 1, d)));
    },
    [intlLocale],
  );

  const appendUser = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", content: text }]);
  }, []);

  // Shows the typing indicator briefly, then appends one or more assistant
  // bubbles and (optionally) advances the step.
  const assistantTurn = useCallback(
    async (nodes: ReactNode[], nextStep?: Step) => {
      setTyping(true);
      await delay(TYPING_MS);
      if (!mountedRef.current) return;
      setTyping(false);
      setMessages((m) => [
        ...m,
        ...nodes.map((content) => ({
          id: nextId(),
          role: "assistant" as const,
          content,
        })),
      ]);
      if (nextStep) setStep(nextStep);
    },
    [],
  );

  const reset = useCallback(() => {
    idRef.current = 0;
    setMessages([]);
    setStep("people");
    setTyping(false);
    setPeople(null);
    setDate(null);
    setSlots([]);
    setTime(null);
    setName("");
    setPhone("");
    setEmail("");
    setTextValue("");
    setShowMoreGuests(false);
    setManualReview(false);
    setCanManualReview(false);
    setCallbackMode(false);
    setFailsafePhone("");
    setTurnstileToken("");
    void assistantTurn([copy.greeting(restaurantName)]);
  }, [assistantTurn, copy, restaurantName]);

  // Fail-safe entry: Sheets unreachable, so offer call/callback options.
  const enterFailsafe = useCallback(
    async (phone: string) => {
      setFailsafePhone(phone);
      setCallbackMode(false);
      await assistantTurn([copy.failsafeIntro], "failsafe");
    },
    [assistantTurn, copy],
  );

  // Seed the conversation when the sheet opens for the first time.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Seed the concierge greeting the first time the sheet opens. This is an
    // intentional initialization effect, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open && messages.length === 0) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll + Escape to close while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  // Focus the text input when a free-text step begins.
  useEffect(() => {
    if (step === "name" || step === "phone" || step === "email") {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step]);

  // --- Step handlers -------------------------------------------------------

  const handlePeople = useCallback(
    (n: number) => {
      appendUser(copy.guestUnit(n));
      setPeople(n);
      void assistantTurn([copy.askDate], "date");
    },
    [appendUser, assistantTurn, copy],
  );

  const fetchAvailability = useCallback(
    async (value: string, guests: number) => {
      try {
        const res = await fetch("/api/reservations/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ people: guests, date: value }),
        });

        if (res.status === 503) {
          // Sheets unreachable → fail-safe mode (never show fake availability).
          const body = (await res.json().catch(() => ({}))) as { phone?: string };
          await enterFailsafe(typeof body.phone === "string" ? body.phone : "");
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          open: boolean;
          full: boolean;
          manualReview: boolean;
          slots: string[];
        };

        if (data.manualReview) {
          // No single table fits, but capacity may allow combining tables: collect
          // contact details for the owner to review. Date is the "desired date".
          setSlots([]);
          setManualReview(true);
          await assistantTurn([copy.manualReviewIntro, copy.askName], "name");
          return;
        }
        if (!data.open) {
          setSlots([]);
          setCanManualReview(false);
          await assistantTurn([copy.closedDay], "slots");
          return;
        }
        if (data.full || data.slots.length === 0) {
          // Open but no free slot for this party — offer manual review alongside
          // trying another date (tables might be combined for them).
          setSlots([]);
          setCanManualReview(true);
          await assistantTurn([copy.noSlots], "slots");
          return;
        }
        setSlots(data.slots);
        setCanManualReview(false);
        await assistantTurn([copy.askSlot(longDate(value))], "slots");
      } catch {
        setSlots([]);
        await assistantTurn([copy.errorBody], "slots");
      }
    },
    [assistantTurn, copy, enterFailsafe, longDate],
  );

  const handleDate = useCallback(
    (value: string) => {
      appendUser(longDate(value));
      setDate(value);
      setTime(null);
      void (async () => {
        setTyping(true);
        await delay(TYPING_MS);
        if (!mountedRef.current) return;
        setTyping(false);
        await fetchAvailability(value, people ?? 1);
      })();
    },
    [appendUser, fetchAvailability, longDate, people],
  );

  const handleSlot = useCallback(
    (value: string) => {
      appendUser(value);
      setTime(value);
      void assistantTurn([copy.askName], "name");
    },
    [appendUser, assistantTurn, copy],
  );

  const showSummary = useCallback(
    async (guestName: string, introText?: string) => {
      const intro =
        introText ??
        (manualReview ? copy.manualReviewSummaryIntro : copy.summaryIntro);
      const summaryNode = (
        <div className="w-full">
          <p className="mb-2">{intro}</p>
          <ReservationSummary
            copy={copy}
            name={guestName}
            people={people ?? 1}
            dateLabel={date ? longDate(date) : ""}
            time={manualReview ? undefined : (time ?? "")}
          />
        </div>
      );
      await assistantTurn([summaryNode], "summary");
    },
    [assistantTurn, copy, date, manualReview, longDate, people, time],
  );

  // Full date → owner may still combine tables; collect contact for review.
  const startManualReview = useCallback(() => {
    appendUser(copy.requestManualReview);
    setManualReview(true);
    setCanManualReview(false);
    void assistantTurn([copy.manualReviewIntro, copy.askName], "name");
  }, [appendUser, assistantTurn, copy]);

  // Fail-safe → collect a callback request. If we already have the contact
  // details (failure at final submit), skip straight to the recap.
  const startCallback = useCallback(() => {
    setCallbackMode(true);
    setManualReview(false);
    if (name && phone && email) {
      void showSummary(name, copy.callbackSummaryIntro);
    } else {
      void assistantTurn([copy.askName], "name");
    }
  }, [assistantTurn, copy, email, name, phone, showSummary]);

  const submitText = useCallback(() => {
    const value = textValue.trim();

    if (step === "name") {
      if (value.length < 2 || value.length > 100) {
        void assistantTurn([copy.invalidName]);
        return;
      }
      appendUser(value);
      setName(value);
      setTextValue("");
      void assistantTurn([copy.askPhone], "phone");
      return;
    }

    if (step === "phone") {
      const digits = value.replace(/[^\d]/g, "");
      if (digits.length < 6 || digits.length > 15) {
        void assistantTurn([copy.invalidPhone]);
        return;
      }
      appendUser(value);
      setPhone(value);
      setTextValue("");
      void assistantTurn([copy.askEmail], "email");
      return;
    }

    if (step === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) {
        void assistantTurn([copy.invalidEmail]);
        return;
      }
      appendUser(value);
      setEmail(value);
      setTextValue("");
      // Pass the name directly so the summary reads correctly even before the
      // setName update has flushed.
      void showSummary(name);
    }
  }, [appendUser, assistantTurn, copy, name, showSummary, step, textValue]);

  const submitReservation = useCallback(async () => {
    if (!date || !people) return;
    const isReserve = !manualReview && !callbackMode;
    if (isReserve && !time) return;
    setStep("submitting");

    const base = { name, phone, email, people, date, turnstileToken, customer_language: locale };
    let endpoint: string;
    let payload: Record<string, unknown>;
    let successTitle: string;
    let successBody: string;
    if (callbackMode) {
      endpoint = "/api/reservations/callback";
      payload = { ...base, time: time ?? "" };
      successTitle = copy.callbackSuccessTitle;
      successBody = copy.callbackSuccessBody;
    } else if (manualReview) {
      endpoint = "/api/reservations/manual-review";
      payload = base;
      successTitle = copy.manualReviewSuccessTitle;
      successBody = copy.manualReviewSuccessBody;
    } else {
      endpoint = "/api/reservations";
      payload = { ...base, time };
      successTitle = copy.successTitle;
      successBody = copy.successBody;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        await assistantTurn(
          [
            <div key="success">
              <p className="font-display text-lg">{successTitle}</p>
              <p className="mt-1 text-muted">{successBody}</p>
            </div>,
          ],
          "done",
        );
        return;
      }

      if (res.status === 503) {
        // Sheets unreachable mid-flow → fail-safe (callback already is fail-safe).
        const body = (await res.json().catch(() => ({}))) as { phone?: string };
        setTurnstileToken("");
        await enterFailsafe(typeof body.phone === "string" ? body.phone : "");
        return;
      }

      if (isReserve && res.status === 409) {
        // Slot was taken between availability check and submit.
        setTime(null);
        setSlots([]);
        await assistantTurn([copy.slotTakenBody], "date");
        return;
      }

      throw new Error(String(res.status));
    } catch {
      // Clear the (now spent) Turnstile token so the retry gets a fresh one.
      setTurnstileToken("");
      await assistantTurn([copy.errorBody], "error");
    }
  }, [
    assistantTurn,
    callbackMode,
    copy,
    date,
    email,
    enterFailsafe,
    locale,
    manualReview,
    name,
    people,
    phone,
    time,
    turnstileToken,
  ]);

  if (!open) return null;

  // --- Render --------------------------------------------------------------

  // When Turnstile is configured, hold the submit until a token is issued.
  const turnstilePending = isTurnstileEnabled && turnstileToken.length === 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateChips = Array.from({ length: DATE_CHIP_COUNT }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      value: toDateValue(d),
      weekday: new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(d),
      day: d.getDate(),
      month: new Intl.DateTimeFormat(intlLocale, { month: "short" }).format(d),
    };
  });

  const guestChips = showMoreGuests
    ? Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1)
    : QUICK_GUESTS;

  const busy = typing || step === "submitting";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-[fade_200ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex h-[100dvh] w-full flex-col bg-background shadow-2xl animate-[sheet_280ms_cubic-bezier(0.22,1,0.36,1)] sm:h-[88dvh] sm:max-w-md sm:rounded-[1.5rem] sm:border sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            <p className="font-display text-lg font-medium leading-tight">
              {copy.title}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {copy.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-subtle hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {messages.map((m) => (
            <ReservationMessage key={m.id} role={m.role}>
              {m.content}
            </ReservationMessage>
          ))}
          {typing && <TypingIndicator label={copy.typing} />}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {step === "people" && (
            <div className="flex flex-wrap gap-2">
              {guestChips.map((n) => (
                <Chip key={n} disabled={busy} onClick={() => handlePeople(n)}>
                  {n}
                </Chip>
              ))}
              {!showMoreGuests && (
                <Chip disabled={busy} onClick={() => setShowMoreGuests(true)} subtle>
                  {copy.morePeople}
                </Chip>
              )}
            </div>
          )}

          {(step === "date" ||
            (step === "slots" && slots.length === 0)) && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {dateChips.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={busy}
                    onClick={() => handleDate(c.value)}
                    className="flex shrink-0 flex-col items-center rounded-2xl border border-border bg-surface px-3.5 py-2 transition-colors hover:bg-subtle disabled:opacity-50"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted">
                      {c.weekday}
                    </span>
                    <span className="text-lg font-medium leading-tight">{c.day}</span>
                    <span className="text-[10px] text-muted">{c.month}</span>
                  </button>
                ))}
              </div>
              {canManualReview && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={startManualReview}
                  className="h-11 w-full rounded-full border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-50"
                >
                  {copy.requestManualReview}
                </button>
              )}
            </div>
          )}

          {step === "slots" && slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <Chip key={s} disabled={busy} onClick={() => handleSlot(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          )}

          {step === "email" && (
            <p className="mb-2 px-1 text-xs leading-snug text-muted">
              {copy.emailWarning}
            </p>
          )}

          {(step === "name" || step === "phone" || step === "email") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!busy) submitText();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                inputMode={step === "phone" ? "tel" : step === "email" ? "email" : "text"}
                autoComplete={
                  step === "email" ? "email" : step === "phone" ? "tel" : "name"
                }
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={
                  step === "name"
                    ? copy.inputPlaceholderName
                    : step === "phone"
                      ? copy.inputPlaceholderPhone
                      : copy.inputPlaceholderEmail
                }
                className="h-12 flex-1 rounded-full border border-border bg-surface px-4 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
              <button
                type="submit"
                disabled={busy || textValue.trim().length === 0}
                aria-label={copy.send}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          )}

          {step === "summary" && (
            <div className="flex flex-col gap-2">
              <TurnstileWidget onToken={setTurnstileToken} />
              <button
                type="button"
                disabled={busy || turnstilePending}
                onClick={submitReservation}
                className="h-12 w-full rounded-full bg-accent text-[15px] font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {callbackMode
                  ? copy.callbackConfirm
                  : manualReview
                    ? copy.manualReviewConfirm
                    : copy.confirmRequest}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={reset}
                className="h-10 w-full rounded-full text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {copy.editDetails}
              </button>
            </div>
          )}

          {step === "submitting" && (
            <div className="flex h-12 items-center justify-center text-sm text-muted">
              {copy.submitting}
            </div>
          )}

          {step === "done" && (
            <button
              type="button"
              onClick={reset}
              className="h-12 w-full rounded-full border border-border bg-surface text-[15px] font-medium text-foreground transition-colors hover:bg-subtle"
            >
              {copy.startOver}
            </button>
          )}

          {step === "error" && (
            <div className="flex flex-col gap-2">
              <TurnstileWidget onToken={setTurnstileToken} />
              <button
                type="button"
                disabled={turnstilePending}
                onClick={submitReservation}
                className="h-12 w-full rounded-full bg-accent text-[15px] font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {copy.retry}
              </button>
            </div>
          )}

          {step === "failsafe" && (
            <div className="flex flex-col gap-2">
              {failsafePhone ? (
                <a
                  href={`tel:${failsafePhone}`}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-white"
                >
                  {copy.failsafeCall}
                </a>
              ) : (
                restaurantWhatsapp && (
                  <a
                    href={restaurantWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-white"
                  >
                    {copy.failsafeCall}
                  </a>
                )
              )}
              <button
                type="button"
                onClick={startCallback}
                className="h-12 w-full rounded-full border border-border bg-surface text-[15px] font-medium text-foreground transition-colors hover:bg-subtle"
              >
                {copy.failsafeCallback}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  onClick,
  disabled,
  subtle,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[3rem] rounded-full border px-4 py-2.5 text-[15px] font-medium transition-colors disabled:opacity-50 ${
        subtle
          ? "border-border bg-transparent text-muted hover:bg-subtle hover:text-foreground"
          : "border-border bg-surface text-foreground hover:border-accent hover:bg-subtle"
      }`}
    >
      {children}
    </button>
  );
}

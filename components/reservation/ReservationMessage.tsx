import type { ReactNode } from "react";

export type MessageRole = "assistant" | "user";

type Props = {
  role: MessageRole;
  children: ReactNode;
};

// A single chat bubble. Assistant messages sit left in a soft surface bubble;
// guest messages sit right in the accent colour — a concierge conversation,
// not a support ticket.
export default function ReservationMessage({ role, children }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-[bubble_220ms_ease-out]`}
    >
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-[1.25rem] rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[var(--shadow-card)]"
            : "max-w-[82%] rounded-[1.25rem] rounded-bl-md border border-border bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-foreground shadow-[var(--shadow-card)]"
        }
      >
        {children}
      </div>
    </div>
  );
}

// Three-dot "concierge is typing" indicator, styled as an assistant bubble.
export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex justify-start animate-[bubble_220ms_ease-out]">
      <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-md border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
        <span className="sr-only">{label}</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted animate-[typing_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 160}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

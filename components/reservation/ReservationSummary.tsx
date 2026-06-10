import type { ReservationCopy } from "./copy";

type Props = {
  copy: ReservationCopy;
  name: string;
  people: number;
  /** Pre-formatted, localized date label. */
  dateLabel: string;
  /** Omitted for large-group enquiries, which have no fixed seating time. */
  time?: string;
};

// Compact recap card shown before the guest confirms. Rendered inside an
// assistant bubble so it reads as part of the conversation.
export default function ReservationSummary({
  copy,
  name,
  people,
  dateLabel,
  time,
}: Props) {
  const rows: Array<[string, string]> = [
    [copy.labelName, name],
    [copy.labelGuests, copy.guestUnit(people)],
    [copy.labelDate, dateLabel],
    ...(time ? [[copy.labelTime, time] as [string, string]] : []),
  ];

  return (
    <dl className="mt-1 w-full overflow-hidden rounded-2xl border border-border bg-background/60">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex items-center justify-between gap-4 px-4 py-2.5 ${
            i > 0 ? "border-t border-border" : ""
          }`}
        >
          <dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt>
          <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

type Variant = "vegan" | "vegetarian" | "spicy" | "unavailable";

const STYLES: Record<Variant, string> = {
  vegan: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  vegetarian: "bg-lime-50 text-lime-700 ring-lime-100",
  spicy: "bg-orange-50 text-orange-700 ring-orange-100",
  unavailable: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

const DOT: Record<Variant, string> = {
  vegan: "•",
  vegetarian: "•",
  spicy: "•",
  unavailable: "·",
};

type Props = {
  variant: Variant;
  label: string;
};

export default function Badge({ variant, label }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset ${STYLES[variant]}`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {DOT[variant]}
      </span>
      {label}
    </span>
  );
}

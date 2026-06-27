import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">404</p>
      <h1 className="font-display mt-4 text-4xl font-medium sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
        The restaurant or page you&#39;re looking for doesn&#39;t exist.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
      >
        ← Back to home
      </Link>
    </main>
  );
}

export default function Loading() {
  return (
    <main
      aria-label="Loading page"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-12"
    >
      <div className="mb-8 space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-64 max-w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 h-5 w-40 animate-pulse rounded bg-slate-200" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="mb-3 h-12 animate-pulse rounded-lg bg-slate-100 last:mb-0"
          />
        ))}
      </div>
      <p className="sr-only">Loading GearGrid content…</p>
    </main>
  );
}

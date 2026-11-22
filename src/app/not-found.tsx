import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Error 404
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          We couldn’t find that page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          The link may be outdated, or the page may have moved. Head back to
          GearGrid to continue browsing equipment.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Go to home
        </Link>
      </section>
    </main>
  );
}

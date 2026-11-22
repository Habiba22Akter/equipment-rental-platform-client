"use client";

import Link from "next/link";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section
        aria-labelledby="error-title"
        className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-700">
          !
        </div>
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Something went wrong
        </p>
        <h1 id="error-title" className="text-2xl font-semibold text-slate-950">
          This page could not be loaded
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Please try again. If the problem continues, return to GearGrid and
          open the page again.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-slate-500">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

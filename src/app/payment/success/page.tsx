"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }
    fetch(`/api/payments/success?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-xl place-items-center px-5 py-12">
        <section className="w-full rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(11,31,26,0.4)]">
          {status === "loading" ? (
            <>
              <div className="mx-auto size-12 animate-pulse rounded-full bg-cream" />
              <h1 className="mt-5 text-[22px] font-bold">Confirming payment...</h1>
            </>
          ) : status === "success" ? (
            <>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime/50 text-ink"><CheckCircle2 className="size-7" /></span>
              <h1 className="mt-5 text-[28px] font-bold tracking-[-0.04em]">Payment successful</h1>
              <p className="mt-3 text-[13px] leading-6 text-ink/55">Your booking is confirmed and the transaction has been recorded.</p>
              <Link href="/customer/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream"><LayoutDashboard className="size-4" /> Go to dashboard</Link>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-[24px] font-bold">Payment could not be confirmed</h1>
              <p className="mt-3 text-[13px] text-ink/55">Please check your dashboard or contact support.</p>
              <Link href="/customer/dashboard" className="mt-6 inline-flex h-11 items-center rounded-xl border border-ink/10 px-5 text-[12px] font-semibold">Open dashboard</Link>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

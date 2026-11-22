import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-xl place-items-center px-5 py-12">
        <section className="w-full rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(11,31,26,0.4)]">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-cream text-ink/60">
            <ArrowLeft className="size-6" />
          </span>
          <h1 className="mt-5 text-[28px] font-bold tracking-[-0.04em]">Checkout cancelled</h1>
          <p className="mt-3 text-[13px] leading-6 text-ink/55">
            You were not charged. The pending booking will be cancelled when Stripe expires the checkout session.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/equipment" className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream">Back to equipment</Link>
            <Link href="/customer/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink/10 px-5 text-[12px] font-semibold">
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-xl place-items-center px-5 py-12">
        <section className="w-full rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center shadow-[0_30px_60px_-40px_rgba(11,31,26,0.4)]">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime/50 text-ink">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-5 text-[28px] font-bold tracking-[-0.04em]">Thank you for your payment</h1>
          <p className="mt-3 text-[13px] leading-6 text-ink/55">
            Stripe is confirming your payment. Your booking status will update in the dashboard after the server receives the confirmation.
          </p>
          <Link href="/customer/dashboard" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream">
            <LayoutDashboard className="size-4" /> Go to dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}

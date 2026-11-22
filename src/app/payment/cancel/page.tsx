import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { PaymentCancelDetails } from "./cancel-details";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-2xl place-items-center px-5 py-12">
        <Suspense fallback={<section className="w-full rounded-[28px] bg-white p-8 text-center text-sm text-ink/50">Loading booking details…</section>}>
          <PaymentCancelDetails />
        </Suspense>
      </main>
    </div>
  );
}

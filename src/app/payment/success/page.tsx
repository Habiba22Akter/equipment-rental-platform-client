import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { PaymentSuccessDetails } from "./success-details";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-2xl place-items-center px-5 py-12">
        <Suspense
          fallback={(
            <section className="w-full animate-pulse rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center text-sm text-ink/50">
              Loading payment details…
            </section>
          )}
        >
          <PaymentSuccessDetails />
        </Suspense>
      </main>
    </div>
  );
}

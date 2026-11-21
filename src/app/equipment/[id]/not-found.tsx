import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

export default function EquipmentNotFound() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <main className="grid min-h-[70dvh] place-items-center px-5 py-16">
        <section className="w-full max-w-lg rounded-[28px] border border-ink/[0.08] bg-white p-8 text-center shadow-[0_24px_60px_-48px_rgba(11,31,26,0.4)] sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-cream text-ink/60">
            <PackageSearch className="size-6" />
          </span>
          <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Listing unavailable</p>
          <h1 className="mt-2 text-[25px] font-bold tracking-[-0.04em]">We couldn’t find that equipment.</h1>
          <p className="mx-auto mt-3 max-w-sm text-[12px] leading-6 text-ink/50">
            The listing may have been removed or the link may be incomplete. Browse the marketplace to find another item.
          </p>
          <Link href="/equipment" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-[11px] font-semibold text-cream transition hover:bg-ink-soft">
            <ArrowLeft className="size-3.5" />
            Back to equipment
          </Link>
        </section>
      </main>
    </div>
  );
}

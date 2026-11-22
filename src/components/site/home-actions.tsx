"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { normalizeRole } from "@/lib/roles";

export function HomeActions() {
  const { data: session } = useSession();
  const isOwner = normalizeRole(session?.user?.role) === "Owner";
  const ownerHref = isOwner ? "/owner/dashboard?tab=listings" : "/signup?role=Owner";

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Link
        href="/equipment"
        className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-[13.5px] font-semibold text-cream shadow-[0_16px_32px_-18px_rgba(11,31,26,0.85)] transition hover:bg-ink-soft"
      >
        Start renting
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
      <Link
        href={ownerHref}
        className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/12 bg-white px-6 text-[13.5px] font-semibold text-ink/70 transition hover:border-ink/25 hover:text-ink"
      >
        List your equipment
        <ArrowUpRight className="size-4 text-ink/35 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink/[0.06] bg-cream">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-4 px-5 py-7 text-center text-[11.5px] text-ink/40 sm:flex-row sm:px-7 sm:text-left lg:px-10">
        <p>© 2026 GearGrid. Built for people who make things.</p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/signin" className="transition hover:text-ink">Sign in</Link>
          <Link href="/signup" className="transition hover:text-ink">Create account</Link>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Secure by design
          </span>
        </div>
      </div>
    </footer>
  );
}

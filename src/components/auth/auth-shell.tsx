import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { BrandMark } from "./brand-mark";

type AuthMode = "signin" | "signup";

type AuthShellProps = {
  mode: AuthMode;
  children: ReactNode;
};

const panelCopy: Record<AuthMode, { eyebrow: string; title: ReactNode; description: string }> = {
  signin: {
    eyebrow: "Welcome back",
    title: (
      <>
        Good gear is <span className="font-serif italic text-lime">waiting</span> for you.
      </>
    ),
    description:
      "Sign in to manage bookings, track active rentals and keep every project moving — without the back-and-forth.",
  },
  signup: {
    eyebrow: "Join the marketplace",
    title: (
      <>
        Turn downtime into <span className="font-serif italic text-lime">uptime.</span>
      </>
    ),
    description:
      "List the equipment you already own, reach trusted renters and earn more from the gear sitting in your garage.",
  },
};

const features = [
  { icon: ShieldCheck, label: "Verified owners and insured rentals" },
  { icon: CalendarDays, label: "Flexible daily, weekly and monthly rates" },
  { icon: Zap, label: "Secure payments with instant confirmation" },
];

const people = [
  { initials: "AR", color: "#f3c48b" },
  { initials: "MK", color: "#a7d7c5" },
  { initials: "SN", color: "#c9f45b" },
];

export function AuthShell({ mode, children }: AuthShellProps) {
  const copy = panelCopy[mode];

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="min-h-dvh lg:grid lg:grid-cols-[1.06fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-ink p-10 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:self-start xl:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="auth-grid absolute inset-0" />
            <div className="absolute -left-24 top-1/4 size-72 rounded-full bg-lime/10 blur-[100px]" />
            <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-emerald-400/10 blur-[120px]" />
            <div className="absolute right-10 top-10 size-40 rounded-full border border-white/[0.06]" />
            <div className="absolute right-16 top-16 size-24 rounded-full border border-white/[0.06]" />
          </div>

          <div className="relative z-10">
            <BrandMark tone="light" />
          </div>

          <div className="relative z-10 mt-auto pt-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-white/60 uppercase">
              <span className="size-1.5 rounded-full bg-lime shadow-[0_0_0_3px_rgba(201,244,91,0.15)]" />
              {copy.eyebrow}
            </span>

            <h2 className="mt-5 max-w-[520px] text-[2.45rem] leading-[1.06] font-semibold tracking-[-0.045em] text-white xl:text-[2.85rem]">
              {copy.title}
            </h2>

            <p className="mt-5 max-w-[430px] text-[14px] leading-7 text-white/50">
              {copy.description}
            </p>

            <ul className="mt-8 space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[13px] text-white/65">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-lime">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-9">
            <div className="animate-auth-float rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-md xl:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime text-ink">
                    <Wrench className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Makita Rotary Hammer</p>
                    <p className="mt-0.5 text-[11px] text-white/40">Power tools · Dhaka</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-lime/10 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-lime uppercase">
                  Available
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-white/[0.08] pt-3.5">
                <div className="flex items-center gap-1.5 text-[10.5px] text-white/45">
                  <CalendarDays className="size-3.5" />
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-white/60">Nov 24</span>
                  <ArrowRight className="size-3" />
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-white/60">Nov 27</span>
                </div>
                <p className="text-[17px] font-semibold text-white">
                  $24
                  <span className="text-[10px] font-normal text-white/35">/day</span>
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {people.map((person) => (
                  <span
                    key={person.initials}
                    style={{ backgroundColor: person.color }}
                    className="grid size-8 place-items-center rounded-full border-2 border-ink text-[9px] font-extrabold text-ink"
                  >
                    {person.initials}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-lime">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-current" />
                  ))}
                  <span className="ml-1.5 text-[10.5px] font-semibold text-white/60">4.9 / 5</span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-white/35">
                  Loved by 12,000+ renters &amp; owners
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-dvh min-w-0 flex-col px-5 pt-6 pb-7 sm:px-8 lg:min-h-0 lg:px-12 lg:pt-8 lg:pb-8 xl:px-20">
          <header className="flex items-center justify-between gap-4">
            <BrandMark className="lg:hidden" />
            <p className="hidden text-[12px] text-ink/40 lg:block">
              A calmer way to rent equipment.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-1 text-[12px] font-semibold text-ink/55 transition-colors hover:text-ink"
            >
              Back to home
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </header>

          <div className="my-auto w-full max-w-[432px] self-center py-10 lg:py-12">{children}</div>

          <footer className="flex flex-col items-center justify-between gap-1.5 text-[11px] text-ink/35 sm:flex-row">
            <p>© 2026 GearGrid. All rights reserved.</p>
            <p>Secure payments · Verified owners</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

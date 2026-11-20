import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Drill,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tractor,
  Truck,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

const categories = [
  { icon: Drill, name: "Power tools", count: "480+ listings" },
  { icon: Tractor, name: "Heavy machinery", count: "210+ listings" },
  { icon: Camera, name: "Cameras & drones", count: "360+ listings" },
  { icon: PartyPopper, name: "Event & audio", count: "190+ listings" },
];

const steps = [
  {
    icon: Search,
    title: "Find the right gear",
    description: "Filter by category, dates and location. Every owner is verified before a listing goes live.",
  },
  {
    icon: CalendarCheck,
    title: "Book your dates",
    description: "Pick the days you need, confirm the rate and pay securely through the platform.",
  },
  {
    icon: CheckCircle2,
    title: "Pick up and build",
    description: "Collect the equipment, finish the job and leave a review for the next renter.",
  },
];

const ownerBenefits = [
  { icon: Wallet, label: "Set your own daily, weekly or monthly rate" },
  { icon: ShieldCheck, label: "Damage cover and verified renter profiles" },
  { icon: Truck, label: "Choose pickup or local delivery for each listing" },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-24 size-[34rem] rounded-full bg-lime/25 blur-[120px]" />
            <div className="absolute top-56 -left-40 size-[28rem] rounded-full bg-emerald-300/15 blur-[110px]" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1180px] items-center gap-14 px-5 pt-16 pb-20 sm:px-7 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pt-24 lg:pb-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10.5px] font-bold tracking-[0.16em] text-ink/55 uppercase shadow-[0_1px_2px_rgba(11,31,26,0.03)] backdrop-blur">
                <span className="size-1.5 rounded-full bg-lime-strong" />
                The equipment rental marketplace
              </span>

              <h1 className="mt-6 max-w-[620px] text-[2.7rem] leading-[0.98] font-semibold tracking-[-0.055em] sm:text-[3.5rem] lg:text-[4.05rem]">
                Rent the gear.
                <br />
                Build the{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-ink/75">
                  thing.
                </span>
              </h1>

              <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-ink/55 sm:text-[16px]">
                From a single drill to a full site setup — find trusted equipment from verified
                owners, book it for exactly the days you need, and get back to work.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-6 text-[13.5px] font-semibold text-cream shadow-[0_16px_32px_-18px_rgba(11,31,26,0.85)] transition hover:bg-ink-soft"
                >
                  Start renting
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/12 bg-white px-6 text-[13.5px] font-semibold text-ink/70 transition hover:border-ink/25 hover:text-ink"
                >
                  List your equipment
                  <ArrowUpRight className="size-4 text-ink/35 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11.5px] font-medium text-ink/45">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-700" />
                  Verified owners
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-4 text-ink/35" />
                  Transparent daily rates
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  4.9 average rating
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[460px] lg:mx-0 lg:ml-auto">
              <div className="absolute inset-x-6 top-8 bottom-8 -rotate-2 rounded-[2rem] border border-ink/[0.06] bg-white/45" />

              <div className="relative rounded-[1.75rem] border border-ink/[0.08] bg-white p-5 shadow-[0_32px_70px_-40px_rgba(11,31,26,0.4)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-ink text-lime">
                      <Drill className="size-5" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold tracking-[-0.01em]">Makita Rotary Hammer</p>
                      <p className="mt-0.5 text-[11px] text-ink/40">Power tools · Dhaka</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-emerald-700 uppercase">
                    Available
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-[9.5px] font-bold tracking-[0.12em] text-ink/35 uppercase">
                      Daily rate
                    </p>
                    <p className="mt-1 text-[20px] font-bold tracking-[-0.04em]">
                      $24<span className="text-[10.5px] font-normal text-ink/35">/day</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-[9.5px] font-bold tracking-[0.12em] text-ink/35 uppercase">
                      Deposit
                    </p>
                    <p className="mt-1 text-[20px] font-bold tracking-[-0.04em]">
                      $40<span className="text-[10.5px] font-normal text-ink/35"> refundable</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/[0.07] px-3.5 py-3">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-ink/55">
                    <CalendarCheck className="size-4 text-ink/35" />
                    Nov 24 — Nov 27
                  </div>
                  <span className="text-[10.5px] font-semibold text-ink/40">3 days</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {["AR", "MK", "SN"].map((initials, index) => (
                      <span
                        key={initials}
                        className="grid size-7 place-items-center rounded-full border-2 border-white text-[8.5px] font-extrabold text-ink"
                        style={{
                          backgroundColor: ["#f3c48b", "#a7d7c5", "#c9f45b"][index],
                        }}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink/50">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    4.9 (86 reviews)
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-3 hidden items-center gap-2.5 rounded-2xl border border-ink/[0.08] bg-white p-3 pr-4 shadow-[0_20px_40px_-24px_rgba(11,31,26,0.45)] sm:flex">
                <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-[11.5px] font-bold">Payment protected</p>
                  <p className="text-[10px] text-ink/40">Released after pickup</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="border-y border-ink/[0.06] bg-white/55">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-7 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
                  Browse by category
                </p>
                <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em]">
                  Whatever the job needs
                </h2>
              </div>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink/55 transition hover:text-ink"
              >
                See all equipment
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ icon: Icon, name, count }) => (
                <Link
                  key={name}
                  href="/signup"
                  className="group rounded-2xl border border-ink/[0.08] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_18px_36px_-28px_rgba(11,31,26,0.5)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-cream text-ink/70 transition group-hover:bg-ink group-hover:text-lime">
                      <Icon className="size-[18px]" />
                    </span>
                    <ArrowUpRight className="size-4 text-ink/20 transition group-hover:text-ink/50" />
                  </div>
                  <p className="mt-4 text-[13.5px] font-semibold">{name}</p>
                  <p className="mt-1 text-[11px] text-ink/40">{count}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 lg:px-10">
          <div className="max-w-[540px]">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
              How it works
            </p>
            <h2 className="mt-2 text-[2rem] leading-tight font-semibold tracking-[-0.045em] sm:text-[2.35rem]">
              Three steps from search to site.
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-ink/50">
              No phone tag, no unclear rates. Just a clean booking flow built around the dates you
              actually need.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="relative rounded-2xl border border-ink/[0.08] bg-white p-6"
              >
                <span className="absolute top-5 right-5 font-mono text-[11px] font-semibold text-ink/20">
                  0{index + 1}
                </span>
                <span className="grid size-10 place-items-center rounded-xl bg-ink text-lime">
                  <Icon className="size-[18px]" />
                </span>
                <h3 className="mt-5 text-[14px] font-bold tracking-[-0.01em]">{title}</h3>
                <p className="mt-2 text-[12.5px] leading-6 text-ink/50">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="for-owners" className="px-5 pb-20 sm:px-7 lg:px-10">
          <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-14">
            <div aria-hidden="true" className="absolute inset-0">
              <div className="auth-grid absolute inset-0 opacity-60" />
              <div className="absolute -top-24 right-10 size-80 rounded-full bg-lime/10 blur-[100px]" />
              <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-emerald-400/10 blur-[110px]" />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white/55 uppercase">
                  <span className="size-1.5 rounded-full bg-lime" />
                  For owners
                </span>
                <h2 className="mt-5 max-w-[560px] text-[2rem] leading-[1.03] font-semibold tracking-[-0.045em] sm:text-[2.55rem]">
                  Your gear is sitting idle.{" "}
                  <span className="font-serif font-normal italic text-lime">Put it to work.</span>
                </h2>
                <p className="mt-4 max-w-[520px] text-[13.5px] leading-7 text-white/50">
                  List equipment in minutes, set your own rates and choose when it is available.
                  You keep control of every booking.
                </p>
              </div>

              <div className="space-y-3">
                {ownerBenefits.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-lime/10 text-lime">
                      <Icon className="size-4" />
                    </span>
                    <p className="text-[12.5px] text-white/65">{label}</p>
                  </div>
                ))}
                <Link
                  href="/signup"
                  className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-lime text-[13px] font-bold text-ink transition hover:bg-lime-strong"
                >
                  Create an owner account
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/[0.06]">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-4 px-5 py-8 text-[11.5px] text-ink/40 sm:flex-row sm:px-7 lg:px-10">
          <p>© 2026 GearGrid. Built for people who make things.</p>
          <div className="flex items-center gap-5">
            <Link href="/signin" className="transition hover:text-ink">
              Sign in
            </Link>
            <Link href="/signup" className="transition hover:text-ink">
              Create account
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Secure by design
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Camera,
  CheckCircle2,
  CarFront,
  HardHat,
  Monitor,
  PartyPopper,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
  Wheat,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { HomeActions } from "@/components/site/home-actions";
import { MotionDiv, MotionSection } from "@/components/site/motion";
import { auth } from "@/lib/auth";
import { getFeaturedEquipment } from "@/lib/equipment";

export const instant = false;

const categories = [
  { icon: HardHat, name: "Construction Equipment" },
  { icon: Camera, name: "Photography Equipment" },
  { icon: CarFront, name: "Vehicles & Transportation" },
  { icon: Wheat, name: "Agriculture Equipment" },
  { icon: Monitor, name: "Electronics" },
  { icon: PartyPopper, name: "Event Equipment" },
];

const benefits = [
  {
    icon: Wallet,
    title: "Affordable rental prices",
    description: "Compare transparent rates from local owners and pay only for the time you need.",
  },
  {
    icon: ShieldCheck,
    title: "Verified equipment owners",
    description: "Every approved listing comes from an owner reviewed by our marketplace team.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible rental periods",
    description: "Choose daily, weekly or monthly rentals that fit your schedule and budget.",
  },
  {
    icon: CheckCircle2,
    title: "Secure payments",
    description: "Your booking and payment details stay protected from checkout to pickup.",
  },
];

const reviews = [
  {
    name: "Nadia Rahman",
    role: "Event producer",
    rating: 5,
    comment: "Found a complete sound setup for our event in minutes. The owner was helpful and the equipment was exactly as described.",
  },
  {
    name: "Arif Hossain",
    role: "Independent contractor",
    rating: 5,
    comment: "The clear daily rates made it easy to compare options. I saved money and got the right tools for a weekend project.",
  },
  {
    name: "Maya Chen",
    role: "Content creator",
    rating: 4,
    comment: "The camera listing had great photos and accurate details. Pickup was smooth, simple and right on schedule.",
  },
  {
    name: "Karim Ahmed",
    role: "Small farm owner",
    rating: 5,
    comment: "I rented a tiller for the season without committing to a purchase. GearGrid made the whole process feel trustworthy.",
  },
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

export default async function HomePage() {
  const [session, featuredEquipment] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getFeaturedEquipment(),
  ]);
  const isLoggedIn = Boolean(session?.user);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />

      <main>
        <MotionSection className="relative overflow-hidden">
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

              <HomeActions />

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

            <div className="relative mx-auto w-full max-w-[500px] lg:mx-0 lg:ml-auto">
              <div className="absolute inset-5 -rotate-3 rounded-[2rem] bg-lime/35" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white p-2 shadow-[0_32px_70px_-40px_rgba(11,31,26,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=90"
                  alt="Professional equipment ready to rent"
                  className="h-[390px] w-full rounded-[1.5rem] object-cover sm:h-[470px]"
                />
                <div className="absolute right-6 bottom-6 left-6 rounded-2xl border border-white/30 bg-ink/85 p-4 text-white backdrop-blur-md">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-lime uppercase">
                    Ready when you are
                  </p>
                  <p className="mt-1 text-[15px] font-semibold">Quality gear. Clear rates. Less hassle.</p>
                </div>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection id="featured-equipment" className="border-y border-ink/[0.06] bg-white/55">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-7 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
                  Featured equipment
                </p>
                <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em]">
                  Trusted gear for every project
                </h2>
                <p className="mt-2 max-w-[520px] text-[13px] leading-6 text-ink/50">
                  Browse approved equipment from reliable owners and find what you need for the job.
                </p>
              </div>
            </div>

            {featuredEquipment.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredEquipment.map((equipment) => (
                  <MotionDiv
                    key={equipment.id}
                    className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-white shadow-[0_18px_36px_-30px_rgba(11,31,26,0.45)]"
                  >
                    <div className="relative h-52 bg-cream">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        className="size-full object-cover"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink/65 backdrop-blur">
                        Approved
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.12em] text-ink/35 uppercase">
                            {equipment.category}
                          </p>
                          <h3 className="mt-1 text-[15px] font-bold tracking-[-0.02em]">
                            {equipment.name}
                          </h3>
                        </div>
                        <p className="shrink-0 text-[14px] font-bold">
                          ৳{equipment.dailyRate}
                          <span className="text-[10px] font-normal text-ink/40">/day</span>
                        </p>
                      </div>
                      <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-ink/50">
                        {equipment.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-medium text-ink/40">{equipment.location}</span>
                        <Link
                          href={isLoggedIn ? `/equipment/${equipment.id}` : "/signin"}
                          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[11px] font-semibold text-cream transition hover:bg-ink-soft"
                        >
                          View Details
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center">
                <p className="text-sm font-semibold text-ink/70">No approved equipment yet.</p>
                <p className="mt-1 text-xs text-ink/45">Check back soon for new listings.</p>
              </div>
            )}
          </div>
        </MotionSection>

        <MotionSection id="categories" className="border-y border-ink/[0.06] bg-white/55">
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
                href="/equipment"
                className="group inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink/55 transition hover:text-ink"
              >
                See all equipment
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map(({ icon: Icon, name }) => (
                <MotionDiv
                  key={name}
                  className="group rounded-2xl border border-ink/[0.08] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_18px_36px_-28px_rgba(11,31,26,0.5)]"
                >
                  <Link href={`/equipment?category=${encodeURIComponent(name)}`} className="block">
                    <div className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-xl bg-cream text-ink/70 transition group-hover:bg-ink group-hover:text-lime">
                        <Icon className="size-[18px]" />
                      </span>
                      <ArrowUpRight className="size-4 text-ink/20 transition group-hover:text-ink/50" />
                    </div>
                    <p className="mt-4 text-[13.5px] font-semibold">{name}</p>
                    <p className="mt-1 text-[11px] text-ink/40">Browse available gear</p>
                  </Link>
                </MotionDiv>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="why-choose-us" className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 lg:px-10">
          <div className="max-w-[600px]">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
              Why choose GearGrid
            </p>
            <h2 className="mt-2 text-[2rem] leading-tight font-semibold tracking-[-0.045em] sm:text-[2.35rem]">
              Everything you need to rent with confidence.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <MotionDiv key={title} className="rounded-2xl border border-ink/[0.08] bg-white p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-ink text-lime">
                  <Icon className="size-[18px]" />
                </span>
                <h3 className="mt-5 text-[14px] font-bold">{title}</h3>
                <p className="mt-2 text-[12.5px] leading-6 text-ink/50">{description}</p>
              </MotionDiv>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="how-it-works" className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 lg:px-10">
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
              <MotionDiv
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
              </MotionDiv>
            ))}
          </div>
        </MotionSection>

        <MotionSection id="customer-reviews" className="border-y border-ink/[0.06] bg-white/55">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
                Customer reviews
              </p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.045em]">
                Good gear. Great experiences.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime/40 px-3 py-2 text-[12px] font-bold text-ink">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              4.9 average rating
            </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map(({ name, role, rating, comment }) => (
              <MotionDiv key={name} className="rounded-2xl border border-ink/[0.08] bg-white p-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, index) => (
                    <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-[12.5px] leading-6 text-ink/60">“{comment}”</p>
                <div className="mt-5 border-t border-ink/[0.07] pt-4">
                  <p className="text-[12.5px] font-bold">{name}</p>
                  <p className="mt-1 text-[10.5px] text-ink/40">{role}</p>
                </div>
              </MotionDiv>
            ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="for-owners" className="px-5 pb-20 sm:px-7 lg:px-10">
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
                  href="/signup?role=Owner"
                  className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-lime text-[13px] font-bold text-ink transition hover:bg-lime-strong"
                >
                  Create an owner account
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>
      </main>

    </div>
  );
}

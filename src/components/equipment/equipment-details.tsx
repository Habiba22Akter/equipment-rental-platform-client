"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  Info,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeRole } from "@/lib/roles";
import type { EquipmentDetails as Equipment, EquipmentReview } from "@/lib/equipment";

type EquipmentDetailsProps = {
  equipment: Equipment;
  reviews: EquipmentReview[];
  role: string;
};

export function EquipmentDetails({ equipment, reviews, role }: EquipmentDetailsProps) {
  const isCustomer = normalizeRole(role) === "Customer";
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isCustomer) return;

    const controller = new AbortController();
    fetch(`/api/favorites?equipmentId=${equipment.id}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { favorite?: boolean };
        setIsFavorite(Boolean(data.favorite));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [equipment.id, isCustomer]);

  useEffect(() => {
    if (!isBookingOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsBookingOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isBookingOpen]);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  }, [startDate, endDate]);

  const rentalUnits = useMemo(() => {
    if (!rentalDays) return 0;
    if (equipment.rentalType === "Monthly") return Math.ceil(rentalDays / 30);
    if (equipment.rentalType === "Weekly") return Math.ceil(rentalDays / 7);
    return rentalDays;
  }, [equipment.rentalType, rentalDays]);

  const rentalRate =
    equipment.rentalType === "Monthly"
      ? equipment.monthlyRate
      : equipment.rentalType === "Weekly"
        ? equipment.weeklyRate
        : equipment.dailyRate;
  const total = rentalUnits * rentalRate * quantity;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const available = equipment.availableQuantity > 0;

  async function toggleFavorite() {
    if (!isCustomer || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const response = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId: equipment.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not update favorites.");

      setIsFavorite(method === "POST");
      toast.success(method === "POST" ? "Saved to your favorites." : "Removed from favorites.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update favorites.");
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCustomer || !total || isSubmitting) return;
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment.id,
          startDate,
          endDate,
          quantity,
          contactNumber: form.get("contactNumber"),
          deliveryAddress: form.get("deliveryAddress"),
          additionalNotes: form.get("additionalNotes"),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Could not start payment.");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start payment.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-6 sm:px-7 lg:px-10 lg:pb-20 lg:pt-9">
      <Link
        href="/equipment"
        className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-[12px] font-semibold text-ink/55 transition hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to equipment
      </Link>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:gap-8">
        <div className="min-w-0">
          <section className="relative overflow-hidden rounded-[26px] border border-ink/[0.08] bg-white p-2 shadow-[0_24px_60px_-48px_rgba(11,31,26,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="h-[290px] w-full rounded-[20px] bg-cream object-cover sm:h-[390px] lg:h-[470px]"
            />
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 sm:bottom-7 sm:left-7">
              <span className="rounded-full border border-white/50 bg-cream/90 px-3 py-1.5 text-[10px] font-bold text-ink/75 shadow-sm backdrop-blur">
                {equipment.category}
              </span>
              <span className="rounded-full border border-white/50 bg-cream/90 px-3 py-1.5 text-[10px] font-bold text-ink/75 shadow-sm backdrop-blur">
                {equipment.rentalType} rental
              </span>
            </div>
            {isCustomer ? (
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={isFavoriteLoading}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                className={`absolute top-5 right-5 grid size-11 place-items-center rounded-full border shadow-sm backdrop-blur transition disabled:opacity-60 ${
                  isFavorite
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-white/60 bg-white/90 text-ink/60 hover:text-rose-600"
                }`}
              >
                <Heart className={`size-[18px] ${isFavorite ? "fill-current" : ""}`} />
              </button>
            ) : null}
          </section>

          <section className="mt-6 rounded-[24px] border border-ink/[0.08] bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.18em] text-ink/40 uppercase">
                  Equipment details
                </p>
                <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.05em] sm:text-[2.65rem]">
                  {equipment.name}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-ink/50">
                  <MapPin className="size-4 shrink-0 text-ink/40" />
                  {equipment.location}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-2">
                <Stars rating={averageRating} />
                <span className="text-[11px] font-bold">{reviews.length ? averageRating.toFixed(1) : "New"}</span>
                <span className="text-[10px] text-ink/40">{reviews.length ? `(${reviews.length})` : "listing"}</span>
              </div>
            </div>

            <div className="my-6 h-px bg-ink/[0.07]" />

            <div className="grid gap-3 sm:grid-cols-3">
              <FactCard icon={Package} label="Available" value={`${equipment.availableQuantity} unit${equipment.availableQuantity === 1 ? "" : "s"}`} />
              <FactCard icon={Clock3} label="Rental period" value={equipment.rentalType} />
              <FactCard icon={MapPin} label="Pickup area" value={equipment.location} />
            </div>

            <div className="mt-7">
              <h2 className="text-[16px] font-bold tracking-[-0.02em]">About this equipment</h2>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-7 text-ink/60">
                {equipment.description}
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-ink/[0.08] bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/40 text-ink">
                <ShieldCheck className="size-[18px]" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold">Rental terms and conditions</h2>
                <p className="mt-2 whitespace-pre-line text-[12.5px] leading-6 text-ink/55">
                  {equipment.terms}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-ink/[0.08] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-ink/35 uppercase">Renter feedback</p>
                <h2 className="mt-1 text-[17px] font-bold">Reviews</h2>
              </div>
              {reviews.length ? (
                <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-2">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-[12px] font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-[10px] text-ink/40">{reviews.length} reviews</span>
                </div>
              ) : null}
            </div>

            {reviews.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-ink/[0.07] bg-cream/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-bold text-lime">
                          {getInitials(review.customerName)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold">{review.customerName}</p>
                          <p className="text-[9px] text-ink/40">{formatReviewDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    {review.comment ? <p className="mt-3 text-[11.5px] leading-5 text-ink/55">{review.comment}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-ink/15 bg-cream/40 p-5 text-center text-[12px] leading-5 text-ink/45">
                No reviews yet. Renters can share feedback after completing a rental.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-[24px] border border-ink/[0.08] bg-white p-5 shadow-[0_24px_60px_-48px_rgba(11,31,26,0.4)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-ink/40 uppercase">Rental rate</p>
                <p className="mt-1 text-[2rem] font-bold tracking-[-0.055em]">
                  {formatPrice(rentalRate)}
                  <span className="ml-1 text-[12px] font-semibold tracking-normal text-ink/40">/ {equipment.rentalType.toLowerCase()}</span>
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${available ? "bg-lime/40 text-ink" : "bg-rose-50 text-rose-700"}`}>
                <span className={`size-1.5 rounded-full ${available ? "bg-emerald-600" : "bg-rose-500"}`} />
                {available ? "Available" : "Out of stock"}
              </span>
            </div>

            <div className="my-5 h-px bg-ink/[0.07]" />

            <div className="flex items-center gap-3 rounded-2xl bg-cream/75 p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-lime">
                <UserRound className="size-[17px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold tracking-[0.12em] text-ink/40 uppercase">Equipment owner</p>
                <p className="mt-0.5 truncate text-[12px] font-bold">{equipment.owner.name}</p>
                {equipment.owner.email ? (
                  <a href={`mailto:${equipment.owner.email}`} className="mt-1 flex items-center gap-1 text-[10px] text-ink/45 hover:text-ink">
                    <Mail className="size-3" />
                    <span className="truncate">{equipment.owner.email}</span>
                  </a>
                ) : null}
              </div>
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-label="Owner listed" />
            </div>

            {isCustomer ? (
              <button
                type="button"
                disabled={!available}
                onClick={() => setIsBookingOpen(true)}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[12px] font-bold text-cream shadow-[0_14px_28px_-18px_rgba(11,31,26,0.85)] transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-45"
              >
                Book this equipment
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <div className="mt-5 flex gap-2.5 rounded-xl border border-ink/[0.07] bg-cream/60 p-3.5">
                <Info className="mt-0.5 size-4 shrink-0 text-ink/45" />
                <p className="text-[10.5px] leading-5 text-ink/55">
                  {normalizeRole(role) === "Owner"
                    ? "You are viewing this listing as an equipment owner. Customer accounts can book and save equipment."
                    : "You are viewing this listing as an admin. Customer accounts can book and save equipment."}
                </p>
              </div>
            )}

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-ink/40">
              <ShieldCheck className="size-3.5" /> Secure checkout powered by Stripe
            </p>
          </section>

          <section className="rounded-[22px] border border-ink/[0.08] bg-ink p-5 text-cream">
            <p className="text-[9px] font-bold tracking-[0.16em] text-lime/80 uppercase">Clear rental details</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2.5 text-[10.5px] text-cream/75"><Check className="size-3.5 text-lime" />Total is calculated before payment</li>
              <li className="flex items-center gap-2.5 text-[10.5px] text-cream/75"><Check className="size-3.5 text-lime" />Availability is checked for your dates</li>
              <li className="flex items-center gap-2.5 text-[10.5px] text-cream/75"><Check className="size-3.5 text-lime" />Payment handled through Stripe Checkout</li>
            </ul>
          </section>
        </aside>
      </div>

      {isBookingOpen && isCustomer ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsBookingOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="booking-title" className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[26px] border border-white/40 bg-cream p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-ink/40 uppercase">Secure reservation</p>
                <h2 id="booking-title" className="mt-1 text-[22px] font-bold tracking-[-0.04em]">Book {equipment.name}</h2>
                <p className="mt-1 text-[11px] text-ink/50">Choose your dates and quantity to see the estimate.</p>
              </div>
              <button type="button" onClick={() => setIsBookingOpen(false)} aria-label="Close booking form" className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/10 bg-white text-ink/60 transition hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={submitBooking} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rental start date" name="startDate">
                  <input id="startDate" name="startDate" required type="date" value={startDate} min={todayLocal()} onChange={(event) => setStartDate(event.target.value)} />
                </Field>
                <Field label="Rental end date" name="endDate">
                  <input id="endDate" name="endDate" required type="date" value={endDate} min={startDate || todayLocal()} onChange={(event) => setEndDate(event.target.value)} />
                </Field>
                <Field label={`Required quantity (max ${equipment.availableQuantity})`} name="quantity">
                  <input id="quantity" name="quantity" required type="number" min={1} max={equipment.availableQuantity} value={quantity} onChange={(event) => setQuantity(Math.min(equipment.availableQuantity, Math.max(1, Number(event.target.value) || 1)))} />
                </Field>
                <Field label="Contact number" name="contactNumber">
                  <input id="contactNumber" required type="tel" name="contactNumber" placeholder="+880 1XXXXXXXXX" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Delivery address" name="deliveryAddress">
                    <input id="deliveryAddress" required type="text" name="deliveryAddress" placeholder="House, road, area and city" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Additional notes (optional)" name="additionalNotes">
                    <textarea id="additionalNotes" rows={3} name="additionalNotes" placeholder="Delivery instructions or other details" />
                  </Field>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-ink/[0.07] bg-white p-4">
                <div className="flex items-center justify-between text-[11px] text-ink/50">
                  <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Rental length</span>
                  <span className="font-semibold text-ink">{rentalDays ? `${rentalDays} day${rentalDays === 1 ? "" : "s"}` : "Select dates"}</span>
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-ink/[0.07] pt-3">
                  <div>
                    <p className="text-[10px] text-ink/45">Estimated total · {quantity} unit{quantity === 1 ? "" : "s"}</p>
                    <p className="mt-0.5 text-[21px] font-bold tracking-[-0.04em]">{formatPrice(total)}</p>
                  </div>
                  <p className="pb-1 text-[9px] text-ink/40">{rentalUnits || 0} {equipment.rentalType.toLowerCase()} unit{rentalUnits === 1 ? "" : "s"} × {formatPrice(rentalRate)}</p>
                </div>
              </div>

              <button disabled={isSubmitting || !total || !available} type="submit" className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[12px] font-bold text-cream transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-45">
                {isSubmitting ? "Opening secure checkout…" : "Continue to Stripe Checkout"}
                <ChevronRight className="size-4" />
              </button>
              <p className="mt-3 text-center text-[9.5px] leading-5 text-ink/40">Final availability and total are confirmed securely before payment.</p>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function FactCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-cream/75 p-3.5">
      <div className="flex items-center gap-2 text-ink/40">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase">{label}</span>
      </div>
      <p className="mt-2 truncate text-[11px] font-bold text-ink/80">{value}</p>
    </div>
  );
}

function Field({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <label htmlFor={name} className="grid gap-1.5 text-[10px] font-bold text-ink/65">
      {label}
      <span className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:bg-white [&_input]:px-3 [&_input]:text-[12px] [&_input]:font-medium [&_input]:text-ink [&_input]:outline-none [&_input]:focus:border-ink/35 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-ink/10 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-[12px] [&_textarea]:font-medium [&_textarea]:text-ink [&_textarea]:outline-none [&_textarea]:focus:border-ink/35" data-field={name}>
        {children}
      </span>
    </label>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} className={`size-3 ${value <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-ink/20"}`} />
      ))}
    </span>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function todayLocal() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GG";
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

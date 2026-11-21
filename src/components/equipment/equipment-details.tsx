"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { CalendarDays, Heart, MapPin, Package, ShieldCheck, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { EquipmentDetails as Equipment, EquipmentReview } from "@/lib/equipment";

export function EquipmentDetails({
  equipment,
  reviews,
}: {
  equipment: Equipment;
  reviews: EquipmentReview[];
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/favorites?equipmentId=${equipment.id}`)
      .then((response) => response.json())
      .then((data) => setIsFavorite(Boolean(data.favorite)))
      .catch(() => undefined);
  }, [equipment.id]);

  const total = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end < start) return 0;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    const units = equipment.rentalType === "Monthly"
      ? Math.max(1, Math.ceil(days / 30))
      : equipment.rentalType === "Weekly"
        ? Math.max(1, Math.ceil(days / 7))
        : days;
    const rate = equipment.rentalType === "Monthly"
      ? equipment.monthlyRate
      : equipment.rentalType === "Weekly"
        ? equipment.weeklyRate
        : equipment.dailyRate;
    return units * rate * quantity;
  }, [startDate, endDate, quantity, equipment]);

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  async function toggleFavorite() {
    const method = isFavorite ? "DELETE" : "POST";
    const response = await fetch("/api/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: equipment.id }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Could not update favorites.");
      return;
    }
    setIsFavorite(method === "POST");
    toast.success(method === "POST" ? "Added to favorites." : "Removed from favorites.");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not start payment.");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start payment.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-7 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="overflow-hidden rounded-[28px] border border-ink/[0.08] bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={equipment.imageUrl} alt={equipment.name} className="h-[360px] w-full rounded-[22px] object-cover sm:h-[520px]" />
        </section>

        <section className="lg:pt-2">
          <p className="text-[10px] font-bold tracking-[0.16em] text-ink/40 uppercase">{equipment.category}</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-[2.2rem] font-semibold leading-tight tracking-[-0.05em] sm:text-[3rem]">{equipment.name}</h1>
            <button type="button" onClick={toggleFavorite} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} className={`grid size-11 shrink-0 place-items-center rounded-full border transition ${isFavorite ? "border-red-200 bg-red-50 text-red-500" : "border-ink/10 bg-white text-ink/50 hover:text-ink"}`}>
              <Heart className={`size-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-[12px] font-medium text-ink/50">
            <MapPin className="size-4" /> {equipment.location}
            <span className="mx-1 text-ink/15">|</span>
            <Package className="size-4" /> {equipment.availableQuantity} available
          </div>

          <div className="mt-7 rounded-2xl border border-ink/[0.08] bg-white p-5">
            <p className="text-[12px] font-medium text-ink/45">Rental price</p>
            <p className="mt-1 text-[2rem] font-bold tracking-[-0.04em]">
              ${equipment.rentalType === "Monthly" ? equipment.monthlyRate : equipment.rentalType === "Weekly" ? equipment.weeklyRate : equipment.dailyRate}
              <span className="text-[12px] font-medium text-ink/40"> / {equipment.rentalType.toLowerCase()}</span>
            </p>
            <button type="button" onClick={() => setIsBookingOpen(true)} className="mt-5 h-12 w-full rounded-xl bg-ink text-[13px] font-semibold text-cream transition hover:bg-ink-soft">
              Book now
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard icon={UserRound} label="Owner" value={equipment.owner.name} />
            <InfoCard icon={ShieldCheck} label="Rental type" value={equipment.rentalType} />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <section className="rounded-2xl border border-ink/[0.08] bg-white p-6">
          <h2 className="text-[16px] font-bold">About this equipment</h2>
          <p className="mt-3 text-[13px] leading-7 text-ink/55">{equipment.description}</p>
        </section>
        <section className="rounded-2xl border border-ink/[0.08] bg-white p-6">
          <h2 className="text-[16px] font-bold">Rental terms</h2>
          <p className="mt-3 text-[12.5px] leading-6 text-ink/55">{equipment.terms}</p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-ink/[0.08] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              <Stars rating={averageRating} />
              <span className="text-[13px] font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-[11px] text-ink/40">
                ({reviews.length} review{reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          ) : null}
        </div>

        {reviews.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-ink/15 p-6 text-center text-[12px] text-ink/45">
            No reviews yet. Completed renters will be able to share their experience here.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-ink/[0.08] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-ink text-[10px] font-bold text-lime">
                      {getInitials(review.customerName)}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold">{review.customerName}</p>
                      <p className="text-[10px] text-ink/35">{formatReviewDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} />
                </div>
                {review.comment ? (
                  <p className="mt-3 text-[12.5px] leading-6 text-ink/55">{review.comment}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {isBookingOpen ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Book equipment">
          <form onSubmit={submitBooking} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-ink/35 uppercase">Secure booking</p>
                <h2 className="mt-1 text-[22px] font-bold">Book {equipment.name}</h2>
              </div>
              <button type="button" onClick={() => setIsBookingOpen(false)} className="size-9 rounded-full border border-ink/10 text-[18px] text-ink/50">×</button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Rental start date" name="startDate"><input required type="date" value={startDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setStartDate(event.target.value)} /></Field>
              <Field label="Rental end date" name="endDate"><input required type="date" value={endDate} min={startDate || new Date().toISOString().slice(0, 10)} onChange={(event) => setEndDate(event.target.value)} /></Field>
              <Field label="Required quantity" name="quantity"><input required type="number" min={1} max={equipment.availableQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></Field>
              <Field label="Contact number" name="contactNumber"><input required type="tel" placeholder="+880..." /></Field>
              <div className="sm:col-span-2"><Field label="Delivery address" name="deliveryAddress"><input required type="text" placeholder="Street, area and city" /></Field></div>
              <div className="sm:col-span-2"><Field label="Additional notes" name="additionalNotes"><textarea rows={3} placeholder="Anything the owner should know?" /></Field></div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-cream px-4 py-3">
              <span className="text-[12px] text-ink/45">Estimated total</span>
              <span className="text-[20px] font-bold">${total.toFixed(2)}</span>
            </div>
            <button disabled={isSubmitting || !total} type="submit" className="mt-4 h-12 w-full rounded-xl bg-ink text-[13px] font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Opening Stripe..." : `Pay $${total.toFixed(2)} securely`}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink/[0.08] bg-white p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-cream"><Icon className="size-4" /></span>
      <div><p className="text-[9px] font-bold tracking-[0.1em] text-ink/35 uppercase">{label}</p><p className="mt-1 text-[12px] font-bold">{value}</p></div>
    </div>
  );
}

function Field({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-ink/55">
      {label}
      <span className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:px-3 [&_input]:text-[12px] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-ink/10 [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-[12px]" data-field={name}>
        {children}
      </span>
    </label>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-3.5 ${value <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-ink/20"}`}
        />
      ))}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GG";
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

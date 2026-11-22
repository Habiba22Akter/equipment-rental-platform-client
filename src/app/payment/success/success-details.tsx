"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, LayoutDashboard } from "lucide-react";

type Booking = {
  _id: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  rentalType?: string;
  rentalUnits?: number;
  equipment?: { name?: string } | null;
};

export function PaymentSuccessDetails() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id") ?? "";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load booking details.");
        if (!active) return;
        setBooking(data.booking ?? null);
        setError("");
        attempts += 1;
        if (data.booking?.paymentStatus !== "paid" && attempts < 12) {
          timer = setTimeout(loadBooking, 1500);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load booking details.");
      }
    }

    void loadBooking();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [bookingId]);

  const paid = booking?.paymentStatus === "paid";

  return (
    <section className="w-full rounded-[28px] border border-ink/[0.08] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(11,31,26,0.4)] sm:p-8">
      <span className={`mx-auto grid size-14 place-items-center rounded-full ${paid ? "bg-lime/50 text-ink" : "bg-amber-50 text-amber-700"}`}>
        {paid ? <CheckCircle2 className="size-7" /> : <Clock3 className="size-7" />}
      </span>
      <h1 className="mt-5 text-center text-[26px] font-bold tracking-[-0.04em]">
        {paid ? "Booking confirmed" : "Payment verification in progress"}
      </h1>
      <p className="mt-3 text-center text-[13px] leading-6 text-ink/55">
        {paid
          ? "Stripe confirmed your payment. Your booking details are below."
          : "Your booking stays saved as unpaid until the server receives Stripe’s verified confirmation."}
      </p>

      {booking ? (
        <div className="mt-7 divide-y divide-ink/[0.08] rounded-2xl border border-ink/[0.08] px-4 sm:px-5">
          <Detail label="Equipment" value={booking.equipment?.name ?? "Equipment"} />
          <Detail label="Rental dates" value={`${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`} />
          <Detail label="Quantity" value={`${booking.quantity} unit${booking.quantity === 1 ? "" : "s"}`} />
          <Detail label="Payment status" value={paid ? "Paid via Stripe" : booking.paymentStatus ?? "pending"} />
          <Detail label="Booking status" value={booking.status} />
          <Detail label="Total" value={money(booking.totalAmount)} strong />
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-4 text-center text-[12px] text-red-600">{error}</p> : null}
      {!bookingId ? <p className="mt-4 text-center text-[12px] text-ink/45">Booking details are unavailable. You can check My Rentals.</p> : null}

      <Link href="/customer/dashboard?tab=bookings" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream">
        <LayoutDashboard className="size-4" /> Go to My Rentals
      </Link>
    </section>
  );
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-[12px]">
      <span className="text-ink/50">{label}</span>
      <span className={`text-right capitalize ${strong ? "font-bold text-ink" : "font-semibold text-ink/75"}`}>{value}</span>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(value || 0);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
}

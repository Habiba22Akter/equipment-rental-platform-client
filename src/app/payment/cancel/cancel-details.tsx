"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

type Booking = {
  status: string;
  paymentStatus: string;
  equipment?: { name?: string } | null;
};

export function PaymentCancelDetails() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id") ?? "";
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`)
      .then((response) => response.json())
      .then((data) => setBooking(data.booking ?? null))
      .catch(() => setBooking(null));
  }, [bookingId]);

  const bookingCancelled = booking?.status === "cancelled";

  return (
    <section className="w-full rounded-[28px] border border-ink/[0.08] bg-white p-6 text-center shadow-[0_30px_60px_-40px_rgba(11,31,26,0.4)] sm:p-8">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 text-amber-700">
        <ArrowLeft className="size-6" />
      </span>
      <h1 className="mt-5 text-[26px] font-bold tracking-[-0.04em]">
        {bookingCancelled ? "Booking cancelled" : "Checkout cancelled"}
      </h1>
      <p className="mt-3 text-[13px] leading-6 text-ink/55">
        {bookingCancelled
          ? "This rental booking has been cancelled. Its current payment status is shown below."
          : "Checkout was closed before payment. Your booking remains unpaid, and you can try payment again from My Rentals."}
      </p>

      {booking ? (
        <div className="mt-7 divide-y divide-ink/[0.08] rounded-2xl border border-ink/[0.08] px-4 text-left sm:px-5">
          <Detail label="Equipment" value={booking.equipment?.name ?? "Equipment"} />
          <Detail label="Booking status" value={booking.status} />
          <Detail label="Payment status" value={booking.paymentStatus ?? "unpaid"} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/customer/dashboard?tab=bookings" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream">
          <LayoutDashboard className="size-4" /> My Rentals
        </Link>
        <Link href="/equipment" className="inline-flex h-11 items-center rounded-xl border border-ink/10 px-5 text-[12px] font-semibold">
          Back to equipment
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-[12px]">
      <span className="text-ink/50">{label}</span>
      <span className="break-words text-right font-semibold capitalize text-ink/75">{value}</span>
    </div>
  );
}

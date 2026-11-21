import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";

const client = new MongoClient(process.env.DB_URL!);
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

function dateNumber(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customer accounts can book equipment." }, { status: 403 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const body = await request.json();
  const equipmentId = typeof body.equipmentId === "string" ? body.equipmentId : "";
  const start = dateNumber(body.startDate);
  const end = dateNumber(body.endDate);
  const quantity = Number(body.quantity);
  if (!ObjectId.isValid(equipmentId) || !start || !end || end < start) {
    return NextResponse.json({ error: "Please provide a valid rental period." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Please provide a valid quantity." }, { status: 400 });
  }

  const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) });
  if (!equipment) return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
  if (equipment.status !== "approved" && equipment.approvalStatus !== "approved") {
    return NextResponse.json({ error: "This equipment is not approved for rental." }, { status: 409 });
  }

  const availableQuantity = Number(equipment.availableQuantity ?? equipment.quantity ?? 1);
  if (quantity > availableQuantity) {
    return NextResponse.json({ error: "Required quantity exceeds available quantity." }, { status: 400 });
  }

  const overlaps = await db.collection("bookings").find({
    equipmentId,
    paymentStatus: { $ne: "refunded" },
    startDate: { $lte: end },
    endDate: { $gte: start },
  }).toArray();
  const bookedQuantity = overlaps.reduce((sum, booking) => sum + Number(booking.quantity ?? 0), 0);
  if (bookedQuantity + quantity > availableQuantity) {
    return NextResponse.json({ error: "Equipment is not available for the selected dates and quantity." }, { status: 409 });
  }

  const rentalType = equipment.rentalType === "Weekly" || equipment.rentalType === "Monthly"
    ? equipment.rentalType
    : "Daily";
  const dailyRate = Number(equipment.dailyRate ?? equipment.pricePerDay ?? 0);
  const weeklyRate = Number(equipment.weeklyRate ?? 0) || dailyRate * 7;
  const monthlyRate = Number(equipment.monthlyRate ?? 0) || dailyRate * 30;
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
  const units = rentalType === "Monthly"
    ? Math.max(1, Math.ceil(days / 30))
    : rentalType === "Weekly"
      ? Math.max(1, Math.ceil(days / 7))
      : days;
  const rate = rentalType === "Monthly" ? monthlyRate : rentalType === "Weekly" ? weeklyRate : dailyRate;
  const total = units * rate * quantity;
  if (!Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "Equipment has no valid rental price." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(total * 100),
        product_data: {
          name: String(equipment.name ?? "Equipment rental"),
          description: `${quantity} item(s) for ${units} ${rentalType.toLowerCase()} unit(s)`,
        },
      },
    }],
    success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/equipment/${equipmentId}`,
    metadata: {
      equipmentId,
      customerId: session.user.id,
      startDate: body.startDate,
      endDate: body.endDate,
      quantity: String(quantity),
      contactNumber: String(body.contactNumber ?? ""),
      deliveryAddress: String(body.deliveryAddress ?? ""),
      additionalNotes: String(body.additionalNotes ?? ""),
      totalAmount: String(total),
      rentalType,
    },
  });

  return NextResponse.json({ url: checkout.url });
}

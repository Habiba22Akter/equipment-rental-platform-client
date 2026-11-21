import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

const client = new MongoClient(process.env.DB_URL!);
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing Stripe session." }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  if (checkout.payment_status !== "paid" || !checkout.metadata) {
    return NextResponse.json({ error: "Payment is not completed." }, { status: 402 });
  }
  if (checkout.metadata.customerId !== session.user.id) {
    return NextResponse.json({ error: "This payment does not belong to you." }, { status: 403 });
  }

  const equipmentId = checkout.metadata.equipmentId;
  if (!ObjectId.isValid(equipmentId)) {
    return NextResponse.json({ error: "Invalid equipment." }, { status: 400 });
  }

  const existing = await db.collection("payments").findOne({ stripeSessionId: sessionId });
  if (!existing) {
    const startDate = new Date(`${checkout.metadata.startDate}T00:00:00Z`);
    const endDate = new Date(`${checkout.metadata.endDate}T00:00:00Z`);
    const quantity = Number(checkout.metadata.quantity);
    const totalAmount = Number(checkout.metadata.totalAmount);

    await db.collection("bookings").insertOne({
      equipmentId,
      customerId: session.user.id,
      customerName: session.user.name,
      customerEmail: session.user.email,
      startDate,
      endDate,
      quantity,
      contactNumber: checkout.metadata.contactNumber,
      deliveryAddress: checkout.metadata.deliveryAddress,
      additionalNotes: checkout.metadata.additionalNotes,
      rentalType: checkout.metadata.rentalType,
      totalAmount,
      status: "confirmed",
      paymentStatus: "paid",
      stripeSessionId: sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("payments").insertOne({
      bookingId: null,
      customerId: session.user.id,
      equipmentId,
      stripeSessionId: sessionId,
      stripePaymentIntentId: typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      amount: totalAmount,
      currency: "usd",
      status: "paid",
      transactionType: "rental",
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ success: true, sessionId });
}

import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const client = new MongoClient(process.env.DB_URL!);
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const checkout = event.data.object as Stripe.Checkout.Session;
  if (checkout.payment_status !== "paid" || !checkout.metadata) {
    return NextResponse.json({ received: true });
  }

  const equipmentId = checkout.metadata.equipmentId;
  if (!ObjectId.isValid(equipmentId)) {
    return NextResponse.json({ error: "Invalid equipment metadata." }, { status: 400 });
  }

  const existing = await db.collection("payments").findOne({ stripeSessionId: checkout.id });
  if (!existing) {
    const quantity = Number(checkout.metadata.quantity);
    const totalAmount = Number(checkout.metadata.totalAmount);
    await db.collection("bookings").insertOne({
      equipmentId,
      customerId: checkout.metadata.customerId,
      startDate: new Date(`${checkout.metadata.startDate}T00:00:00Z`),
      endDate: new Date(`${checkout.metadata.endDate}T00:00:00Z`),
      quantity,
      contactNumber: checkout.metadata.contactNumber,
      deliveryAddress: checkout.metadata.deliveryAddress,
      additionalNotes: checkout.metadata.additionalNotes,
      rentalType: checkout.metadata.rentalType,
      totalAmount,
      status: "confirmed",
      paymentStatus: "paid",
      stripeSessionId: checkout.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.collection("payments").insertOne({
      customerId: checkout.metadata.customerId,
      equipmentId,
      stripeSessionId: checkout.id,
      stripePaymentIntentId: typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      amount: totalAmount,
      currency: "usd",
      status: "paid",
      transactionType: "rental",
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ received: true });
}

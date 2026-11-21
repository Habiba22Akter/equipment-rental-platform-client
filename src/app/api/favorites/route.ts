import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";

const client = new MongoClient(process.env.DB_URL!);
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customer accounts can manage favorites." }, { status: 403 });
  }

  const equipmentId = request.nextUrl.searchParams.get("equipmentId");
  if (!equipmentId || !ObjectId.isValid(equipmentId)) {
    return NextResponse.json({ favorite: false });
  }

  const favorite = await db.collection("favorites").findOne({
    userId: session.user.id,
    equipmentId,
  });
  return NextResponse.json({ favorite: Boolean(favorite) });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customer accounts can manage favorites." }, { status: 403 });
  }

  const body = await request.json();
  const equipmentId = typeof body.equipmentId === "string" ? body.equipmentId : "";
  if (!ObjectId.isValid(equipmentId)) {
    return NextResponse.json({ error: "Invalid equipment" }, { status: 400 });
  }

  await db.collection("favorites").updateOne(
    { userId: session.user.id, equipmentId },
    { $set: { userId: session.user.id, equipmentId, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );
  return NextResponse.json({ favorite: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customer accounts can manage favorites." }, { status: 403 });
  }

  const body = await request.json();
  const equipmentId = typeof body.equipmentId === "string" ? body.equipmentId : "";
  await db.collection("favorites").deleteOne({ userId: session.user.id, equipmentId });
  return NextResponse.json({ favorite: false });
}

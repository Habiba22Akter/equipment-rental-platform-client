import { headers } from "next/headers";
import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const client = new MongoClient(process.env.DB_URL!);
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favoriteRows = await db.collection("favorites").find({ userId: session.user.id }).toArray();
  const ids = favoriteRows
    .map((row) => typeof row.equipmentId === "string" && ObjectId.isValid(row.equipmentId) ? new ObjectId(row.equipmentId) : null)
    .filter((id): id is ObjectId => Boolean(id));
  const equipment = await db.collection("equipment").find({ _id: { $in: ids } }).toArray();
  const byId = new Map(equipment.map((item) => [item._id.toString(), item]));
  const favorites = [];
  for (const id of ids) {
    const item = byId.get(id.toString());
    if (!item) continue;
    favorites.push({
      equipmentId: item._id.toString(),
      name: typeof item.name === "string" ? item.name : "Equipment",
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : typeof item.image === "string" ? item.image : "",
      category: typeof item.category === "string" ? item.category : "Equipment",
      location: typeof item.location === "string" ? item.location : "Location unavailable",
      dailyRate: Number(item.dailyRate ?? item.pricePerDay ?? 0),
    });
  }

  return NextResponse.json({ favorites });
}

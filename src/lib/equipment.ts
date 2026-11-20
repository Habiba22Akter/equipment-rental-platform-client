import { MongoClient, ObjectId } from "mongodb";

export type FeaturedEquipment = {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  dailyRate: number;
};

type EquipmentDocument = {
  _id: ObjectId;
  name?: unknown;
  description?: unknown;
  category?: unknown;
  location?: unknown;
  imageUrl?: unknown;
  image?: unknown;
  dailyRate?: unknown;
  pricePerDay?: unknown;
};

const globalForMongo = globalThis as typeof globalThis & {
  __gearGridEquipmentMongoClient?: MongoClient;
};

function getMongoClient() {
  const dbUrl = process.env.DB_URL;

  if (!dbUrl) {
    throw new Error("Missing DB_URL. Add your MongoDB connection string to the environment.");
  }

  const client =
    globalForMongo.__gearGridEquipmentMongoClient ?? new MongoClient(dbUrl);

  if (process.env.NODE_ENV !== "production") {
    globalForMongo.__gearGridEquipmentMongoClient = client;
  }

  return client;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function getFeaturedEquipment() {
  const client = getMongoClient();
  const database = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

  const equipment = await database
    .collection<EquipmentDocument>("equipment")
    .find({
      $or: [{ status: "approved" }, { approvalStatus: "approved" }],
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  return equipment.map((item) => ({
    id: item._id.toString(),
    name: asString(item.name, "Unnamed equipment"),
    description: asString(item.description, "Reliable equipment for your next project."),
    category: asString(item.category, "Equipment"),
    location: asString(item.location, "Location unavailable"),
    imageUrl: asString(
      item.imageUrl ?? item.image,
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
    ),
    dailyRate: asNumber(item.dailyRate ?? item.pricePerDay),
  })) satisfies FeaturedEquipment[];
}

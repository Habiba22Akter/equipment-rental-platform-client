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

export type EquipmentDetails = FeaturedEquipment & {
  rentalType: "Daily" | "Weekly" | "Monthly";
  weeklyRate: number;
  monthlyRate: number;
  availableQuantity: number;
  terms: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
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
  rentalType?: unknown;
  weeklyRate?: unknown;
  monthlyRate?: unknown;
  availableQuantity?: unknown;
  quantity?: unknown;
  terms?: unknown;
  rentalTerms?: unknown;
  ownerId?: unknown;
  ownerName?: unknown;
  ownerEmail?: unknown;
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

export async function getEquipmentById(id: string) {
  if (!ObjectId.isValid(id)) return null;

  const client = getMongoClient();
  const database = client.db(process.env.DB_NAME ?? "equipment-rental-platform");
  const item = await database
    .collection<EquipmentDocument>("equipment")
    .findOne({ _id: new ObjectId(id) });

  if (!item) return null;

  const rentalTypeValue = asString(item.rentalType, "Daily");
  const rentalType =
    rentalTypeValue === "Weekly" || rentalTypeValue === "Monthly"
      ? rentalTypeValue
      : "Daily";
  const dailyRate = asNumber(item.dailyRate ?? item.pricePerDay);

  return {
    id: item._id.toString(),
    name: asString(item.name, "Unnamed equipment"),
    description: asString(item.description, "Reliable equipment for your next project."),
    category: asString(item.category, "Equipment"),
    location: asString(item.location, "Location unavailable"),
    imageUrl: asString(
      item.imageUrl ?? item.image,
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
    ),
    dailyRate,
    rentalType,
    weeklyRate: asNumber(item.weeklyRate) || dailyRate * 7,
    monthlyRate: asNumber(item.monthlyRate) || dailyRate * 30,
    availableQuantity: asNumber(item.availableQuantity ?? item.quantity) || 1,
    terms: asString(
      item.terms ?? item.rentalTerms,
      "Return the equipment clean and on time. The renter is responsible for accidental damage during the rental period.",
    ),
    owner: {
      id: asString(item.ownerId, ""),
      name: asString(item.ownerName, "Verified owner"),
      email: asString(item.ownerEmail, ""),
    },
  } satisfies EquipmentDetails;
}

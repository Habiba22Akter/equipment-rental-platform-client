import { MongoClient, ObjectId, type Sort } from "mongodb";
import { connection } from "next/server";

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

export type EquipmentFilters = {
  q?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  limit?: number;
};

export type EquipmentReview = {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
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

function toFeaturedEquipment(item: EquipmentDocument): FeaturedEquipment {
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
    dailyRate: asNumber(item.dailyRate ?? item.pricePerDay),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getFeaturedEquipment() {
  await connection();
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

export async function getEquipmentList(filters: EquipmentFilters = {}) {
  await connection();
  const client = getMongoClient();
  const database = client.db(process.env.DB_NAME ?? "equipment-rental-platform");
  const conditions: Record<string, unknown>[] = [
    { $or: [{ status: "approved" }, { approvalStatus: "approved" }] },
  ];

  if (filters.category) {
    conditions.push({ category: filters.category });
  }

  if (filters.q) {
    const pattern = new RegExp(escapeRegex(filters.q.trim()), "i");
    conditions.push({
      $or: [
        { name: pattern },
        { description: pattern },
        { category: pattern },
        { location: pattern },
      ],
    });
  }

  const sort: Sort =
    filters.sort === "price-asc"
      ? { dailyRate: 1 }
      : filters.sort === "price-desc"
        ? { dailyRate: -1 }
        : { createdAt: -1 };

  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 60);
  const equipment = await database
    .collection<EquipmentDocument>("equipment")
    .find({ $and: conditions })
    .sort(sort)
    .limit(limit)
    .toArray();

  return equipment.map(toFeaturedEquipment);
}

export async function getEquipmentCategories() {
  await connection();
  const client = getMongoClient();
  const database = client.db(process.env.DB_NAME ?? "equipment-rental-platform");
  const categories = await database
    .collection<EquipmentDocument>("equipment")
    .distinct("category", {
      $or: [{ status: "approved" }, { approvalStatus: "approved" }],
    });

  return categories
    .filter((category): category is string => typeof category === "string" && Boolean(category.trim()))
    .sort((a, b) => a.localeCompare(b));
}

export async function getEquipmentById(id: string) {
  if (!ObjectId.isValid(id)) return null;

  await connection();
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

export async function getEquipmentReviews(equipmentId: string) {
  if (!ObjectId.isValid(equipmentId)) return [];

  await connection();
  const client = getMongoClient();
  const database = client.db(process.env.DB_NAME ?? "equipment-rental-platform");
  const reviews = await database
    .collection("reviews")
    .find({ equipmentId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return reviews.map((review) => ({
    id: review._id.toString(),
    rating: typeof review.rating === "number" ? review.rating : 0,
    comment: typeof review.comment === "string" ? review.comment : "",
    customerName:
      typeof review.customerName === "string" && review.customerName
        ? review.customerName
        : "GearGrid customer",
    createdAt:
      review.createdAt instanceof Date
        ? review.createdAt.toISOString()
        : typeof review.createdAt === "string"
          ? review.createdAt
          : new Date().toISOString(),
  })) satisfies EquipmentReview[];
}

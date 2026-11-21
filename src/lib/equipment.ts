import { MongoClient, ObjectId } from "mongodb";
import { connection } from "next/server";

export type FeaturedEquipment = {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  rentalType: "Daily" | "Weekly" | "Monthly";
  availableQuantity: number;
};

export type EquipmentDetails = FeaturedEquipment & {
  rentalType: "Daily" | "Weekly" | "Monthly";
  weeklyRate: number;
  monthlyRate: number;
  availableQuantity: number;
  terms: string;
  brand: string;
  model: string;
  condition: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
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
  brand?: unknown;
  model?: unknown;
  condition?: unknown;
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

function getRentalType(value: unknown): FeaturedEquipment["rentalType"] {
  return value === "Weekly" || value === "Monthly" ? value : "Daily";
}

function getAvailableQuantity(item: EquipmentDocument) {
  const value = item.availableQuantity ?? item.quantity;
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 1;
}

function normalizeCategory(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

const categoryDefinitions = [
  { label: "Construction Equipment", aliases: ["construction", "construction equipment"] },
  { label: "Photography Equipment", aliases: ["photography", "photographic equipment", "photography equipment"] },
  { label: "Vehicles & Transportation", aliases: ["vehicle", "vehicles", "transportation", "vehicles and transportation"] },
  { label: "Agriculture Equipment", aliases: ["agriculture", "agricultural", "agriculture equipment"] },
  { label: "Electronics", aliases: ["electronic", "electronics"] },
  { label: "Event Equipment", aliases: ["event", "events", "event equipment"] },
];

export function getEquipmentCategoryLabel(value: string) {
  const normalized = normalizeCategory(value);
  return categoryDefinitions.find((definition) =>
    definition.aliases.some((alias) => normalizeCategory(alias) === normalized),
  )?.label ?? value;
}

function toFeaturedEquipment(item: EquipmentDocument): FeaturedEquipment {
  const dailyRate = asNumber(item.dailyRate ?? item.pricePerDay);
  const weeklyRate = asNumber(item.weeklyRate) || dailyRate * 7;
  const monthlyRate = asNumber(item.monthlyRate) || dailyRate * 30;
  return {
    id: item._id.toString(),
    name: asString(item.name, "Unnamed equipment"),
    description: asString(item.description, "Reliable equipment for your next project."),
    category: getEquipmentCategoryLabel(asString(item.category, "Equipment")),
    location: asString(item.location, "Location unavailable"),
    imageUrl: asString(
      item.imageUrl ?? item.image,
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
    ),
    dailyRate,
    weeklyRate,
    monthlyRate,
    rentalType: getRentalType(item.rentalType),
    availableQuantity: getAvailableQuantity(item),
  };
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

  return equipment.map(toFeaturedEquipment) satisfies FeaturedEquipment[];
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
  const quantityValue = item.availableQuantity ?? item.quantity;
  const availableQuantity =
    typeof quantityValue === "number" && Number.isFinite(quantityValue)
      ? Math.max(0, quantityValue)
      : 1;

  return {
    id: item._id.toString(),
    name: asString(item.name, "Unnamed equipment"),
    description: asString(item.description, "Reliable equipment for your next project."),
    category: getEquipmentCategoryLabel(asString(item.category, "Equipment")),
    brand: asString(item.brand, "Not specified"),
    model: asString(item.model, "Not specified"),
    condition: asString(item.condition, "Not specified"),
    location: asString(item.location, "Location unavailable"),
    imageUrl: asString(
      item.imageUrl ?? item.image,
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
    ),
    dailyRate,
    rentalType,
    weeklyRate: asNumber(item.weeklyRate) || dailyRate * 7,
    monthlyRate: asNumber(item.monthlyRate) || dailyRate * 30,
    availableQuantity,
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

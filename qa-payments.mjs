import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DB_URL);
await client.connect();
const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

const action = process.argv[2];
const customerId = process.argv[3];
const equipmentId = process.argv[4];

if (action === "seed") {
  const result = await db.collection("payments").insertOne({
    customerId,
    equipmentId,
    amount: 120,
    currency: "usd",
    status: "paid",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(JSON.stringify({ paymentId: result.insertedId.toString() }));
} else if (action === "cleanup") {
  const result = await db.collection("payments").deleteMany({ customerId });
  const users = await db.collection("user").deleteMany({ email: "qa.payments@geargrid.test" });
  console.log(JSON.stringify({ payments: result.deletedCount, users: users.deletedCount }));
}

await client.close();

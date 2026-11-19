import { betterAuth, input } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.DB_URL as string);
const db = client.db("equipment-rental-platform");


export const auth = betterAuth({
database: mongodbAdapter(db, {
    client,
  }),

user: {
       additionalFields: {
          role: {
              type: ["Customer", "Owner", "Admin"],
              input: false,
              defaultValue: "Customer",
            } 
        }
    },

  //...other options
  emailAndPassword: { 
    enabled: true, 
  }, 
  socialProviders: { 
    // github: { 
    //   clientId: process.env.GITHUB_CLIENT_ID as string, 
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    // }, 
  }, 
});
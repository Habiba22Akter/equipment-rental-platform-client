import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { toSignupRole } from "@/lib/roles";

const dbUrl = process.env.DB_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!dbUrl) {
  throw new Error("Missing DB_URL. Add your MongoDB connection string to the environment.");
}

if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET. Add a long random secret to the environment.");
}

/**
 * Reuse the Mongo client across hot reloads in development so `next dev`
 * does not open a new connection pool on every recompile.
 */
const globalForMongo = globalThis as typeof globalThis & {
  __gearGridMongoClient?: MongoClient;
};

const client = globalForMongo.__gearGridMongoClient ?? new MongoClient(dbUrl);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__gearGridMongoClient = client;
}

const db = client.db(process.env.DB_NAME ?? "equipment-rental-platform");

/**
 * OAuth providers are only registered when both credentials exist. This keeps
 * local development and preview deployments bootable before the real keys are
 * added, while production picks them up from environment variables.
 */
const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : null;

const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }
    : null;

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
]
  .map((origin) => origin?.trim().replace(/\/$/, ""))
  .filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  appName: "GearGrid",
  baseURL: process.env.BETTER_AUTH_URL || undefined,
  secret: authSecret,
  database: mongodbAdapter(db, { client }),
  trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,

  emailAndPassword: {
    enabled: true,
    // The assignment asks for a minimum of 6 characters. Uppercase/lowercase
    // requirements are enforced below and in the sign-up form.
    minPasswordLength: 6,
    maxPasswordLength: 128,
    // Email verification is intentionally disabled for this project.
    requireEmailVerification: false,
  },

  socialProviders: {
    ...(google ? { google } : {}),
    ...(github ? { github } : {}),
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Customer",
        // Accepted on sign-up so people can pick Customer or Owner. The hooks
        // below make sure Admin can never be self-assigned.
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: toSignupRole(user.role),
          },
        }),
      },
      update: {
        before: async (user) => {
          // Role changes are a privileged operation. Drop the field from any
          // update-user request instead of allowing self-promotion to Admin.
          if (!("role" in user)) return;

          const nextUser = { ...user };
          delete nextUser.role;

          return { data: nextUser };
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/update-user") {
        // `role` is accepted on sign-up, but must never be editable through
        // the public update-user endpoint (privilege escalation).
        const body = ctx.body as Record<string, unknown> | undefined;

        if (body && "role" in body) {
          delete body.role;
        }

        return;
      }

      if (ctx.path !== "/sign-up/email") return;

      const password = (ctx.body as { password?: unknown } | undefined)?.password;

      if (typeof password !== "string") return;

      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);

      if (password.length < 6 || !hasUppercase || !hasLowercase) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and include an uppercase and a lowercase letter.",
        });
      }
    }),
  },
});

export type AuthSession = typeof auth.$Infer.Session;

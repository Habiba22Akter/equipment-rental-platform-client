import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

/**
 * `auth` is imported as a type only: the server config (and the MongoDB
 * driver) must never end up in the browser bundle.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
  plugins: [
    inferAdditionalFields<typeof auth>(),
    jwtClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export async function getJwt() {
  const { data, error } = await authClient.token();
  if (error || !data?.token) {
    throw new Error(error?.message ?? "Could not create JWT.");
  }
  return data.token;
}

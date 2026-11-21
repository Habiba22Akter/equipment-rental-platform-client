import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const query = role === "Admin"
    ? ""
    : role === "Owner"
      ? `?ownerId=${encodeURIComponent(session.user.id)}`
      : `?customerId=${encodeURIComponent(session.user.id)}`;

  const result = await serverFetch<unknown[]>(`/api/bookings${query}`);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load bookings." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ bookings: result.data ?? [] });
}

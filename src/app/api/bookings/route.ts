import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role === "Admin") {
    const bookings: unknown[] = [];
    let skip = 0;

    while (true) {
      const result = await serverFetch<unknown[]>(`/api/bookings?limit=200&skip=${skip}`);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error ?? "Could not load bookings." },
          { status: result.status === 200 ? 502 : result.status },
        );
      }

      const page = result.data ?? [];
      bookings.push(...page);
      if (page.length < 200) break;
      skip += page.length;
    }

    return NextResponse.json({ bookings });
  }

  const query = new URLSearchParams({ limit: "200" });
  if (role === "Owner") query.set("ownerId", session.user.id);
  else query.set("customerId", session.user.id);

  const result = await serverFetch<unknown[]>(`/api/bookings?${query.toString()}`);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load bookings." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ bookings: result.data ?? [] });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customers can book equipment." }, { status: 403 });
  }

  const form = await request.json();
  const result = await serverFetch<{ bookingId: string; checkoutUrl: string }>("/api/bookings", {
    method: "POST",
    user: { id: session.user.id, role: "Customer" },
    body: {
      ...form,
      customerName: session.user.name,
      customerEmail: session.user.email,
    },
  });

  if (!result.ok || !result.data?.checkoutUrl) {
    return NextResponse.json(
      { error: result.error ?? "Could not start Stripe Checkout." },
      { status: result.ok ? 502 : result.status },
    );
  }

  return NextResponse.json({ bookingId: result.data.bookingId, url: result.data.checkoutUrl });
}

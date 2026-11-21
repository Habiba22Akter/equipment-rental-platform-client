import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

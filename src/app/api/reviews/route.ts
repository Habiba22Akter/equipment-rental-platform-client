import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  const result = await serverFetch<unknown[]>(`/api/reviews${query}`);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load reviews." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ reviews: result.data ?? [] });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = await serverFetch("/api/reviews", {
    method: "POST",
    user: { id: session.user.id, role: session.user.role },
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not save the review." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, review: result.data });
}

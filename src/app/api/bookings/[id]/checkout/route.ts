import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (normalizeRole(session.user.role) !== "Customer") {
    return NextResponse.json({ error: "Only customers can pay for bookings." }, { status: 403 });
  }

  const { id } = await params;
  const result = await serverFetch<{ checkoutUrl: string }>(
    `/api/bookings/${encodeURIComponent(id)}/checkout`,
    {
      method: "POST",
      user: { id: session.user.id, role: "Customer" },
      body: {},
    },
  );

  if (!result.ok || !result.data?.checkoutUrl) {
    return NextResponse.json(
      { error: result.error ?? "Could not reopen Stripe Checkout." },
      { status: result.ok ? 502 : result.status },
    );
  }

  return NextResponse.json({ url: result.data.checkoutUrl });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await serverFetch(`/api/bookings/${encodeURIComponent(id)}`, {
    user: { id: session.user.id, role: normalizeRole(session.user.role) },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load the booking." },
      { status: result.status },
    );
  }

  return NextResponse.json({ booking: result.data });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL?.trim().toLowerCase();
  if (
    session.user.role === "Admin" &&
    demoAdminEmail &&
    session.user.email.toLowerCase() === demoAdminEmail
  ) {
    return NextResponse.json({ error: "Demo Admin cannot change booking statuses." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const result = await serverFetch(`/api/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    user: { id: session.user.id, role: session.user.role },
    body: { status: body.status },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not update the booking." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}

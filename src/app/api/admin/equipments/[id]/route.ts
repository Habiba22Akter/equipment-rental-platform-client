import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { params: Promise<{ id: string }> };

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "Admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { session, error } = await adminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const result = await serverFetch(`/api/equipments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    user: { id: session.user.id, role: session.user.role },
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not update equipment." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, equipment: result.data });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { session, error } = await adminSession();
  if (error) return error;

  const { id } = await params;
  const result = await serverFetch(`/api/equipments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    user: { id: session.user.id, role: session.user.role },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not delete equipment." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}

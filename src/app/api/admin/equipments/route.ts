import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "Admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request: Request) {
  const { error } = await adminSession();
  if (error) return error;

  const status = new URL(request.url).searchParams.get("status");
  const query = status && status !== "all"
    ? `all=true&status=${encodeURIComponent(status)}`
    : "all=true";
  const result = await serverFetch<unknown[]>(`/api/equipments?${query}`);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load equipment." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ equipment: result.data ?? [] });
}

export async function PATCH(request: Request) {
  const { session, error } = await adminSession();
  if (error) return error;

  const body = await request.json();
  const equipmentId = typeof body.equipmentId === "string" ? body.equipmentId : "";

  if (!equipmentId) {
    return NextResponse.json({ error: "Equipment id is required." }, { status: 400 });
  }

  const result = await serverFetch(`/api/equipments/${encodeURIComponent(equipmentId)}/status`, {
    method: "PATCH",
    user: { id: session.user.id, role: session.user.role },
    body: { status: body.status },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not review equipment." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "Owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await serverFetch<unknown[]>(
    `/api/equipments?ownerId=${encodeURIComponent(session.user.id)}&all=true`,
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load equipment." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ equipment: result.data ?? [] });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "Owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = await serverFetch("/api/equipments", {
    method: "POST",
    user: { id: session.user.id, role: session.user.role },
    body: {
      ...body,
      ownerId: session.user.id,
      ownerName: session.user.name,
      ownerEmail: session.user.email,
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not add equipment." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, equipment: result.data });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type EquipmentPayload = Record<string, unknown> & { _id?: unknown; ownerId?: unknown };

const serverUrl = process.env.EQUIPMENT_API_URL ?? "http://localhost:5001";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "Owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = await fetch(`${serverUrl}/api/equipments`, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok) return NextResponse.json({ error: "Could not load equipment." }, { status: 502 });

  const all = Array.isArray(payload.data) ? payload.data as EquipmentPayload[] : [];
  const equipment = all.filter((item: EquipmentPayload) =>
    typeof item.ownerId === "string" && item.ownerId === session.user.id
  );

  return NextResponse.json({
    equipment: equipment.map((item: EquipmentPayload) => ({
      ...item,
      _id: String(item._id),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "Owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const response = await fetch(`${serverUrl}/api/equipments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      ownerId: session.user.id,
      ownerName: session.user.name,
      ownerEmail: session.user.email,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: payload?.error?.message ?? "Could not add equipment." },
      { status: response.status },
    );
  }

  return NextResponse.json(payload);
}

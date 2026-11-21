import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await serverFetch(`/api/reviews/${encodeURIComponent(id)}`, {
    method: "DELETE",
    user: { id: session.user.id, role: session.user.role },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not delete the review." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}

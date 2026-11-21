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
  const { session, error } = await adminSession();
  if (error) return error;

  const role = new URL(request.url).searchParams.get("role");
  const result = await serverFetch<unknown[]>(
    `/api/users${role ? `?role=${encodeURIComponent(role)}` : ""}`,
    { user: { id: session.user.id, role: session.user.role } },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not load users." },
      { status: result.status === 200 ? 502 : result.status },
    );
  }

  return NextResponse.json({ users: result.data ?? [] });
}

export async function PATCH(request: Request) {
  const { session, error } = await adminSession();
  if (error) return error;

  const body = await request.json();
  const userId = typeof body.userId === "string" ? body.userId : "";
  const role = body.role;

  if (!userId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }
  if (role !== "Customer" && role !== "Owner" && role !== "Admin") {
    return NextResponse.json({ error: "Role must be Customer, Owner or Admin." }, { status: 400 });
  }
  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  const result = await serverFetch(`/api/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    user: { id: session.user.id, role: session.user.role },
    body: { role },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not update the user." },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true });
}

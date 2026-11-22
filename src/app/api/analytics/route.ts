import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";
import { serverFetch } from "@/lib/server-api";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = normalizeRole(session.user.role);
  if (role !== "Admin" && role !== "Owner") {
    return NextResponse.json({ error: "Analytics are available to owners and admins." }, { status: 403 });
  }

  const result = await serverFetch<Record<string, unknown>>("/api/analytics");
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not load dashboard analytics." }, { status: result.status });
  }

  return NextResponse.json({ analytics: result.data });
}

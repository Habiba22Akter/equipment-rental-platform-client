import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";

type PaymentPayload = {
  payments: unknown[];
  summary: {
    count: number;
    paidCount: number;
    totalAmount: number;
    currency: string;
  };
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const query = role === "Admin"
    ? ""
    : role === "Owner"
      ? `?ownerId=${encodeURIComponent(session.user.id)}`
      : `?customerId=${encodeURIComponent(session.user.id)}`;

  const result = await serverFetch<PaymentPayload>(`/api/payments${query}`);

  if (!result.ok || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Could not load payments." },
      { status: result.ok ? 502 : result.status },
    );
  }

  return NextResponse.json(result.data);
}

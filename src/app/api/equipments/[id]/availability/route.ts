import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/server-api";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const search = new URL(request.url).searchParams;
  const startDate = search.get("startDate") ?? "";
  const endDate = search.get("endDate") ?? "";
  const result = await serverFetch<{
    totalQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
  }>(
    `/api/equipments/${encodeURIComponent(id)}/availability?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
  );

  if (!result.ok || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Could not check equipment availability." },
      { status: result.ok ? 502 : result.status },
    );
  }

  return NextResponse.json(result.data);
}

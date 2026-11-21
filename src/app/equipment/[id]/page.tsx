import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEquipmentById, getEquipmentReviews } from "@/lib/equipment";
import { SiteHeader } from "@/components/site/site-header";
import { EquipmentDetails } from "@/components/equipment/equipment-details";

export const instant = false;

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/signin");

  const { id } = await params;
  const equipment = await getEquipmentById(id);
  if (!equipment) notFound();

  const reviews = await getEquipmentReviews(equipment.id);

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />
      <EquipmentDetails equipment={equipment} reviews={reviews} role={session.user.role ?? "Customer"} />
    </div>
  );
}

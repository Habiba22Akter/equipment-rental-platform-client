import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createRemoteJWKSet, jwtVerify } from "jose";
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
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user) redirect("/signin");

  // Verify the session_data cookie with Better Auth's JWT plugin JWKS.
  if (process.env.NODE_ENV === "development") {
    const sessionDataCookie = (await cookies())
      .getAll()
      .find((cookie) => cookie.name.endsWith("session_data"));

    if (!sessionDataCookie) {
      console.log("[equipment details] better-auth.session_data cookie not found");
    } else {
      try {
        const authUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const jwks = createRemoteJWKSet(new URL(`${authUrl}/api/auth/jwks`));
        const { payload } = await jwtVerify(sessionDataCookie.value, jwks, {
          issuer: authUrl,
          audience: "better-auth:session-cache",
        });

        console.log("[equipment details] verified session_data payload:", payload);
      } catch (error) {
        console.error("[equipment details] session_data JWT verification failed:", error);
      }
    }
  }

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

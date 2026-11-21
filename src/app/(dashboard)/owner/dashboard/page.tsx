import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function OwnerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "Owner") {
    redirect(
      session.user.role === "Admin"
        ? "/admin/dashboard"
        : "/customer/dashboard",
    );
  }

  return (
    <DashboardShell
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        phoneNumber: session.user.phoneNumber,
        address: session.user.address,
        role: "Owner",
      }}
    />
  );
}

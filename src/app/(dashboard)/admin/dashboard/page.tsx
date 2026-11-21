import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "Admin") {
    redirect(
      session.user.role === "Owner"
        ? "/owner/dashboard"
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
        role: "Admin",
      }}
    />
  );
}

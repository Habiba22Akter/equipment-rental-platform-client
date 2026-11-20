import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  const role =
    typeof session.user.role === "string"
      ? session.user.role.toLowerCase()
      : "customer";

  if (role === "admin") redirect("/admin/dashboard");
  if (role === "owner") redirect("/owner/dashboard");
  redirect("/customer/dashboard");
}

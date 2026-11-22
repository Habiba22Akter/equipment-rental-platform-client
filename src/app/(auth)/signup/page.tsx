import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a GearGrid account to rent equipment or list your own gear and start earning.",
};

type SignUpPageProps = { searchParams: Promise<{ role?: string }> };

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { role } = await searchParams;
  return (
    <AuthShell mode="signup">
      <SignUpForm initialRole={role === "Owner" ? "Owner" : "Customer"} />
    </AuthShell>
  );
}

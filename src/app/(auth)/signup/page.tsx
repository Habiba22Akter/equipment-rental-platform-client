import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a GearGrid account to rent equipment or list your own gear and start earning.",
};

export default function SignUpPage() {
  return (
    <AuthShell mode="signup">
      <SignUpForm />
    </AuthShell>
  );
}

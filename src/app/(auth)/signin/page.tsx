import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to GearGrid to manage equipment rentals, bookings and payments in one place.",
};

export default function SignInPage() {
  return (
    <AuthShell mode="signin">
      <SignInForm />
    </AuthShell>
  );
}

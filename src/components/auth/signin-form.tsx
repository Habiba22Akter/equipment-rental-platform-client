"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { useRouter } from "next/navigation";
import { AuthDivider } from "./auth-divider";
import { Field } from "./field";
import { SocialButtons } from "./social-buttons";

type SigninValues = {
  email: string;
  password: string;
  remember: boolean;
};

type SigninErrors = Partial<Record<keyof SigninValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const router = useRouter();
  const [values, setValues] = useState<SigninValues>({
    email: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<SigninErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof SigninValues>(key: K, value: SigninValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const nextErrors: SigninErrors = {};

    if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!values.password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.email) {
        document.getElementById("signin-email")?.focus();
      } else if (nextErrors.password) {
        document.getElementById("signin-password")?.focus();
      }
      toast.error("Please check your details and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe: values.remember,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }

      toast.success("Welcome back!", {
        description: "You are signed in. Time to find the right gear.",
      });

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not sign you in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="signin-heading">
      <div>
        <span className="inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] text-ink/40 uppercase">
          <span className="size-1.5 rounded-full bg-lime-strong" />
          Sign in
        </span>
        <h1
          id="signin-heading"
          className="mt-3 text-[2rem] leading-[1.1] font-bold tracking-[-0.045em] text-ink"
        >
          Welcome back
        </h1>
        <p className="mt-2 text-[13.5px] leading-6 text-ink/50">
          Pick up where you left off — bookings, saved gear and messages are all here.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} className="mt-8 space-y-5">
        <Field
          id="signin-email"
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={Mail}
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />

        <Field
          id="signin-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={Lock}
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          error={errors.password}
          disabled={isSubmitting}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="grid size-9 place-items-center rounded-lg text-ink/35 transition hover:bg-ink/[0.05] hover:text-ink focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:outline-none"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink/55 select-none">
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={(event) => updateField("remember", event.target.checked)}
              disabled={isSubmitting}
              className="size-4 cursor-pointer rounded border-ink/20 accent-ink"
            />
            Remember me
          </label>

          <span className="text-[11px] font-medium text-ink/35">Secure, password-based access</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="group h-12 w-full rounded-xl bg-ink text-[14px] font-semibold text-cream shadow-[0_12px_28px_-14px_rgba(11,31,26,0.65)] transition hover:bg-ink-soft focus-visible:border-ink focus-visible:ring-lime/50 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-5">
        <AuthDivider />
        <SocialButtons mode="signin" />

        <p className="text-center text-[13px] text-ink/50">
          New to GearGrid?{" "}
          <Link
            href="/signup"
            className="font-semibold text-ink underline-offset-4 transition hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Lock,
  Mail,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthDivider } from "./auth-divider";
import { Field } from "./field";
import { GoogleButton } from "./google-button";
import { signUp } from "@/lib/auth-client";
import { console } from "inspector/promises";

type AccountRole = "customer" | "owner";

type SignupValues = {
  name: string;
  email: string;
  photo: string;
  password: string;
  role: AccountRole;
  terms: boolean;
};

type SignupErrors = Partial<Record<keyof SignupValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roles = [
  { value: "customer", label: "Rent equipment", icon: ShoppingBag },
  { value: "owner", label: "List equipment", icon: Package },
] as const satisfies ReadonlyArray<{
  value: AccountRole;
  label: string;
  icon: typeof ShoppingBag;
}>;

function getPasswordChecks(password: string) {
  return [
    { label: "6+ characters", met: password.length >= 6 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
  ];
}

export function SignUpForm() {
  const [values, setValues] = useState<SignupValues>({
    name: "",
    email: "",
    photo: "",
    password: "",
    role: "customer",
    terms: false,
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = getPasswordChecks(values.password);
  const isPasswordValid = passwordChecks.every((check) => check.met);

  function updateField<K extends keyof SignupValues>(key: K, value: SignupValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file is not an image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Keep the image under 2 MB.");
      return;
    }

    // UI-only preview. Swap this for an imgbb upload when the API is connected.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("photo", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: SignupErrors = {};

    if (values.name.trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!isPasswordValid) {
      nextErrors.password = "Use 6+ characters with one uppercase and one lowercase letter.";
    }
    if (!values.terms) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    const photo = values.photo.trim();
    if (photo && !photo.startsWith("data:image/")) {
      try {
        const parsed = new URL(photo);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("Unsupported protocol");
        }
      } catch {
        nextErrors.photo = "Enter a valid image URL or upload a file.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = (["name", "email", "photo", "password", "terms"] as const).find(
        (key) => nextErrors[key],
      );
      if (firstInvalid) {
        document.getElementById(`signup-${firstInvalid}`)?.focus();
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO(better-auth): replace the demo delay with the real sign-up call.
      // await authClient.signUp.email({
      //   name: values.name,
      //   email: values.email,
      //   password: values.password,
      //   image: values.photo,
      //   role: values.role,
      //   callbackURL: "/",
      // });

// ata ami nije documentation theke nisi
const { data, error } = await signUp.email({
    name: "John Doe", // required, The name of the user.
    email: "john.doe@example.com", // required, The email address of the user.
    password: "password1234", // required, The password of the user. It should be at least 8 characters long and max 128 by default.
    image: "https://example.com/image.png", // An optional profile image of the user.
    callbackURL: "https://example.com/callback", // An optional URL to redirect to after the user signs up.
});

// ///
console.log("Sign-up response:", { data, error });

      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success("Account details look good!", {
        description: "Connect better-auth to finish creating this account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignUp() {
    // Google accounts default to the "customer" role.
    // TODO(better-auth): await authClient.signIn.social({ provider: "google", callbackURL: "/" });
    toast.info("Google sign-up is ready to connect.", {
      description: "Wire this button to the better-auth Google provider.",
    });
  }

  return (
    <section aria-labelledby="signup-heading">
      <div>
        <span className="inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] text-ink/40 uppercase">
          <span className="size-1.5 rounded-full bg-lime-strong" />
          Create account
        </span>
        <h1
          id="signup-heading"
          className="mt-3 text-[1.95rem] leading-[1.1] font-bold tracking-[-0.045em] text-ink"
        >
          Join GearGrid
        </h1>
        <p className="mt-2 text-[13.5px] leading-6 text-ink/50">
          Rent smarter or earn from the gear you own — one account does both.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} className="mt-7 space-y-4">
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-ink/80">I want to</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
            {roles.map(({ value, label, icon: Icon }) => {
              const isActive = values.role === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateField("role", value)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-[12.5px] font-semibold transition duration-150 focus-visible:ring-4 focus-visible:ring-lime/40 focus-visible:outline-none",
                    isActive
                      ? "border-ink bg-ink text-cream shadow-[0_8px_20px_-12px_rgba(11,31,26,0.6)]"
                      : "border-ink/10 bg-white text-ink/60 hover:border-ink/20 hover:text-ink",
                  )}
                >
                  <Icon
                    className={cn("size-4 shrink-0", isActive ? "text-lime" : "text-ink/35")}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Field
          id="signup-name"
          label="Full name"
          type="text"
          name="name"
          placeholder="Ayesha Rahman"
          autoComplete="name"
          icon={UserRound}
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
        />

        <Field
          id="signup-email"
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={Mail}
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
        />

        <div className="space-y-1.5">
          <label htmlFor="signup-photo" className="text-[13px] font-semibold text-ink/80">
            Profile photo <span className="font-normal text-ink/35">(optional)</span>
          </label>

          <div className="flex items-center gap-3">
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-cream-deep">
              {values.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.photo}
                  alt="Profile preview"
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-5 text-ink/30" />
              )}
            </div>

            <div className="relative min-w-0 flex-1">
              <ImagePlus className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink/30" />
              <input
                id="signup-photo"
                name="photo"
                type="url"
                inputMode="url"
                placeholder="Paste an image URL"
                autoComplete="off"
                value={values.photo}
                onChange={(event) => updateField("photo", event.target.value)}
                aria-invalid={errors.photo ? true : undefined}
                aria-describedby={errors.photo ? "signup-photo-error" : undefined}
                className={cn(
                  "h-12 w-full rounded-xl border bg-white pr-[5.4rem] pl-11 text-[13px] text-ink shadow-[0_1px_2px_rgba(11,31,26,0.03)] transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink/30",
                  "focus:border-ink/25 focus:ring-4 focus:ring-lime/40",
                  errors.photo
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-ink/10 hover:border-ink/20",
                )}
              />
              <label className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-lg bg-ink/[0.05] px-2.5 py-1.5 text-[10.5px] font-bold tracking-wide text-ink/65 uppercase transition hover:bg-ink/10">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {errors.photo ? (
            <p id="signup-photo-error" role="alert" className="text-[11.5px] font-medium text-red-600">
              {errors.photo}
            </p>
          ) : null}
        </div>

        <Field
          id="signup-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          icon={Lock}
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          error={errors.password}
          description={<PasswordChecklist password={values.password} />}
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

        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-5 text-ink/55 select-none">
            <input
              type="checkbox"
              id="signup-terms"
              name="terms"
              checked={values.terms}
              onChange={(event) => updateField("terms", event.target.checked)}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? "signup-terms-error" : undefined}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-ink/20 accent-ink"
            />
            <span>
              I agree to the <span className="font-semibold text-ink/75">Terms of Service</span> and{" "}
              <span className="font-semibold text-ink/75">Rental Policy</span>, including damage cover
              rules.
            </span>
          </label>

          {errors.terms ? (
            <p role="alert" className="text-[11.5px] font-medium text-red-600">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="group h-12 w-full rounded-xl bg-ink text-[14px] font-semibold text-cream shadow-[0_12px_28px_-14px_rgba(11,31,26,0.65)] transition hover:bg-ink-soft focus-visible:border-ink focus-visible:ring-lime/50 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-5">
        <AuthDivider>or sign up with</AuthDivider>

        <GoogleButton label="Sign up with Google" onClick={handleGoogleSignUp} />

        <p className="text-center text-[13px] text-ink/50">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-ink underline-offset-4 transition hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

function PasswordChecklist({ password }: { password: string }) {
  const checks = getPasswordChecks(password);

  return (
    <ul aria-live="polite" className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
      {checks.map(({ label, met }) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-1.5 text-[10.5px] font-medium transition-colors",
            met ? "text-emerald-700" : "text-ink/35",
          )}
        >
          <span
            className={cn(
              "grid size-3.5 shrink-0 place-items-center rounded-full border transition-colors",
              met ? "border-emerald-600 bg-emerald-600 text-white" : "border-ink/20",
            )}
          >
            {met ? <Check className="size-2.5" strokeWidth={3.5} /> : null}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

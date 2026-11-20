"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-error";

type SocialButtonsProps = {
  mode: "signin" | "signup";
};

type ProviderId = "google" | "github";

const providers: Array<{
  id: ProviderId;
  name: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}> = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: GitHubIcon },
];

export function SocialButtons({ mode }: SocialButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);

  const action = mode === "signin" ? "Continue" : "Sign up";

  async function handleSocialSignIn(provider: ProviderId) {
    if (pendingProvider) return;

    setPendingProvider(provider);

    try {
      // Social accounts are created with the default Customer role.
      // The callback returns to the landing page with a welcome flag.
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/?auth=success",
        errorCallbackURL: "/signin",
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        setPendingProvider(null);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start social sign-in. Please try again.",
      );
      setPendingProvider(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {providers.map((provider) => {
        const isPending = pendingProvider === provider.id;
        const isDisabled = pendingProvider !== null;

        return (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialSignIn(provider.id)}
            disabled={isDisabled}
            aria-label={`${action} with ${provider.name}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white text-[13px] font-semibold text-ink shadow-[0_1px_2px_rgba(11,31,26,0.03)] transition duration-150 hover:border-ink/20 hover:bg-ink/[0.025] focus-visible:border-ink/25 focus-visible:ring-4 focus-visible:ring-lime/40 focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <LoaderCircle className="size-[17px] animate-spin text-ink/50" />
            ) : (
              <provider.icon className="size-[17px]" />
            )}
            {provider.name}
          </button>
        );
      })}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.33Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.23-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.9a6 6 0 0 1 0-3.8V7.52H3.08a10 10 0 0 0 0 8.96l3.33-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.52l3.33 2.58C7.2 7.74 9.4 5.98 12 5.98Z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

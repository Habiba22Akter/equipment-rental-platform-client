"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { BrandMark } from "@/components/auth/brand-mark";
import { cn } from "cn";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "All Equipment" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("auth") === "success") {
      toast.success("You are signed in.", {
        description: "Welcome to GearGrid. Your next project starts here.",
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await authClient.signOut();
      toast.success("Signed out.", { description: "See you next time." });
      setIsMenuOpen(false);
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  const user = session?.user;
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/[0.06] bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-7 lg:px-10">
        <BrandMark />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-ink/55 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {isPending ? (
            <span className="h-9 w-32 animate-pulse rounded-full bg-ink/[0.06]" />
          ) : user ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-ink text-[11px] font-bold text-lime">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      className="size-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <div className="leading-tight">
                  <p className="max-w-[9rem] truncate text-[12.5px] font-semibold text-ink">
                    {user.name}
                  </p>
                  <p className="text-[10.5px] font-medium tracking-wide text-ink/40 uppercase">
                    {user.role}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3.5 text-[12px] font-semibold text-ink/60 transition hover:border-ink/20 hover:text-ink sm:inline-flex"
              >
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 px-3.5 text-[12px] font-semibold text-ink/60 transition hover:border-ink/20 hover:text-ink disabled:opacity-60"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden h-9 items-center rounded-full px-3.5 text-[12.5px] font-semibold text-ink/60 transition hover:bg-ink/[0.04] hover:text-ink sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-cream shadow-[0_10px_22px_-14px_rgba(11,31,26,0.8)] transition hover:bg-ink-soft"
              >
                Register
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:text-ink lg:hidden"
          >
            {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "overflow-hidden border-t border-ink/[0.06] transition-[max-height] duration-300 lg:hidden",
          isMenuOpen ? "max-h-64" : "max-h-0",
        )}
      >
        <nav aria-label="Mobile" className="mx-auto grid max-w-[1180px] gap-1 px-5 py-4 sm:px-7">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-ink/65 transition hover:bg-ink/[0.04] hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          {!user ? (
            <Link
              href="/signin"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-ink/65 transition hover:bg-ink/[0.04] hover:text-ink"
            >
              Login
            </Link>
          ) : (
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-ink/65 transition hover:bg-ink/[0.04] hover:text-ink"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "GG";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

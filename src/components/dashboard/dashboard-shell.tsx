"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  PackagePlus,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { normalizeRole } from "@/lib/roles";

type DashboardUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

type DashboardShellProps = {
  user: DashboardUser;
};

type DashboardTab =
  | "overview"
  | "bookings"
  | "favorites"
  | "reviews"
  | "profile"
  | "listings"
  | "approvals"
  | "users"
  | "payments";

type DashboardNavigation = {
  id: DashboardTab;
  label: string;
  icon: typeof LayoutDashboard;
};

function getNavigation(role: string): DashboardNavigation[] {
  if (role === "Owner") {
    return [
      { id: "overview", label: "Owner Dashboard", icon: LayoutDashboard },
      { id: "listings", label: "My Listings", icon: Package },
      { id: "bookings", label: "Rental Requests", icon: CalendarDays },
      { id: "payments", label: "Payments", icon: DollarSign },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "profile", label: "Profile Settings", icon: Settings },
    ];
  }

  if (role === "Admin") {
    return [
      { id: "overview", label: "Admin Dashboard", icon: LayoutDashboard },
      { id: "users", label: "Manage Users", icon: Users },
      { id: "approvals", label: "Equipment Approvals", icon: ClipboardCheck },
      { id: "bookings", label: "All Bookings", icon: CalendarDays },
      { id: "payments", label: "Payments", icon: DollarSign },
      { id: "profile", label: "Profile Settings", icon: Settings },
    ];
  }

  return [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "My Bookings", icon: CalendarDays },
    { id: "favorites", label: "My Favorites", icon: Heart },
    { id: "reviews", label: "My Reviews", icon: MessageSquareText },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];
}

const recentBookings = [
  {
    name: "Makita Rotary Hammer",
    category: "Power tools",
    dates: "Nov 24 — Nov 27, 2026",
    status: "Confirmed",
    price: "$72",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=240&q=80",
  },
  {
    name: "Canon Cinema Camera",
    category: "Photography",
    dates: "Dec 02 — Dec 04, 2026",
    status: "Pending",
    price: "$180",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=240&q=80",
  },
];

export function DashboardShell({ user }: DashboardShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const initials = getInitials(user.name);
  const role = normalizeRole(user.role);
  const navigation = getNavigation(role);

  function selectTab(tab: DashboardTab) {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <header className="flex h-[72px] items-center justify-between border-b border-ink/[0.08] bg-white/80 px-5 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime">
            <Package className="size-4" />
          </span>
          <span className="text-[17px] font-extrabold tracking-[-0.04em]">
            Gear<span className="text-ink/40">Grid</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen((open) => !open)}
          className="grid size-9 place-items-center rounded-xl border border-ink/10 text-ink/60"
          aria-label={isSidebarOpen ? "Close dashboard menu" : "Open dashboard menu"}
        >
          {isSidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      <div className="mx-auto flex min-h-[calc(100dvh-72px)] max-w-[1440px] lg:min-h-dvh">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[270px] -translate-x-full bg-ink text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : ""
          }`}
        >
          <div className="flex h-full flex-col px-5 py-6">
            <div className="hidden items-center gap-3 px-2 lg:flex">
              <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink">
                <Package className="size-4" />
              </span>
              <span className="text-[17px] font-extrabold tracking-[-0.04em]">
                Gear<span className="text-lime">Grid</span>
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-lime text-[12px] font-bold text-ink">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{user.name}</p>
                  <p className="mt-1 text-[10px] font-medium tracking-[0.12em] text-white/40 uppercase">
                    {user.role ?? "Customer"}
                  </p>
                </div>
              </div>
            </div>

            <nav aria-label="Dashboard" className="mt-8 space-y-1">
              <p className="px-3 pb-3 text-[10px] font-bold tracking-[0.16em] text-white/30 uppercase">
                Workspace
              </p>
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12.5px] font-medium transition ${
                    activeTab === id
                      ? "bg-lime text-ink shadow-[0_12px_24px_-16px_rgba(201,244,91,0.9)]"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12.5px] font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                <LogOut className="size-4" />
                Logout
              </button>
              <p className="px-3 pt-5 text-[10px] leading-5 text-white/25">
                GearGrid keeps your rentals organized, secure and ready for the next project.
              </p>
            </div>
          </div>
        </aside>

        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close dashboard menu"
          />
        ) : null}

        <main className="min-w-0 flex-1">
          <div className="hidden h-[72px] items-center justify-between border-b border-ink/[0.08] bg-white/65 px-8 lg:flex">
            <div className="flex items-center gap-2 text-[12px] text-ink/40">
              <BarChart3 className="size-4" />
              <span>Workspace</span>
              <ChevronRight className="size-3" />
              <span className="font-semibold text-ink/70">
                {navigation.find((item) => item.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium text-ink/50">
              <button type="button" className="relative">
                <Bell className="size-4" />
                <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-lime-strong" />
              </button>
              <span>{user.email}</span>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"
          >
            {activeTab === "overview" ? <Overview userName={user.name} role={role} /> : null}
            {activeTab === "bookings" ? <Bookings /> : null}
            {activeTab === "favorites" ? <EmptyState icon={Heart} title="Your favorite equipment" description="Save equipment you want to compare or rent later." /> : null}
            {activeTab === "reviews" ? <EmptyState icon={Star} title="Your reviews" description="Reviews you leave after completed rentals will appear here." /> : null}
            {activeTab === "profile" ? <Profile user={user} /> : null}
            {activeTab === "listings" ? <EmptyState icon={PackagePlus} title="My equipment listings" description="Create and manage the equipment you rent out to customers." /> : null}
            {activeTab === "approvals" ? <EmptyState icon={ClipboardCheck} title="Equipment approvals" description="Review newly submitted equipment listings and approve or reject them." /> : null}
            {activeTab === "users" ? <EmptyState icon={Users} title="Manage users" description="Review customers and owners from the GearGrid user directory." /> : null}
            {activeTab === "payments" ? <EmptyState icon={DollarSign} title="Payments" description="Track completed, pending and refunded rental payments." /> : null}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Overview({ userName, role }: { userName: string; role: string }) {
  const stats =
    role === "Admin"
      ? [
          { label: "Total users", value: "248", note: "Customers and owners" },
          { label: "Pending approvals", value: "12", note: "Equipment listings" },
          { label: "Active bookings", value: "34", note: "Across the marketplace" },
        ]
      : role === "Owner"
        ? [
            { label: "Active listings", value: "6", note: "Approved equipment" },
            { label: "Rental requests", value: "4", note: "Awaiting a response" },
            { label: "Monthly earnings", value: "$840", note: "Completed payments" },
          ]
        : [
            { label: "Active rentals", value: "2", note: "Currently booked" },
            { label: "Completed rentals", value: "8", note: "Since joining GearGrid" },
            { label: "Saved equipment", value: "5", note: "Ready to compare" },
          ];

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">
            {role} overview
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] sm:text-[2.5rem]">
            Welcome back, {userName.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[13px] text-ink/50">
            Keep track of your rentals and discover your next project essential.
          </p>
        </div>
        <Link
          href="/#featured-equipment"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-[12px] font-semibold text-cream transition hover:bg-ink-soft"
        >
          Browse equipment
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-ink/[0.08] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold">Recent bookings</h2>
            <p className="mt-1 text-[11px] text-ink/40">Your latest equipment reservations</p>
          </div>
          <span className="rounded-full bg-lime/40 px-3 py-1.5 text-[10px] font-bold text-ink">2 active</span>
        </div>
        <div className="mt-5 space-y-3">
          {recentBookings.map((booking) => (
            <BookingRow key={booking.name} booking={booking} />
          ))}
        </div>
      </div>
    </>
  );
}

function Bookings() {
  return (
    <>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Rental history</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">My Bookings</h1>
      <p className="mt-2 text-[13px] text-ink/50">Track, manage and review your equipment reservations.</p>
      <div className="mt-8 space-y-3">
        {recentBookings.map((booking) => (
          <BookingRow key={booking.name} booking={booking} detailed />
        ))}
      </div>
    </>
  );
}

function BookingRow({
  booking,
  detailed = false,
}: {
  booking: (typeof recentBookings)[number];
  detailed?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={booking.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold">{booking.name}</p>
          <p className="mt-1 text-[10.5px] text-ink/40">{booking.category} · {booking.dates}</p>
          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
            {booking.status}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="text-[16px] font-bold">{booking.price}</p>
        {detailed ? (
          <button type="button" className="rounded-lg border border-ink/10 px-3 py-2 text-[10px] font-semibold text-ink/60">
            View details
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-ink/[0.08] bg-white p-5">
      <p className="text-[11px] font-medium text-ink/45">{label}</p>
      <p className="mt-2 text-[2rem] font-bold tracking-[-0.06em]">{value}</p>
      <p className="mt-1 text-[10px] text-ink/35">{note}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Your space</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">{title}</h1>
      <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
            <Icon className="size-5" />
          </span>
          <p className="mt-4 text-[14px] font-bold">{title} is empty</p>
          <p className="mt-2 max-w-sm text-[12px] leading-5 text-ink/45">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Profile({ user }: { user: DashboardUser }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Account</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">Profile Settings</h1>
      <div className="mt-8 max-w-2xl rounded-2xl border border-ink/[0.08] bg-white p-6">
        <div className="flex items-center gap-4 border-b border-ink/[0.08] pb-6">
          <span className="grid size-14 place-items-center overflow-hidden rounded-full bg-ink text-sm font-bold text-lime">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="size-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </span>
          <div>
            <p className="text-[15px] font-bold">{user.name}</p>
            <p className="mt-1 text-[12px] text-ink/45">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-4 pt-6 sm:grid-cols-2">
          <ProfileField label="Full name" value={user.name} />
          <ProfileField label="Email address" value={user.email} />
          <ProfileField label="Account type" value={user.role ?? "Customer"} />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.1em] text-ink/35 uppercase">{label}</p>
      <p className="mt-2 rounded-xl border border-ink/10 bg-cream px-3.5 py-3 text-[12px] text-ink/70">{value}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GG";
}

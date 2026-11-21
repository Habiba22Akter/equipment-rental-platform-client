"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
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
  Pencil,
  Settings,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { normalizeRole } from "@/lib/roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DashboardUser = {
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  role?: string | null;
};

type DashboardShellProps = {
  user: DashboardUser;
  initialTab?: DashboardTab;
};

type DashboardTab =
  | "overview"
  | "add-equipment"
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

type Booking = {
  _id: string;
  equipmentId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  equipment?: {
    name: string;
    imageUrl: string;
    category: string;
    location: string;
    ownerId: string;
    ownerName: string;
  } | null;
};

type EquipmentRow = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  model?: string;
  condition?: string;
  location: string;
  imageUrl?: string;
  image?: string;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  rentalType?: string;
  availableQuantity?: number;
  quantity?: number;
  terms?: string;
  status?: string;
  approvalStatus?: string;
  ownerId?: string;
  ownerName?: string;
};

type AdminUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  createdAt?: string;
};

type PaymentRow = {
  _id: string;
  amount: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  equipment?: { name?: string; imageUrl?: string; category?: string } | null;
};

type PaymentSummary = {
  count: number;
  paidCount: number;
  totalAmount: number;
  currency: string;
};

const BOOKING_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  active: "bg-sky-50 text-sky-700",
  completed: "bg-ink/[0.06] text-ink/60",
  cancelled: "bg-red-50 text-red-600",
};

const APPROVAL_BADGE: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
};

function getNavigation(role: string): DashboardNavigation[] {
  if (role === "Owner") {
    return [
      { id: "overview", label: "Owner Dashboard", icon: LayoutDashboard },
      { id: "add-equipment", label: "Add Equipment", icon: PackagePlus },
      { id: "listings", label: "My Equipment", icon: Package },
      { id: "bookings", label: "My Equipment Rental", icon: CalendarDays },
      { id: "payments", label: "Payments", icon: DollarSign },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "profile", label: "My Profile", icon: Settings },
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
    { id: "bookings", label: "My Rentals", icon: CalendarDays },
    { id: "favorites", label: "My Favorites", icon: Heart },
    { id: "reviews", label: "My Reviews", icon: MessageSquareText },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];
}

export function DashboardShell({ user, initialTab = "overview" }: DashboardShellProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Array<{ equipmentId: string; name: string; imageUrl: string; category: string; dailyRate: number; location: string }>>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const initials = getInitials(user.name);
  const role = normalizeRole(user.role);
  const navigation = getNavigation(role);

  useEffect(() => {
    if (role !== "Customer") return;
    fetch("/api/customer/favorites")
      .then((response) => response.ok ? response.json() : { favorites: [] })
      .then((data) => setFavorites(data.favorites ?? []))
      .catch(() => setFavorites([]))
      .finally(() => setFavoritesLoaded(true));
  }, [role]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((response) => response.ok ? response.json() : { bookings: [] })
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoaded(true));
  }, []);

  function selectTab(tab: DashboardTab) {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Could not update the booking.");
      return;
    }

    setBookings((items) =>
      items.map((item) => item._id === bookingId ? { ...item, status } : item),
    );
    toast.success(`Booking marked ${status}.`);
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
            {activeTab === "overview" ? (
              <Overview
                userName={user.name}
                role={role}
                bookings={bookings}
                bookingsLoaded={bookingsLoaded}
                savedCount={favorites.length}
              />
            ) : null}
            {activeTab === "bookings" ? (
              <Bookings
                role={role}
                bookings={bookings}
                loaded={bookingsLoaded}
                onStatusChange={updateBookingStatus}
              />
            ) : null}
            {activeTab === "favorites" ? (
              <FavoriteEquipment
                favorites={favorites}
                loaded={favoritesLoaded}
                onRemove={(equipmentId) => setFavorites((items) => items.filter((item) => item.equipmentId !== equipmentId))}
              />
            ) : null}
            {activeTab === "reviews" ? (
              <Reviews
                role={role}
                userId={user.id}
                bookings={bookings}
                bookingsLoaded={bookingsLoaded}
              />
            ) : null}
            {activeTab === "profile" ? <Profile user={user} /> : null}
            {activeTab === "listings" ? <OwnerEquipment user={user} /> : null}
            {activeTab === "add-equipment" ? <OwnerEquipment user={user} initialOpen /> : null}
            {activeTab === "approvals" ? <AdminApprovals /> : null}
            {activeTab === "users" ? <AdminUsers currentUserId={user.id} /> : null}
            {activeTab === "payments" ? <Payments role={role} /> : null}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Overview({
  userName,
  role,
  bookings,
  bookingsLoaded,
  savedCount,
}: {
  userName: string;
  role: string;
  bookings: Booking[];
  bookingsLoaded: boolean;
  savedCount: number;
}) {
  const active = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "active").length;
  const completed = bookings.filter((booking) => booking.status === "completed").length;
  const revenue = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((sum, booking) => sum + Number(booking.totalAmount ?? 0), 0);

  const stats =
    role === "Admin"
      ? [
          { label: "Total bookings", value: bookingsLoaded ? String(bookings.length) : "—", note: "Across the marketplace" },
          { label: "Active bookings", value: bookingsLoaded ? String(active) : "—", note: "Confirmed or running" },
          { label: "Rental revenue", value: bookingsLoaded ? money(revenue) : "—", note: "Paid bookings" },
        ]
      : role === "Owner"
        ? [
            { label: "Rental requests", value: bookingsLoaded ? String(bookings.length) : "—", note: "All incoming bookings" },
            { label: "Active rentals", value: bookingsLoaded ? String(active) : "—", note: "Confirmed or running" },
            { label: "Monthly earnings", value: bookingsLoaded ? money(revenue) : "—", note: "Completed payments" },
          ]
        : [
            { label: "Active rentals", value: bookingsLoaded ? String(active) : "—", note: "Currently booked" },
            { label: "Completed rentals", value: bookingsLoaded ? String(completed) : "—", note: "Since joining GearGrid" },
            { label: "Saved equipment", value: String(savedCount), note: "Ready to compare" },
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
          href="/equipment"
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
            <h2 className="text-[15px] font-bold">
              {role === "Customer" ? "Recent bookings" : role === "Owner" ? "Latest rental requests" : "Latest bookings"}
            </h2>
            <p className="mt-1 text-[11px] text-ink/40">Your latest equipment reservations</p>
          </div>
          <span className="rounded-full bg-lime/40 px-3 py-1.5 text-[10px] font-bold text-ink">
            {active} active
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {!bookingsLoaded ? (
            <div className="h-24 animate-pulse rounded-xl bg-cream" />
          ) : bookings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-[12px] text-ink/45">
              No bookings yet. Your reservations will appear here.
            </p>
          ) : (
            bookings.slice(0, 2).map((booking) => (
              <BookingRow key={booking._id} booking={booking} role={role} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function Bookings({
  role,
  bookings,
  loaded,
  onStatusChange,
}: {
  role: string;
  bookings: Booking[];
  loaded: boolean;
  onStatusChange: (bookingId: string, status: string) => void;
}) {
  return (
    <>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">
        {role === "Customer" ? "Rental history" : "Marketplace bookings"}
      </p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">
        {role === "Customer" ? "My Rentals" : role === "Owner" ? "My Equipment Rental" : "All Bookings"}
      </h1>
      <p className="mt-2 text-[13px] text-ink/50">
        {role === "Customer"
          ? "Track, manage and review your equipment reservations."
          : "Follow every rental from confirmation through completion."}
      </p>

      <div className="mt-8">
        {!loaded ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        ) : bookings.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
                <CalendarDays className="size-5" />
              </span>
              <p className="mt-4 text-[14px] font-bold">No bookings yet</p>
              <p className="mt-2 text-[12px] text-ink/45">
                {role === "Customer"
                  ? "Book equipment from the marketplace and it will show up here."
                  : "Customer bookings for your equipment will appear here."}
              </p>
            </div>
          </div>
        ) : role === "Customer" ? (
          <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-white">
            <Table>
              <TableCaption className="px-4 pb-4 text-left text-[10px] text-ink/40">
                Your equipment rental bookings.
              </TableCaption>
              <TableHeader>
                <TableRow className="bg-cream/70 hover:bg-cream/70">
                  <TableHead className="px-4 text-[10px] font-bold text-ink/55">Equipment Name</TableHead>
                  <TableHead className="text-[10px] font-bold text-ink/55">Rental Start Date</TableHead>
                  <TableHead className="text-[10px] font-bold text-ink/55">Rental End Date</TableHead>
                  <TableHead className="text-[10px] font-bold text-ink/55">Booking Date</TableHead>
                  <TableHead className="text-right text-[10px] font-bold text-ink/55">Total Amount</TableHead>
                  <TableHead className="text-[10px] font-bold text-ink/55">Payment Status</TableHead>
                  <TableHead className="px-4 text-[10px] font-bold text-ink/55">Booking Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="max-w-52 px-4 text-[11px] font-semibold text-ink">
                      <span className="block truncate">{booking.equipment?.name ?? "Equipment"}</span>
                    </TableCell>
                    <TableCell className="text-[10.5px] text-ink/60">{formatDate(booking.startDate)}</TableCell>
                    <TableCell className="text-[10.5px] text-ink/60">{formatDate(booking.endDate)}</TableCell>
                    <TableCell className="text-[10.5px] text-ink/60">{booking.createdAt ? formatDate(booking.createdAt) : "—"}</TableCell>
                    <TableCell className="text-right text-[11px] font-bold">{money(booking.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize ${booking.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {booking.paymentStatus ?? "pending"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize ${BOOKING_BADGE[booking.status] ?? "bg-ink/[0.06] text-ink/60"}`}>
                        {booking.status}
                      </span>
                      {booking.status !== "cancelled" && booking.status !== "completed" ? (
                        <button
                          type="button"
                          onClick={() => onStatusChange(booking._id, "cancelled")}
                          className="ml-2 text-[9px] font-semibold text-red-500 hover:underline"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingRow
              key={booking._id}
              booking={booking}
              role={role}
              detailed
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </>
  );
}

function BookingRow({
  booking,
  role,
  detailed = false,
  onStatusChange,
}: {
  booking: Booking;
  role: string;
  detailed?: boolean;
  onStatusChange?: (bookingId: string, status: string) => void;
}) {
  const equipment = booking.equipment;
  const canManage = role === "Owner" || role === "Admin";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink/[0.08] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        {equipment?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={equipment.imageUrl} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-cream text-ink/40">
            <Package className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold">{equipment?.name ?? "Equipment"}</p>
          <p className="mt-1 text-[10.5px] text-ink/40">
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)} · Qty {booking.quantity}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold capitalize ${BOOKING_BADGE[booking.status] ?? "bg-ink/[0.06] text-ink/60"}`}>
              {booking.status}
            </span>
            {detailed && canManage && booking.customerName ? (
              <span className="text-[9.5px] text-ink/40">Customer: {booking.customerName}</span>
            ) : null}
            {detailed && booking.paymentStatus ? (
              <span className="text-[9.5px] text-ink/40 capitalize">Payment: {booking.paymentStatus}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="text-[16px] font-bold">{money(booking.totalAmount)}</p>
        {detailed && canManage && onStatusChange ? (
          <select
            value={booking.status}
            onChange={(event) => onStatusChange(booking._id, event.target.value)}
            className="h-9 rounded-lg border border-ink/10 bg-white px-2 text-[10px] font-semibold capitalize"
            aria-label="Booking status"
          >
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ) : null}
        {detailed && role === "Customer" && onStatusChange && booking.status !== "cancelled" && booking.status !== "completed" ? (
          <button
            type="button"
            onClick={() => onStatusChange(booking._id, "cancelled")}
            className="rounded-lg border border-ink/10 px-3 py-2 text-[10px] font-semibold text-red-500"
          >
            Cancel
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

function FavoriteEquipment({
  favorites,
  loaded,
  onRemove,
}: {
  favorites: Array<{ equipmentId: string; name: string; imageUrl: string; category: string; dailyRate: number; location: string }>;
  loaded: boolean;
  onRemove: (equipmentId: string) => void;
}) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function removeFavorite(equipmentId: string) {
    setRemovingId(equipmentId);
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not remove this favorite.");
      onRemove(equipmentId);
      toast.success("Removed from favorites.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove this favorite.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Saved for later</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">My Favorites</h1>
      {!loaded ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      ) : favorites.length === 0 ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50"><Heart className="size-5" /></span>
            <p className="mt-4 text-[14px] font-bold">No favorite equipment yet</p>
            <p className="mt-2 text-[12px] text-ink/45">Open an equipment detail page and save it for later.</p>
            <Link href="/equipment" className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[11px] font-semibold text-cream">Browse equipment</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/[0.08] bg-white">
          <Table>
            <TableCaption className="px-4 pb-4 text-left text-[10px] text-ink/40">
              Equipment you have saved for later.
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-cream/70 hover:bg-cream/70">
                <TableHead className="px-4 text-[10px] font-bold text-ink/55">Equipment</TableHead>
                <TableHead className="text-[10px] font-bold text-ink/55">Category</TableHead>
                <TableHead className="text-[10px] font-bold text-ink/55">Location</TableHead>
                <TableHead className="text-right text-[10px] font-bold text-ink/55">Daily Rate</TableHead>
                <TableHead className="px-4 text-right text-[10px] font-bold text-ink/55">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favorites.map((item) => (
                <TableRow key={item.equipmentId}>
                  <TableCell className="max-w-64 px-4">
                    <div className="flex min-w-40 items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-cream text-ink/40"><Package className="size-4" /></span>
                      )}
                      <span className="truncate text-[11px] font-semibold text-ink">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10.5px] text-ink/60">{item.category}</TableCell>
                  <TableCell className="max-w-44 truncate text-[10.5px] text-ink/60">{item.location}</TableCell>
                  <TableCell className="text-right text-[11px] font-bold">{money(item.dailyRate)}<span className="ml-1 text-[9px] font-medium text-ink/40">/day</span></TableCell>
                  <TableCell className="px-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/equipment/${item.equipmentId}`} className="inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[10px] font-semibold text-cream transition hover:bg-ink-soft">
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeFavorite(item.equipmentId)}
                        disabled={removingId === item.equipmentId}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 px-2.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Heart className="size-3 fill-current" />
                        {removingId === item.equipmentId ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OwnerEquipment({ user, initialOpen = false }: { user: DashboardUser; initialOpen?: boolean }) {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(initialOpen);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<EquipmentRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEquipment() {
    setLoaded(false);
    const response = await fetch("/api/owner/equipments", { cache: "no-store" });
    const data = await response.json();
    setEquipment(response.ok ? data.equipment ?? [] : []);
    setLoaded(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/owner/equipments", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { equipment: [] })
      .then((data) => {
        if (!cancelled) setEquipment(data.equipment ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not upload image.");
    return data.url as string;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("image");

    try {
      if (!(file instanceof File) || file.size === 0) throw new Error("Choose an equipment image to upload.");
      const imageUrl = await uploadImage(file);

      const response = await fetch("/api/owner/equipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          category: formData.get("category"),
          brand: formData.get("brand"),
          model: formData.get("model"),
          condition: formData.get("condition"),
          location: formData.get("location"),
          imageUrl,
          rentalPrice: Number(formData.get("rentalPrice")),
          rentalType: formData.get("rentalType"),
          availableQuantity: Number(formData.get("availableQuantity")),
          terms: formData.get("terms"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add equipment.");

      toast.success("Equipment submitted.", { description: "It is waiting for admin approval." });
      form.reset();
      setOpen(false);
      await loadEquipment();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add equipment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setSavingEdit(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/owner/equipments/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          category: formData.get("category"),
          brand: formData.get("brand"),
          model: formData.get("model"),
          condition: formData.get("condition"),
          location: formData.get("location"),
          imageUrl: formData.get("imageUrl"),
          dailyRate: Number(formData.get("dailyRate")),
          weeklyRate: Number(formData.get("weeklyRate")) || undefined,
          monthlyRate: Number(formData.get("monthlyRate")) || undefined,
          rentalType: formData.get("rentalType"),
          availableQuantity: Number(formData.get("availableQuantity")),
          terms: formData.get("terms"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update equipment.");

      toast.success("Equipment updated.", { description: "It will be reviewed again before going live." });
      setEditing(null);
      await loadEquipment();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update equipment.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(item: EquipmentRow) {
    const confirmed = window.confirm(`Delete “${item.name}”? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(item._id);
    try {
      const response = await fetch(`/api/owner/equipments/${item._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete equipment.");

      setEquipment((rows) => rows.filter((row) => row._id !== item._id));
      toast.success("Equipment deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete equipment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Inventory</p>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">{initialOpen ? "Add Equipment" : "My Equipment"}</h1>
          <p className="mt-2 text-[13px] text-ink/50">{initialOpen ? "List your equipment with clear details and rental terms." : "Create listings and track approval status."}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[12px] font-semibold text-cream">
                <PackagePlus className="size-4" /> Add equipment
              </button>
            }
          />
          <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>Add equipment</DialogTitle>
            <DialogDescription>Create a listing for customers to rent. It will remain pending until approved.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 pt-2 sm:grid-cols-2">
              <OwnerField label="Equipment name" name="name"><input required name="name" placeholder="Excavator, camera, drill..." /></OwnerField>
              <OwnerField label="Category" name="category">
                <select required name="category" defaultValue="">
                  <option value="" disabled>Select a category</option>
                  <option>Construction Equipment</option>
                  <option>Photography Equipment</option>
                  <option>Vehicles &amp; Transportation</option>
                  <option>Agriculture Equipment</option>
                  <option>Electronics</option>
                  <option>Event Equipment</option>
                </select>
              </OwnerField>
              <div className="sm:col-span-2"><OwnerField label="Description" name="description"><textarea required name="description" rows={3} placeholder="Describe the equipment, condition and included accessories." /></OwnerField></div>
              <OwnerField label="Brand" name="brand"><input required name="brand" placeholder="e.g. Makita" /></OwnerField>
              <OwnerField label="Model" name="model"><input required name="model" placeholder="e.g. XGT 40V" /></OwnerField>
              <OwnerField label="Equipment condition" name="condition">
                <select required name="condition" defaultValue="">
                  <option value="" disabled>Select condition</option>
                  <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
                </select>
              </OwnerField>
              <OwnerField label="Location" name="location"><input required name="location" placeholder="Chattogram, Bangladesh" /></OwnerField>
              <OwnerField label="Rental type" name="rentalType">
                <select required name="rentalType" defaultValue="Daily">
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </OwnerField>
              <OwnerField label="Rental price" name="rentalPrice"><input required name="rentalPrice" type="number" min="0.01" step="0.01" placeholder="50" /></OwnerField>
              <OwnerField label="Available quantity" name="availableQuantity"><input required name="availableQuantity" type="number" min="1" step="1" defaultValue="1" /></OwnerField>
              <div className="sm:col-span-2"><OwnerField label="Rental terms and conditions" name="terms"><textarea required name="terms" rows={3} placeholder="Pickup, damage policy, late return..." /></OwnerField></div>
              <div className="sm:col-span-2"><OwnerField label="Equipment image (ImgBB upload)" name="image"><input required name="image" type="file" accept="image/*" /></OwnerField><p className="mt-1 text-[10px] text-ink/40">Upload one image up to 5 MB. The image is hosted on ImgBB.</p></div>
              <div className="sm:col-span-2 rounded-xl border border-ink/10 bg-cream/70 p-3 text-[11px] text-ink/60">
                <p className="font-bold text-ink">Owner information</p>
                <p className="mt-1">{user.name} · {user.email}</p>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px]">
                <span className="font-semibold text-amber-800">Listing status</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-800">Pending admin approval</span>
              </div>
              <button disabled={submitting} type="submit" className="sm:col-span-2 h-11 rounded-xl bg-ink text-[12px] font-semibold text-cream disabled:opacity-50">
                {submitting ? "Adding equipment..." : "Add equipment"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(next) => { if (!next) setEditing(null); }}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit equipment</DialogTitle>
            <DialogDescription>
              Owner changes are reviewed again before the listing goes back live.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <form onSubmit={handleUpdate} className="grid gap-4 pt-2 sm:grid-cols-2">
              <OwnerField label="Equipment name" name="name"><input required name="name" defaultValue={editing.name} /></OwnerField>
              <OwnerField label="Category" name="category">
                <select required name="category" defaultValue={editing.category}>
                  <option>Construction Equipment</option><option>Photography Equipment</option><option>Vehicles &amp; Transportation</option><option>Agriculture Equipment</option><option>Electronics</option><option>Event Equipment</option>
                </select>
              </OwnerField>
              <div className="sm:col-span-2"><OwnerField label="Description" name="description"><textarea required name="description" rows={3} defaultValue={editing.description ?? ""} /></OwnerField></div>
              <OwnerField label="Brand" name="brand"><input required name="brand" defaultValue={editing.brand ?? ""} /></OwnerField>
              <OwnerField label="Model" name="model"><input required name="model" defaultValue={editing.model ?? ""} /></OwnerField>
              <OwnerField label="Equipment condition" name="condition">
                <select required name="condition" defaultValue={editing.condition ?? "Good"}>
                  <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
                </select>
              </OwnerField>
              <OwnerField label="Location" name="location"><input required name="location" defaultValue={editing.location} /></OwnerField>
              <OwnerField label="Rental type" name="rentalType">
                <select required name="rentalType" defaultValue={editing.rentalType ?? "Daily"}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </OwnerField>
              <OwnerField label="Daily price" name="dailyRate"><input required name="dailyRate" type="number" min="1" step="0.01" defaultValue={Number(editing.dailyRate ?? 0)} /></OwnerField>
              <OwnerField label="Available quantity" name="availableQuantity"><input required name="availableQuantity" type="number" min="1" step="1" defaultValue={Number(editing.availableQuantity ?? editing.quantity ?? 1)} /></OwnerField>
              <OwnerField label="Weekly price (optional)" name="weeklyRate"><input name="weeklyRate" type="number" min="1" step="0.01" defaultValue={Number(editing.weeklyRate ?? 0) || ""} /></OwnerField>
              <OwnerField label="Monthly price (optional)" name="monthlyRate"><input name="monthlyRate" type="number" min="1" step="0.01" defaultValue={Number(editing.monthlyRate ?? 0) || ""} /></OwnerField>
              <div className="sm:col-span-2"><OwnerField label="Rental terms" name="terms"><textarea name="terms" rows={2} defaultValue={editing.terms ?? ""} /></OwnerField></div>
              <div className="sm:col-span-2"><OwnerField label="Image URL" name="imageUrl"><input name="imageUrl" type="url" defaultValue={editing.imageUrl ?? editing.image ?? ""} /></OwnerField></div>
              <button disabled={savingEdit} type="submit" className="sm:col-span-2 h-11 rounded-xl bg-ink text-[12px] font-semibold text-cream disabled:opacity-50">
                {savingEdit ? "Saving changes..." : "Save changes"}
              </button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {!loaded ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      ) : equipment.length === 0 ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50"><PackagePlus className="size-5" /></span>
            <p className="mt-4 text-[14px] font-bold">No equipment listings yet</p>
            <p className="mt-2 text-[12px] text-ink/45">Add your first equipment to start receiving rental requests.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/[0.08] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead><TableHead>Category</TableHead><TableHead>Condition</TableHead><TableHead>Location</TableHead><TableHead>Price</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => {
                const status = item.status ?? item.approvalStatus ?? "pending";
                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl ?? item.image ?? ""} alt="" className="size-12 rounded-xl object-cover" />
                        <div>
                          <span className="font-bold">{item.name}</span>
                          <p className="mt-1 text-[10px] text-ink/45">{[item.brand, item.model].filter(Boolean).join(" · ") || "Brand/model not provided"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.condition ?? "—"}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>${Number(item.dailyRate ?? 0).toFixed(2)} / day</TableCell>
                    <TableCell>{item.availableQuantity ?? item.quantity ?? 1}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${APPROVAL_BADGE[status] ?? "bg-amber-50 text-amber-700"}`}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setEditing(item)} className="grid size-8 place-items-center rounded-lg border border-ink/10 text-ink/55" aria-label={`Edit ${item.name}`}>
                          <Pencil className="size-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(item)} disabled={deletingId === item._id} className="grid size-8 place-items-center rounded-lg border border-ink/10 text-red-500 disabled:opacity-40" aria-label={`Delete ${item.name}`}>
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function AdminApprovals() {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/equipments?status=pending", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { equipment: [] })
      .then((data) => {
        if (!cancelled) setEquipment(data.equipment ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function review(item: EquipmentRow, status: "approved" | "rejected") {
    setBusyId(item._id);
    try {
      const response = await fetch("/api/admin/equipments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId: item._id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not review equipment.");

      setEquipment((rows) => rows.filter((row) => row._id !== item._id));
      toast.success(status === "approved" ? "Listing approved." : "Listing rejected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review equipment.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Marketplace quality</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">Equipment Approvals</h1>
      <p className="mt-2 text-[13px] text-ink/50">New listings wait here until an admin approves them.</p>

      {!loaded ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      ) : equipment.length === 0 ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50"><ClipboardCheck className="size-5" /></span>
            <p className="mt-4 text-[14px] font-bold">Nothing waiting for review</p>
            <p className="mt-2 text-[12px] text-ink/45">New owner listings will appear here automatically.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {equipment.map((item) => (
            <div key={item._id} className="flex flex-col gap-4 rounded-2xl border border-ink/[0.08] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl ?? item.image ?? ""} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{item.name}</p>
                  <p className="mt-1 text-[10.5px] text-ink/40">
                    {item.category} · {item.location} · ${Number(item.dailyRate ?? 0).toFixed(2)}/day
                  </p>
                  <p className="mt-1 text-[10px] text-ink/35">Owner: {item.ownerName ?? "Unknown"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => review(item, "approved")}
                  className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-[10px] font-semibold text-cream disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => review(item, "rejected")}
                  className="inline-flex h-9 items-center rounded-lg border border-ink/10 px-3 text-[10px] font-semibold text-red-500 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsers({ currentUserId }: { currentUserId?: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/users", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { users: [] })
      .then((data) => {
        if (!cancelled) setUsers(data.users ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function changeRole(user: AdminUser, role: string) {
    setBusyId(user._id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update the user.");

      setUsers((rows) => rows.map((row) => row._id === user._id ? { ...row, role } : row));
      toast.success(`${user.name ?? "User"} is now a ${role}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Community</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">Manage Users</h1>
      <p className="mt-2 text-[13px] text-ink/50">Promote trusted renters to owners or return them to customers.</p>

      {!loaded ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      ) : users.length === 0 ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <p className="text-[12px] text-ink/45">No users found.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/[0.08] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const role = normalizeRole(user.role);
                const isSelf = Boolean(currentUserId && user._id === currentUserId);
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <span className="font-bold">{user.name ?? "Unnamed user"}</span>
                    </TableCell>
                    <TableCell>{user.email ?? "—"}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold">{role}</span>
                    </TableCell>
                    <TableCell>{user.createdAt ? formatDate(user.createdAt) : "—"}</TableCell>
                    <TableCell>
                      {role === "Admin" || isSelf ? (
                        <span className="text-[10px] text-ink/35">{isSelf ? "Your account" : "Admin"}</span>
                      ) : (
                        <select
                          value={role}
                          disabled={busyId === user._id}
                          onChange={(event) => changeRole(user, event.target.value)}
                          className="h-9 rounded-lg border border-ink/10 bg-white px-2 text-[10px] font-semibold disabled:opacity-50"
                          aria-label={`Role for ${user.name ?? "user"}`}
                        >
                          <option value="Customer">Customer</option>
                          <option value="Owner">Owner</option>
                        </select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Payments({ role }: { role: string }) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payments", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { payments: [], summary: null })
      .then((data) => {
        if (cancelled) return;
        setPayments(data.payments ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statusStyles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    refunded: "bg-red-50 text-red-600",
    failed: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Transactions</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">Payments</h1>
      <p className="mt-2 text-[13px] text-ink/50">
        {role === "Customer"
          ? "Your rental payments and receipts."
          : role === "Owner"
            ? "Payments collected for your equipment."
            : "Every transaction processed by the marketplace."}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Paid transactions"
          value={loaded ? String(summary?.paidCount ?? 0) : "—"}
          note="Successful Stripe payments"
        />
        <StatCard
          label="Total volume"
          value={loaded ? money(summary?.totalAmount ?? 0) : "—"}
          note="Gross rental value"
        />
        <StatCard
          label="Currency"
          value={(summary?.currency ?? "usd").toUpperCase()}
          note="All rentals are charged in dollars"
        />
      </div>

      {!loaded ? (
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-white" />
      ) : payments.length === 0 ? (
        <div className="mt-6 grid min-h-48 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
              <DollarSign className="size-5" />
            </span>
            <p className="mt-4 text-[14px] font-bold">No payments yet</p>
            <p className="mt-2 text-[12px] text-ink/45">
              Paid bookings will show their transaction receipts here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex flex-col gap-4 rounded-xl border border-ink/[0.08] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {payment.equipment?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={payment.equipment.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-cream text-ink/40">
                    <Package className="size-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">
                    {payment.equipment?.name ?? "Equipment rental"}
                  </p>
                  <p className="mt-1 text-[10.5px] text-ink/40">
                    {payment.createdAt ? formatDate(payment.createdAt) : "—"}
                    {payment.equipment?.category ? ` · ${payment.equipment.category}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${statusStyles[payment.status ?? "paid"] ?? "bg-ink/[0.06] text-ink/60"}`}>
                  {payment.status ?? "paid"}
                </span>
                <p className="text-[15px] font-bold">{money(payment.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OwnerField({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-ink/55" htmlFor={name}>
      {label}
      <span className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:px-3 [&_input]:text-[12px] [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-ink/10 [&_select]:px-3 [&_select]:text-[12px] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-ink/10 [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-[12px]">
        {children}
      </span>
    </label>
  );
}

type ReviewRow = {
  _id: string;
  bookingId: string;
  equipmentId: string;
  equipmentName?: string;
  ownerId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function Reviews({
  role,
  userId,
  bookings,
  bookingsLoaded,
}: {
  role: string;
  userId?: string;
  bookings: Booking[];
  bookingsLoaded: boolean;
}) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query =
      role === "Customer"
        ? `?customerId=${encodeURIComponent(userId ?? "")}`
        : role === "Owner"
          ? `?ownerId=${encodeURIComponent(userId ?? "")}`
          : "";

    fetch(`/api/reviews${query}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { reviews: [] })
      .then((data) => {
        if (!cancelled) setReviews(data.reviews ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [role, userId]);

  const reviewedBookings = new Set(reviews.map((review) => review.bookingId));
  const awaitingReview = role === "Customer"
    ? bookings.filter((booking) => booking.status === "completed" && !reviewedBookings.has(booking._id))
    : [];

  function openReview(booking: Booking) {
    setReviewing(booking);
    setRating(5);
    setComment("");
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewing) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: reviewing._id, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the review.");

      setReviews((items) => [data.review as ReviewRow, ...items]);
      setReviewing(null);
      toast.success("Thanks for the review!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the review.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReview(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete the review.");

      setReviews((items) => items.filter((item) => item._id !== id));
      toast.success("Review deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the review.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Feedback</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">
        {role === "Customer" ? "My Reviews" : role === "Owner" ? "Rental Reviews" : "All Reviews"}
      </h1>
      <p className="mt-2 text-[13px] text-ink/50">
        {role === "Customer"
          ? "Share how each completed rental went."
          : role === "Owner"
            ? "See what renters say about your equipment."
            : "Review quality across the GearGrid marketplace."}
      </p>

      {role === "Customer" ? (
        <div className="mt-8">
          <h2 className="text-[14px] font-bold">Waiting for your review</h2>
          {!bookingsLoaded ? (
            <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white" />
          ) : awaitingReview.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-ink/15 bg-white p-4 text-[11.5px] text-ink/45">
              Nothing to review right now. Completed rentals will show up here.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {awaitingReview.map((booking) => (
                <div key={booking._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/[0.08] bg-white p-3">
                  <div className="flex items-center gap-3">
                    {booking.equipment?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={booking.equipment.imageUrl} alt="" className="size-11 rounded-lg object-cover" />
                    ) : null}
                    <div>
                      <p className="text-[12px] font-bold">{booking.equipment?.name ?? "Equipment"}</p>
                      <p className="text-[10px] text-ink/40">
                        {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReview(booking)}
                    className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-[10.5px] font-semibold text-cream"
                  >
                    Leave a review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <Dialog open={Boolean(reviewing)} onOpenChange={(next) => { if (!next) setReviewing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review {reviewing?.equipment?.name ?? "your rental"}</DialogTitle>
            <DialogDescription>Your feedback helps other renters choose with confidence.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReview} className="grid gap-4 pt-2">
            <div className="grid gap-2 text-[11px] font-bold text-ink/55">
              Rating
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    className="rounded-md p-1"
                  >
                    <Star className={`size-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}`} />
                  </button>
                ))}
                <span className="ml-1 text-[11px] font-semibold text-ink/45">{rating}/5</span>
              </div>
            </div>
            <label className="grid gap-2 text-[11px] font-bold text-ink/55" htmlFor="review-comment">
              Comment (optional)
              <textarea
                id="review-comment"
                rows={4}
                maxLength={600}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Condition of the equipment, pickup experience, owner communication..."
                className="w-full rounded-xl border border-ink/10 px-3 py-3 text-[12px] font-normal"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-xl bg-ink text-[12px] font-semibold text-cream disabled:opacity-50"
            >
              {submitting ? "Saving review..." : "Publish review"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {!loaded ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white" />
      ) : reviews.length === 0 ? (
        <div className="mt-6 grid min-h-48 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
              <Star className="size-5" />
            </span>
            <p className="mt-4 text-[14px] font-bold">No reviews yet</p>
            <p className="mt-2 text-[12px] text-ink/45">
              {role === "Customer"
                ? "Finish a rental, then share your experience."
                : "Reviews will appear here as renters share feedback."}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-2xl border border-ink/[0.08] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-bold">{review.equipmentName ?? "Equipment"}</p>
                  <p className="mt-0.5 text-[10px] text-ink/40">
                    {role === "Customer" ? "Your review" : review.customerName} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars rating={review.rating} />
                  {role === "Admin" || role === "Customer" ? (
                    <button
                      type="button"
                      disabled={deletingId === review._id}
                      onClick={() => deleteReview(review._id)}
                      className="grid size-8 place-items-center rounded-lg border border-ink/10 text-red-500 disabled:opacity-40"
                      aria-label="Delete review"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
              {review.comment ? (
                <p className="mt-3 text-[12.5px] leading-6 text-ink/55">{review.comment}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`size-3.5 ${value <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-ink/20"}`}
        />
      ))}
    </span>
  );
}

function Profile({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handlePhoto(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not upload the photo.");

      setImage(data.url);
      toast.success("Photo uploaded.", { description: "Save your profile to apply it." });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      toast.error("Your name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const result = await authClient.updateUser({
        name: nextName,
        image: image.trim() || null,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message || "Could not update your profile.");
      }

      toast.success("Profile updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-ink/35 uppercase">Account</p>
      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em]">
        {user.role === "Owner" ? "My Profile" : "Profile Settings"}
      </h1>
      <p className="mt-2 text-[13px] text-ink/50">
        Update how your name and photo appear to other GearGrid members.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-2xl rounded-2xl border border-ink/[0.08] bg-white p-6"
      >
        <div className="flex items-center gap-4 border-b border-ink/[0.08] pb-6">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-sm font-bold text-lime">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="size-full object-cover" />
            ) : (
              getInitials(name || user.name)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{name || user.name}</p>
            <p className="mt-1 truncate text-[12px] text-ink/45">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4 pt-6 sm:grid-cols-2">
          <label className="grid gap-2 text-[11px] font-bold text-ink/55 sm:col-span-2" htmlFor="profile-name">
            Full name
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-ink/10 px-3 text-[12px] font-normal"
            />
          </label>

          <label className="grid gap-2 text-[11px] font-bold text-ink/55 sm:col-span-2" htmlFor="profile-photo">
            Photo URL
            <input
              id="profile-photo"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="h-11 w-full rounded-xl border border-ink/10 px-3 text-[12px] font-normal"
            />
          </label>

          <label className="grid gap-2 text-[11px] font-bold text-ink/55 sm:col-span-2" htmlFor="profile-upload">
            Or upload a photo
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handlePhoto(file);
              }}
              className="text-[12px] file:mr-3 file:rounded-lg file:border-0 file:bg-cream file:px-3 file:py-2 file:text-[11px] file:font-semibold"
            />
            {uploading ? <span className="text-[10px] font-normal text-ink/40">Uploading...</span> : null}
          </label>

          <label className="grid gap-2 text-[11px] font-bold text-ink/55" htmlFor="profile-phone">
            Phone number
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Add your phone number"
              className="h-11 w-full rounded-xl border border-ink/10 px-3 text-[12px] font-normal"
            />
          </label>

          <label className="grid gap-2 text-[11px] font-bold text-ink/55 sm:col-span-2" htmlFor="profile-address">
            Address
            <textarea
              id="profile-address"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Add your street, city and region"
              rows={3}
              className="w-full resize-y rounded-xl border border-ink/10 px-3 py-2.5 text-[12px] font-normal"
            />
          </label>

          <ProfileField label="Email address" value={user.email} />
          <ProfileField label="Account type" value={user.role ?? "Customer"} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink/[0.08] pt-5">
          <p className="text-[10.5px] leading-5 text-ink/35">
            Your role is managed by GearGrid admins.
          </p>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-10 shrink-0 items-center rounded-xl bg-ink px-4 text-[11.5px] font-semibold text-cream disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
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

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GG";
}

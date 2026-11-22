import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  MapPin,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getEquipmentCategoryLabel, type FeaturedEquipment } from "@/lib/equipment";
import { serverFetch } from "@/lib/server-api";
import { SiteHeader } from "@/components/site/site-header";
import { EquipmentSearchForm } from "@/components/equipment/equipment-search-form";

export const metadata: Metadata = {
  title: "All equipment",
  description:
    "Browse approved rental equipment. Search by name or location, then filter by category, rental type, price and availability.",
};

export const instant = false;

type SearchValue = string | string[] | undefined;
type SearchParams = Promise<Record<string, SearchValue>>;
type EquipmentApiRecord = Record<string, unknown>;

const defaultCategories = [
  "Agriculture Equipment",
  "Construction Equipment",
  "Electronics",
  "Event Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
];

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePrice(value: SearchValue) {
  const parsed = Number(first(value));
  return Number.isFinite(parsed) && parsed >= 0 && first(value)?.trim() ? parsed : undefined;
}

function selectedValues(value: SearchValue) {
  return [...new Set((Array.isArray(value) ? value : value ? [value] : []).map((item) => item.trim()).filter(Boolean))];
}

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function toEquipmentCard(value: EquipmentApiRecord): FeaturedEquipment | null {
  const id = asText(value._id ?? value.id, "");
  if (!id) return null;

  const dailyRate = asAmount(value.dailyRate ?? value.pricePerDay);
  const weeklyRate = asAmount(value.weeklyRate) || dailyRate * 7;
  const monthlyRate = asAmount(value.monthlyRate) || dailyRate * 30;
  const rentalType = value.rentalType === "Weekly" || value.rentalType === "Monthly" ? value.rentalType : "Daily";
  const quantityValue = value.currentAvailableQuantity ?? value.availableQuantity ?? value.quantity;
  const availableQuantity = Number.isFinite(Number(quantityValue))
    ? Math.max(0, Number(quantityValue))
    : 1;

  return {
    id,
    name: asText(value.name, "Unnamed equipment"),
    description: asText(value.description, "Reliable equipment for your next project."),
    category: getEquipmentCategoryLabel(asText(value.category, "Equipment")),
    location: asText(value.location, "Location unavailable"),
    imageUrl: asText(value.imageUrl ?? value.image, "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85"),
    dailyRate,
    weeklyRate,
    monthlyRate,
    rentalType,
    availableQuantity,
  };
}

function requestEquipmentApi<T>(path: string) {
  return serverFetch<T>(path).catch(() => ({
    ok: false,
    status: 502,
    data: undefined,
    error: "The equipment service is unavailable. Start the Express server and try again.",
  }));
}

export default async function EquipmentListPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = (first(params.q) ?? "").trim();
  const selectedCategories = selectedValues(params.category);
  const rentalTypeValue = first(params.rentalType);
  const rentalType = rentalTypeValue === "Daily" || rentalTypeValue === "Weekly" || rentalTypeValue === "Monthly"
    ? rentalTypeValue
    : undefined;
  const minPrice = parsePrice(params.minPrice);
  const maxPrice = parsePrice(params.maxPrice);
  const availabilityValue = first(params.availability);
  const availability = availabilityValue === "available" || availabilityValue === "unavailable"
    ? availabilityValue
    : "all";
  const sortValue = first(params.sort);
  const sort = sortValue === "price-asc" || sortValue === "price-desc" ? sortValue : "newest";
  const invalidPriceRange = minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice;

  const equipmentQuery = new URLSearchParams();
  if (q) equipmentQuery.set("q", q);
  selectedCategories.forEach((category) => equipmentQuery.append("category", category));
  if (rentalType) equipmentQuery.set("rentalType", rentalType);
  if (minPrice !== undefined) equipmentQuery.set("minPrice", String(minPrice));
  if (maxPrice !== undefined) equipmentQuery.set("maxPrice", String(maxPrice));
  if (availability !== "all") equipmentQuery.set("availability", availability);
  equipmentQuery.set("sort", sort);

  const [session, equipmentResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    invalidPriceRange
      ? Promise.resolve({ ok: true, status: 200, data: [] as EquipmentApiRecord[], error: undefined })
      : requestEquipmentApi<EquipmentApiRecord[]>(`/api/equipments?${equipmentQuery.toString()}`),
  ]);
  const equipment = equipmentResult.ok
    ? (equipmentResult.data ?? []).map(toEquipmentCard).filter((item): item is FeaturedEquipment => Boolean(item))
    : [];
  const equipmentError = equipmentResult.ok ? "" : equipmentResult.error ?? "Could not load equipment right now.";
  const categoryOptions = defaultCategories;
  const viewHref = (id: string) => (session?.user ? `/equipment/${id}` : "/signin");

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />

      <section className="overflow-hidden bg-ink text-cream">
        <div className="mx-auto flex min-h-[205px] w-full max-w-[1180px] items-center justify-between gap-8 px-5 py-9 sm:px-7 lg:min-h-[230px] lg:px-10">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.2em] text-lime uppercase">Explore & rent</p>
            <h1 className="mt-2 text-[2.4rem] font-semibold leading-none tracking-[-0.055em] sm:text-[3.25rem]">
              All equipment
            </h1>
            <p className="mt-3 max-w-xl text-[12px] leading-6 text-cream/65 sm:text-[13px]">
              Find approved gear for your project. Compare clear rental rates and check availability before booking.
            </p>
          </div>
          <div className="hidden h-[118px] w-[174px] shrink-0 overflow-hidden rounded-[20px] border border-white/15 bg-ink-soft p-1 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=85"
              alt="Tools ready for a project"
              className="size-full rounded-[16px] object-cover opacity-85"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1180px] px-5 py-7 sm:px-7 sm:py-9 lg:px-10">
        <EquipmentSearchForm>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-ink/[0.08] bg-white px-4 shadow-[0_12px_35px_-30px_rgba(11,31,26,0.55)]">
              <Search className="size-4 shrink-0 text-ink/35" />
              <span className="sr-only">Search by equipment name or location</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by equipment name or location..."
                className="h-full w-full bg-transparent text-[12px] outline-none placeholder:text-ink/35"
              />
            </label>
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[11px] font-bold text-cream transition hover:bg-ink-soft">
              Search
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[225px_minmax(0,1fr)] lg:gap-6">
            <aside className="rounded-2xl border border-ink/[0.09] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 border-b border-ink/[0.08] pb-3">
                <SlidersHorizontal className="size-4 text-ink/55" />
                <h2 className="text-[13px] font-bold">Filters</h2>
              </div>

              <fieldset className="mt-4">
                <legend className="text-[9px] font-bold tracking-[0.13em] text-ink/45 uppercase">Category</legend>
                <div className="mt-2.5 max-h-48 space-y-2 overflow-y-auto pr-1">
                  {categoryOptions.map((category, index) => (
                    <label key={category} htmlFor={`category-${index}`} className="flex cursor-pointer items-center gap-2.5 text-[10.5px] text-ink/65 transition hover:text-ink">
                      <input
                        id={`category-${index}`}
                        type="checkbox"
                        name="category"
                        value={category}
                        defaultChecked={selectedCategories.includes(category)}
                        className="size-3.5 accent-[#0b1f1a]"
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 border-t border-ink/[0.08] pt-4">
                <label htmlFor="rentalType" className="text-[9px] font-bold tracking-[0.13em] text-ink/45 uppercase">Rental type</label>
                <span className="relative mt-2 block">
                  <select id="rentalType" name="rentalType" defaultValue={rentalType ?? "all"} className="h-10 w-full appearance-none rounded-lg border border-ink/10 bg-white px-3 pr-8 text-[10.5px] text-ink/70 outline-none focus:border-ink/35">
                    <option value="all">All rental types</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-3 right-3 size-3.5 text-ink/40" />
                </span>
              </div>

              <fieldset className="mt-5 border-t border-ink/[0.08] pt-4">
                <legend className="text-[9px] font-bold tracking-[0.13em] text-ink/45 uppercase">Rental price range (BDT)</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-[9px] font-medium text-ink/40" htmlFor="minPrice">
                    Min
                    <input id="minPrice" name="minPrice" type="number" min="0" step="1" defaultValue={minPrice ?? ""} placeholder="৳0" className="mt-1 h-9 w-full rounded-lg border border-ink/10 px-2.5 text-[10.5px] text-ink outline-none focus:border-ink/35" />
                  </label>
                  <label className="text-[9px] font-medium text-ink/40" htmlFor="maxPrice">
                    Max
                    <input id="maxPrice" name="maxPrice" type="number" min="0" step="1" defaultValue={maxPrice ?? ""} placeholder="No max" className="mt-1 h-9 w-full rounded-lg border border-ink/10 px-2.5 text-[10.5px] text-ink outline-none focus:border-ink/35" />
                  </label>
                </div>
              </fieldset>

              <div className="mt-5 border-t border-ink/[0.08] pt-4">
                <label htmlFor="availability" className="text-[9px] font-bold tracking-[0.13em] text-ink/45 uppercase">Availability</label>
                <span className="relative mt-2 block">
                  <select id="availability" name="availability" defaultValue={availability} className="h-10 w-full appearance-none rounded-lg border border-ink/10 bg-white px-3 pr-8 text-[10.5px] text-ink/70 outline-none focus:border-ink/35">
                    <option value="all">All equipment</option>
                    <option value="available">Available now</option>
                    <option value="unavailable">Out of stock</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-3 right-3 size-3.5 text-ink/40" />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-[10px] font-bold text-cream transition hover:bg-ink-soft">
                  Apply filters
                </button>
                <button type="button" data-reset-filters className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-ink/10 px-3 text-[10px] font-semibold text-ink/55 transition hover:bg-cream">
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              </div>
            </aside>

            <section className="min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/[0.08] pb-3">
                <div>
                  <h2 className="text-[14px] font-bold">{q ? `Results for “${q}”` : "Approved equipment"}</h2>
                  <p className="mt-1 text-[10px] text-ink/40">
                    {invalidPriceRange
                      ? "Minimum price must be lower than maximum price."
                      : `${equipment.length} listing${equipment.length === 1 ? "" : "s"} found`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-ink/45">
                  <label htmlFor="sort">Sort by</label>
                  <span className="relative">
                    <select id="sort" name="sort" defaultValue={sort} className="h-9 min-w-36 appearance-none rounded-lg border border-ink/10 bg-white px-3 pr-8 text-[10px] font-semibold text-ink/75 outline-none focus:border-ink/35">
                      <option value="newest">Recently added</option>
                      <option value="price-asc">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-2.5 right-2.5 size-3.5 text-ink/40" />
                  </span>
                  <button type="submit" className="h-9 rounded-lg border border-ink/10 bg-white px-3 text-[10px] font-semibold text-ink/65 transition hover:bg-cream">Apply</button>
                </div>
              </div>

              {equipment.length === 0 ? (
                <div className="mt-6 grid min-h-72 place-items-center rounded-2xl border border-dashed border-ink/15 bg-white p-7 text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
                      <PackageSearch className="size-5" />
                    </span>
                    <p className="mt-4 text-[14px] font-bold">No approved equipment found</p>
                    <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-ink/45">
                      {invalidPriceRange
                        ? "Adjust the price range and apply the filters again."
                : equipmentError || "Try changing your search or filters. Owner listings appear here after an admin approves them."}
                    </p>
                    <button type="button" data-reset-filters className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[10px] font-semibold text-cream">
                      Clear filters
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {equipment.map((item) => {
                    const rentalPrice = item.rentalType === "Weekly"
                      ? item.weeklyRate
                      : item.rentalType === "Monthly"
                        ? item.monthlyRate
                        : item.dailyRate;
                    const isAvailable = item.availableQuantity > 0;

                    return (
                      <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.08] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_22px_45px_-34px_rgba(11,31,26,0.55)]">
                        <div className="relative overflow-hidden bg-cream">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.name} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                          <span className="absolute top-3 left-3 max-w-[70%] truncate rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-bold text-ink/70 shadow-sm backdrop-blur">
                            {item.category}
                          </span>
                          <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold shadow-sm ${isAvailable ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                            {isAvailable ? <CheckCircle2 className="size-3" /> : null}
                            {isAvailable ? `${item.availableQuantity} available` : "Out of stock"}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="line-clamp-1 text-[14px] font-bold tracking-[-0.02em]">{item.name}</h3>
                          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-ink/45">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>
                          <p className="mt-2 line-clamp-2 min-h-9 text-[10.5px] leading-[1.15rem] text-ink/45">{item.description}</p>
                          <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink/[0.07] pt-3.5">
                            <div>
                              <p className="text-[15px] font-bold tracking-[-0.03em]">
                                {formatPrice(rentalPrice)}
                                <span className="ml-1 text-[9px] font-medium tracking-normal text-ink/40">/ {item.rentalType.toLowerCase()}</span>
                              </p>
                              <p className="mt-1 text-[9px] text-ink/40">{item.rentalType} rental</p>
                            </div>
                            <Link href={viewHref(item.id)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-ink px-3 text-[10px] font-semibold text-cream transition hover:bg-ink-soft">
                              View details
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </EquipmentSearchForm>
      </main>
    </div>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 }).format(value);
}

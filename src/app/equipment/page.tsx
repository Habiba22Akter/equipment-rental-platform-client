import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, MapPin, PackageSearch, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { getEquipmentCategories, getEquipmentList } from "@/lib/equipment";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Browse equipment",
  description:
    "Search approved construction, photography, agriculture and event equipment from verified GearGrid owners.",
};

export const instant = false;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref({
  q,
  category,
  sort,
}: {
  q?: string;
  category?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort && sort !== "newest") params.set("sort", sort);

  const query = params.toString();
  return query ? `/equipment?${query}` : "/equipment";
}

export default async function EquipmentListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (first(params.q) ?? "").trim();
  const category = (first(params.category) ?? "").trim();
  const sortParam = first(params.sort);
  const sort = sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "newest";

  const session = await auth.api.getSession({ headers: await headers() });
  const [equipment, categories] = await Promise.all([
    getEquipmentList({ q, category, sort }),
    getEquipmentCategories(),
  ]);

  const viewHref = (id: string) => (session?.user ? `/equipment/${id}` : "/signin");

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-7 lg:px-10 lg:py-14">
        <div className="max-w-2xl">
          <p className="text-[10.5px] font-bold tracking-[0.18em] text-ink/35 uppercase">
            Marketplace
          </p>
          <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.05em] sm:text-[3rem]">
            Find equipment for
            <span className="font-serif italic text-ink/80"> every job.</span>
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-ink/50 sm:text-[14px]">
            Search approved listings from verified owners. Filter by category, compare daily
            rates and book securely with Stripe.
          </p>
        </div>

        <form
          action="/equipment"
          method="get"
          className="mt-8 flex flex-col gap-2 rounded-2xl border border-ink/[0.08] bg-white p-2 shadow-[0_20px_50px_-44px_rgba(11,31,26,0.6)] sm:flex-row"
        >
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
          <label className="flex flex-1 items-center gap-3 px-3" htmlFor="equipment-search">
            <Search className="size-4 shrink-0 text-ink/35" />
            <span className="sr-only">Search equipment</span>
            <input
              id="equipment-search"
              name="q"
              defaultValue={q}
              placeholder="Search drills, cameras, tractors, event gear..."
              className="h-11 w-full bg-transparent text-[13px] outline-none placeholder:text-ink/35"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[12px] font-semibold text-cream transition hover:bg-ink-soft"
          >
            Search
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={buildHref({ q, sort })}
            className={`inline-flex h-8 items-center rounded-full px-3.5 text-[11.5px] font-semibold transition ${
              category
                ? "border border-ink/10 bg-white text-ink/55 hover:text-ink"
                : "bg-ink text-cream"
            }`}
          >
            All categories
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={buildHref({ q, category: item, sort })}
              className={`inline-flex h-8 items-center rounded-full px-3.5 text-[11.5px] font-semibold capitalize transition ${
                category === item
                  ? "bg-ink text-cream"
                  : "border border-ink/10 bg-white text-ink/55 hover:text-ink"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink/[0.08] pb-4">
          <div>
            <h2 className="text-[16px] font-bold">
              {q ? `Results for “${q}”` : category ? category : "All approved equipment"}
            </h2>
            <p className="mt-1 text-[11px] text-ink/40">
              {equipment.length === 0
                ? "No listings match these filters yet."
                : `${equipment.length} listing${equipment.length === 1 ? "" : "s"} available now`}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            <span className="mr-1 text-ink/35">Sort</span>
            {[
              { id: "newest", label: "Newest" },
              { id: "price-asc", label: "Price ↑" },
              { id: "price-desc", label: "Price ↓" },
            ].map((option) => (
              <Link
                key={option.id}
                href={buildHref({ q, category, sort: option.id })}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  sort === option.id
                    ? "bg-ink text-cream"
                    : "text-ink/50 hover:bg-ink/[0.05] hover:text-ink"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        {equipment.length === 0 ? (
          <div className="mt-10 grid min-h-72 place-items-center rounded-[24px] border border-dashed border-ink/15 bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-cream text-ink/50">
                <PackageSearch className="size-5" />
              </span>
              <p className="mt-4 text-[15px] font-bold">Nothing here yet</p>
              <p className="mt-2 max-w-sm text-[12px] leading-5 text-ink/45">
                {category
                  ? "No approved listings are available in this category yet. Owner submissions appear here after an admin approves them."
                  : "Try a different search term or clear the filters to see every approved listing."}
              </p>
              <Link
                href="/equipment"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[11px] font-semibold text-cream"
              >
                Clear filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-ink/[0.08] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_22px_45px_-34px_rgba(11,31,26,0.55)]"
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-cream/90 px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] text-ink/60 uppercase backdrop-blur">
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold tracking-[-0.01em]">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-ink/45">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-medium text-ink/40">
                    <MapPin className="size-3.5" />
                    {item.location}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-ink/[0.06] pt-3">
                    <p className="text-[16px] font-bold">
                      ${item.dailyRate}
                      <span className="text-[10px] font-normal text-ink/40">/day</span>
                    </p>
                    <Link
                      href={viewHref(item.id)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg bg-ink px-3 text-[10.5px] font-semibold text-cream"
                    >
                      View details
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

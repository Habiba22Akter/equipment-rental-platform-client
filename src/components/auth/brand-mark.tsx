import Link from "next/link";
import { cn } from "cn";

type BrandMarkProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function BrandMark({ className, tone = "dark" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="GearGrid home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[11px] transition-transform duration-300 group-hover:-rotate-6",
          tone === "dark" ? "bg-ink text-lime" : "bg-lime text-ink",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[19px]" aria-hidden="true">
          <path
            d="M4.5 7.6 12 3.3l7.5 4.3v8.8L12 20.7l-7.5-4.3V7.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="m4.9 7.8 7.1 4.1 7.1-4.1M12 11.9v8.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-[17px] font-extrabold tracking-[-0.04em]",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        Gear
        <span className={tone === "dark" ? "text-ink/40" : "text-lime"}>Grid</span>
      </span>
    </Link>
  );
}

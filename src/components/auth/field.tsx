import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

type FieldProps = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  description?: ReactNode;
  labelAction?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function Field({
  label,
  icon: Icon,
  error,
  description,
  labelAction,
  trailing,
  className,
  id,
  ...props
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink/80">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-ink/30"
          />
        ) : null}

        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 w-full rounded-xl border bg-white px-3.5 text-[14.5px] text-ink shadow-[0_1px_2px_rgba(11,31,26,0.03)] transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink/30",
            "focus:border-ink/25 focus:ring-4 focus:ring-lime/40",
            Icon && "pl-11",
            trailing && "pr-12",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-ink/10 hover:border-ink/20",
          )}
          {...props}
        />

        {trailing ? (
          <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-[11.5px] font-medium text-red-600">
          {error}
        </p>
      ) : null}

      {description}
    </div>
  );
}

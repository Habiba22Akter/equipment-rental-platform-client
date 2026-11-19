import type { ReactNode } from "react";

export function AuthDivider({ children = "or continue with" }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-ink/10" />
      <span className="text-[10px] font-semibold tracking-[0.14em] text-ink/35 uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  );
}

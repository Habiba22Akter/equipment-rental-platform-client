"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("geargrid-theme") === "dark";
    document.documentElement.classList.toggle("dark", saved);
    setDark(saved);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("geargrid-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`${dark ? "Light" : "Dark"} mode`}
      className={compact
        ? "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12.5px] font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
        : "grid size-9 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:text-ink"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {compact ? "Theme" : <span className="sr-only">Toggle theme</span>}
    </button>
  );
}

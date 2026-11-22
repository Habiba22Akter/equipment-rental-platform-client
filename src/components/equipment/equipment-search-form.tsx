"use client";

import { useEffect, useRef, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function EquipmentSearchForm({ children }: { children: ReactNode }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function updateResults(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === "string" && value.trim() && value !== "all") {
        params.append(key, value.trim());
      }
    }
    const query = params.toString();
    router.replace(query ? `/equipment?${query}` : "/equipment", { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    updateResults(event.currentTarget);
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "q") return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (formRef.current) updateResults(formRef.current);
    }, 350);
  }

  function handleClick(event: MouseEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest("[data-reset-filters]")) return;

    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    for (const field of Array.from(form.elements)) {
      if (field instanceof HTMLInputElement) {
        if (field.type === "checkbox") field.checked = false;
        else field.value = "";
      }
      if (field instanceof HTMLSelectElement) {
        field.value = field.name === "sort" ? "newest" : "all";
      }
    }

    updateResults(form);
  }

  return (
    <form ref={formRef} action="/equipment" method="get" onSubmit={handleSubmit} onChange={handleChange} onClick={handleClick}>
      {children}
    </form>
  );
}

"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-center"
      offset={{ top: 20 }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border-ink/10 !bg-white !font-sans !text-ink !shadow-[0_18px_45px_-20px_rgba(11,31,26,0.35)]",
          title: "!text-[13px] !font-semibold !text-ink",
          description: "!text-[12px] !text-ink/55",
          actionButton: "!rounded-lg !bg-ink !text-cream",
          cancelButton: "!rounded-lg !bg-cream-deep !text-ink",
          closeButton: "!border-ink/10 !bg-white !text-ink/50",
          success: "[&_[data-icon]]:!text-emerald-600",
          error: "[&_[data-icon]]:!text-red-600",
          info: "[&_[data-icon]]:!text-ink/60",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

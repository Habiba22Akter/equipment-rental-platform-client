"use client";

import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type MotionSectionProps = ComponentProps<typeof motion.section> & {
  children: ReactNode;
};

export function MotionSection({ children, ...props }: MotionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

type MotionDivProps = ComponentProps<typeof motion.div> & {
  children: ReactNode;
};

export function MotionDiv({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

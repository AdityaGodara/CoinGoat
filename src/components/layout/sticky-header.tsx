"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useScrollDirection } from "@/lib/motion/hooks";
import { EASINGS } from "@/lib/motion/easings";

export function StickyHeader({ children }: { children: ReactNode }) {
  const hidden = useScrollDirection();

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.28, ease: EASINGS.inOut }}
      className="sticky top-0 z-40 w-full"
    >
      {children}
    </motion.header>
  );
}

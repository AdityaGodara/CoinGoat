"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { DURATION, EASINGS } from "@/lib/motion/easings";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.slow, ease: EASINGS.out }}
    >
      {children}
    </motion.div>
  );
}

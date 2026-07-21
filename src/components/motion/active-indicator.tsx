"use client";

import { motion } from "framer-motion";

export function ActiveIndicator({ layoutId, className }: { layoutId: string; className?: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      className={className}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}

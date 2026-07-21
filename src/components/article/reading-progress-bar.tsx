"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import type { RefObject } from "react";

export function ReadingProgressBar({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/motion/variants";
import { DURATION, EASINGS } from "@/lib/motion/easings";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function Reveal({ children, delay = 0, transition, ...props }: RevealProps) {
  // `animate`, not `whileInView`: see the comment in stagger-group.tsx — the
  // IntersectionObserver-based trigger can get stuck at the "hidden" variant
  // when this content is swapped in via a client-side transition rather than
  // a fresh full-page load.
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={transition ?? (delay ? { delay, duration: DURATION.slow, ease: EASINGS.out } : undefined)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/motion/variants";
import { DURATION, EASINGS } from "@/lib/motion/easings";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  amount?: number;
}

export function Reveal({ children, delay = 0, amount = 0.25, transition, ...props }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={fadeUp}
      transition={transition ?? (delay ? { delay, duration: DURATION.slow, ease: EASINGS.out } : undefined)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

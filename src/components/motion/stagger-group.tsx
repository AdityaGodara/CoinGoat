"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion/variants";

export function StaggerGroup({ children, ...props }: HTMLMotionProps<"div">) {
  // `animate` (mount-triggered), not `whileInView` (scroll/IntersectionObserver-
  // triggered): whileInView's observer callback frequently never fires when
  // this content replaces already-in-viewport content via a client-side
  // transition (pagination, navigating into an article) rather than a fresh
  // full-page load with an actual scroll — leaving items stuck invisible at
  // their "hidden" variant despite being present and clickable in the DOM.
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

import type { Variants } from "framer-motion";
import { DURATION, EASINGS } from "./easings";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASINGS.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.medium, ease: EASINGS.out },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.medium, ease: EASINGS.out },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: DURATION.fast, ease: EASINGS.out },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = fadeUp;

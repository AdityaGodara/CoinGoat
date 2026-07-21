"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { useLenisScrollTo } from "@/lib/motion/lenis-provider";
import { DURATION, EASINGS } from "@/lib/motion/easings";
import { ArrowUpIcon } from "@/components/ui/icons";

export function BackToTopButton() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const scrollTo = useLenisScrollTo();

  useMotionValueEvent(scrollY, "change", (latest) => setVisible(latest > 640));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => scrollTo(0, { duration: 1.4 })}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: DURATION.base, ease: EASINGS.out }}
          aria-label="Back to top"
          className="glass-nav fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border shadow-lg"
        >
          <ArrowUpIcon className="h-4 w-4 text-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

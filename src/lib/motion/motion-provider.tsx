"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { DURATION, EASINGS } from "./easings";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASINGS.out }}>
      {children}
    </MotionConfig>
  );
}

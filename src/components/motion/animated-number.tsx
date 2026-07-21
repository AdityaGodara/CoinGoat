"use client";

import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SPRINGS } from "@/lib/motion/easings";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, format = (v) => v.toFixed(2), className }: AnimatedNumberProps) {
  const spring = useSpring(value, SPRINGS.number);
  const prevValue = useRef(value);
  const [display, setDisplay] = useState(() => format(value));
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(format(latest));
  });

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(value > prevValue.current ? "up" : "down");
      prevValue.current = value;
      spring.set(value);
      const timeout = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [value, spring]);

  return (
    <motion.span
      className={`inline-block rounded px-1 tabular-nums ${className ?? ""}`}
      animate={{
        backgroundColor:
          flash === "up"
            ? ["rgba(22,199,132,0.28)", "rgba(22,199,132,0)"]
            : flash === "down"
              ? ["rgba(234,57,67,0.28)", "rgba(234,57,67,0)"]
              : "rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}

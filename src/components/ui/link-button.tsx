"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BASE_BUTTON_CLASSES, SIZE_CLASSES, VARIANT_CLASSES, type ButtonSize, type ButtonVariant } from "./button-styles";

const MotionLink = motion.create(Link);

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function LinkButton({ href, children, variant = "primary", size = "md", className }: LinkButtonProps) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
      className={`${BASE_BUTTON_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ""}`}
    >
      {children}
    </MotionLink>
  );
}

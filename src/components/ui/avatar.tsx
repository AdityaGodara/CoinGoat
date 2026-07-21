"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Avatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
      className={`relative shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill unoptimized className="object-cover" />
    </motion.div>
  );
}

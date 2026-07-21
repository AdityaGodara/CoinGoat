"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { DURATION, EASINGS } from "@/lib/motion/easings";
import { scaleIn } from "@/lib/motion/variants";
import { CloseIcon } from "@/components/ui/icons";

interface LightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ src, alt, isOpen, onClose }: LightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.medium, ease: EASINGS.out }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <motion.img
            src={src}
            alt={alt}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

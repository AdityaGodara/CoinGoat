"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "./nav-links";
import { DURATION, EASINGS } from "@/lib/motion/easings";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface md:hidden"
      >
        <MenuIcon className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.medium }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: DURATION.medium, ease: EASINGS.inOut }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) setIsOpen(false);
              }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col gap-1 border-l border-border bg-background p-6 md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-hover"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

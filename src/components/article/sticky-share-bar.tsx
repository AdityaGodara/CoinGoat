"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LinkIcon, TwitterIcon, LinkedinIcon } from "@/components/ui/icons";
import { DURATION } from "@/lib/motion/easings";

export function StickyShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const shareLinks = [
    {
      label: "Share on Twitter",
      icon: TwitterIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on LinkedIn",
      icon: LinkedinIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex gap-2 lg:sticky lg:top-28 lg:flex-col">
      {shareLinks.map(({ label, icon: Icon, href }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Icon className="h-4 w-4" />
        </motion.a>
      ))}
      <motion.button
        type="button"
        onClick={handleCopy}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
        aria-label="Copy link"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/50 hover:text-accent"
      >
        <LinkIcon className="h-4 w-4" />
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast }}
              className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background"
            >
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

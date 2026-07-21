"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/lib/motion/variants";
import { DURATION } from "@/lib/motion/easings";

interface Position {
  top: number;
  left: number;
}

export function SelectionSharePopover() {
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleSelection = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() ?? "";
        if (!text || !selection || selection.rangeCount === 0) {
          setPosition(null);
          return;
        }
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0) {
          setPosition(null);
          return;
        }
        setSelectedText(text);
        setPosition({ top: rect.top + window.scrollY - 48, left: rect.left + rect.width / 2 });
      }, 150);
    };

    const clearOnScroll = () => setPosition(null);

    document.addEventListener("selectionchange", handleSelection);
    window.addEventListener("scroll", clearOnScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("selectionchange", handleSelection);
      window.removeEventListener("scroll", clearOnScroll);
    };
  }, []);

  async function handleShare() {
    const shareText = `"${selectedText}" (via ${document.title})`;
    if (navigator.share) {
      await navigator.share({ text: shareText, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`).catch(() => {});
    }
    setPosition(null);
  }

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          className="glass-nav fixed z-40 -translate-x-1/2 rounded-full border border-border px-3 py-1.5 shadow-lg"
          style={{ top: position.top, left: position.left }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: DURATION.fast }}
        >
          <button
            type="button"
            onClick={handleShare}
            className="text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Share selection
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

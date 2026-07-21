"use client";

import { motion } from "framer-motion";
import { useActiveHeading } from "@/lib/motion/hooks";
import { useLenisScrollTo } from "@/lib/motion/lenis-provider";
import type { Heading } from "@/lib/utils/markdown";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const activeId = useActiveHeading(headings.map((heading) => heading.id));
  const scrollTo = useLenisScrollTo();

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-1 text-sm">
      <p className="mb-3 font-semibold text-foreground">On this page</p>
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        return (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollTo(`#${heading.id}`, { offset: -96 });
              window.history.replaceState(null, "", `#${heading.id}`);
            }}
            className={`relative block border-l-2 py-1 pl-3 transition-colors ${heading.depth === 3 ? "ml-3" : ""} ${
              isActive ? "border-transparent text-accent" : "border-border text-muted hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="toc-active"
                className="absolute -left-[2px] top-0 h-full w-[2px] rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {heading.text}
          </a>
        );
      })}
    </nav>
  );
}

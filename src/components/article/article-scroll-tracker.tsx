"use client";

import { useRef, type ReactNode } from "react";
import { ReadingProgressBar } from "./reading-progress-bar";

export function ArticleScrollTracker({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      <ReadingProgressBar targetRef={ref} />
      {children}
    </div>
  );
}

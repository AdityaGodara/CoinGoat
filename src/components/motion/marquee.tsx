import type { ReactNode } from "react";

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`group overflow-hidden ${className ?? ""}`}>
      <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
        <div className="flex shrink-0 items-center gap-6" aria-hidden={false}>
          {children}
        </div>
        <div className="flex shrink-0 items-center gap-6" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

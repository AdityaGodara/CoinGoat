"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActiveIndicator } from "@/components/motion/active-indicator";
import { NAV_LINKS } from "./nav-links";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
            {isActive && (
              <ActiveIndicator
                layoutId="nav-underline"
                className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

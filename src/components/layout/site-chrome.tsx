"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/lib/motion/motion-provider";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { BackToTopButton } from "./back-to-top-button";

interface SiteChromeProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/** Sanity Studio (/studio) is a full-viewport app with its own auth, theming,
 * and layout — it must render bare, without this site's Header/Footer/theme/
 * motion/Lenis chrome around it. `Header`/`Footer` are async Server
 * Components, so RootLayout renders them and passes the result in as nodes
 * rather than this (client) component importing them directly. */
export function SiteChrome({ header, footer, children }: SiteChromeProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <MotionProvider>
        <LenisProvider>
          {header}
          <div className="flex-1">{children}</div>
          {footer}
          <BackToTopButton />
        </LenisProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}

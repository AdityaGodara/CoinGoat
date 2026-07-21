"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

interface ScrollToOptions {
  offset?: number;
  duration?: number;
}

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function useLenisScrollTo() {
  const lenis = useLenis();
  return (target: string | HTMLElement | number, options: ScrollToOptions = {}) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: options.offset ?? 0, duration: options.duration ?? 1.2 });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  };
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const instance = new Lenis({ autoRaf: true, duration: 1.1 });
    lenisRef.current = instance;
    // Lenis must be created here (needs `window`) and exposed via state so
    // context consumers (TOC, back-to-top) re-render once it's ready: a ref
    // alone never triggers that re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

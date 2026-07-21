"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/motion/lightbox";

export function LightboxImage({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Expand image: ${alt}`}
        className="group relative block w-full overflow-hidden rounded-2xl"
      >
        <span className="relative block aspect-video w-full">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </span>
      </button>
      <Lightbox src={src} alt={alt} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

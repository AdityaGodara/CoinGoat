"use client";

import Image from "next/image";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { PriceChangeBadge } from "./price-change-badge";
import { Sparkline } from "./sparkline";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { CryptoAsset } from "@/types";

interface CryptoPriceCardProps {
  asset: CryptoAsset;
  variant?: "compact" | "full";
}

export function CryptoPriceCard({ asset, variant = "full" }: CryptoPriceCardProps) {
  const isCompact = variant === "compact";
  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-[0_0_24px_-4px_var(--color-accent)] ${
        isCompact ? "px-3 py-2" : "p-4"
      }`}
    >
      <Image
        src={asset.logo}
        alt={asset.name}
        width={isCompact ? 24 : 32}
        height={isCompact ? 24 : 32}
        className="shrink-0 rounded-full"
        unoptimized
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-foreground">{asset.symbol}</span>
          {!isCompact && <span className="truncate text-sm text-muted">{asset.name}</span>}
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <AnimatedNumber value={asset.price} format={formatPrice} />
          <PriceChangeBadge changePct={asset.change24hPct} />
        </div>
      </div>
      {!isCompact && <Sparkline data={asset.sparkline} className="shrink-0" />}
    </div>
  );
}

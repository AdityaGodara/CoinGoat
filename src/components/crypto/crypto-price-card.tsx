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

  if (isCompact) {
    return (
      <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 transition-shadow duration-300 hover:shadow-[0_0_24px_-4px_var(--color-accent)]">
        <Image src={asset.logo} alt={asset.name} width={24} height={24} className="shrink-0 rounded-full" unoptimized />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-foreground">{asset.symbol}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <AnimatedNumber value={asset.price} format={formatPrice} />
          <PriceChangeBadge changePct={asset.change24hPct} />
        </div>
      </div>
    );
  }

  // Sparkline gets its own full-width row below rather than sitting beside
  // the price — sharing a row with real (often multi-digit) price data
  // caused the two to visually overlap once content was wide enough to
  // overflow its shrunk flex space.
  return (
    <div className="group rounded-xl border border-border bg-surface p-4 transition-shadow duration-300 hover:shadow-[0_0_24px_-4px_var(--color-accent)]">
      <div className="flex items-center gap-3">
        <Image src={asset.logo} alt={asset.name} width={32} height={32} className="shrink-0 rounded-full" unoptimized />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-foreground">{asset.symbol}</span>
            <span className="truncate text-sm text-muted">{asset.name}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm">
            <AnimatedNumber value={asset.price} format={formatPrice} />
            <PriceChangeBadge changePct={asset.change24hPct} />
          </div>
        </div>
      </div>
      <Sparkline data={asset.sparkline} height={32} className="mt-3 w-full" />
    </div>
  );
}

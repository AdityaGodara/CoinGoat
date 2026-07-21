"use client";

import { Marquee } from "@/components/motion/marquee";
import { CryptoPriceCard } from "@/components/crypto/crypto-price-card";
import { useLivePrices } from "@/lib/hooks/use-live-prices";
import type { CryptoAsset } from "@/types";

export function CryptoPriceMarquee({ initialAssets }: { initialAssets: CryptoAsset[] }) {
  const assets = useLivePrices(initialAssets);

  return (
    <Marquee className="border-y border-border bg-surface/60 py-2">
      {assets.map((asset) => (
        <CryptoPriceCard key={asset.symbol} asset={asset} variant="compact" />
      ))}
    </Marquee>
  );
}

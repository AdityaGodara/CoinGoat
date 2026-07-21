"use client";

import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { CryptoPriceCard } from "@/components/crypto/crypto-price-card";
import { useLivePrices } from "@/lib/hooks/use-live-prices";
import type { CryptoAsset } from "@/types";

export function MarketsGrid({ initialAssets }: { initialAssets: CryptoAsset[] }) {
  const assets = useLivePrices(initialAssets);

  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <StaggerItem key={asset.symbol}>
          <CryptoPriceCard asset={asset} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

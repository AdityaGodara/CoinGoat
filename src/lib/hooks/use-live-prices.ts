"use client";

import { useEffect, useState } from "react";
import type { CryptoAsset } from "@/types";

export function useLivePrices(initialAssets: CryptoAsset[], intervalMs = 4000): CryptoAsset[] {
  const [assets, setAssets] = useState(initialAssets);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          const driftPct = (Math.random() - 0.5) * 0.6;
          const nextPrice = Math.max(asset.price * (1 + driftPct / 100), 0.0001);
          return { ...asset, price: nextPrice, change24hPct: asset.change24hPct + driftPct * 0.4 };
        }),
      );
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return assets;
}

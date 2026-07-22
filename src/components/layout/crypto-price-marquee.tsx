import { Marquee } from "@/components/motion/marquee";
import { CryptoPriceCard } from "@/components/crypto/crypto-price-card";
import type { CryptoAsset } from "@/types";

export function CryptoPriceMarquee({ initialAssets }: { initialAssets: CryptoAsset[] }) {
  return (
    <Marquee className="border-y border-border bg-surface/60 py-2">
      {initialAssets.map((asset) => (
        <CryptoPriceCard key={asset.symbol} asset={asset} variant="compact" />
      ))}
    </Marquee>
  );
}

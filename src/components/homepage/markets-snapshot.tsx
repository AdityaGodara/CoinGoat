import { SectionHeading } from "@/components/ui/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { CryptoPriceCard } from "@/components/crypto/crypto-price-card";
import type { CryptoAsset } from "@/types";

export function MarketsSnapshot({ assets }: { assets: CryptoAsset[] }) {
  return (
    <section>
      <SectionHeading title="Markets" viewAllHref="/markets" />
      <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset) => (
          <StaggerItem key={asset.symbol}>
            <CryptoPriceCard asset={asset} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

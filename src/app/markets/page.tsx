import type { Metadata } from "next";
import { getCryptoAssets } from "@/lib/api/crypto";
import { Container } from "@/components/ui/container";
import { MarketsGrid } from "@/components/crypto/markets-grid";

export const metadata: Metadata = {
  title: "Markets",
};

export default async function MarketsPage() {
  const assets = await getCryptoAssets();

  return (
    <Container className="py-10">
      <h1 className="mb-2 text-headline-lg font-extrabold text-foreground">Markets</h1>
      <p className="mb-8 text-muted">A live-style snapshot of prices across major crypto assets.</p>
      <MarketsGrid initialAssets={assets} />
    </Container>
  );
}

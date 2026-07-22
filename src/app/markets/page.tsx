import type { Metadata } from "next";
import { getCryptoAssets } from "@/lib/api/crypto";
import { Container } from "@/components/ui/container";
import { MarketsGrid } from "@/components/crypto/markets-grid";

export const metadata: Metadata = {
  title: "Markets",
};

// Matches the CoinGecko fetch's own cache window (src/lib/api/coingecko/
// client.ts) — kept in sync so this page's route-level revalidate doesn't
// mask how often the underlying market data actually refreshes.
export const revalidate = 300;

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

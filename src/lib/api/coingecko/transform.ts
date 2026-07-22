import type { CryptoAsset } from "@/types";
import type { CoingeckoMarketCoin } from "./types";

// Sparkline (src/components/crypto/sparkline.tsx) expects a plain, gap-free
// `number[]` — it does no defensive filtering itself — so any null/missing
// points from CoinGecko's 7d hourly series must be dropped here.
function cleanSparkline(points: (number | null)[] | undefined): number[] {
  return (points ?? []).filter((point): point is number => typeof point === "number");
}

/** Returns null (rather than coercing to 0, which would misleadingly render
 * as a real "$0.0000" price) for a coin CoinGecko has no live price for —
 * e.g. an id that's been migrated/delisted, like the old "matic-network"
 * after its MATIC->POL migration. Callers should filter these out. */
export function mapCoingeckoCoin(raw: CoingeckoMarketCoin): CryptoAsset | null {
  if (raw.current_price === null) return null;

  return {
    symbol: raw.symbol.toUpperCase(),
    name: raw.name,
    logo: raw.image,
    price: raw.current_price,
    change24hPct: raw.price_change_percentage_24h ?? 0,
    sparkline: cleanSparkline(raw.sparkline_in_7d?.price),
  };
}

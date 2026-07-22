import type { CryptoAsset } from "@/types";
import { fetchFromCoingecko } from "./client";
import { COINGECKO_IDS, COINGECKO_SYMBOL_ORDER } from "./coins";
import { mapCoingeckoCoin } from "./transform";
import type { CoingeckoMarketCoin } from "./types";

// One request for every coin's price + 24h change + 7d sparkline —
// `sparkline=true` bundles chart data into the same call, so there's no
// second endpoint/request needed for charts. This single call is what the
// whole app's rate-limit budget rests on (see client.ts).
export async function getCoingeckoMarkets(): Promise<CryptoAsset[]> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const path = `/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;
  const raw = await fetchFromCoingecko<CoingeckoMarketCoin[]>(path);

  const bySymbol = new Map(raw.map((coin) => [coin.symbol.toUpperCase(), coin]));
  return COINGECKO_SYMBOL_ORDER.map((symbol) => bySymbol.get(symbol))
    .filter((coin): coin is CoingeckoMarketCoin => coin !== undefined)
    .map(mapCoingeckoCoin)
    .filter((asset): asset is CryptoAsset => asset !== null);
}

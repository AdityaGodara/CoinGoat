import { cryptoAssets } from "@/data/crypto-assets";
import type { CryptoAsset } from "@/types";
import { isCoingeckoConfigured } from "./coingecko/env";
import { getCoingeckoMarkets } from "./coingecko/markets";

/** Falls back to the static mock roster if COINGECKO_API_KEY isn't set, or
 * if CoinGecko's API is briefly unavailable/rate-limited — market data
 * degrading to a slightly-stale/mock snapshot is preferable to breaking the
 * homepage, header ticker, or /markets page. */
export async function getCryptoAssets(): Promise<CryptoAsset[]> {
  if (!isCoingeckoConfigured) return cryptoAssets;

  try {
    const assets = await getCoingeckoMarkets();
    return assets.length > 0 ? assets : cryptoAssets;
  } catch (error) {
    console.warn("getCryptoAssets: CoinGecko fetch failed, falling back to mock data:", error);
    return cryptoAssets;
  }
}

export async function getCryptoAsset(symbol: string): Promise<CryptoAsset | undefined> {
  const assets = await getCryptoAssets();
  return assets.find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase());
}

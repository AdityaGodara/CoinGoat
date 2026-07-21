import { cryptoAssets } from "@/data/crypto-assets";
import type { CryptoAsset } from "@/types";

export async function getCryptoAssets(): Promise<CryptoAsset[]> {
  return cryptoAssets;
}

export async function getCryptoAsset(symbol: string): Promise<CryptoAsset | undefined> {
  return cryptoAssets.find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase());
}

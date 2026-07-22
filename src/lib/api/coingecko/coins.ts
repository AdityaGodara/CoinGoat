// Fixed roster matching the site's existing 12-asset mock lineup (src/data/
// crypto-assets.ts) — keeps the UI (homepage snapshot, header ticker,
// /markets grid) showing the exact same coins, just with real data now.
// CoinGecko identifies coins by an internal `id`, not ticker symbol.
export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  LINK: "chainlink",
  // MATIC fully migrated to POL on-chain; CoinGecko's old "matic-network"
  // id now returns null price data for it. "polygon-ecosystem-token" is
  // the live successor token (same project, new ticker).
  POL: "polygon-ecosystem-token",
  LTC: "litecoin",
};

// Preserves this exact display order regardless of what order CoinGecko's
// response comes back in.
export const COINGECKO_SYMBOL_ORDER = Object.keys(COINGECKO_IDS);

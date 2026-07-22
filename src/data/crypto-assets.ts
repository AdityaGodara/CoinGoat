import type { CryptoAsset } from "@/types";

function generateSparkline(base: number, volatility: number, points = 24): number[] {
  const values: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    const step = ((i * 37 + base) % 17) - 8;
    current += (step / 8) * volatility;
    values.push(Math.max(current, base * 0.5));
  }
  return values;
}

export const cryptoAssets: CryptoAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    logo: "/images/logos/btc.svg",
    price: 68420.5,
    change24hPct: 2.34,
    sparkline: generateSparkline(68000, 900),
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    logo: "/images/logos/eth.svg",
    price: 3512.8,
    change24hPct: -1.12,
    sparkline: generateSparkline(3500, 60),
  },
  {
    symbol: "SOL",
    name: "Solana",
    logo: "/images/logos/sol.svg",
    price: 178.42,
    change24hPct: 5.67,
    sparkline: generateSparkline(175, 6),
  },
  {
    symbol: "BNB",
    name: "BNB",
    logo: "/images/logos/bnb.svg",
    price: 592.1,
    change24hPct: 0.48,
    sparkline: generateSparkline(590, 8),
  },
  {
    symbol: "XRP",
    name: "XRP",
    logo: "/images/logos/xrp.svg",
    price: 0.612,
    change24hPct: -2.89,
    sparkline: generateSparkline(0.6, 0.02),
  },
  {
    symbol: "ADA",
    name: "Cardano",
    logo: "/images/logos/ada.svg",
    price: 0.452,
    change24hPct: 1.76,
    sparkline: generateSparkline(0.45, 0.015),
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    logo: "/images/logos/doge.svg",
    price: 0.158,
    change24hPct: 8.21,
    sparkline: generateSparkline(0.15, 0.01),
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    logo: "/images/logos/avax.svg",
    price: 34.87,
    change24hPct: -3.42,
    sparkline: generateSparkline(35, 1.2),
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    logo: "/images/logos/dot.svg",
    price: 6.94,
    change24hPct: 0.93,
    sparkline: generateSparkline(6.9, 0.25),
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    logo: "/images/logos/link.svg",
    price: 14.28,
    change24hPct: 3.15,
    sparkline: generateSparkline(14, 0.5),
  },
  {
    // MATIC fully migrated to POL on-chain — matches the real CoinGecko
    // roster (src/lib/api/coingecko/coins.ts), which tracks the live
    // successor token rather than the now-defunct "matic-network" id.
    symbol: "POL",
    name: "POL (ex-MATIC)",
    logo: "/images/logos/matic.svg",
    price: 0.0788,
    change24hPct: -2.01,
    sparkline: generateSparkline(0.08, 0.003),
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    logo: "/images/logos/ltc.svg",
    price: 84.15,
    change24hPct: 1.24,
    sparkline: generateSparkline(84, 2.5),
  },
];

export function getCryptoAsset(symbol: string): CryptoAsset | undefined {
  return cryptoAssets.find((asset) => asset.symbol === symbol);
}

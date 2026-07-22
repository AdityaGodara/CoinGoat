export interface CoingeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: (number | null)[] };
}

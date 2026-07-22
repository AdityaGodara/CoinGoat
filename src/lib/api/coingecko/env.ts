// CoinGecko's free "Demo" tier key (the `CG-...` prefix format) is used
// against the public api.coingecko.com host with an `x-cg-demo-api-key`
// header — different from a paid Pro key, which uses pro-api.coingecko.com
// and `x-cg-pro-api-key`. This is a real secret (tied to the account's
// quota) — deliberately NOT NEXT_PUBLIC_, server-only, unlike Sanity's
// project id/dataset which Sanity itself treats as public.
export const coingeckoApiKey = process.env.COINGECKO_API_KEY ?? "";
export const coingeckoApiBaseUrl = "https://api.coingecko.com/api/v3";

export const isCoingeckoConfigured = coingeckoApiKey.length > 0;

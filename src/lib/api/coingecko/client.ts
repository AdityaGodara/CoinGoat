import { coingeckoApiBaseUrl, coingeckoApiKey, isCoingeckoConfigured } from "./env";

export class CoingeckoUnavailableError extends Error {}

// Free-tier budget: 10,000 calls/month, 100 req/min. The whole app shares
// ONE cached fetch per revalidate window (Next's Data Cache dedupes
// identical fetch(url, options) calls across every caller — Header, the
// homepage, and /markets all resolve to the same cache entry), so this
// number alone controls total upstream call volume, independent of traffic.
// 300s gives a worst-case ceiling of (30*24*3600)/300 = 8,640 calls/month
// even under nonstop, always-expiring traffic — comfortably under 10,000
// with margin, and 1 call/5min is nowhere near the 100/min cap either way.
const REVALIDATE_SECONDS = 300;

export async function fetchFromCoingecko<T>(path: string): Promise<T> {
  if (!isCoingeckoConfigured) {
    throw new CoingeckoUnavailableError("COINGECKO_API_KEY is not configured");
  }

  const res = await fetch(`${coingeckoApiBaseUrl}${path}`, {
    headers: { "x-cg-demo-api-key": coingeckoApiKey },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new CoingeckoUnavailableError(`${path} returned ${res.status}`);
  }

  return res.json() as Promise<T>;
}

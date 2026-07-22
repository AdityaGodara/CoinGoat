// The backend's ingestion pipeline classifies every article into one of its
// own 12 categories (see backend/app/services/category_normalizer.py), which
// is a different, more granular taxonomy than this site's fixed 7 nav
// categories (src/data/categories.ts). Rather than changing the site's
// navigation/IA, backend categories are folded down onto the existing 7
// slugs here — every backend category is assigned to exactly one frontend
// bucket, so nothing is silently dropped.

/** Frontend category slug -> the backend category name(s) that map onto it.
 * Most are 1:1; a few frontend categories absorb more than one backend
 * category (e.g. "technology" has no direct backend equivalent, so it
 * aggregates AI/Layer 2/Mining). */
export const FRONTEND_TO_BACKEND_CATEGORIES: Record<string, string[]> = {
  bitcoin: ["Bitcoin"],
  ethereum: ["Ethereum"],
  defi: ["DeFi", "Stablecoins"],
  nfts: ["NFT"],
  markets: ["Markets", "Altcoins"],
  regulation: ["Regulation", "Security"],
  technology: ["AI", "Layer 2", "Mining"],
};

/** Backend category name -> the backend's own URL slug for it (must match
 * `slugify()` in backend/app/services/category_normalizer.py exactly, since
 * this is what GET /api/category/{slug} expects). */
const BACKEND_CATEGORY_SLUGS: Record<string, string> = {
  Bitcoin: "bitcoin",
  Ethereum: "ethereum",
  Altcoins: "altcoins",
  Markets: "markets",
  NFT: "nft",
  Regulation: "regulation",
  Mining: "mining",
  AI: "ai",
  Security: "security",
  "Layer 2": "layer-2",
  DeFi: "defi",
  Stablecoins: "stablecoins",
};

const BACKEND_CATEGORY_TO_FRONTEND_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(FRONTEND_TO_BACKEND_CATEGORIES).flatMap(([frontendSlug, backendNames]) =>
    backendNames.map((name) => [name, frontendSlug]),
  ),
);

export function backendCategoryUrlSlug(backendCategoryName: string): string {
  return BACKEND_CATEGORY_SLUGS[backendCategoryName] ?? backendCategoryName.toLowerCase();
}

export function frontendSlugForBackendCategory(backendCategoryName: string): string {
  return BACKEND_CATEGORY_TO_FRONTEND_SLUG[backendCategoryName] ?? "markets";
}

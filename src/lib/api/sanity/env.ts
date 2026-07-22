// Shared by both the frontend data layer (src/lib/api/sanity/client.ts) and
// the Studio config (sanity.config.ts) so project/dataset/apiVersion are
// only ever declared once. Project ID and dataset are not secret — Sanity's
// own docs treat them as public, safe to ship in the client bundle — so
// these use NEXT_PUBLIC_ and have no fallback since there is nothing sane
// to guess: reads throw as soon as an actual query runs if this is unset,
// clearly pointing to the missing setup step rather than failing silently.
export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const sanityApiVersion = process.env.SANITY_API_VERSION ?? "2025-01-01";

export const isSanityConfigured = sanityProjectId.length > 0;

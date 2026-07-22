import { createClient, type SanityClient } from "@sanity/client";
import { sanityApiVersion, sanityDataset, sanityProjectId, isSanityConfigured } from "./env";

let cachedClient: SanityClient | null = null;

// Lazy, not module-scope: `createClient` throws immediately if `projectId`
// is empty, and it's expected to BE empty until the user finishes the
// `sanity init` setup step (see README/CLAUDE.md) — every caller in
// src/lib/api/sanity/posts.ts checks `isSanityConfigured` first and skips
// Sanity entirely (falling back to backend-only content) until then, so
// this must never throw just from being imported.
export function getSanityClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error("Sanity is not configured — set NEXT_PUBLIC_SANITY_PROJECT_ID first.");
  }
  if (!cachedClient) {
    cachedClient = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
      // Matches the backend's REVALIDATE_SECONDS — this is the ISR-cached
      // read path for published content; no token needed since published
      // documents are publicly readable.
      perspective: "published",
    });
  }
  return cachedClient;
}

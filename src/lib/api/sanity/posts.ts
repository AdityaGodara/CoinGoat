import type { Article, Author } from "@/types";
import { getSanityClient } from "./client";
import { isSanityConfigured } from "./env";
import {
  ALL_AUTHORS_QUERY,
  ALL_POSTS_QUERY,
  FEATURED_POSTS_QUERY,
  POSTS_BY_CATEGORY_QUERY,
  POST_BY_SLUG_QUERY,
  SEARCH_POSTS_QUERY,
} from "./queries";
import { mapSanityAuthor, mapSanityPost } from "./transform";
import type { SanityAuthor, SanityPost } from "./types";

const REVALIDATE_SECONDS = 60;
const FETCH_OPTIONS = { next: { revalidate: REVALIDATE_SECONDS } };

/** Every export here degrades to an empty result instead of throwing when
 * Sanity isn't configured yet (no NEXT_PUBLIC_SANITY_PROJECT_ID) — the site
 * must keep working on backend/RSS content alone until the user finishes
 * the `sanity init` setup step. */
export async function getSanityPosts(limit = 100): Promise<Article[]> {
  if (!isSanityConfigured) return [];
  const raw = await getSanityClient().fetch<SanityPost[]>(ALL_POSTS_QUERY, { limit }, FETCH_OPTIONS);
  return raw.map(mapSanityPost);
}

export async function getSanityPostBySlug(slug: string): Promise<Article | null> {
  if (!isSanityConfigured) return null;
  const raw = await getSanityClient().fetch<SanityPost | null>(POST_BY_SLUG_QUERY, { slug }, FETCH_OPTIONS);
  return raw ? mapSanityPost(raw) : null;
}

export async function getSanityPostsByCategory(category: string, limit = 100): Promise<Article[]> {
  if (!isSanityConfigured) return [];
  const raw = await getSanityClient().fetch<SanityPost[]>(POSTS_BY_CATEGORY_QUERY, { category, limit }, FETCH_OPTIONS);
  return raw.map(mapSanityPost);
}

export async function getSanityFeaturedPost(): Promise<Article | null> {
  if (!isSanityConfigured) return null;
  const raw = await getSanityClient().fetch<SanityPost[]>(FEATURED_POSTS_QUERY, { limit: 1 }, FETCH_OPTIONS);
  return raw[0] ? mapSanityPost(raw[0]) : null;
}

export async function searchSanityPosts(query: string, limit = 50): Promise<Article[]> {
  if (!isSanityConfigured) return [];
  const term = `*${query}*`;
  const raw = await getSanityClient().fetch<SanityPost[]>(SEARCH_POSTS_QUERY, { term, limit }, FETCH_OPTIONS);
  return raw.map(mapSanityPost);
}

export async function getSanityAuthors(): Promise<Author[]> {
  if (!isSanityConfigured) return [];
  const raw = await getSanityClient().fetch<SanityAuthor[]>(ALL_AUTHORS_QUERY, {}, FETCH_OPTIONS);
  return raw.map(mapSanityAuthor);
}

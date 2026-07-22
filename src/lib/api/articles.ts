import type { Article } from "@/types";
import { fetchFromBackend, fetchFromBackendOrNull } from "./backend/client";
import { backendCategoryUrlSlug, FRONTEND_TO_BACKEND_CATEGORIES } from "./backend/category-map";
import { mapBackendArticle, mapBackendSummary } from "./backend/transform";
import type { BackendArticle, BackendArticleList, BackendHomepage } from "./backend/types";
import {
  getSanityFeaturedPost,
  getSanityPostBySlug,
  getSanityPosts,
  getSanityPostsByCategory,
  searchSanityPosts,
} from "./sanity/posts";

const DEFAULT_PAGE_SIZE = 9;
const ARTICLES_POOL_LIMIT = 100;
const AGGREGATE_CATEGORY_FETCH_LIMIT = 100;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function emptyPaginatedResult<T>(page: number, pageSize: number): PaginatedResult<T> {
  return { items: [], total: 0, page, pageSize, totalPages: 1 };
}

function mapArticleList(data: BackendArticleList): Article[] {
  return data.items.map((raw, index) => mapBackendArticle(raw, index + 1));
}

/** Sorts a merged backend+Sanity pool by recency and slices out one page.
 * `total`/`totalPages` are bounded by however much of each source was
 * actually fetched into `items` — an approximation, same documented
 * tradeoff the multi-backend-category aggregate case already accepted
 * before Sanity existed (see getArticlesByCategory). */
function mergeAndPaginate(sources: Article[][], page: number, pageSize: number): PaginatedResult<Article> {
  const safePage = Math.max(1, page);
  const merged = sources
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = merged.length;
  const start = (safePage - 1) * pageSize;

  return {
    items: merged.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function mergeAndSort(sources: Article[][]): Article[] {
  return sources.flat().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getArticles(): Promise<Article[]> {
  const [backendData, sanityPosts] = await Promise.all([
    fetchFromBackend<BackendArticleList>(`/api/latest?limit=${ARTICLES_POOL_LIMIT}&offset=0`),
    getSanityPosts(ARTICLES_POOL_LIMIT),
  ]);
  return mergeAndSort([mapArticleList(backendData), sanityPosts]);
}

export async function getPaginatedArticles(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  // Both sources are fetched as full-ish pools and paginated in memory —
  // there's no single backend endpoint spanning both content sources, same
  // reasoning as the multi-category aggregate case below.
  const [backendData, sanityPosts] = await Promise.all([
    fetchFromBackend<BackendArticleList>(`/api/latest?limit=${ARTICLES_POOL_LIMIT}&offset=0`),
    getSanityPosts(ARTICLES_POOL_LIMIT),
  ]);
  return mergeAndPaginate([mapArticleList(backendData), sanityPosts], page, pageSize);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const [backendRaw, sanityArticle] = await Promise.all([
    fetchFromBackendOrNull<BackendArticle>(`/api/article/${encodeURIComponent(slug)}`),
    getSanityPostBySlug(slug),
  ]);
  if (backendRaw) return mapBackendArticle(backendRaw, 1);
  return sanityArticle ?? undefined;
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  const sanityFeatured = await getSanityFeaturedPost();
  if (sanityFeatured) return sanityFeatured;

  const homepage = await fetchFromBackend<BackendHomepage>("/api/homepage");
  if (!homepage.featured) return undefined;
  return mapBackendSummary(homepage.featured, 1);
}

export async function getBreakingArticles(): Promise<Article[]> {
  // No real editorial "breaking" flag exists for either content source —
  // this is a recency proxy, same honest limitation as `getTrendingArticles`.
  return getLatestArticles(5);
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const [backendData, sanityPosts] = await Promise.all([
    fetchFromBackend<BackendArticleList>(`/api/latest?limit=${limit}&offset=0`),
    getSanityPosts(limit),
  ]);
  return mergeAndSort([mapArticleList(backendData), sanityPosts]).slice(0, limit);
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  // No real engagement analytics exist for either source — trending is the
  // same recency proxy the backend itself uses, now source-agnostic so
  // Sanity posts have a chance to surface here too.
  const [homepage, sanityPosts] = await Promise.all([
    fetchFromBackend<BackendHomepage>("/api/homepage"),
    getSanityPosts(limit),
  ]);
  const backendTrending = homepage.trending.map((raw, index) => mapBackendSummary(raw, index + 1));
  return mergeAndSort([backendTrending, sanityPosts]).slice(0, limit);
}

export async function getArticlesByCategory(
  categorySlug: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const backendCategoryNames = FRONTEND_TO_BACKEND_CATEGORIES[categorySlug] ?? [];
  const safePage = Math.max(1, page);

  const [backendLists, sanityPosts] = await Promise.all([
    Promise.all(
      backendCategoryNames.map((name) =>
        fetchFromBackendOrNull<BackendArticleList>(
          `/api/category/${backendCategoryUrlSlug(name)}?limit=${AGGREGATE_CATEGORY_FETCH_LIMIT}&offset=0`,
        ),
      ),
    ),
    getSanityPostsByCategory(categorySlug, AGGREGATE_CATEGORY_FETCH_LIMIT),
  ]);

  const backendArticles = backendLists
    .filter((list): list is BackendArticleList => list !== null)
    .flatMap((list) => list.items)
    .map((raw, index) => mapBackendArticle(raw, index + 1));

  if (backendArticles.length === 0 && sanityPosts.length === 0) {
    return emptyPaginatedResult(safePage, pageSize);
  }

  return mergeAndPaginate([backendArticles, sanityPosts], safePage, pageSize);
}

export async function getArticlesByTag(
  tag: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  // Neither content source has a free-tag list — tags are set to
  // `[categorySlug]` for both backend and Sanity articles, so a tag page is
  // functionally the same lookup as a category page today.
  return getArticlesByCategory(tag, page, pageSize);
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const sameCategory = await getArticlesByCategory(article.category.slug, 1, limit + 3);
  return sameCategory.items.filter((candidate) => candidate.slug !== article.slug).slice(0, limit);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const [backendData, sanityResults] = await Promise.all([
    fetchFromBackend<BackendArticleList>(`/api/search?q=${encodeURIComponent(normalized)}&limit=50&offset=0`),
    searchSanityPosts(normalized, 50),
  ]);

  return mergeAndSort([mapArticleList(backendData), sanityResults]);
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<Article[]> {
  const results = await searchArticles(query);
  return results.slice(0, limit);
}

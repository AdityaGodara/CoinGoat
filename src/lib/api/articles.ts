import type { Article } from "@/types";
import { fetchFromBackend, fetchFromBackendOrNull } from "./backend/client";
import { backendCategoryUrlSlug, FRONTEND_TO_BACKEND_CATEGORIES } from "./backend/category-map";
import { mapBackendArticle, mapBackendSummary } from "./backend/transform";
import type { BackendArticle, BackendArticleList, BackendHomepage } from "./backend/types";

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

export async function getArticles(): Promise<Article[]> {
  const data = await fetchFromBackend<BackendArticleList>(`/api/latest?limit=${ARTICLES_POOL_LIMIT}&offset=0`);
  return mapArticleList(data);
}

export async function getPaginatedArticles(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * pageSize;
  const data = await fetchFromBackend<BackendArticleList>(`/api/latest?limit=${pageSize}&offset=${offset}`);
  return {
    items: mapArticleList(data),
    total: data.total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(data.total / pageSize)),
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const raw = await fetchFromBackendOrNull<BackendArticle>(`/api/article/${encodeURIComponent(slug)}`);
  if (!raw) return undefined;
  return mapBackendArticle(raw, 1);
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  const homepage = await fetchFromBackend<BackendHomepage>("/api/homepage");
  if (!homepage.featured) return undefined;
  return mapBackendSummary(homepage.featured, 1);
}

export async function getBreakingArticles(): Promise<Article[]> {
  // The backend has no editorial "breaking" flag for RSS-sourced content —
  // this is a recency proxy, same honest limitation as `getTrendingArticles`.
  const homepage = await fetchFromBackend<BackendHomepage>("/api/homepage");
  return homepage.latest.slice(0, 5).map((raw, index) => mapBackendSummary(raw, index + 1));
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const data = await fetchFromBackend<BackendArticleList>(`/api/latest?limit=${limit}&offset=0`);
  return mapArticleList(data);
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  // No real engagement analytics exist for RSS-sourced content — trending is
  // the same recency proxy the backend itself uses, just a different slice.
  const homepage = await fetchFromBackend<BackendHomepage>("/api/homepage");
  return homepage.trending.slice(0, limit).map((raw, index) => mapBackendSummary(raw, index + 1));
}

export async function getArticlesByCategory(
  categorySlug: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const backendCategoryNames = FRONTEND_TO_BACKEND_CATEGORIES[categorySlug];
  if (!backendCategoryNames || backendCategoryNames.length === 0) {
    return emptyPaginatedResult(page, pageSize);
  }

  const safePage = Math.max(1, page);

  if (backendCategoryNames.length === 1) {
    const backendSlug = backendCategoryUrlSlug(backendCategoryNames[0]);
    const offset = (safePage - 1) * pageSize;
    const data = await fetchFromBackendOrNull<BackendArticleList>(
      `/api/category/${backendSlug}?limit=${pageSize}&offset=${offset}`,
    );
    if (!data) return emptyPaginatedResult(safePage, pageSize);
    return {
      items: mapArticleList(data),
      total: data.total,
      page: safePage,
      pageSize,
      totalPages: Math.max(1, Math.ceil(data.total / pageSize)),
    };
  }

  // A handful of frontend categories aggregate more than one backend
  // category (see backend/category-map.ts). There's no single backend
  // endpoint for "any of these categories," so each is fetched in full and
  // merged/re-sorted/re-paginated here. `total`/`totalPages` are therefore
  // an approximation bounded by how much of each category was fetched, not
  // a true count — acceptable for a handful of secondary categories.
  const lists = await Promise.all(
    backendCategoryNames.map((name) =>
      fetchFromBackendOrNull<BackendArticleList>(
        `/api/category/${backendCategoryUrlSlug(name)}?limit=${AGGREGATE_CATEGORY_FETCH_LIMIT}&offset=0`,
      ),
    ),
  );
  const merged = lists
    .filter((list): list is BackendArticleList => list !== null)
    .flatMap((list) => list.items)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  const total = merged.length;
  const start = (safePage - 1) * pageSize;
  const pageItems = merged.slice(start, start + pageSize);

  return {
    items: pageItems.map((raw, index) => mapBackendArticle(raw, index + 1)),
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getArticlesByTag(
  tag: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  // Backend articles carry a single normalized category, not a free-tag
  // list — tags are set to `[categorySlug]` in the transform layer, so a
  // tag page is functionally the same lookup as a category page today.
  return getArticlesByCategory(tag, page, pageSize);
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const sameCategory = await getArticlesByCategory(article.category.slug, 1, limit + 3);
  return sameCategory.items.filter((candidate) => candidate.slug !== article.slug).slice(0, limit);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const normalized = query.trim();
  if (!normalized) return [];
  const data = await fetchFromBackend<BackendArticleList>(
    `/api/search?q=${encodeURIComponent(normalized)}&limit=50&offset=0`,
  );
  return mapArticleList(data);
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<Article[]> {
  const results = await searchArticles(query);
  return results.slice(0, limit);
}

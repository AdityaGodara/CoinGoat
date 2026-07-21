import { articles } from "@/data/articles";
import type { Article } from "@/types";

const DEFAULT_PAGE_SIZE = 9;

function byNewest(a: Article, b: Article): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort(byNewest);
}

export async function getPaginatedArticles(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const sorted = [...articles].sort(byNewest);
  return paginate(sorted, page, pageSize);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return articles.find((article) => article.slug === slug);
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  return articles.find((article) => article.featured);
}

export async function getBreakingArticles(): Promise<Article[]> {
  return articles.filter((article) => article.breaking).sort(byNewest);
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  return [...articles].sort(byNewest).slice(0, limit);
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  // No real analytics yet, so approximate "trending" as the most recent
  // non-featured articles so the homepage trending rail differs from Latest.
  return [...articles]
    .filter((article) => !article.featured)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getArticlesByCategory(
  categorySlug: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const filtered = articles
    .filter((article) => article.category.slug === categorySlug)
    .sort(byNewest);
  return paginate(filtered, page, pageSize);
}

export async function getArticlesByTag(
  tag: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Article>> {
  const filtered = articles.filter((article) => article.tags.includes(tag)).sort(byNewest);
  return paginate(filtered, page, pageSize);
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const scored = articles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => article.tags.includes(tag)).length;
      const sameCategory = candidate.category.slug === article.category.slug ? 1 : 0;
      return { candidate, score: sharedTags * 2 + sameCategory };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.candidate, b.candidate));

  const related = scored.map((entry) => entry.candidate);
  if (related.length < limit) {
    const fallback = articles
      .filter((candidate) => candidate.slug !== article.slug && !related.includes(candidate))
      .sort(byNewest);
    related.push(...fallback.slice(0, limit - related.length));
  }
  return related.slice(0, limit);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return articles
    .filter((article) => {
      const haystack = [
        article.title,
        article.excerpt,
        article.category.name,
        ...article.tags,
        article.author.name,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .sort(byNewest);
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<Article[]> {
  const results = await searchArticles(query);
  return results.slice(0, limit);
}

// Raw shapes returned by the FastAPI backend (see backend/app/schemas/article.py).
// Never imported outside src/lib/api/backend/ — pages only ever see the
// normalized `Article`/`Author`/`Category` types from @/types.

export interface BackendArticleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  author: string | null;
  category: string;
  image_url: string | null;
  published_at: string;
}

export interface BackendArticle extends BackendArticleSummary {
  content: string | null;
  canonical_url: string;
  updated_at: string;
}

export interface BackendArticleList {
  items: BackendArticle[];
  total: number;
  limit: number;
  offset: number;
}

export interface BackendHomepage {
  featured: BackendArticleSummary | null;
  latest: BackendArticleSummary[];
  trending: BackendArticleSummary[];
}

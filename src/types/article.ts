import type { Author } from "./author";
import type { Category } from "./category";

export interface ArticleImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: ArticleImage;
  category: Category;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingTimeMinutes: number;
  featured: boolean;
  breaking?: boolean;
  relatedAssetSymbols?: string[];
}

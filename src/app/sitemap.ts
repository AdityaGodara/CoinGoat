import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/api/articles";
import { getCategories } from "@/lib/api/categories";
import { getAuthors } from "@/lib/api/authors";

const BASE_URL = "https://coingoat.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors] = await Promise.all([getArticles(), getCategories(), getAuthors()]);

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/news/${article.slug}`,
    lastModified: article.updatedAt ?? article.publishedAt,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/category/${category.slug}`,
  }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${BASE_URL}/author/${author.slug}`,
  }));

  return [
    { url: BASE_URL },
    { url: `${BASE_URL}/news` },
    { url: `${BASE_URL}/markets` },
    { url: `${BASE_URL}/search` },
    ...categoryEntries,
    ...authorEntries,
    ...articleEntries,
  ];
}

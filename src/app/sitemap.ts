import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { authors } from "@/data/authors";

const BASE_URL = "https://coingoat.example";

export default function sitemap(): MetadataRoute.Sitemap {
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

import { authors } from "@/data/authors";
import { articles } from "@/data/articles";
import type { Author, Article } from "@/types";

export async function getAuthors(): Promise<Author[]> {
  return authors;
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  return authors.find((author) => author.slug === slug);
}

export async function getArticlesByAuthor(authorSlug: string): Promise<Article[]> {
  return articles
    .filter((article) => article.author.slug === authorSlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

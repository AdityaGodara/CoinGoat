import { categories } from "@/data/categories";
import type { Article, ArticleImage } from "@/types";
import { synthesizeAuthor } from "./authors";
import { backendCategoryUrlSlug, frontendSlugForBackendCategory } from "./category-map";
import type { BackendArticle, BackendArticleSummary } from "./types";

const WORDS_PER_MINUTE = 200;
const FALLBACK_EXCERPT_SUFFIX = "Read the latest from CoinGoat's covered sources.";

function categoryFor(backendCategoryName: string) {
  const slug = frontendSlugForBackendCategory(backendCategoryName);
  return categories.find((category) => category.slug === slug) ?? categories[0];
}

function stripHtml(html: string | null): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function excerptFor(summary: string | null, content: string | null): string {
  // Some sources (e.g. Cointelegraph) put raw HTML — including floated
  // <img> tags — in the RSS summary/description field, not just in
  // content. Excerpt is always rendered as plain text (see
  // ArticleHeader/ArticleCard), so it must never contain markup.
  const strippedSummary = stripHtml(summary);
  if (strippedSummary) return strippedSummary.slice(0, 220);
  const strippedContent = stripHtml(content);
  if (strippedContent) return strippedContent.slice(0, 180);
  return FALLBACK_EXCERPT_SUFFIX;
}

function readingTimeFor(summary: string | null, content: string | null): number {
  const words = `${stripHtml(summary)} ${stripHtml(content)}`.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 3;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// RSS content commonly embeds its own cover image inline (often literally
// where `image_url` was scraped from, see backend's `_extract_image_url`
// fallback) — since the article page already renders `coverImage` big up
// top, leaving it in `content` too shows the same photo twice. Strips only
// the first occurrence whose `src` matches the cover image, and unwraps its
// containing <figure>/<p> if that's all the block held, so no dangling
// empty wrapper (or stray caption) is left behind.
function stripDuplicateCoverImage(html: string, imageUrl: string): string {
  const escaped = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const imgPattern = `<img[^>]*src=["']${escaped}["'][^>]*/?>`;

  const figureMatch = html.match(new RegExp(`<figure[^>]*>\\s*${imgPattern}[\\s\\S]*?</figure>`, "i"));
  if (figureMatch) return html.replace(figureMatch[0], "");

  const paragraphMatch = html.match(new RegExp(`<p[^>]*>\\s*${imgPattern}\\s*</p>`, "i"));
  if (paragraphMatch) return html.replace(paragraphMatch[0], "");

  return html.replace(new RegExp(imgPattern, "i"), "");
}

function coverImageFor(imageUrl: string | null, title: string, index: number): ArticleImage {
  if (imageUrl) {
    return { src: imageUrl, alt: title, width: 1200, height: 630 };
  }
  const coverIndex = ((index - 1 + 8) % 8) + 1;
  return {
    src: `/images/covers/cover-${String(coverIndex).padStart(2, "0")}.svg`,
    alt: title,
    width: 1200,
    height: 630,
  };
}

export function mapBackendSummary(raw: BackendArticleSummary, index = 1): Article {
  const category = categoryFor(raw.category);
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: excerptFor(raw.summary, null),
    content: "",
    coverImage: coverImageFor(raw.image_url, raw.title, index),
    category,
    tags: [category.slug],
    author: synthesizeAuthor(raw.author),
    publishedAt: raw.published_at,
    readingTimeMinutes: readingTimeFor(raw.summary, null),
    featured: false,
    relatedAssetSymbols: undefined,
  };
}

export function mapBackendArticle(raw: BackendArticle, index = 1): Article {
  const category = categoryFor(raw.category);
  const content = raw.image_url ? stripDuplicateCoverImage(raw.content ?? "", raw.image_url) : (raw.content ?? "");
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: excerptFor(raw.summary, raw.content),
    content,
    coverImage: coverImageFor(raw.image_url, raw.title, index),
    category,
    tags: [category.slug],
    author: synthesizeAuthor(raw.author),
    publishedAt: raw.published_at,
    updatedAt: raw.updated_at,
    readingTimeMinutes: readingTimeFor(raw.summary, raw.content),
    featured: false,
    relatedAssetSymbols: undefined,
  };
}

export { backendCategoryUrlSlug };

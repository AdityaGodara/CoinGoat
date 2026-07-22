import { toHTML, escapeHTML, type PortableTextComponents } from "@portabletext/to-html";
import { categories } from "@/data/categories";
import type { Article, ArticleImage, Author } from "@/types";
import { sanityImageUrl } from "./image";
import type { SanityAuthor, SanityImageRef, SanityPost } from "./types";

const WORDS_PER_MINUTE = 200;

// Heading blocks (style "h2"/"h3") already serialize to plain <h2>/<h3> via
// @portabletext/to-html's defaults — deliberately NOT overridden here, so
// extractHeadings() (src/lib/utils/markdown.ts) and rehype-slug both derive
// the same id from the same heading text at their own separate times,
// exactly like they already do for backend/RSS content's real <h2> tags.
const PORTABLE_TEXT_COMPONENTS: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const src = sanityImageUrl(value as SanityImageRef, { width: 1200, height: 630 });
      return `<img src="${escapeHTML(src)}" />`;
    },
  },
};

function bodyToHtml(body: SanityPost["body"]): string {
  return toHTML(body, { components: PORTABLE_TEXT_COMPONENTS });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function readingTimeFor(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  if (words === 0) return 3;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function categoryFor(slug: string) {
  return categories.find((category) => category.slug === slug) ?? categories[0];
}

function imageFor(ref: SanityImageRef, alt: string): ArticleImage {
  return { src: sanityImageUrl(ref, { width: 1200, height: 630 }), alt, width: 1200, height: 630 };
}

export function mapSanityAuthor(raw: SanityAuthor): Author {
  return {
    id: `sanity-${raw._id}`,
    slug: raw.slug,
    name: raw.name,
    avatar: sanityImageUrl(raw.avatar, { width: 200, height: 200 }),
    title: raw.role || "Contributor",
    bio: raw.bio ?? "",
    social: {
      twitter: raw.twitter ?? undefined,
      linkedin: raw.linkedin ?? undefined,
      website: raw.website ?? undefined,
    },
  };
}

export function mapSanityPost(raw: SanityPost): Article {
  const category = categoryFor(raw.category);
  const content = bodyToHtml(raw.body);
  return {
    id: `sanity-${raw._id}`,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content,
    coverImage: imageFor(raw.coverImage, raw.title),
    category,
    tags: [category.slug],
    author: mapSanityAuthor(raw.author),
    publishedAt: raw.publishedAt,
    updatedAt: raw._updatedAt !== raw.publishedAt ? raw._updatedAt : undefined,
    readingTimeMinutes: readingTimeFor(content),
    featured: raw.featured,
    relatedAssetSymbols: undefined,
  };
}

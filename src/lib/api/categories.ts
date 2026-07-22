import { categories, getCategoryBySlug as getCategoryBySlugSync } from "@/data/categories";
import type { Category } from "@/types";

// Categories define the site's fixed navigation/IA (7 slugs) and are
// independent of the backend's own (larger, more granular) category
// taxonomy — see src/lib/api/backend/category-map.ts for how backend
// articles get folded onto these 7. This file exists purely so nothing
// outside src/data/ imports @/data/categories directly, per the seam rule
// in CLAUDE.md.

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getCategoryBySlugSync(slug);
}

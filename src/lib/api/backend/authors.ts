import type { Author } from "@/types";

const PLACEHOLDER_AVATAR = "/images/avatars/wire.svg";

/** A plain, stable slugify — deliberately NOT github-slugger, which
 * uniquifies repeated inputs (appending -1, -2, ...) for heading anchors.
 * Author slugs must be deterministic: the same byline has to resolve to
 * the same slug every time it appears, across any number of articles. */
function stableSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "author"
  );
}

/** The backend stores bylines as a plain reporter name, not one of this
 * site's curated editorial personas — this builds a lightweight Author
 * object per unique name so bylines stay accurate without inventing fake
 * bios. */
export function synthesizeAuthor(name: string | null): Author {
  const safeName = name?.trim() || "CoinDesk";
  return {
    id: `ext-${stableSlug(safeName)}`,
    slug: stableSlug(safeName),
    name: safeName,
    avatar: PLACEHOLDER_AVATAR,
    title: "Contributor",
    bio: "",
    social: {},
  };
}

export function slugForAuthorName(name: string): string {
  return stableSlug(name || "CoinDesk");
}

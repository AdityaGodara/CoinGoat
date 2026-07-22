import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "./env";
import type { SanityImageRef } from "./types";

const builder = createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset });

/** Fixed output size for cover images / avatars — matches the width/height
 * the rest of the app already assumes for `ArticleImage` (see
 * src/lib/api/backend/transform.ts's `coverImageFor`), so both content
 * sources produce visually consistent cards. */
export function sanityImageUrl(ref: SanityImageRef, { width, height }: { width: number; height: number }): string {
  return builder.image(ref).width(width).height(height).fit("crop").auto("format").url();
}

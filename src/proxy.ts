import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";

const KNOWN_CATEGORY_SLUGS = new Set(categories.map((category) => category.slug));
const KNOWN_TAG_SLUGS = new Set(articles.flatMap((article) => article.tags));

// /category and /tag pages read `searchParams` for pagination, which forces
// fully-dynamic rendering. In that mode Next locks the response to a 200
// status once streaming starts, even when the page later calls notFound().
// Rejecting unknown slugs here (before the page ever renders) lets Next's
// standard unmatched-route 404 handling take over, which does set a real
// 404 status.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const categoryMatch = pathname.match(/^\/category\/([^/]+)$/);
  if (categoryMatch && !KNOWN_CATEGORY_SLUGS.has(decodeURIComponent(categoryMatch[1]))) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }

  const tagMatch = pathname.match(/^\/tag\/([^/]+)$/);
  if (tagMatch && !KNOWN_TAG_SLUGS.has(decodeURIComponent(tagMatch[1]))) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/category/:path*", "/tag/:path*"],
};

import type { PortableTextBlock } from "@portabletext/types";

export interface SanityImageRef {
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface SanityAuthor {
  _id: string;
  name: string;
  slug: string;
  avatar: SanityImageRef;
  role: string | null;
  bio: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: SanityImageRef;
  category: string;
  author: SanityAuthor;
  featured: boolean;
  publishedAt: string;
  _updatedAt: string;
  body: PortableTextBlock[];
}

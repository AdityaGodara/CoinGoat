import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sanity Studio's dependency tree (via `sanity`/`next-sanity`) resolves
  // `swr` differently than Turbopack's RSC bundling expects when it's
  // pulled into the server graph through sanity.config.ts — treating it as
  // an external server package defers to Node's normal module resolution
  // instead, which resolves correctly.
  serverExternalPackages: ["sanity", "@sanity/vision"],
};

export default nextConfig;

"use client";

import nextDynamic from "next/dynamic";

// Sanity's own embedded Studio — a full-viewport app with its own auth
// (Sanity account login), routing, and theming. `SiteChrome` (rendered by
// the root layout) detects this path and skips the public site's Header/
// Footer/ThemeProvider/MotionProvider/LenisProvider chrome around it.
//
// `ssr: false` is load-bearing, not an optimization: Studio was never
// designed to be server-rendered (it's a client-only SPA), and attempting
// to SSR it crashes on a React-internals mismatch inside Sanity's bundled
// dependency tree. `next/dynamic` with `ssr: false` requires the call site
// itself to be in a Client Component (App Router restriction), hence this
// file being "use client" too, on top of `studio-client.tsx` — that split
// still keeps `sanity.config.ts`'s config object (functions/classes:
// validators, plugin icons, the router) entirely on the client side, since
// it's only ever imported inside `studio-client.tsx`.
const StudioClient = nextDynamic(() => import("./studio-client"), { ssr: false });

export default function StudioPage() {
  return <StudioClient />;
}

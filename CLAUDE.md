# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack, default port 3000)
npm run build    # production build (also runs the TypeScript check)
npm run start    # serve the production build
npm run lint     # ESLint (flat config, eslint-config-next)
```

There is no test runner configured in this project (no `test` script, no Jest/Vitest dependency). Verify changes via `npm run build` (type-checks and statically renders every route, including all `generateStaticParams` pages) and `npm run lint`.

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack default), React 19, TypeScript, Tailwind CSS v4. Tailwind v4 uses CSS-based configuration, not `tailwind.config.ts` — all design tokens (colors, fonts, custom text sizes, animations) live in `src/app/globals.css` inside `@theme inline`. Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *))` in that same file, toggled by `next-themes` (`ThemeProvider` in `src/app/layout.tsx`, default theme is dark).

Next.js 16 has real breaking changes from earlier versions (see `AGENTS.md`, imported above) — the load-bearing one throughout this codebase is that `params`/`searchParams` are Promises everywhere (page, layout, route handlers, image/sitemap metadata generators) with no sync fallback. Every dynamic route's `page.tsx` is `async` and `await`s them.

### Data layer and the API seam

This is a mock-data site with no real backend. The seam that matters:

- `src/data/*.ts` — static mock arrays (`articles.ts`, `authors.ts`, `categories.ts`, `crypto-assets.ts`), typed against `src/types/*.ts`. Articles/authors/categories are cross-referenced by lookup (`categories.find(...)`), not duplicated inline.
- `src/lib/api/*.ts` — `async` accessor functions (`getArticles`, `getArticleBySlug`, `getArticlesByCategory`, `getRelatedArticles`, `searchArticles`, `getCryptoAssets`, etc.) that currently just filter the in-memory arrays but already return `Promise<T>`.
- **Pages and components must import from `src/lib/api/*`, never from `src/data/*` directly.** That's the only place a real CMS/API would be wired in later.

### Routing and the category/tag 404 mechanism

Routes: `/`, `/news`, `/news/[slug]`, `/category/[category]`, `/tag/[tag]`, `/author/[authorSlug]`, `/search`, `/markets`. `/news/[slug]` and `/author/[authorSlug]` use `generateStaticParams` (SSG); `/category/[category]`, `/tag/[tag]`, `/news`, and `/search` read `searchParams` for pagination/query and are therefore fully dynamic.

`src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) exists specifically to work around a Next.js quirk: once a fully-dynamic route (one reading `searchParams`) starts streaming, Next has already committed to a 200 status, so calling `notFound()` inside `/category/[category]` or `/tag/[tag]` for an unknown slug can't produce a real 404 response. `proxy.ts` checks the slug against the known category/tag sets *before* the page renders and rewrites unknown ones to `/__not-found`, an intentionally-unmatched path that falls through to the standard `src/app/not-found.tsx` boundary with a correct 404 status.

### Motion system

- `src/lib/motion/` — `easings.ts` (shared `EASINGS`/`SPRINGS`/`DURATION` constants, do not hand-roll new ones), `variants.ts` (`fadeUp`/`staggerContainer`/etc.), `hooks.ts` (`useScrollDirection`, `useActiveHeading`), `motion-provider.tsx` (app-wide `MotionConfig`), `lenis-provider.tsx` (Lenis smooth-scroll instance + `useLenisScrollTo`).
- `src/components/motion/` — reusable animation primitives (`Reveal`, `StaggerGroup`/`StaggerItem`, `PageTransition`, `ActiveIndicator`, `AnimatedNumber`, `Marquee`, skeleton base). Domain components (article cards, hero, price cards) compose these rather than writing raw `framer-motion` JSX inline.
- **Lenis gotcha**: internal anchor navigation (table of contents, back-to-top) must call `useLenisScrollTo()`, not a native anchor jump or `scrollIntoView` — a native jump desyncs Lenis's internal scroll model. `LenisProvider` also resets scroll to top on every `usePathname()` change since Lenis persists across client-side navigations.
- `src/app/template.tsx` (not `layout.tsx`) drives the page-enter transition, since `template.tsx` remounts per navigation and `layout.tsx` doesn't.

### Component organization

Domain-grouped under `src/components/`: `layout/` (header, footer, nav, price marquee, search), `homepage/` (hero, section variants), `article/` (article page furniture: TOC, reading progress, share bar, lightbox), `crypto/` (price card, sparkline, change badge), `shared/` (`ArticleCard` with `grid`/`list`/`compact` variants, category/tag pills, pagination, sidebar), `ui/` (button, input, icons, skeletons).

Icons are never hand-rolled inline SVG. `src/components/ui/icons.tsx` is the single wrapping layer around `@phosphor-icons/react/ssr` (the SSR-safe import path, usable from Server Components without a `'use client'` boundary) — add new icons there rather than importing Phosphor directly at call sites, and rather than authoring a new inline `<svg>`.

Fonts are Geist Sans/Mono from the `geist` package (`geist/font/sans`, `geist/font/mono`), not `next/font/google` — these are prebuilt `next/font/local` wrappers exposing `--font-geist-sans`/`--font-geist-mono`, referenced from `globals.css`'s `--font-sans`/`--font-mono` theme vars.

### Article content and the TOC slug contract

Article `content` is a markdown string rendered via `react-markdown` + `rehype-slug` (in the render path). The table of contents is built separately by extracting `##`/`###` headings from the raw markdown string and slugging them with `github-slugger` directly (`src/lib/utils/markdown.ts`), rather than by inspecting the rendered tree. Both `rehype-slug` and the standalone extraction use the same `github-slugger` algorithm, which is why the TOC's generated anchor IDs match the actual heading IDs in the rendered article body — if one side ever changes its slugging approach, they will drift out of sync.

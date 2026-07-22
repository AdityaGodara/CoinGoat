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

Articles come from **two merged sources**, both funneled through `src/lib/api/articles.ts` so pages never know which one a given article came from:

- **Backend (RSS-ingested)** — a separate FastAPI + Postgres + Redis + Celery service under `backend/` (see `backend/README.md`) ingests multiple RSS feeds on a schedule. `src/lib/api/backend/` (`client.ts`, `types.ts`, `category-map.ts`, `transform.ts`, `authors.ts`) fetches from it (`BACKEND_API_URL`, default `http://localhost:8001`) and maps its shapes onto `Article`/`Author`/`Category`. Backend articles have no real author profile, just a byline string — `backend/authors.ts`'s `synthesizeAuthor()` fabricates a minimal placeholder.
- **Sanity CMS (manually authored)** — `src/lib/api/sanity/` (`client.ts`, `queries.ts`, `transform.ts`, `posts.ts`) fetches published `post`/`author` documents via GROQ and maps them the same way. Unlike backend articles, Sanity authors are real documents (avatar, bio, socials) — see `sanity/schemaTypes/`. Post content is Portable Text, serialized to an HTML string at fetch time (`@portabletext/to-html` in `sanity/transform.ts`) so it needs zero special-casing anywhere else — it becomes a plain `Article.content` string exactly like backend content. The embedded Studio lives at `/studio` (`src/app/studio/[[...tool]]/page.tsx` + root `sanity.config.ts`); `SiteChrome` (`src/components/layout/site-chrome.tsx`) detects that path and skips the public site's Header/Footer/theme/motion/Lenis chrome around it. `src/app/api/revalidate/route.ts` is an optional webhook target for near-instant updates on publish (secret-gated via `SANITY_REVALIDATE_SECRET`); without it, content still updates within the normal 60s ISR window. Sanity isn't configured until `NEXT_PUBLIC_SANITY_PROJECT_ID` is set (via `npx sanity login` + `npx sanity init`) — every Sanity accessor degrades to an empty result until then, so the site works on backend content alone in the meantime.
- `src/lib/api/articles.ts` merges both sources for every export (`getArticles`, `getFeaturedArticle`, `getArticlesByCategory`, `searchArticles`, etc.) — concatenated, sorted by `publishedAt`, paginated in memory via a shared `mergeAndPaginate` helper. `src/lib/api/authors.ts` similarly unions backend-synthesized authors (derived from the article pool) with Sanity's real author list.
- `src/data/*.ts` — static arrays (`categories.ts`, `crypto-assets.ts`, plus legacy mock `articles.ts`/`authors.ts` fixtures that predate the backend/Sanity integration) typed against `src/types/*.ts`. `categories.ts` is the one still genuinely load-bearing: **both** the backend (12→7 name fold, `backend/category-map.ts`) and Sanity (`post.category` is a string field constrained to these same 7 slugs) map onto this same fixed taxonomy, so there's one source of truth for category name/description/color.
- **Pages and components must import from `src/lib/api/*`, never from `src/data/*` directly.**

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

Article `content` is a markdown/HTML string rendered via `react-markdown` + `rehype-raw` (renders raw HTML embedded in the string — needed since backend content is sanitized HTML, not real markdown) + `rehype-slug`. The table of contents is built separately, by extracting headings directly from that raw string and slugging them with `github-slugger` (`src/lib/utils/markdown.ts`'s `extractHeadings`), rather than by inspecting the rendered tree. It matches **two** heading shapes with one regex: markdown `## `/`### ` lines (backend/RSS content) and literal `<h2>`/`<h3>` tags (Sanity content — Portable Text headings serialize straight to plain heading tags, no markdown). Both `rehype-slug` and `extractHeadings` run the same `github-slugger` algorithm on the same heading text, which is why the TOC's anchor IDs match the actual rendered heading IDs regardless of content source — if either side ever changes its slugging approach, or a new content source introduces a third heading shape, they will drift out of sync.

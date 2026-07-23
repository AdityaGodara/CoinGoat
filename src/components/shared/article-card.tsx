"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CategoryPill } from "./category-pill";
import { ClockIcon } from "@/components/ui/icons";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  variant?: "grid" | "list" | "compact" | "sidebar";
  rank?: number;
  priority?: boolean;
}

export function ArticleCard({ article, variant = "grid", rank, priority = false }: ArticleCardProps) {
  const href = `/news/${article.slug}`;

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex items-start gap-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-muted">{formatRelativeTime(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === "sidebar") {
    return (
      <Link href={href} className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface-hover">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {rank !== undefined && (
            <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-[10px] font-bold tabular-nums text-foreground backdrop-blur-sm">
              {rank}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
            {article.title}
          </p>
          <p className="mt-1.5 truncate text-xs text-muted">{formatRelativeTime(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link href={href} className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-surface-hover">
        {rank !== undefined && (
          <span className="w-7 shrink-0 text-2xl font-bold tabular-nums text-border transition-colors group-hover:text-accent/40">
            {String(rank).padStart(2, "0")}
          </span>
        )}
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <CategoryPill category={article.category} interactive={false} className="mb-1.5" />
          <p className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-accent">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-muted">
            {article.author.name} · {formatRelativeTime(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block h-full">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/10"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            unoptimized
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <CategoryPill category={article.category} interactive={false} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{article.excerpt}</p>
          <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted">
            <span className="truncate">
              {article.author.name} · {formatRelativeTime(article.publishedAt)}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {article.readingTimeMinutes} min read
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

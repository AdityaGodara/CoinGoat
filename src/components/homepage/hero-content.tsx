"use client";

import { motion } from "framer-motion";
import { CategoryPill } from "@/components/shared/category-pill";
import { ClockIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils/formatDate";
import { staggerContainer, staggerItem } from "@/lib/motion/variants";
import type { Article } from "@/types";

export function HeroContent({ article }: { article: Article }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10"
    >
      <motion.div variants={staggerItem}>
        <CategoryPill category={article.category} interactive={false} />
      </motion.div>
      <motion.h1
        variants={staggerItem}
        className="line-clamp-2 max-w-3xl text-headline-sm font-extrabold leading-tight text-white sm:text-headline-md lg:text-headline-lg"
      >
        {article.title}
      </motion.h1>
      <motion.p variants={staggerItem} className="line-clamp-2 max-w-2xl text-sm text-white/80 sm:text-article-lead">
        {article.excerpt}
      </motion.p>
      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
        <span>
          {article.author.name} · {formatDate(article.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          {article.readingTimeMinutes} min read
        </span>
      </motion.div>
    </motion.div>
  );
}

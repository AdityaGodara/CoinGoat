"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { searchArticles } from "@/lib/api/articles";
import { SearchIcon } from "@/components/ui/icons";
import { DURATION, EASINGS } from "@/lib/motion/easings";
import type { Article } from "@/types";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    searchArticles(query).then((found) => {
      if (active) setResults(found.slice(0, 5));
    });
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = isFocused && query.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit}>
        <motion.div
          animate={{ width: isFocused ? 288 : 200 }}
          transition={{ duration: DURATION.base, ease: EASINGS.out }}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5"
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsFocused(true)}
            type="search"
            placeholder="Search news..."
            aria-label="Search articles"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </motion.div>
      </form>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.fast }}
            className="glass-nav absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border shadow-xl"
          >
            {results.length > 0 ? (
              <ul>
                {results.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/news/${article.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover"
                    >
                      <span className="line-clamp-1 font-medium text-foreground">{article.title}</span>
                      <span className="text-xs text-muted">{article.category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-muted">No results for &ldquo;{query}&rdquo;</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

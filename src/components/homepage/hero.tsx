import Link from "next/link";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import type { Article } from "@/types";

export function Hero({ article }: { article: Article }) {
  return (
    <Link href={`/news/${article.slug}`} className="group relative block overflow-hidden rounded-3xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9]">
        <Image
          src={article.coverImage.src}
          alt={article.coverImage.alt}
          fill
          unoptimized
          priority
          className="animate-kenburns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      </div>
      <HeroContent article={article} />
    </Link>
  );
}

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { TwitterIcon, LinkedinIcon, WebsiteIcon } from "@/components/ui/icons";
import type { Author } from "@/types";

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
      <Link href={`/author/${author.slug}`}>
        <Avatar src={author.avatar} alt={author.name} size={56} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/author/${author.slug}`}
          className="font-semibold text-foreground transition-colors hover:text-accent"
        >
          {author.name}
        </Link>
        <p className="text-sm text-muted">{author.title}</p>
        <p className="mt-2 text-sm text-muted">{author.bio}</p>
        <div className="mt-3 flex items-center gap-3 text-muted opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          {author.social.twitter && (
            <a
              href={author.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} on Twitter`}
              className="transition-transform duration-200 hover:scale-110 hover:text-accent"
            >
              <TwitterIcon className="h-4 w-4" />
            </a>
          )}
          {author.social.linkedin && (
            <a
              href={author.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} on LinkedIn`}
              className="transition-transform duration-200 hover:scale-110 hover:text-accent"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
          )}
          {author.social.website && (
            <a
              href={author.social.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name}'s website`}
              className="transition-transform duration-200 hover:scale-110 hover:text-accent"
            >
              <WebsiteIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

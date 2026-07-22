import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorBySlug, getArticlesByAuthor, getAuthors } from "@/lib/api/authors";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/ui/avatar";
import { ArticleCard } from "@/components/shared/article-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { TwitterIcon, LinkedinIcon, WebsiteIcon } from "@/components/ui/icons";

interface AuthorPageProps {
  params: Promise<{ authorSlug: string }>;
}

export async function generateStaticParams() {
  // Backend bylines are derived from recent articles, not a fixed roster
  // (see src/lib/api/authors.ts) — this pre-warms whoever appears in that
  // snapshot; `dynamicParams` stays at its default (true) so any other real
  // byline still resolves on demand instead of 404ing.
  const authors = await getAuthors();
  return authors.map((author) => ({ authorSlug: author.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { authorSlug } = await params;
  const author = await getAuthorBySlug(authorSlug);
  if (!author) return {};
  return { title: author.name, description: author.bio };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorSlug } = await params;
  const author = await getAuthorBySlug(authorSlug);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(authorSlug);

  return (
    <Container className="py-10">
      <div className="mb-10 flex items-start gap-5">
        <Avatar src={author.avatar} alt={author.name} size={80} />
        <div>
          <h1 className="text-headline-lg font-extrabold text-foreground">{author.name}</h1>
          <p className="text-muted">{author.title}</p>
          <p className="mt-3 max-w-2xl text-muted">{author.bio}</p>
          <div className="mt-3 flex items-center gap-3 text-muted">
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
      {articles.length === 0 ? (
        <EmptyState title="No articles yet" description={`${author.name} hasn't published any stories yet.`} />
      ) : (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </Container>
  );
}

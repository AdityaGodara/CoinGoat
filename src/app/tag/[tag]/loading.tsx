import { Container } from "@/components/ui/container";
import { ArticleGridSkeleton } from "@/components/ui/skeletons/article-grid-skeleton";

export default function Loading() {
  return (
    <Container className="py-10">
      <div className="mb-8 h-9 w-48 animate-pulse rounded-md bg-surface-hover" />
      <ArticleGridSkeleton count={9} />
    </Container>
  );
}

import { Container } from "@/components/ui/container";
import { ArticleGridSkeleton } from "@/components/ui/skeletons/article-grid-skeleton";

export default function Loading() {
  return (
    <Container className="py-10">
      <ArticleGridSkeleton count={6} />
    </Container>
  );
}

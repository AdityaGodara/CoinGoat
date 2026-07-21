import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

export default function ArticleNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-headline-md font-bold text-foreground">Story not found</p>
      <p className="max-w-md text-muted">
        This article may have been moved or no longer exists. Try heading back to the latest news.
      </p>
      <LinkButton href="/news" variant="primary">
        Browse latest news
      </LinkButton>
    </Container>
  );
}

import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-headline-md font-bold text-foreground">Page not found</p>
      <p className="max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <LinkButton href="/">Back to homepage</LinkButton>
    </Container>
  );
}

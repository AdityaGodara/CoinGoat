import { Reveal } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function NewsletterCTA() {
  return (
    <Reveal className="glass-subtle relative overflow-hidden rounded-3xl border border-border p-8 text-center sm:p-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
      <div className="relative">
        <h2 className="text-headline-md font-bold text-foreground">Never miss a move</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Get the day&apos;s biggest crypto stories and market moves, delivered straight to your inbox.
        </p>
        <div className="mx-auto mt-6 max-w-sm">
          <NewsletterForm variant="large" />
        </div>
      </div>
    </Reveal>
  );
}

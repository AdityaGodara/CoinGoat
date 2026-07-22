import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { Components } from "react-markdown";
import { LightboxImage } from "./lightbox-image";

const components: Components = {
  img: ({ src, alt }) => (typeof src === "string" ? <LightboxImage src={src} alt={alt ?? ""} /> : null),
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http");
    return (
      <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  },
};

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="prose-article max-w-none">
      {/* rehypeRaw runs first to parse raw HTML (backend articles store
          sanitized HTML, not markdown, in `content`) into real elements;
          rehypeSlug then adds heading ids to whatever came out of that. */}
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSlug]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { resolveImage, useCatalog } from "@/lib/catalog";

export function Logo({ className = "h-10 sm:h-12" }: { className?: string }) {
  const { content } = useCatalog();
  return (
    <Link to="/" aria-label={`${content.footer.brandName} home`} className="inline-flex shrink-0 items-center">
      <img src={resolveImage(content.footer.logoImage)} alt={content.footer.brandName}
        className={`${className} w-auto max-w-44 object-contain mix-blend-multiply`} width={920} height={665} />
    </Link>
  );
}

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCatalog } from "@/lib/catalog";

/**
 * The old Lovable-only "/__l5e/assets-v1/..." reference does not work on
 * every custom-domain deployment. Show a dependable branded wordmark until
 * an admin provides a public logo URL through Website Content.
 */
export function Logo({ className = "h-10 sm:h-12" }: { className?: string }) {
  const { content } = useCatalog();
  const [failed, setFailed] = useState(false);
  const name = content.footer.brandName?.trim() || "Sweet Trade";
  const source = content.footer.logoImage?.trim() || "";
  const showImage = /^(https:\/\/|http:\/\/)/i.test(source) && !failed;

  useEffect(() => setFailed(false), [source]);

  return (
    <Link to="/" aria-label={`${name} home`} className="inline-flex min-w-0 shrink-0 items-center">
      {showImage
        ? <img src={source} alt={name} onError={() => setFailed(true)}
            className={`${className} w-auto max-w-36 object-contain sm:max-w-44`} />
        : <span className="flex items-center gap-2">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground sm:size-10">S</span>
            <span className="max-w-36 text-base font-bold tracking-tight text-foreground sm:text-xl">{name}</span>
          </span>}
    </Link>
  );
}

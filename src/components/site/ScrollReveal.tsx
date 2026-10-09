import { useEffect, useRef, type ReactNode } from "react";

/**
 * Progressive enhancement: content is visible without JS/IntersectionObserver.
 * Elements below the viewport reveal once on entry. Respect reduced motion.
 */
export function ScrollReveal({ children, className = "", delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = node.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.92) return;
    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.dataset.reveal = "visible";
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    observer.observe(el);
    return () => { observer.disconnect(); el.dataset.reveal = "visible"; };
  }, []);
  return <div ref={node} className={`wow-reveal ${className}`} style={{ transitionDelay: `${Math.min(350, Math.max(0, delay))}ms` }}>{children}</div>;
}

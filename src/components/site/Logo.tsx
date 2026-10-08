import { Link } from "@tanstack/react-router";
import logo from "@/assets/sweetrade-logo.png.asset.json";

export function Logo({ className = "h-10 sm:h-12" }: { className?: string }) {
  return (
    <Link to="/" aria-label="Sweet Trade home" className="inline-flex shrink-0 items-center">
      <img src={logo.url} alt="Sweet Trade — Sweet Taste, Healthy Life" className={`${className} w-auto mix-blend-multiply`} width={920} height={665} />
    </Link>
  );
}

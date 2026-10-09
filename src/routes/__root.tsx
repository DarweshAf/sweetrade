import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { catalogQuery } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { StoreSkeleton } from "@/components/site/StoreSkeleton";

const BASE_URL = "https://sweetrade.pk";

function NotFoundComponent() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-6xl text-primary">404</h1>
      <p className="mt-3 text-muted-foreground">This page doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
        Go home
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl">This page didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SweeTrade — Natural Products in Pakistan" },
      { name: "description", content: "Honey, shilajit, saffron, olive oil, dates and traditional sweets available across Pakistan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      {
        rel: "alternate",
        href: "/llms.txt",
        type: "text/plain",
        title: "SweeTrade LLM guide",
      },
      {
        rel: "alternate",
        href: "/api/ai/catalog",
        type: "application/json",
        title: "SweeTrade live AI catalogue",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  pendingComponent: StoreSkeleton,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": BASE_URL + "/#organization",
    name: "SweeTrade",
    description:
      "Pakistan-focused online store for natural and traditional food products.",
    url: BASE_URL + "/",
    logo: BASE_URL + "/favicon.png",
    telephone: "+92 334 3645850",
    currenciesAccepted: "PKR",
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+92 334 3645850",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "SweeTrade product catalogue",
      url: BASE_URL + "/shop",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Honey", url: BASE_URL + "/shop?category=honey" },
        { "@type": "OfferCatalog", name: "Shilajit", url: BASE_URL + "/shop?category=shilajit" },
        { "@type": "OfferCatalog", name: "Saffron", url: BASE_URL + "/shop?category=saffron" },
        { "@type": "OfferCatalog", name: "Olive Oil", url: BASE_URL + "/shop?category=olive-oil" },
        { "@type": "OfferCatalog", name: "Dates & Dried Fruits", url: BASE_URL + "/shop?category=dates" },
      ],
    },
    knowsAbout: [
      "Honey",
      "Shilajit",
      "Saffron",
      "Olive oil",
      "Dates",
      "Dried fruits",
      "Traditional foods in Pakistan",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": BASE_URL + "/#website",
    name: "SweeTrade",
    url: BASE_URL + "/",
    publisher: { "@id": BASE_URL + "/#organization" },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: BASE_URL + "/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const isAdmin = useRouterState({ select: (s) => /^\/(admin|auth)/.test(s.location.pathname) });
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <div className="flex min-h-screen flex-col">
          {!isAdmin && <Header />}
          <main className={`flex-1 ${isAdmin ? "" : "pb-16 xl:pb-0"}`}>
            <Outlet />
          </main>
          {!isAdmin && <Footer />}
        </div>
        <Toaster position="top-center" />
      </StoreProvider>
    </QueryClientProvider>
  );
}

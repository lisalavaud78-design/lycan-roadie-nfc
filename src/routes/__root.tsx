import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { WeiHydrator } from "@/lib/wei-store";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LYCAN WEI NFC — Highway to WEI 2025" },
      { name: "description", content: "Application NFC officielle du WEI Lycan 2025 — Télécom SudParis & IMT-BS" },
      { property: "og:title", content: "LYCAN WEI NFC — Highway to WEI 2025" },
      { name: "twitter:title", content: "LYCAN WEI NFC — Highway to WEI 2025" },
      { property: "og:description", content: "Application NFC officielle du WEI Lycan 2025 — Télécom SudParis & IMT-BS" },
      { name: "twitter:description", content: "Application NFC officielle du WEI Lycan 2025 — Télécom SudParis & IMT-BS" },
      { name: "twitter:card", content: "summary" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="display text-7xl text-electric neon-text">404</h1>
        <p className="mt-4 text-muted-foreground">Cette route n'existe pas dans le WEI.</p>
        <Link to="/" className="mt-6 inline-block rounded-md gradient-electric px-6 py-2 font-semibold text-black">Retour</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-3xl">Erreur</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <WeiHydrator />
      <Outlet />
      <Toaster theme="dark" position="top-right" />
    </QueryClientProvider>
  );
}

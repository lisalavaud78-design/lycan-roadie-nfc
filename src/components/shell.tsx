import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Zap } from "lucide-react";

export function OrgShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/org", label: "Assistant IA", exact: true },
    { to: "/org/devis", label: "Devis" },
    { to: "/org/modules", label: "Modules NFC" },
    { to: "/org/bracelets", label: "Bracelets" },
    { to: "/org/scan", label: "Scan NFC demo" },
    { to: "/org/design", label: "Design" },
    { to: "/org/participants", label: "Participants" },
    { to: "/org/staff", label: "Staff" },
    { to: "/org/import", label: "Import CSV" },
    { to: "/org/settings", label: "Paramètres" },
  ];
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-electric" />
            <span className="display text-xl">LYCAN <span className="text-electric">ORG</span></span>
          </Link>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-electric">Accueil</Link>
            <Link to="/live" className="hover:text-electric">Live</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${active ? "gradient-electric font-semibold text-black" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

export function LiveShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/live", label: "Dashboard", exact: true },
    { to: "/live/participants", label: "Participants" },
    { to: "/live/bus", label: "Bus" },
    { to: "/live/logements", label: "Logements" },
    { to: "/live/activites", label: "Activités" },
    { to: "/live/conso", label: "Soirées & Conso" },
    { to: "/live/restauration", label: "Restauration" },
    { to: "/live/goodies", label: "Goodies" },
    { to: "/live/securite", label: "Sécurité" },
    { to: "/live/medical", label: "Médical" },
    { to: "/live/alertes", label: "Alertes" },
    { to: "/live/historique", label: "Scans" },
    { to: "/live/plans", label: "Plans" },
    { to: "/live/staff", label: "Staff" },
    { to: "/live/messages", label: "Messages" },
    { to: "/live/stats", label: "Stats" },
  ];
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-5 w-5 text-electric" />
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-danger" />
            </div>
            <span className="display text-xl">LYCAN <span className="text-electric">LIVE</span></span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-success"><span className="h-2 w-2 animate-pulse rounded-full bg-success" />En direct</span>
            <Link to="/" className="text-muted-foreground hover:text-electric">Accueil</Link>
            <Link to="/org" className="text-muted-foreground hover:text-electric">Org</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${active ? "gradient-electric font-semibold text-black" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

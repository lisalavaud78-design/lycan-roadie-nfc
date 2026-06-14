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
      <header className="sticky top-0 z-40 border-b-2 border-(--ink) bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--ink) text-accent"><Zap className="h-4 w-4" /></span>
            <span className="display text-xl tracking-tight">LYCAN <span className="text-electric italic">ORG</span></span>
          </Link>
          <div className="flex gap-2 text-xs font-bold">
            <Link to="/" className="rounded-full border-2 border-(--ink) bg-white px-3 py-1.5 hover:bg-muted">Accueil</Link>
            <Link to="/live" className="rounded-full border-2 border-(--ink) bg-white px-3 py-1.5 hover:bg-muted">Live</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={`whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "border-(--ink) bg-accent text-(--ink)" : "border-transparent text-muted-foreground hover:border-(--ink) hover:bg-white hover:text-(--ink)"}`}>
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
      <header className="sticky top-0 z-40 border-b-2 border-(--ink) bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-(--ink) text-accent">
              <Zap className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-danger" />
            </span>
            <span className="display text-xl tracking-tight">LYCAN <span className="text-electric italic">LIVE</span></span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-(--ink) bg-success px-3 py-1.5 text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />En direct</span>
            <Link to="/" className="rounded-full border-2 border-(--ink) bg-white px-3 py-1.5 hover:bg-muted">Accueil</Link>
            <Link to="/org" className="rounded-full border-2 border-(--ink) bg-white px-3 py-1.5 hover:bg-muted">Org</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className={`whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "border-(--ink) bg-accent text-(--ink)" : "border-transparent text-muted-foreground hover:border-(--ink) hover:bg-white hover:text-(--ink)"}`}>
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

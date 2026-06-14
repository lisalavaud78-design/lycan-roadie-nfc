import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { Zap, Radio, Activity, ArrowRight, Music2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LYCAN WEI NFC — Highway to WEI 2025" },
      { name: "description", content: "Application NFC officielle du WEI Lycan 2025 — Télécom SudParis & IMT-BS — 5-8 septembre, Camping Ty Nadan." },
    ],
  }),
  component: Home,
});

function Home() {
  const bracelets = useWei((s) => s.bracelets);
  const sample = bracelets[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-4 pb-20 pt-6 md:px-6 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border-2 border-(--ink) bg-electric p-7 hard-shadow md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-(--ink) bg-(--ink) px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
              <Music2 className="h-3.5 w-3.5" /> Highway to WEI · 5-8 sept. 2025 · Ty Nadan
            </div>
            <h1 className="display mt-6 text-6xl leading-[0.9] text-white md:text-8xl">
              LYCAN WEI
              <br />
              <span className="italic text-accent">version festival</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold text-white/85">
              Le WEI Lycan 2025 dans ta poche. Bracelets NFC, tickets conso, soirées, sécurité, médical — tout est connecté.
              <span className="font-extrabold text-white"> 350 participants · 6 bus · 4 jours rock'n roll.</span>
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SpaceCard
              to="/org"
              icon={<Zap className="h-6 w-6" />}
              eyebrow="Avant l'événement"
              title="Espace Organisateur"
              desc="Assistant IA, devis automatique, génération de bracelets, modules NFC."
            />
            <SpaceCard
              to="/w/$braceletId"
              params={{ braceletId: sample?.id ?? "demo" }}
              icon={<Radio className="h-6 w-6" />}
              eyebrow="Pendant le WEI"
              title="Interface Bracelet NFC"
              desc="Vue participant : billet, transport, planning, tickets conso, SOS."
              highlight
            />
            <SpaceCard
              to="/live"
              icon={<Activity className="h-6 w-6" />}
              eyebrow="Live"
              title="Dashboard Organisateur"
              desc="Suivi temps réel : bus, soirées, sécurité, médical, staff."
            />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Participants" value="350" />
            <Stat label="Bus" value="6 × 60" />
            <Stat label="Soirées" value="22h → 4h" />
            <Stat label="Activités" value="10+" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SpaceCard({ to, params, icon, eyebrow, title, desc, highlight }: any) {
  return (
    <Link
      to={to}
      params={params}
      className={`group relative overflow-hidden rounded-2xl border-2 border-(--ink) p-6 transition-transform hover:-translate-y-1 hard-shadow ${
        highlight ? "bg-accent text-(--ink)" : "bg-white text-(--ink)"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-(--ink) ${highlight ? "bg-(--ink) text-accent" : "bg-secondary text-(--ink)"}`}>{icon}</div>
        <ArrowRight className="h-5 w-5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      <div className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
      <h3 className="display mt-1 text-2xl">{title}</h3>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{desc}</p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-(--ink) bg-white p-4 text-(--ink) hard-shadow-sm">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="display mt-1 text-3xl">{value}</div>
    </div>
  );
}

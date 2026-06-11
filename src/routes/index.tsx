import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { Zap, Radio, Activity, ArrowRight, Music2, Shield, Wand2 } from "lucide-react";

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
  const sampleParticipant = bracelets.find((b) => b.role === "participant");
  const sampleStaff = bracelets.find((b) => b.role !== "participant");

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-electric/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-lycan/30 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-electric">
            <Music2 className="h-4 w-4" /> Highway to WEI · 5-8 sept. 2025 · Ty Nadan
          </div>
          <h1 className="display mt-6 text-6xl leading-none md:text-8xl">
            <span className="neon-text text-electric">LYCAN</span>
            <span className="text-foreground"> WEI </span>
            <span className="text-mist">NFC</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Le WEI Lycan 2025 dans ta poche. Bracelets NFC, tickets conso, soirées, sécurité, médical — tout est connecté.
            <span className="text-foreground"> 350 participants · 6 bus · 4 jours rock'n roll.</span>
          </p>

          <div className="mt-12">
            <div className="mb-4 text-xs uppercase tracking-widest text-electric">Choisis ton espace</div>
            <div className="grid gap-4 md:grid-cols-2">
              <SpaceCard
                to="/org"
                icon={<Wand2 className="h-6 w-6" />}
                eyebrow="Organisateur · Avant"
                title="Préparer le WEI"
                desc="Assistant IA guidé, devis automatique, modules NFC, génération bracelets, design, import CSV."
              />
              <SpaceCard
                to="/live"
                icon={<Activity className="h-6 w-6" />}
                eyebrow="Organisateur · Pendant"
                title="Piloter le WEI en direct"
                desc="Dashboard live : bus, logements, soirées, médical, sécurité, staff, alertes, messages."
              />
              <SpaceCard
                to="/w/$braceletId"
                params={{ braceletId: sampleParticipant?.id ?? "demo" }}
                icon={<Radio className="h-6 w-6" />}
                eyebrow="Bracelet NFC"
                title="Interface participant"
                desc="Accueil, planning, transport, logement, tickets conso, SOS, médical, contacts."
                highlight
              />
              <SpaceCard
                to="/s/$braceletId"
                params={{ braceletId: sampleStaff?.id ?? "demo" }}
                icon={<Shield className="h-6 w-6" />}
                eyebrow="Bracelet NFC"
                title="Interface staff"
                desc="Planning perso, missions, notifications, carte staff, signalements."
              />
            </div>
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
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
        highlight ? "border-electric/60 gradient-electric text-black shadow-electric" : "glass hover:border-electric/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${highlight ? "bg-black/20" : "bg-electric/10 text-electric"}`}>{icon}</div>
        <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
      </div>
      <div className={`mt-4 text-xs uppercase tracking-widest ${highlight ? "text-black/70" : "text-electric"}`}>{eyebrow}</div>
      <h3 className="display mt-1 text-2xl">{title}</h3>
      <p className={`mt-2 text-sm ${highlight ? "text-black/80" : "text-muted-foreground"}`}>{desc}</p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="display mt-1 text-3xl text-electric">{value}</div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/live/plans")({
  component: Plans,
});

const ZONES = [
  { id: "accueil", name: "Accueil & Check-in", x: 12, y: 20, color: "bg-electric", desc: "Récupération bracelets, billets et infos" },
  { id: "bungalows", name: "Zone bungalows", x: 30, y: 45, color: "bg-lycan", desc: "Bungalows B01 à B70 — 4 à 6 personnes" },
  { id: "scene", name: "Scène / Soirées", x: 60, y: 30, color: "bg-warning", desc: "Salle com/rap/pop & salle techno · 22h-04h" },
  { id: "bar", name: "Bar central", x: 55, y: 50, color: "bg-success", desc: "Tickets conso + unité fort" },
  { id: "cantine", name: "Restauration", x: 45, y: 65, color: "bg-orange-500", desc: "Brunchs, dîners, encas" },
  { id: "funbreak", name: "Zone Funbreak", x: 75, y: 60, color: "bg-pink-500", desc: "Taureau, sumo, Pedal'Balayette" },
  { id: "piscine", name: "Piscine", x: 80, y: 35, color: "bg-blue-400", desc: "Chill & activités jour" },
  { id: "plage", name: "Plage", x: 88, y: 75, color: "bg-yellow-400", desc: "Holy Color + feu d'artifice" },
  { id: "paps", name: "Poste PAPS / Médical", x: 20, y: 70, color: "bg-danger", desc: "Secouristes 24/7" },
  { id: "securite", name: "PC Sécurité", x: 15, y: 35, color: "bg-red-700", desc: "Coordination sécurité" },
];

function Plans() {
  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Plans & lieux — Camping Ty Nadan</h1>
      <p className="text-sm text-muted-foreground">Locunolé · Finistère · 350 participants · 6 bus</p>

      <div className="glass rounded-2xl p-5">
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-lycan/10 via-card to-electric/10" style={{ aspectRatio: "16/10" }}>
          {/* river */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-blue-400/40 -rotate-3" />
          {ZONES.map((z) => (
            <div key={z.id} className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
              <div className={`h-3 w-3 rounded-full ${z.color} ring-4 ring-background animate-pulse`} />
              <div className="absolute left-4 top-0 whitespace-nowrap rounded bg-background/90 px-2 py-0.5 text-[10px] border border-border opacity-90 group-hover:opacity-100">
                {z.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ZONES.map((z) => (
          <div key={z.id} className="glass rounded-xl p-4 flex gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-lg ${z.color} flex items-center justify-center`}><MapPin className="h-5 w-5 text-white" /></div>
            <div>
              <div className="font-semibold">{z.name}</div>
              <div className="text-xs text-muted-foreground">{z.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

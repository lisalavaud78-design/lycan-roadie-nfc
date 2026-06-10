import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/restauration")({
  component: Restauration,
});

const REPAS = [
  { id: "brunch_sam", label: "Brunch samedi", horaire: "11h-13h", capacity: 350 },
  { id: "encas_sam", label: "Encas samedi", horaire: "14h-18h", capacity: 350 },
  { id: "diner_sam", label: "Dîner samedi", horaire: "19h-21h", capacity: 350 },
  { id: "encas_soiree_sam", label: "Encas soirée sam", horaire: "22h-04h", capacity: 350 },
  { id: "brunch_dim", label: "Brunch dimanche", horaire: "11h-13h", capacity: 350 },
  { id: "diner_dim", label: "Dîner dimanche", horaire: "19h-21h", capacity: 350 },
];

function Restauration() {
  const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));

  function markAll(id: string) {
    parts.forEach((b) => actions.updateBracelet(b.id, { repas: { ...b.repas, [id]: true } }));
    toast.success("Marqué pour tous");
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Restauration live</h1>
      <p className="text-sm text-muted-foreground">Suivi des repas distribués par service</p>
      <div className="grid gap-3 md:grid-cols-2">
        {REPAS.map((r) => {
          const count = parts.filter((b) => b.repas[r.id]).length;
          const pct = (count / Math.max(parts.length, 1)) * 100;
          return (
            <div key={r.id} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-2"><UtensilsCrossed className="h-4 w-4 text-electric" /> {r.label}</div>
                  <div className="text-xs text-muted-foreground">{r.horaire} · Capacité {r.capacity}</div>
                </div>
                <div className="display text-2xl text-electric">{count}/{parts.length}</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                <div className="h-full gradient-electric" style={{ width: `${pct}%` }} />
              </div>
              <button onClick={() => markAll(r.id)} className="mt-3 w-full rounded-lg border border-border bg-card/60 py-1.5 text-xs hover:border-electric">
                Marquer tous présents
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/goodies")({
  component: Goodies,
});

const GOODIES = [
  { key: "tshirt", label: "Tee-shirt" },
  { key: "bob", label: "Bob" },
  { key: "bandana", label: "Bandana" },
  { key: "ecocup", label: "Ecocup" },
  { key: "sac", label: "Sac" },
];

function Goodies() {
  const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));

  function distribAll(k: string) {
    parts.forEach((b) => actions.updateBracelet(b.id, { goodies: { ...b.goodies, [k]: { ...(b.goodies[k] || {}), recupere: true } } }));
    toast.success("Distribué à tous");
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Goodies</h1>
      <p className="text-sm text-muted-foreground">Distribution suivie par bracelet NFC</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {GOODIES.map((g) => {
          const count = parts.filter((b) => b.goodies[g.key]?.recupere).length;
          const pct = (count / Math.max(parts.length, 1)) * 100;
          return (
            <div key={g.key} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold"><ShoppingBag className="h-4 w-4 text-electric" /> {g.label}</div>
                <div className="display text-2xl text-electric">{count}/{parts.length}</div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                <div className="h-full gradient-electric" style={{ width: `${pct}%` }} />
              </div>
              <button onClick={() => distribAll(g.key)} className="mt-3 w-full rounded-lg border border-border bg-card/60 py-1.5 text-xs hover:border-electric">
                Distribuer à tous
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

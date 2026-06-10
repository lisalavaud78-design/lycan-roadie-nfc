import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

const ACTIVITES = ["Taureau mécanique", "Pedal'Balayette", "Sumo", "Canoë-kayak", "Olympiades", "Apéro mousse", "Holy Color", "Feu d'artifice"];

export const Route = createFileRoute("/live/activites")({
  component: () => {
    const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Activités live</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {ACTIVITES.map((a) => {
            const inscrits = parts.filter((p) => p.activites[a] === "inscrit").length;
            const absents = parts.filter((p) => p.activites[a] === "absent").length;
            return (
              <div key={a} className="glass rounded-2xl p-4">
                <div className="display text-lg">{a}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <Stat label="Inscrits" value={inscrits} color="text-electric" />
                  <Stat label="Absents" value={absents} color="text-warning" />
                  <Stat label="Capacité" value={a === "Canoë-kayak" ? 30 : a === "Holy Color" ? 350 : 60} />
                </div>
                <div className="mt-3 text-xs"><span className="rounded-full bg-success/20 px-2 py-0.5 text-success">à venir</span></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});

function Stat({ label, value, color = "" }: { label: string; value: any; color?: string }) {
  return <div className="rounded-lg bg-card/40 p-2"><div className="text-muted-foreground">{label}</div><div className={`display text-xl ${color || "text-foreground"}`}>{value}</div></div>;
}

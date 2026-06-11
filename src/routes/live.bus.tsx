import { createFileRoute } from "@tanstack/react-router";
import { useWei, BUS_TYPES } from "@/lib/wei-store";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/live/bus")({
  component: BusLive,
});

function BusLive() {
  const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
  const alerts = useWei((s) => s.alerts.filter((a) => a.type === "transport"));
  const [sens, setSens] = useState<"aller" | "retour">("aller");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="display text-3xl">Bus live</h1>
        <div className="flex gap-1">
          {(["aller", "retour"] as const).map((s) => (
            <button key={s} onClick={() => setSens(s)} className={`rounded-full px-4 py-1.5 text-sm ${sens === s ? "gradient-electric text-black font-semibold" : "bg-card border border-border"}`}>Bus {s}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {BUS_TYPES.map((type, i) => {
          const inBus = parts.filter((b) => (sens === "aller" ? b.busAllerType : b.busRetourType) === type);
          const present = inBus.filter((b) => (sens === "aller" ? b.checkin.bus : b.checkin.busRetour)).length;
          const probs = alerts.filter((a) => inBus.some((b) => b.id === a.braceletId)).length;
          return (
            <div key={type} className="glass rounded-2xl p-5">
              <div className="display text-2xl">Bus {type}</div>
              <div className="text-xs text-muted-foreground">{sens === "aller" ? "Aller — vendredi 8h" : "Retour — lundi 14h"} · capacité 60</div>
              <div className="mt-3 display text-4xl text-electric">{present}/{inBus.length}</div>
              <div className="text-xs text-muted-foreground mb-3">Montés / Attendus</div>
              <div className="h-2 overflow-hidden rounded-full bg-card">
                <div className="h-full gradient-electric" style={{ width: `${(present / Math.max(inBus.length, 1)) * 100}%` }} />
              </div>
              {probs > 0 && <div className="mt-2 text-xs text-danger">⚠ {probs} signalement(s)</div>}
              <button onClick={() => toast.success(`Manifeste bus ${type} (${sens}) exporté`)} className="mt-4 w-full rounded-lg border border-border bg-card py-2 text-xs hover:border-electric">Export manifeste</button>
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h2 className="display text-lg mb-3">Problèmes transport signalés</h2>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex justify-between text-sm rounded bg-card/40 p-3">
                <span><strong>{a.prenom}</strong> · {a.lieu}</span>
                <span className="text-xs text-muted-foreground">{new Date(a.ts).toLocaleTimeString("fr")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

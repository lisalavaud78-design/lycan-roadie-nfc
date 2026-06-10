import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { toast } from "sonner";

export const Route = createFileRoute("/live/bus")({
  component: () => {
    const config = useWei((s) => s.config);
    const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Bus live</h1>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: config.nbBus }, (_, i) => i + 1).map((n) => {
            const inBus = parts.filter((b) => b.bus === n);
            const present = inBus.filter((b) => b.checkin.bus).length;
            return (
              <div key={n} className="glass rounded-2xl p-5">
                <div className="display text-2xl">Bus {n}</div>
                <div className="text-xs text-muted-foreground">Capacité 60</div>
                <div className="mt-3 display text-4xl text-electric">{present}/{inBus.length}</div>
                <div className="text-xs text-muted-foreground mb-3">Montés / Attendus</div>
                <div className="h-2 overflow-hidden rounded-full bg-card">
                  <div className="h-full gradient-electric" style={{ width: `${(present / Math.max(inBus.length, 1)) * 100}%` }} />
                </div>
                <button onClick={() => toast.success(`Manifeste bus ${n} exporté`)} className="mt-4 w-full rounded-lg border border-border bg-card py-2 text-xs hover:border-electric">
                  Export manifeste
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});

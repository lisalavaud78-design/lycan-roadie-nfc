import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/live/conso")({
  component: () => {
    const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
    const ticketsTotal = parts.reduce((a, b) => a + b.tickets_conso.length, 0);
    const ticketsUsed = parts.reduce((a, b) => a + b.tickets_conso.filter((t) => t.used).length, 0);
    const fortUsed = parts.filter((b) => b.unite_fort.used).length;
    const allConsumed = parts.filter((b) => b.tickets_conso.every((t) => t.used) && b.unite_fort.used).length;

    const byHour = new Map<string, number>();
    parts.forEach((p) => p.tickets_conso.filter((t) => t.used && t.usedAt).forEach((t) => {
      const h = new Date(t.usedAt!).getHours();
      byHour.set(`${h}h`, (byHour.get(`${h}h`) || 0) + 1);
    }));

    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Soirées & Conso live</h1>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Kpi label="Tickets distribués" value={ticketsTotal} />
          <Kpi label="Tickets utilisés" value={ticketsUsed} color="text-electric" />
          <Kpi label="Tickets restants" value={ticketsTotal - ticketsUsed} color="text-success" />
          <Kpi label="Unités fort utilisées" value={fortUsed} color="text-warning" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <h2 className="display mb-3 text-lg">Consommation par heure</h2>
            {[...byHour.entries()].length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune consommation enregistrée.</p>
            ) : (
              <ul className="space-y-1">
                {[...byHour.entries()].sort().map(([h, n]) => (
                  <li key={h} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-electric">{h}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-card">
                      <div className="h-full gradient-electric" style={{ width: `${(n / ticketsUsed) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="glass rounded-2xl p-5">
            <h2 className="display mb-3 text-lg">Alertes conso</h2>
            <p className="text-sm text-muted-foreground mb-2">{allConsumed} participants ont tout consommé.</p>
            <ul className="space-y-1 text-xs">
              {parts.filter((b) => b.tickets_conso.every((t) => t.used)).slice(0, 8).map((b) => (
                <li key={b.id} className="rounded bg-card/40 px-3 py-2 flex justify-between">
                  <span>{b.prenom} {b.nom}</span><span className="text-warning">tout consommé</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  },
});

function Kpi({ label, value, color = "" }: any) {
  return <div className="glass rounded-xl p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className={`display text-3xl mt-1 ${color || "text-foreground"}`}>{value}</div></div>;
}

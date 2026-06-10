import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/live/logements")({
  component: () => {
    const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
    const map = new Map<string, typeof parts>();
    parts.forEach((p) => {
      const k = p.bungalow ?? "—";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    });
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Logements live</h1>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...map.entries()].sort().map(([bung, occupants]) => {
            const checkedIn = occupants.filter((o) => o.checkin.logement).length;
            return (
              <div key={bung} className="glass rounded-2xl p-4">
                <div className="display text-xl">{bung}</div>
                <div className="text-xs text-muted-foreground">{checkedIn}/{occupants.length} check-in</div>
                <ul className="mt-2 space-y-1 text-xs">
                  {occupants.map((o) => (
                    <li key={o.id} className="flex justify-between"><span>{o.prenom} {o.nom}</span><span>{o.checkin.logement ? "🟢" : "⚪"}</span></li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});

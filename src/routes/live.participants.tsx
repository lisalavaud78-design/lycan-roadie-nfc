import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { useState } from "react";

export const Route = createFileRoute("/live/participants")({
  component: () => {
    const [q, setQ] = useState("");
    const bracelets = useWei((s) => s.bracelets);
    const filtered = bracelets.filter((b) => `${b.prenom} ${b.nom} ${b.id}`.toLowerCase().includes(q.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="display text-3xl">Participants live</h1>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Recherche…" className="rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        </div>
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase text-muted-foreground"><tr>
              <th className="p-3 text-left">ID</th><th className="p-3 text-left">Nom</th><th className="p-3 text-left">Check-in</th>
              <th className="p-3 text-left">Bus</th><th className="p-3 text-left">Conso</th><th className="p-3"></th>
            </tr></thead>
            <tbody>{filtered.slice(0, 100).map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs text-electric">{b.id}</td>
                <td className="p-3">{b.prenom} {b.nom}</td>
                <td className="p-3 text-xs">{b.checkin.general ? "🟢" : "⚪"} gén · {b.checkin.bus ? "🟢" : "⚪"} bus · {b.checkin.logement ? "🟢" : "⚪"} log</td>
                <td className="p-3 text-muted-foreground">{b.bus ?? "—"}</td>
                <td className="p-3 text-xs">{b.tickets_conso.filter(t => t.used).length}/{b.tickets_conso.length} · fort {b.unite_fort.used ? "✓" : "—"}</td>
                <td className="p-3"><Link to="/w/$braceletId" params={{ braceletId: b.id }} className="text-electric text-xs hover:underline">Voir</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  },
});

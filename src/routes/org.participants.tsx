import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/org/participants")({
  component: Participants,
});

function Participants() {
  const bracelets = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
  const [q, setQ] = useState("");
  const filtered = bracelets.filter((b) => `${b.prenom} ${b.nom} ${b.id} ${b.bus} ${b.bungalow}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl">Participants ({bracelets.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm" />
        </div>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Nom</th><th className="p-3 text-left">École</th><th className="p-3 text-left">Bus</th><th className="p-3 text-left">Bungalow</th><th className="p-3 text-left">Équipe</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, 150).map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-card/40">
                <td className="p-3 font-mono text-xs text-electric">{b.id}</td>
                <td className="p-3">{b.prenom} {b.nom}</td>
                <td className="p-3 text-muted-foreground">{b.ecole}</td>
                <td className="p-3">Bus {b.bus}</td>
                <td className="p-3">{b.bungalow}</td>
                <td className="p-3 text-muted-foreground">{b.equipe}</td>
                <td className="p-3"><Link to="/w/$braceletId" params={{ braceletId: b.id }} className="text-electric hover:underline text-xs">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

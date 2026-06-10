import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/org/staff")({
  component: Staff,
});

function Staff() {
  const staff = useWei((s) => s.bracelets.filter((b) => b.role !== "participant"));
  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Staff ({staff.length})</h1>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Nom</th><th className="p-3 text-left">Rôle</th><th className="p-3 text-left">Accès</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {staff.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-card/40">
                <td className="p-3 font-mono text-xs text-electric">{b.id}</td>
                <td className="p-3">{b.prenom} {b.nom}</td>
                <td className="p-3"><span className="rounded-full bg-lycan/20 px-2 py-0.5 text-xs text-lycan">{b.role}</span></td>
                <td className="p-3 text-xs text-muted-foreground">{b.acces.join(", ")}</td>
                <td className="p-3"><Link to="/w/$braceletId" params={{ braceletId: b.id }} className="text-electric hover:underline text-xs">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

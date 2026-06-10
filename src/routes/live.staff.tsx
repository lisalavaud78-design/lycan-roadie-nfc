import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/live/staff")({
  component: () => {
    const staff = useWei((s) => s.bracelets.filter((b) => b.role !== "participant"));
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Staff live</h1>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{s.prenom} {s.nom}</div>
                <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">en poste</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.role}</div>
              <div className="text-xs text-muted-foreground mt-2">Bracelet : <span className="font-mono text-electric">{s.id}</span></div>
              <div className="text-xs text-muted-foreground">Accès : {s.acces.join(", ")}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

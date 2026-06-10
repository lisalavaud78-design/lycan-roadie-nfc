import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { toast } from "sonner";

export const Route = createFileRoute("/live/securite")({
  component: () => {
    const alerts = useWei((s) => s.alerts);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="display text-3xl">Sécurité live</h1>
          <div className="text-sm text-muted-foreground">{alerts.filter(a => a.statut !== "cloturee").length} alertes ouvertes</div>
        </div>
        {alerts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="display text-2xl text-success">Aucune alerte</div>
            <p className="text-sm text-muted-foreground mt-2">Le WEI se déroule sereinement.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className={`glass rounded-xl p-4 border-l-4 ${a.priorite === "haute" ? "border-danger" : a.priorite === "moyenne" ? "border-warning" : "border-muted"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span className="rounded bg-danger/20 text-danger px-2 py-0.5 text-xs">{a.type.toUpperCase()}</span>
                      <span>{a.prenom}</span>
                      <span className="text-xs text-muted-foreground font-mono">{a.braceletId}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{a.notes} · {a.lieu} · {new Date(a.ts).toLocaleString("fr")}</div>
                  </div>
                  <div className="flex gap-2">
                    {a.statut !== "cloturee" && (
                      <>
                        {a.statut === "ouverte" && (
                          <button onClick={() => actions.updateAlert(a.id, { statut: "en_cours" })} className="rounded bg-warning/20 text-warning px-3 py-1 text-xs">Prendre en charge</button>
                        )}
                        <button onClick={() => { actions.updateAlert(a.id, { statut: "cloturee" }); toast.success("Alerte clôturée"); }} className="rounded bg-success/20 text-success px-3 py-1 text-xs">Clôturer</button>
                      </>
                    )}
                    {a.statut === "cloturee" && <span className="rounded bg-success/20 text-success px-3 py-1 text-xs">Clôturée</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});

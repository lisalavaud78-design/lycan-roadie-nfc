import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei, actions, type Alert } from "@/lib/wei-store";
import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/alertes")({
  component: Alertes,
});

const TYPES: Alert["type"][] = ["SOS", "malaise", "blessure", "piqure", "harcelement", "perdu", "alcool", "bagarre", "terrain", "logement", "transport"];

function Alertes() {
  const alerts = useWei((s) => s.alerts);
  const bracelets = useWei((s) => s.bracelets);
  const [filter, setFilter] = useState<"all" | Alert["statut"]>("all");
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.statut === filter);

  function createDemo() {
    const b = bracelets[Math.floor(Math.random() * bracelets.length)];
    const t = TYPES[Math.floor(Math.random() * TYPES.length)];
    actions.addAlert({ type: t, braceletId: b.id, prenom: b.prenom, lieu: "Camping zone", priorite: "moyenne", notes: `Alerte ${t} simulée` });
    toast.success(`Alerte ${t} créée`);
  }

  function exportCsv() {
    const rows = [["id", "type", "braceletId", "prenom", "lieu", "priorite", "statut", "notes", "ts"], ...alerts.map((a) => [a.id, a.type, a.braceletId, a.prenom, a.lieu, a.priorite, a.statut, a.notes, a.ts])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "alertes.csv"; a.click();
    toast.success("Alertes exportées");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="display text-3xl">Alertes & incidents</h1>
          <p className="text-sm text-muted-foreground">{alerts.filter((a) => a.statut !== "cloturee").length} ouvertes · {alerts.filter((a) => a.statut === "cloturee").length} clôturées</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-electric">Export CSV</button>
          <button onClick={createDemo} className="flex items-center gap-2 rounded-lg gradient-electric px-3 py-2 text-sm font-semibold text-black">
            <Plus className="h-4 w-4" /> Simuler alerte
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "ouverte", "en_cours", "cloturee"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ${filter === f ? "bg-electric text-black" : "bg-card border border-border"}`}>
            {f === "all" ? "Toutes" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-success" />
          <div className="display text-2xl mt-2 text-success">Aucune alerte</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.id} className={`glass rounded-xl p-4 border-l-4 ${a.priorite === "haute" ? "border-danger" : a.priorite === "moyenne" ? "border-warning" : "border-muted"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-danger/20 text-danger px-2 py-0.5 text-xs">{a.type.toUpperCase()}</span>
                    <Link to="/w/$braceletId" params={{ braceletId: a.braceletId }} className="hover:text-electric">{a.prenom}</Link>
                    <span className="text-xs text-muted-foreground font-mono">{a.braceletId}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${a.priorite === "haute" ? "bg-danger/20 text-danger" : a.priorite === "moyenne" ? "bg-warning/20 text-warning" : "bg-muted/20"}`}>{a.priorite}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{a.notes} · {a.lieu} · {new Date(a.ts).toLocaleString("fr")}</div>
                  {a.staffAssigne && <div className="text-xs text-electric mt-1">Staff : {a.staffAssigne}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {a.statut !== "cloturee" && (
                    <>
                      {a.statut === "ouverte" && (
                        <button onClick={() => { actions.updateAlert(a.id, { statut: "en_cours", staffAssigne: "Staff-" + Math.floor(Math.random() * 10) }); toast.success("Prise en charge"); }} className="rounded bg-warning/20 text-warning px-3 py-1 text-xs">Prendre en charge</button>
                      )}
                      <button onClick={() => { actions.updateAlert(a.id, { statut: "cloturee" }); toast.success("Clôturée"); }} className="rounded bg-success/20 text-success px-3 py-1 text-xs">Clôturer</button>
                    </>
                  )}
                  {a.statut === "cloturee" && <span className="rounded bg-success/20 text-success px-3 py-1 text-xs">Clôturée</span>}
                  <button onClick={() => { actions.deleteAlert(a.id); toast("Supprimée"); }} className="rounded border border-border px-3 py-1 text-xs">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

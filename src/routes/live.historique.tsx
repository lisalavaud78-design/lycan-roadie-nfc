import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

export const Route = createFileRoute("/live/historique")({
  component: Historique,
});

function Historique() {
  const scans = useWei((s) => s.scans);
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");
  const filtered = scans.filter((s) =>
    (type === "all" || s.type === type) &&
    (q === "" || s.braceletId.toLowerCase().includes(q.toLowerCase()) || s.prenom.toLowerCase().includes(q.toLowerCase()))
  );
  const types = ["all", ...Array.from(new Set(scans.map((s) => s.type)))];

  function exportCsv() {
    const rows = [["ts", "type", "braceletId", "prenom", "lieu", "ok", "detail"], ...filtered.map((s) => [s.ts, s.type, s.braceletId, s.prenom, s.lieu, s.ok ? "OK" : "ECHEC", s.detail])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "historique-scans.csv"; a.click();
    toast.success("Historique exporté");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="display text-3xl">Historique des scans</h1>
          <p className="text-sm text-muted-foreground">{scans.length} scans enregistrés · {scans.filter((s) => !s.ok).length} échecs</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-electric">
          <Download className="h-4 w-4" /> CSV
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher bracelet / prénom"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        {types.map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-xs ${type === t ? "bg-electric text-black" : "bg-card border border-border"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-xs uppercase text-muted-foreground">
            <tr><th className="p-3 text-left">Heure</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Bracelet</th><th className="p-3 text-left">Personne</th><th className="p-3 text-left">Lieu</th><th className="p-3 text-left">Détail</th><th className="p-3 text-left">Statut</th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-card/40">
                <td className="p-3 text-xs text-muted-foreground">{new Date(s.ts).toLocaleTimeString("fr")}</td>
                <td className="p-3"><span className="rounded-full bg-electric/15 text-electric px-2 py-0.5 text-xs">{s.type}</span></td>
                <td className="p-3 font-mono text-xs"><Link to="/w/$braceletId" params={{ braceletId: s.braceletId }} className="text-electric hover:underline">{s.braceletId}</Link></td>
                <td className="p-3">{s.prenom}</td>
                <td className="p-3 text-muted-foreground">{s.lieu}</td>
                <td className="p-3 text-xs">{s.detail}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${s.ok ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>{s.ok ? "OK" : "ÉCHEC"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucun scan correspondant.</div>}
      </div>
    </div>
  );
}

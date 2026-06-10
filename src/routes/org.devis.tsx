import { createFileRoute } from "@tanstack/react-router";
import { useWei, computeQuote, MODULE_LABELS, PRICES, actions } from "@/lib/wei-store";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/devis")({
  component: Devis,
});

function Devis() {
  const state = useWei((s) => s);
  const q = computeQuote(state);

  function exportDevis() {
    const lines = [
      "DEVIS LYCAN WEI NFC 2025",
      "Highway to WEI — Camping Ty Nadan, 5-8 sept. 2025",
      "",
      `Participants : ${state.config.nbParticipants}`,
      `Staff : ${state.config.nbStaff}`,
      "",
      "MODULES NFC ACTIVÉS",
      ...q.activeModules.map((m) => `  • ${MODULE_LABELS[m]} — ${PRICES[m]} €/pers`),
      "",
      `Total modules par participant : ${q.moduleTotal} €`,
      `Total HT : ${q.totalHT.toFixed(2)} €`,
      `TVA 20% : ${q.tva.toFixed(2)} €`,
      `Total TTC : ${q.totalTTC.toFixed(2)} €`,
      "",
      `Coût matière estimé : ${q.matiere.toFixed(2)} €`,
      `  Tissu : ${q.tissuCost.toFixed(2)} €`,
      `  Puces NFC : ${q.chipCost.toFixed(2)} €`,
      `  Impression 3D : ${q.impressionCost.toFixed(2)} €`,
      `Marge estimée : ${q.marge.toFixed(2)} €`,
      `Coût moyen par participant : ${q.coutMoyen.toFixed(2)} €`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "devis-lycan-wei.txt"; a.click();
    toast.success("Devis exporté");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl">Devis automatique</h1>
          <p className="text-sm text-muted-foreground">Recalculé en temps réel selon les modules NFC actifs</p>
        </div>
        <button onClick={exportDevis} className="flex items-center gap-2 rounded-lg gradient-electric px-4 py-2 font-semibold text-black hover:opacity-90">
          <Download className="h-4 w-4" /> Exporter
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Total TTC" value={`${q.totalTTC.toFixed(0)} €`} highlight />
        <Kpi label="Coût matière" value={`${q.matiere.toFixed(0)} €`} />
        <Kpi label="Marge estimée" value={`${q.marge.toFixed(0)} €`} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="display mb-4 text-xl flex items-center gap-2"><FileText className="h-5 w-5 text-electric" /> Détail modules</h2>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left pb-2">Module</th><th className="text-right pb-2">Prix/pers</th><th className="text-right pb-2">Actif</th></tr>
          </thead>
          <tbody>
            {(Object.keys(MODULE_LABELS) as (keyof typeof MODULE_LABELS)[]).map((k) => (
              <tr key={k} className="border-t border-border">
                <td className="py-2">{MODULE_LABELS[k]}</td>
                <td className="py-2 text-right">{PRICES[k]} €</td>
                <td className="py-2 text-right">
                  <input type="checkbox" checked={state.modules[k]} onChange={(e) => actions.setModule(k, e.target.checked)} className="h-4 w-4 accent-electric" />
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-electric/40">
              <td className="py-3 font-semibold">Total par participant</td>
              <td className="py-3 text-right display text-electric">{q.moduleTotal} €</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="display mb-3 text-lg">Synthèse financière</h3>
          <Line k={`Participants (${state.config.nbParticipants})`} v={`${state.config.nbParticipants} × ${q.moduleTotal} €`} />
          <Line k="Total HT" v={`${q.totalHT.toFixed(2)} €`} />
          <Line k="TVA 20%" v={`${q.tva.toFixed(2)} €`} />
          <Line k="Total TTC" v={`${q.totalTTC.toFixed(2)} €`} highlight />
          <Line k="Coût moyen / pers." v={`${q.coutMoyen.toFixed(2)} €`} />
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="display mb-3 text-lg">Coûts matière ({q.totalBracelets} bracelets)</h3>
          <Line k="Tissu (0,89 €/u)" v={`${q.tissuCost.toFixed(2)} €`} />
          <Line k="Puces NFC" v={`${q.chipCost.toFixed(2)} €`} />
          <Line k="Impression 3D (0,18 €/u)" v={`${q.impressionCost.toFixed(2)} €`} />
          <Line k="Total matière" v={`${q.matiere.toFixed(2)} €`} highlight />
          <Line k="Marge brute" v={`${q.marge.toFixed(2)} €`} />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "gradient-electric text-black" : "glass"}`}>
      <div className={`text-xs uppercase tracking-widest ${highlight ? "text-black/70" : "text-muted-foreground"}`}>{label}</div>
      <div className="display mt-1 text-4xl">{value}</div>
    </div>
  );
}
function Line({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-border py-2 last:border-0 ${highlight ? "text-electric font-semibold" : ""}`}>
      <span className={highlight ? "" : "text-muted-foreground"}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

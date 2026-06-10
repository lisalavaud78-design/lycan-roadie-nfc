import { createFileRoute } from "@tanstack/react-router";
import { useWei, computeQuote, MODULE_LABELS, MODULE_CATEGORIES, PRICES, actions, type ModulesConfig } from "@/lib/wei-store";
import { Download, FileText, Info } from "lucide-react";
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
      `Total bracelets : ${q.totalBracelets}`,
      "",
      "OPTIONS FONCTIONNELLES (coût fixe par événement)",
      ...q.activeModules.map((m) => `  • ${MODULE_LABELS[m]} — ${PRICES[m]} € (fixe)`),
      `  Total options fixes : ${q.optionsFixes.toFixed(2)} €`,
      "",
      "COÛTS VARIABLES (par bracelet)",
      `  Tissu (${q.tissuUnit} €/u × ${q.totalBracelets}) : ${q.tissuCost.toFixed(2)} €`,
      `  Puce NFC (${q.chipUnit} €/u × ${q.totalBracelets}) : ${q.chipCost.toFixed(2)} €`,
      `  Impression 3D (${q.impressionUnit} €/u × ${q.totalBracelets}) : ${q.impressionCost.toFixed(2)} €`,
      `  Total matière : ${q.matiere.toFixed(2)} €`,
      "",
      `TOTAL HT : ${q.totalHT.toFixed(2)} €`,
      `TVA 20% : ${q.tva.toFixed(2)} €`,
      `TOTAL TTC : ${q.totalTTC.toFixed(2)} €`,
      "",
      `Coût par participant : ${q.coutParParticipant.toFixed(2)} €`,
      `Coût par bracelet : ${q.coutParBracelet.toFixed(2)} €`,
      `Marge estimée : ${q.marge.toFixed(2)} €`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "devis-lycan-wei.txt"; a.click();
    toast.success("Devis exporté");
  }

  function exportCsv() {
    const rows = [
      ["Catégorie", "Libellé", "Type de coût", "Prix unitaire €", "Quantité appliquée", "Total €"],
      ...q.activeModules.map((m) => ["Option fixe", MODULE_LABELS[m], "Fixe (par événement)", PRICES[m], 1, PRICES[m]]),
      ["Matière", "Tissu bracelet", "Par bracelet", q.tissuUnit, q.totalBracelets, q.tissuCost.toFixed(2)],
      ["Matière", "Puce NFC", "Par bracelet", q.chipUnit, q.totalBracelets, q.chipCost.toFixed(2)],
      ["Matière", "Impression 3D", "Par bracelet", q.impressionUnit, q.totalBracelets, q.impressionCost.toFixed(2)],
      ["Total", "Total HT", "—", "", "", q.totalHT.toFixed(2)],
      ["Total", "TVA 20%", "—", "", "", q.tva.toFixed(2)],
      ["Total", "Total TTC", "—", "", "", q.totalTTC.toFixed(2)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "devis-lycan-wei.csv"; a.click();
    toast.success("CSV devis exporté");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="display text-3xl">Devis automatique</h1>
          <p className="text-sm text-muted-foreground">Recalculé en temps réel — modules NFC à coût fixe + matière par bracelet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 hover:border-electric">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={exportDevis} className="flex items-center gap-2 rounded-lg gradient-electric px-4 py-2 font-semibold text-black hover:opacity-90">
            <Download className="h-4 w-4" /> Devis .txt
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-electric/30 bg-electric/5 p-4 text-sm flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-electric mt-0.5" />
        <p>
          Les <strong>options fonctionnelles</strong> sont facturées <strong>une seule fois par événement</strong>. Elles ne sont pas multipliées par le nombre de bracelets.
          Le <strong>coût par participant</strong> est seulement un indicateur de répartition.
          Seuls le tissu, la puce NFC et l'impression 3D sont des coûts <strong>par bracelet</strong>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Options fixes" value={`${q.optionsFixes.toFixed(0)} €`} sub={`${q.activeModules.length} activées`} />
        <Kpi label="Matière (×${q.totalBracelets})" value={`${q.matiere.toFixed(0)} €`} sub={`${q.totalBracelets} bracelets`} />
        <Kpi label="Total TTC" value={`${q.totalTTC.toFixed(0)} €`} highlight />
        <Kpi label="Marge estimée" value={`${q.marge.toFixed(0)} €`} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="display mb-4 text-xl flex items-center gap-2"><FileText className="h-5 w-5 text-electric" /> Détail du devis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left pb-2">Module / poste</th>
                <th className="text-left pb-2">Type de coût</th>
                <th className="text-right pb-2">Prix unitaire</th>
                <th className="text-right pb-2">Quantité appliquée</th>
                <th className="text-right pb-2">Total</th>
                <th className="pb-2 text-right">Actif</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(MODULE_LABELS) as (keyof ModulesConfig)[]).map((k) => {
                const on = state.modules[k];
                return (
                  <tr key={k} className={`border-b border-border/50 ${on ? "" : "opacity-50"}`}>
                    <td className="py-2">{MODULE_LABELS[k]}</td>
                    <td className="py-2 text-xs text-muted-foreground">Fixe (par événement)</td>
                    <td className="py-2 text-right">{PRICES[k]} €</td>
                    <td className="py-2 text-right">{on ? 1 : 0}</td>
                    <td className="py-2 text-right font-semibold">{on ? `${PRICES[k]} €` : "—"}</td>
                    <td className="py-2 text-right">
                      <input type="checkbox" checked={on} onChange={(e) => actions.setModule(k, e.target.checked)} className="h-4 w-4 accent-electric" />
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-electric/40 bg-electric/5">
                <td className="py-2 font-semibold">Sous-total options fixes</td>
                <td className="py-2 text-xs text-muted-foreground">Fixe</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">{q.activeModules.length}</td>
                <td className="py-2 text-right display text-electric">{q.optionsFixes.toFixed(2)} €</td>
                <td></td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-2">Tissu bracelet</td>
                <td className="py-2 text-xs text-muted-foreground">Par bracelet</td>
                <td className="py-2 text-right">{q.tissuUnit} €</td>
                <td className="py-2 text-right">{q.totalBracelets}</td>
                <td className="py-2 text-right font-semibold">{q.tissuCost.toFixed(2)} €</td>
                <td></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2">Puce NFC</td>
                <td className="py-2 text-xs text-muted-foreground">Par bracelet</td>
                <td className="py-2 text-right">{q.chipUnit} €</td>
                <td className="py-2 text-right">{q.totalBracelets}</td>
                <td className="py-2 text-right font-semibold">{q.chipCost.toFixed(2)} €</td>
                <td></td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2">Impression 3D</td>
                <td className="py-2 text-xs text-muted-foreground">Par bracelet</td>
                <td className="py-2 text-right">{q.impressionUnit} €</td>
                <td className="py-2 text-right">{q.totalBracelets}</td>
                <td className="py-2 text-right font-semibold">{q.impressionCost.toFixed(2)} €</td>
                <td></td>
              </tr>
              <tr className="border-t-2 border-electric/40 bg-electric/5">
                <td className="py-2 font-semibold">Sous-total matière</td>
                <td className="py-2 text-xs text-muted-foreground">Par bracelet</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">{q.totalBracelets}</td>
                <td className="py-2 text-right display text-electric">{q.matiere.toFixed(2)} €</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="display mb-3 text-lg">Synthèse financière</h3>
          <Line k="Total options fixes" v={`${q.optionsFixes.toFixed(2)} €`} />
          <Line k="Total matière" v={`${q.matiere.toFixed(2)} €`} />
          <Line k="Total HT" v={`${q.totalHT.toFixed(2)} €`} />
          <Line k="TVA 20%" v={`${q.tva.toFixed(2)} €`} />
          <Line k="Total TTC" v={`${q.totalTTC.toFixed(2)} €`} highlight />
          <Line k="Marge estimée" v={`${q.marge.toFixed(2)} €`} />
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="display mb-3 text-lg">Indicateurs de répartition</h3>
          <Line k={`Coût par participant (${state.config.nbParticipants})`} v={`${q.coutParParticipant.toFixed(2)} €`} />
          <Line k={`Coût par bracelet (${q.totalBracelets})`} v={`${q.coutParBracelet.toFixed(2)} €`} />
          <Line k="Coût matière par bracelet" v={`${(q.matiere / Math.max(q.totalBracelets, 1)).toFixed(2)} €`} />
          <Line k="Marge brute / bracelet" v={`${(q.marge / Math.max(q.totalBracelets, 1)).toFixed(2)} €`} />
          <p className="mt-3 text-xs text-muted-foreground">Indicateurs informatifs uniquement — les options ne sont pas refacturées par bracelet.</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="display mb-3 text-lg">Modules par catégorie</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(MODULE_CATEGORIES).map(([cat, keys]) => (
            <div key={cat}>
              <div className="text-xs uppercase tracking-widest text-electric mb-2">{cat}</div>
              <ul className="space-y-1">
                {keys.map((k) => (
                  <li key={k} className="flex items-center justify-between gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={state.modules[k]} onChange={(e) => actions.setModule(k, e.target.checked)} className="h-3 w-3 accent-electric" />
                      <span>{MODULE_LABELS[k]}</span>
                    </label>
                    <span className="text-muted-foreground">{PRICES[k]} €</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "gradient-electric text-black" : "glass"}`}>
      <div className={`text-xs uppercase tracking-widest ${highlight ? "text-black/70" : "text-muted-foreground"}`}>{label}</div>
      <div className="display mt-1 text-3xl">{value}</div>
      {sub && <div className={`text-xs mt-1 ${highlight ? "text-black/60" : "text-muted-foreground"}`}>{sub}</div>}
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

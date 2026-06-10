import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei, actions, type Role } from "@/lib/wei-store";
import { Download, Plus, ExternalLink, Radio } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/org/bracelets")({
  component: Bracelets,
});

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: "participant", label: "Participant WEI", color: "bg-electric/20 text-electric" },
  { value: "staff_bde", label: "Staff BDE", color: "bg-lycan/20 text-lycan" },
  { value: "staff_bda", label: "Staff BDA", color: "bg-purple-500/20 text-purple-300" },
  { value: "staff_asint", label: "Staff ASINT", color: "bg-orange-500/20 text-orange-300" },
  { value: "securite", label: "Sécurité", color: "bg-red-500/20 text-red-300" },
  { value: "paps", label: "Secouriste / PAPS", color: "bg-green-500/20 text-green-300" },
  { value: "funbreak", label: "Funbreak", color: "bg-pink-500/20 text-pink-300" },
  { value: "vip", label: "VIP / invité", color: "bg-yellow-500/20 text-yellow-300" },
  { value: "prestataire", label: "Prestataire", color: "bg-gray-500/20 text-gray-300" },
];

function Bracelets() {
  const bracelets = useWei((s) => s.bracelets);
  const [selectedRole, setSelectedRole] = useState<Role>("participant");
  const [qty, setQty] = useState(10);
  const [filter, setFilter] = useState<Role | "all">("all");

  const filtered = filter === "all" ? bracelets : bracelets.filter((b) => b.role === filter);

  function generate() {
    actions.generateBracelets(selectedRole, qty);
    toast.success(`${qty} bracelets ${selectedRole} générés`);
  }

  function exportCSV() {
    const rows = [
      ["index", "bracelet_id", "url", "prenom", "nom", "role", "ecole", "bus", "bungalow", "equipe", "tickets_conso", "unite_fort", "acces", "statut"],
      ...bracelets.map((b, i) => [
        i + 1, b.id, b.url, b.prenom, b.nom, b.role, b.ecole, b.bus ?? "", b.bungalow ?? "", b.equipe ?? "",
        b.tickets_conso.length, b.unite_fort.used ? "used" : "1", b.acces.join("|"), b.statut,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bracelets-lycan.csv"; a.click();
    toast.success("CSV exporté");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-3xl">Génération bracelets NFC</h1>
          <p className="text-sm text-muted-foreground">{bracelets.length} bracelets dans le système</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 hover:border-electric">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="text-xs uppercase tracking-widest text-electric mb-2">Important</div>
        <p className="text-sm">La puce NFC contient <strong>uniquement</strong> l'URL. Les données sensibles restent dans l'application.</p>
        <code className="mt-2 block rounded bg-background px-3 py-2 text-xs text-electric">https://lycan-wei-nfc.app/w/NFC-XXXXXX</code>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="display mb-3 text-lg">Générer de nouveaux bracelets</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)} className="block rounded-md border border-border bg-background px-3 py-2 text-sm">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Quantité</label>
            <input type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} className="block w-24 rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <button onClick={generate} className="flex items-center gap-2 rounded-md gradient-electric px-4 py-2 font-semibold text-black">
            <Plus className="h-4 w-4" /> Générer
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1 text-xs ${filter === "all" ? "bg-electric text-black" : "bg-card border border-border"}`}>
          Tous ({bracelets.length})
        </button>
        {ROLES.map((r) => {
          const n = bracelets.filter((b) => b.role === r.value).length;
          if (!n) return null;
          return (
            <button key={r.value} onClick={() => setFilter(r.value)}
              className={`rounded-full px-3 py-1 text-xs ${filter === r.value ? "bg-electric text-black" : "bg-card border border-border"}`}>
              {r.label} ({n})
            </button>
          );
        })}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">École</th>
              <th className="p-3 text-left">Bus</th>
              <th className="p-3 text-left">Bungalow</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((b) => {
              const r = ROLES.find((x) => x.value === b.role)!;
              return (
                <tr key={b.id} className="border-t border-border hover:bg-card/40">
                  <td className="p-3 font-mono text-xs text-electric">{b.id}</td>
                  <td className="p-3">{b.prenom} {b.nom}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${r.color}`}>{r.label}</span></td>
                  <td className="p-3 text-muted-foreground">{b.ecole}</td>
                  <td className="p-3 text-muted-foreground">{b.bus ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{b.bungalow ?? "—"}</td>
                  <td className="p-3"><span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">{b.statut}</span></td>
                  <td className="p-3">
                    <Link to="/w/$braceletId" params={{ braceletId: b.id }} className="inline-flex items-center gap-1 text-electric hover:underline text-xs">
                      <Radio className="h-3 w-3" /> Ouvrir <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 100 && <div className="p-3 text-center text-xs text-muted-foreground">+ {filtered.length - 100} autres bracelets…</div>}
      </div>
    </div>
  );
}

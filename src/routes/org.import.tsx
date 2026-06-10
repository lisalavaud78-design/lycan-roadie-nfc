import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/import")({
  component: ImportCSV,
});

function ImportCSV() {
  const [rows, setRows] = useState<string[][]>([]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const lines = String(r.result).split(/\r?\n/).filter(Boolean);
      setRows(lines.map((l) => l.split(",")));
      toast.success(`${lines.length} lignes lues`);
    };
    r.readAsText(f);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Import CSV</h1>
        <p className="text-sm text-muted-foreground">Importe une liste de participants existante</p>
      </div>
      <label className="glass flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-electric/40 p-12 hover:border-electric">
        <Upload className="h-10 w-10 text-electric" />
        <div className="display text-lg">Glisser un fichier CSV</div>
        <div className="text-xs text-muted-foreground">prenom, nom, ecole, email…</div>
        <input type="file" accept=".csv" onChange={onFile} className="hidden" />
      </label>
      {rows.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-border p-3 text-sm">{rows.length} lignes — Aperçu</div>
          <table className="w-full text-xs">
            <tbody>
              {rows.slice(0, 20).map((r, i) => (
                <tr key={i} className="border-t border-border"><td className="p-2 text-muted-foreground">{i + 1}</td>{r.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei, actions, type Role } from "@/lib/wei-store";
import { useState } from "react";
import { Radio, Scan, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<Role, string> = {
  participant: "Participant WEI",
  staff_bde: "Staff BDE",
  staff_bda: "Staff BDA",
  staff_asint: "Staff ASINT",
  securite: "Sécurité",
  paps: "Secouriste / PAPS",
  funbreak: "Funbreak",
  vip: "VIP / invité",
  prestataire: "Prestataire",
  bar: "Bar",
};

export const Route = createFileRoute("/org/scan")({
  component: ScanDemo,
});

function ScanDemo() {
  const bracelets = useWei((s) => s.bracelets);
  const scans = useWei((s) => s.scans.slice(0, 10));
  const [scanned, setScanned] = useState<string | null>(null);
  const [lieu, setLieu] = useState("Bar central");

  const b = scanned ? bracelets.find((x) => x.id === scanned) : null;

  function simulateRandom() {
    if (!bracelets.length) return;
    const random = bracelets[Math.floor(Math.random() * bracelets.length)];
    setScanned(random.id);
    actions.scanEntree(random.id, lieu);
    toast.success(`Scan : ${random.prenom} ${random.nom}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Démo scan NFC</h1>
        <p className="text-sm text-muted-foreground">Simule un passage de bracelet sur un lecteur NFC</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="display mb-4 text-lg flex items-center gap-2"><Scan className="h-5 w-5 text-electric" /> Lecteur</h2>

          <div className="rounded-xl border-2 border-dashed border-electric/40 bg-electric/5 p-8 text-center">
            <Radio className="mx-auto h-16 w-16 text-electric animate-pulse" />
            <p className="mt-3 text-sm text-muted-foreground">Approche un bracelet du lecteur</p>
          </div>

          <div className="mt-4 space-y-2">
            <select value={lieu} onChange={(e) => setLieu(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              {["Bar central", "Bar techno", "Entrée soirée", "Cantine", "Activités", "Bus"].map((l) => <option key={l}>{l}</option>)}
            </select>
            <button onClick={simulateRandom} className="w-full rounded-lg gradient-electric py-3 font-semibold text-black">
              Simuler scan aléatoire
            </button>
            <div className="text-xs text-muted-foreground">ou choisis un bracelet :</div>
            <div className="flex flex-wrap gap-1">
              {bracelets.slice(0, 12).map((bb) => (
                <button key={bb.id} onClick={() => { setScanned(bb.id); actions.scanEntree(bb.id, lieu); }}
                  className="rounded border border-border bg-card px-2 py-1 text-[10px] font-mono hover:border-electric">{bb.id}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="display mb-4 text-lg">Résultat</h2>
          {!b ? (
            <p className="text-sm text-muted-foreground">Aucun bracelet scanné.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <div className="display text-2xl">{b.prenom} {b.nom}</div>
                  <div className="text-xs text-muted-foreground font-mono">{b.id}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Info k="Rôle" v={ROLE_LABELS[b.role] ?? b.role} />
                <Info k="École" v={b.ecole} />
                <Info k="Bus" v={b.bus ?? "—"} />
                <Info k="Bungalow" v={b.bungalow ?? "—"} />
                <Info k="Tickets restants" v={`${b.tickets_conso.filter((t) => !t.used).length}/${b.tickets_conso.length}`} />
                <Info k="Unité fort" v={b.unite_fort.used ? "utilisée" : "disponible"} />
              </div>
              <Link to="/w/$braceletId" params={{ braceletId: b.id }} className="block text-center rounded-lg gradient-electric py-2 font-semibold text-black">
                Ouvrir le profil
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="display mb-3 text-lg">10 derniers scans</h2>
        {scans.length === 0 ? <p className="text-sm text-muted-foreground">Aucun scan.</p> : (
          <ul className="space-y-1">
            {scans.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-xs rounded bg-card/40 px-3 py-2">
                {s.ok ? <CheckCircle2 className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-danger" />}
                <span className="text-muted-foreground w-16">{new Date(s.ts).toLocaleTimeString("fr")}</span>
                <span className="rounded bg-electric/15 text-electric px-1.5 py-0.5">{s.type}</span>
                <span className="font-mono">{s.braceletId}</span>
                <span>{s.prenom}</span>
                <span className="ml-auto text-muted-foreground">{s.lieu}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: any }) {
  return <div className="rounded bg-card/40 p-2"><div className="text-muted-foreground text-[10px] uppercase">{k}</div><div>{v}</div></div>;
}

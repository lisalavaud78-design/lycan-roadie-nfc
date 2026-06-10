import { createFileRoute, Link } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { useState, useMemo } from "react";
import { Beer, Wine, Music, Scan } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/conso")({
  component: Conso,
});

const SOIREES = [
  { jour: "Vendredi 5 sept", salle: "Salle pop/rap", horaire: "22h → 04h", staff: "BDE" },
  { jour: "Samedi 6 sept", salle: "Salle com/rap/pop", horaire: "22h → 04h", staff: "BDE" },
  { jour: "Samedi 6 sept", salle: "Salle techno", horaire: "22h → 04h", staff: "BDE" },
  { jour: "Dimanche 7 sept", salle: "Salle com/rap/pop", horaire: "22h → 04h", staff: "BDA + ASINT" },
  { jour: "Dimanche 7 sept", salle: "Salle techno", horaire: "22h → 04h", staff: "BDA + ASINT" },
  { jour: "Dimanche 7 sept", salle: "Projection INTV", horaire: "04h → 05h", staff: "ASINT" },
];

const LIEUX = ["Bar central", "Bar techno", "Bar pop/rap", "Bar plage"];

function Conso() {
  const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
  const scans = useWei((s) => s.scans);
  const [scanId, setScanId] = useState("");
  const [scanLieu, setScanLieu] = useState(LIEUX[0]);

  const ticketsTotal = parts.reduce((a, b) => a + b.tickets_conso.length, 0);
  const ticketsUsed = parts.reduce((a, b) => a + b.tickets_conso.filter((t) => t.used).length, 0);
  const fortUsed = parts.filter((b) => b.unite_fort.used).length;
  const allConsumed = parts.filter((b) => b.tickets_conso.every((t) => t.used) && b.unite_fort.used);
  const doubleScans = scans.filter((s) => s.type === "double_scan").length;

  const byHour = useMemo(() => {
    const m = new Map<number, number>();
    parts.forEach((p) => p.tickets_conso.filter((t) => t.used && t.usedAt).forEach((t) => {
      const h = new Date(t.usedAt!).getHours();
      m.set(h, (m.get(h) || 0) + 1);
    }));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [parts]);

  const byLieu = useMemo(() => {
    const m = new Map<string, number>();
    parts.forEach((p) => p.tickets_conso.filter((t) => t.used).forEach((t) => {
      const l = t.lieu || "Inconnu";
      m.set(l, (m.get(l) || 0) + 1);
    }));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [parts]);

  function simulateScanTicket() {
    const b = parts.find((p) => p.id.toLowerCase().includes(scanId.toLowerCase().replace("nfc-", "")));
    if (!b) { toast.error("Bracelet introuvable"); return; }
    const t = b.tickets_conso.find((x) => !x.used);
    if (!t) {
      actions.useTicket(b.id, "T1", scanLieu); // logs double scan
      toast.error(`${b.prenom} a déjà tout consommé — double scan détecté`);
      return;
    }
    actions.useTicket(b.id, t.id, scanLieu);
    toast.success(`Ticket ${t.id} utilisé pour ${b.prenom} à ${scanLieu}`);
  }

  function simulateScanFort() {
    const b = parts.find((p) => p.id.toLowerCase().includes(scanId.toLowerCase().replace("nfc-", "")));
    if (!b) { toast.error("Bracelet introuvable"); return; }
    if (b.unite_fort.used) {
      actions.useUniteFort(b.id, scanLieu); // logs double
      toast.error(`${b.prenom} a déjà utilisé son unité fort`);
      return;
    }
    actions.useUniteFort(b.id, scanLieu);
    toast.success(`Unité fort utilisée pour ${b.prenom} à ${scanLieu}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Soirées & tickets conso</h1>
        <p className="text-sm text-muted-foreground">Toutes les soirées 22h → 4h · projection INTV 4h → 5h dimanche</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <Kpi label="Tickets distribués" value={ticketsTotal} />
        <Kpi label="Tickets utilisés" value={ticketsUsed} color="text-electric" />
        <Kpi label="Tickets restants" value={ticketsTotal - ticketsUsed} color="text-success" />
        <Kpi label="Unités fort utilisées" value={`${fortUsed}/${parts.length}`} color="text-warning" />
        <Kpi label="Double scans bloqués" value={doubleScans} color="text-danger" />
      </div>

      {/* Soirées programmées */}
      <div className="glass rounded-2xl p-5">
        <h2 className="display mb-3 text-lg flex items-center gap-2"><Music className="h-5 w-5 text-electric" /> Programme soirées</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOIREES.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-card/40 p-3">
              <div className="text-xs uppercase text-electric">{s.jour}</div>
              <div className="font-semibold">{s.salle}</div>
              <div className="text-xs text-muted-foreground">{s.horaire} · Staff {s.staff}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulateur de scan bar */}
      <div className="glass rounded-2xl p-5">
        <h2 className="display mb-3 text-lg flex items-center gap-2"><Scan className="h-5 w-5 text-electric" /> Scan bar simulé</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto_auto]">
          <input value={scanId} onChange={(e) => setScanId(e.target.value)} placeholder="ID bracelet (ex: NFC-ABC123 ou ABC123)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={scanLieu} onChange={(e) => setScanLieu(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            {LIEUX.map((l) => <option key={l}>{l}</option>)}
          </select>
          <button onClick={simulateScanTicket} className="flex items-center gap-2 rounded-md gradient-electric px-3 py-2 text-sm font-semibold text-black">
            <Beer className="h-4 w-4" /> Ticket
          </button>
          <button onClick={simulateScanFort} className="flex items-center gap-2 rounded-md bg-lycan px-3 py-2 text-sm font-semibold text-white">
            <Wine className="h-4 w-4" /> Unité fort
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {parts.slice(0, 8).map((b) => (
            <button key={b.id} onClick={() => setScanId(b.id)} className="rounded-full border border-border bg-card/50 px-2 py-0.5 text-[10px] font-mono hover:border-electric">
              {b.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="display mb-3 text-lg">Consommation par heure</h2>
          {byHour.length === 0 ? <p className="text-sm text-muted-foreground">Aucune consommation.</p> : (
            <ul className="space-y-1">
              {byHour.map(([h, n]) => (
                <li key={h} className="flex items-center gap-2 text-sm">
                  <span className="w-12 text-electric">{h}h</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-card">
                    <div className="h-full gradient-electric" style={{ width: `${(n / Math.max(...byHour.map((x) => x[1]))) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="display mb-3 text-lg">Consommation par salle / bar</h2>
          {byLieu.length === 0 ? <p className="text-sm text-muted-foreground">Aucune consommation.</p> : (
            <ul className="space-y-1">
              {byLieu.map(([l, n]) => (
                <li key={l} className="flex items-center gap-2 text-sm">
                  <span className="w-32 truncate">{l}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-card">
                    <div className="h-full bg-lycan" style={{ width: `${(n / Math.max(...byLieu.map((x) => x[1]))) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="display mb-3 text-lg">Participants ayant tout consommé ({allConsumed.length})</h2>
        {allConsumed.length === 0 ? (
          <p className="text-sm text-muted-foreground">Personne n'a encore tout consommé.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {allConsumed.map((b) => (
              <Link key={b.id} to="/w/$braceletId" params={{ braceletId: b.id }}
                className="flex items-center justify-between rounded-lg bg-warning/10 border border-warning/30 px-3 py-2 text-sm hover:border-warning">
                <span>{b.prenom} {b.nom}</span>
                <span className="text-warning text-xs">tout consommé</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, color = "" }: any) {
  return <div className="glass rounded-xl p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className={`display text-3xl mt-1 ${color || "text-foreground"}`}>{value}</div></div>;
}

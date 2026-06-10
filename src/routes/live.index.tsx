import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";
import { Users, Bus, Home, UtensilsCrossed, Beer, Zap, AlertTriangle, Heart, Activity, Shield } from "lucide-react";

export const Route = createFileRoute("/live/")({
  component: LiveDashboard,
});

function LiveDashboard() {
  const s = useWei((x) => x);
  const parts = s.bracelets.filter((b) => b.role === "participant");
  const staff = s.bracelets.filter((b) => b.role !== "participant");
  const checkin = parts.filter((b) => b.checkin.general).length;
  const inBus = parts.filter((b) => b.checkin.bus).length;
  const inLog = parts.filter((b) => b.checkin.logement).length;
  const ticketsUsed = parts.reduce((acc, b) => acc + b.tickets_conso.filter((t) => t.used).length, 0);
  const ticketsTotal = parts.reduce((acc, b) => acc + b.tickets_conso.length, 0);
  const fortUsed = parts.filter((b) => b.unite_fort.used).length;
  const alertsOpen = s.alerts.filter((a) => a.statut !== "cloturee").length;
  const alertsClosed = s.alerts.filter((a) => a.statut === "cloturee").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl">Live Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vue temps réel — WEI Lycan 2025</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Kpi icon={<Users />} label="Check-in" value={`${checkin}/${parts.length}`} color="electric" />
        <Kpi icon={<Bus />} label="Dans les bus" value={inBus} color="lycan" />
        <Kpi icon={<Home />} label="Logements OK" value={inLog} color="success" />
        <Kpi icon={<Activity />} label="Participants" value={parts.length} />
        <Kpi icon={<Beer />} label="Tickets conso" value={`${ticketsUsed}/${ticketsTotal}`} color="electric" />
        <Kpi icon={<Zap />} label="Unités fort" value={fortUsed} color="warning" />
        <Kpi icon={<AlertTriangle />} label="Alertes ouvertes" value={alertsOpen} color="danger" />
        <Kpi icon={<Shield />} label="Staff en poste" value={staff.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="display mb-3 text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-danger" /> Alertes récentes</h2>
          {s.alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune alerte active. Tout va bien.</p>
          ) : (
            <ul className="space-y-2">
              {s.alerts.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-card/40 p-3">
                  <div>
                    <div className="font-semibold text-sm">{a.type.toUpperCase()} · {a.prenom}</div>
                    <div className="text-xs text-muted-foreground">{a.notes} — {new Date(a.ts).toLocaleTimeString("fr")}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${a.statut === "cloturee" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>{a.statut}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="display mb-3 text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-electric" /> Stats consommation</h2>
          <Bar label="Tickets conso utilisés" value={ticketsUsed} max={ticketsTotal || 1} />
          <Bar label="Unités fort utilisées" value={fortUsed} max={parts.length || 1} />
          <Bar label="Check-in général" value={checkin} max={parts.length || 1} />
          <Bar label="Logements occupés" value={inLog} max={parts.length || 1} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Stat label="Alertes clôturées" value={alertsClosed} />
            <Stat label="Repas consommés" value={parts.reduce((acc, b) => acc + Object.values(b.repas).filter(Boolean).length, 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, color = "" }: any) {
  const colors: Record<string, string> = { electric: "text-electric", lycan: "text-lycan", success: "text-success", danger: "text-danger", warning: "text-warning" };
  return (
    <div className="glass rounded-xl p-4">
      <div className={`flex items-center justify-between ${colors[color] || "text-foreground"}`}>
        <div className="opacity-80">{icon}</div>
        <div className="display text-2xl">{value}</div>
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span>{value}/{max}</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-card">
        <div className="h-full gradient-electric" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-card/40 p-2"><div className="text-muted-foreground">{label}</div><div className="display text-lg text-electric">{value}</div></div>;
}

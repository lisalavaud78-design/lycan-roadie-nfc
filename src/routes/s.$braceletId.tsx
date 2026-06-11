import { createFileRoute, notFound } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { useState } from "react";
import { Shield, Calendar, Bell, Map, AlertTriangle, Briefcase, Coffee, CheckCircle2, Zap, AlertOctagon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$braceletId")({
  component: StaffView,
  loader: ({ params }) => { if (!params.braceletId) throw notFound(); return { id: params.braceletId }; },
});

type Tab = "accueil" | "planning" | "missions" | "notifications" | "carte" | "signalements";

function StaffView() {
  const { id } = Route.useLoaderData();
  const b = useWei((s) => s.bracelets.find((x) => x.id === id));
  const [tab, setTab] = useState<Tab>("accueil");
  const [enPause, setEnPause] = useState(false);

  if (!b) return <div className="flex min-h-screen items-center justify-center p-6"><div className="text-center"><h1 className="display text-3xl text-electric">Bracelet staff introuvable</h1><p className="mt-2 text-sm text-muted-foreground font-mono">{id}</p></div></div>;
  if (b.role === "participant") return <div className="p-6 text-center"><p>Ce bracelet est un bracelet participant. <a href={`/w/${b.id}`} className="text-electric underline">Aller à l'interface participant</a></p></div>;

  const prochain = b.staffShifts.find((s) => s.statut === "en_cours") ?? b.staffShifts.find((s) => s.statut === "a_venir");
  const notifsNonLues = b.notifications.filter((n) => !n.lu).length;
  const ROLE_LABEL: Record<string, string> = { staff_bde: "Staff BDE", staff_bda: "Staff BDA", staff_asint: "Staff ASINT", securite: "Sécurité", paps: "Secouriste PAPS", bar: "Bar", funbreak: "Funbreak", vip: "VIP", prestataire: "Prestataire" };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "accueil", label: "Accueil", icon: Shield },
    { id: "planning", label: "Mon planning", icon: Calendar },
    { id: "missions", label: "Missions", icon: Briefcase },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifsNonLues },
    { id: "carte", label: "Carte", icon: Map },
    { id: "signalements", label: "Signaler", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden bg-gradient-to-br from-lycan to-electric p-6 text-black">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Shield className="h-3 w-3" /> STAFF · WEI Lycan 2025
            </div>
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-mono">{b.id}</span>
          </div>
          <h1 className="display mt-2 text-3xl">{b.prenom} {b.nom}</h1>
          <div className="mt-1 text-sm opacity-90">{ROLE_LABEL[b.role] ?? b.role} · Zone {b.zone ?? "—"}</div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-black/15 px-2 py-0.5">{enPause ? "🟡 En pause" : "🟢 En poste"}</span>
            {prochain && <span className="rounded-full bg-black/15 px-2 py-0.5">Prochain : {prochain.debut} · {prochain.mission}</span>}
          </div>
        </div>
      </header>

      <div className="mx-4 -mt-4 flex gap-2">
        <button onClick={() => { setEnPause(false); toast.success("Poste pris"); }} className="flex-1 rounded-full bg-success px-4 py-2 text-sm font-semibold text-white shadow"><CheckCircle2 className="inline h-4 w-4 mr-1" />Je prends mon poste</button>
        <button onClick={() => { setEnPause(true); toast("En pause"); }} className="flex-1 rounded-full bg-card border border-border px-4 py-2 text-sm font-semibold"><Coffee className="inline h-4 w-4 mr-1" />Pause</button>
        <button onClick={() => { actions.addAlert({ type: "SOS", braceletId: b.id, prenom: `STAFF ${b.prenom}`, lieu: b.zone ?? "Inconnu", priorite: "haute", notes: "SOS staff" }); toast.error("SOS staff envoyé"); }} className="rounded-full bg-danger px-4 py-2 text-sm font-bold text-white shadow"><AlertOctagon className="inline h-4 w-4" /></button>
      </div>

      <nav className="sticky top-0 z-30 mt-4 flex gap-1 overflow-x-auto bg-background/90 px-4 py-2 backdrop-blur">
        {tabs.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap ${tab === t.id ? "gradient-electric text-black font-semibold" : "bg-card text-muted-foreground"}`}>
              <I className="h-3 w-3" /> {t.label}
              {t.badge ? <span className="rounded-full bg-danger text-white px-1.5 text-[10px]">{t.badge}</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 space-y-4">
        {tab === "accueil" && (
          <>
            <Card title="Prochain créneau"><ShiftRow s={prochain} /></Card>
            <Card title="Notifications récentes">
              {b.notifications.length === 0 ? <p className="text-sm text-muted-foreground">Aucune notification.</p> : (
                <ul className="space-y-2">{b.notifications.slice(0, 3).map((n) => <li key={n.id} className={`rounded-lg p-3 ${n.priorite === "urgent" ? "bg-danger/10 border border-danger/30" : "bg-card/40"}`}><div className="font-semibold text-sm">{n.titre}</div><div className="text-xs text-muted-foreground">{n.text}</div></li>)}</ul>
              )}
            </Card>
            <Card title="Stats du jour">
              <div className="grid grid-cols-3 gap-2 text-center">
                <KpiMini label="Shifts" value={b.staffShifts.length} />
                <KpiMini label="Faits" value={b.staffShifts.filter(s => s.statut === "termine").length} />
                <KpiMini label="À venir" value={b.staffShifts.filter(s => s.statut === "a_venir").length} />
              </div>
            </Card>
          </>
        )}
        {tab === "planning" && (
          <Card title="Mon planning staff" icon={<Calendar className="h-5 w-5 text-electric" />}>
            {b.staffShifts.length === 0 ? <p className="text-sm text-muted-foreground">Aucun shift attribué.</p> :
              <ul className="space-y-2">{b.staffShifts.map((s) => <li key={s.id}><ShiftRow s={s} /></li>)}</ul>}
          </Card>
        )}
        {tab === "missions" && (
          <Card title="Types de missions" icon={<Briefcase className="h-5 w-5 text-electric" />}>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {["staff bus", "staff check-in", "staff activité", "staff soirée", "staff bar", "staff sécurité", "staff goodies", "staff restauration", "staff PAPS", "staff logement"].map((m) => (
                <li key={m} className="rounded-lg bg-card/40 p-3 text-center capitalize">{m}</li>
              ))}
            </ul>
          </Card>
        )}
        {tab === "notifications" && (
          <Card title="Centre de notifications" icon={<Bell className="h-5 w-5 text-electric" />}>
            {b.notifications.length === 0 ? <p className="text-sm text-muted-foreground">Boîte vide.</p> : (
              <ul className="space-y-2">{b.notifications.map((n) => (
                <li key={n.id} className={`rounded-lg p-3 ${n.priorite === "urgent" ? "bg-danger/10 border border-danger/30" : "bg-card/40"} ${n.lu ? "opacity-60" : ""}`}>
                  <div className="flex justify-between"><div className="font-semibold text-sm">{n.titre}</div><span className="text-[10px] text-muted-foreground">{new Date(n.ts).toLocaleTimeString("fr")}</span></div>
                  <div className="text-xs text-muted-foreground">{n.text}</div>
                </li>
              ))}</ul>
            )}
          </Card>
        )}
        {tab === "carte" && (
          <Card title="Ma zone & itinéraire" icon={<Map className="h-5 w-5 text-electric" />}>
            <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-lycan/30 to-background border border-border relative">
              <div className="absolute left-[40%] top-[35%] -translate-x-1/2 -translate-y-1/2">
                <div className="h-4 w-4 rounded-full bg-electric ring-4 ring-electric/30 animate-pulse" />
                <div className="mt-1 text-xs font-semibold text-electric whitespace-nowrap">{b.zone ?? "Zone"}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Position de ta mission — ouvre la carte camping pour plus de détails.</p>
          </Card>
        )}
        {tab === "signalements" && (
          <Card title="Signaler un incident" icon={<AlertTriangle className="h-5 w-5 text-danger" />}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { t: "terrain", l: "Problème terrain" },
                { t: "logement", l: "Problème logement" },
                { t: "transport", l: "Problème transport" },
                { t: "malaise", l: "Malaise participant" },
                { t: "alcool", l: "Alcoolisation" },
                { t: "bagarre", l: "Incident soirée" },
                { t: "perdu", l: "Personne perdue" },
                { t: "blessure", l: "Rupture stock / blessure" },
              ].map((a) => (
                <button key={a.t} onClick={() => { actions.addAlert({ type: a.t as any, braceletId: b.id, prenom: `STAFF ${b.prenom}`, lieu: b.zone ?? "Inconnu", priorite: "moyenne", notes: a.l }); toast.success("Signalement envoyé"); }} className="rounded-xl bg-card border border-border p-3 text-sm hover:border-danger">
                  {a.l}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ title, children, icon }: any) {
  return <section className="glass rounded-2xl p-5"><div className="flex items-center gap-2 mb-3">{icon}<h2 className="display text-lg">{title}</h2></div>{children}</section>;
}
function KpiMini({ label, value }: any) { return <div className="rounded-lg bg-card/40 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="display text-2xl text-electric">{value}</div></div>; }
function ShiftRow({ s }: any) {
  if (!s) return <p className="text-sm text-muted-foreground">Aucun créneau.</p>;
  const colors = { en_cours: "border-electric bg-electric/10", a_venir: "border-border bg-card/40", termine: "border-success/40 bg-card/20 opacity-60" } as const;
  return (
    <div className={`rounded-lg border-l-4 p-3 ${colors[s.statut as keyof typeof colors]}`}>
      <div className="flex justify-between text-sm font-semibold">{s.mission}<span className="text-xs">{s.debut} – {s.fin}</span></div>
      <div className="mt-1 text-xs text-muted-foreground">{s.date} · {s.lieu} · resp. {s.responsable}</div>
      <div className="mt-1 text-xs">{s.consignes}</div>
      <div className="mt-2 text-[10px] uppercase tracking-widest">{s.statut === "en_cours" ? "🟢 En cours" : s.statut === "a_venir" ? "⏳ À venir" : "✓ Terminé"}</div>
    </div>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { useWei, actions, DESTINATION_CONFIDENTIELLE } from "@/lib/wei-store";
import { useState } from "react";
import { Ticket, Bus, Home, Calendar, Beer, UtensilsCrossed, ShoppingBag, Map, AlertTriangle, Heart, Phone, Zap, CheckCircle2, AlertOctagon, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/w/$braceletId")({
  component: ParticipantView,
  loader: ({ params }) => { if (!params.braceletId) throw notFound(); return { id: params.braceletId }; },
});

type Tab = "accueil" | "securite" | "medical" | "transport" | "logement" | "planning" | "soirees" | "repas" | "goodies" | "carte" | "contacts" | "billet";

function ParticipantView() {
  const { id } = Route.useLoaderData();
  const b = useWei((s) => s.bracelets.find((x) => x.id === id));
  const [tab, setTab] = useState<Tab>("accueil");

  if (!b) return <div className="flex min-h-screen items-center justify-center p-6 text-center"><div><h1 className="display text-3xl text-electric">Bracelet introuvable</h1><p className="mt-2 text-sm text-muted-foreground font-mono">{id}</p></div></div>;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "accueil", label: "Accueil", icon: Sparkles },
    { id: "securite", label: "Sécurité & urgence", icon: AlertTriangle },
    { id: "medical", label: "Médical", icon: Heart },
    { id: "transport", label: "Transport", icon: Bus },
    { id: "logement", label: "Logement", icon: Home },
    { id: "planning", label: "Planning", icon: Calendar },
    { id: "soirees", label: "Soirées & tickets", icon: Beer },
    { id: "repas", label: "Restauration", icon: UtensilsCrossed },
    { id: "goodies", label: "Goodies", icon: ShoppingBag },
    { id: "carte", label: "Carte", icon: Map },
    { id: "contacts", label: "Contacts", icon: Phone },
    { id: "billet", label: "Mon billet", icon: Ticket },
  ];

  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden gradient-electric p-6 text-black">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80"><Zap className="h-3 w-3" /> Highway to WEI · 2025</div>
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-mono">{b.id}</span>
          </div>
          <h1 className="display mt-2 text-4xl">{b.prenom} {b.nom}</h1>
          <div className="mt-1 text-sm opacity-80">{b.ecole} · {b.equipe ?? "Participant"}</div>
        </div>
      </header>

      <nav className="sticky top-0 z-30 flex gap-1 overflow-x-auto bg-background/90 px-4 py-2 backdrop-blur border-b border-border">
        {tabs.map((t) => {
          const I = t.icon;
          const isUrg = t.id === "securite";
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap ${tab === t.id ? "gradient-electric text-black font-semibold" : isUrg ? "bg-danger/10 text-danger border border-danger/30" : "bg-card text-muted-foreground"}`}>
              <I className="h-3 w-3" /> {t.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 space-y-4">
        {tab === "accueil" && <AccueilTab b={b} setTab={setTab} />}
        {tab === "securite" && <SecuriteTab b={b} />}
        {tab === "medical" && <MedicalTab b={b} />}
        {tab === "transport" && <TransportTab b={b} />}
        {tab === "logement" && <LogementTab b={b} />}
        {tab === "planning" && <PlanningTab b={b} />}
        {tab === "soirees" && <SoireesTab b={b} />}
        {tab === "repas" && <RepasTab b={b} />}
        {tab === "goodies" && <GoodiesTab b={b} />}
        {tab === "carte" && <CarteTab />}
        {tab === "contacts" && <ContactsTab />}
        {tab === "billet" && <BilletTab b={b} />}
      </div>
    </div>
  );
}

function Card({ title, children, icon }: any) { return <section className="glass rounded-2xl p-5"><div className="flex items-center gap-2 mb-3">{icon}<h2 className="display text-lg">{title}</h2></div>{children}</section>; }
function Info({ k, v }: { k: string; v: string }) { return <div className="flex justify-between border-b border-border/50 py-2 last:border-0"><span className="text-xs uppercase tracking-widest text-muted-foreground">{k}</span><span className="text-sm">{v}</span></div>; }

const PLANNING = [
  { day: "Vendredi 5 sept", color: "lycan", items: [
    { h: "08:00", t: "Départ bus campus Évry", lieu: "Parking TSP" },
    { h: "18:00", t: "Arrivée Ty Nadan", lieu: "Camping" },
    { h: "19:00", t: "Check-in & installation bungalows", lieu: "Bungalows" },
    { h: "21:00", t: "Apéro d'accueil", lieu: "Zone centrale" },
  ]},
  { day: "Samedi 6 sept", color: "electric", items: [
    { h: "11:00-13:00", t: "Brunch", lieu: "Salle restauration" },
    { h: "15:00-16:30", t: "Olympiades", lieu: "Terrain central" },
    { h: "17:30-18:30", t: "Apéro mousse", lieu: "Zone centrale" },
    { h: "22:00-04:00", t: "Soirée 1", lieu: "Scène principale" },
  ]},
  { day: "Dimanche 7 sept", color: "electric", items: [
    { h: "11:00-13:00", t: "Brunch", lieu: "Salle restauration" },
    { h: "14:00-17:00", t: "Activités au choix", lieu: "Camping" },
    { h: "18:00-19:00", t: "Holy Color", lieu: "Plage" },
    { h: "22:00", t: "Feu d'artifice", lieu: "Plage" },
    { h: "22:00-04:00", t: "Soirée 2", lieu: "Scène principale" },
  ]},
  { day: "Lundi 8 sept", color: "lycan", items: [
    { h: "10:00", t: "Check-out bungalows", lieu: "Bungalows" },
    { h: "12:00", t: "Repas midi", lieu: "Salle restauration" },
    { h: "14:00", t: "Départ bus retour", lieu: "Parking camping" },
  ]},
];

function nextItem() {
  for (const d of PLANNING) for (const it of d.items) return { ...it, day: d.day };
  return null;
}

function AccueilTab({ b, setTab }: any) {
  const next = nextItem();
  const ticketsLeft = b.tickets_conso.filter((t: any) => !t.used).length;
  return (
    <>
      <Card title="Bracelet actif" icon={<Sparkles className="h-5 w-5 text-electric" />}>
        <Info k="Statut" v={b.statut === "actif" ? "🟢 Actif" : b.statut} />
        <Info k="ID NFC" v={b.id} />
        <Info k="École" v={b.ecole} />
        <Info k="Équipe" v={b.equipe ?? "—"} />
      </Card>

      <button onClick={() => setTab("securite")} className="w-full rounded-xl border border-danger/40 bg-danger/10 p-3 flex items-center justify-between hover:bg-danger/20">
        <span className="flex items-center gap-2 text-sm font-semibold text-danger"><AlertOctagon className="h-4 w-4" /> Besoin d'aide ? Sécurité & urgence</span>
        <span className="text-xs text-danger">→</span>
      </button>

      {next && (
        <Card title="Prochain rendez-vous" icon={<Calendar className="h-5 w-5 text-electric" />}>
          <div className="rounded-lg bg-electric/10 border border-electric/30 p-3">
            <div className="text-xs text-electric uppercase tracking-widest">{next.day}</div>
            <div className="display text-xl mt-1">{next.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{next.h} · {next.lieu}</div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setTab("soirees")} className="glass rounded-2xl p-4 text-left hover:border-electric border border-transparent">
          <div className="text-xs uppercase text-muted-foreground">Tickets restants</div>
          <div className="display text-3xl text-electric">{ticketsLeft}/{b.tickets_conso.length}</div>
          <div className="text-xs mt-1">+ {b.unite_fort.used ? "0" : "1"} unité fort</div>
        </button>
        <button onClick={() => setTab("transport")} className="glass rounded-2xl p-4 text-left hover:border-electric border border-transparent">
          <div className="text-xs uppercase text-muted-foreground">Bus aller</div>
          <div className="display text-xl text-electric">{b.busAllerType ?? "—"}</div>
          <div className="text-xs mt-1">N°{b.busAller}</div>
        </button>
      </div>

      <Card title="Goodies récupérés" icon={<ShoppingBag className="h-5 w-5 text-electric" />}>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(b.goodies).map(([k, v]: any) => (
            <span key={k} className={`rounded-full px-2 py-1 ${v.recupere ? "bg-success/20 text-success" : "bg-card/40 text-muted-foreground"}`}>
              {k} {v.recupere ? "✓" : ""}
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}

function TransportTab({ b }: any) {
  return (
    <>
      <Card title="Bus aller" icon={<Bus className="h-5 w-5 text-electric" />}>
        <Info k="Bus" v={`${b.busAllerType ?? "—"} (n°${b.busAller ?? "—"})`} />
        <Info k="Départ" v="Vendredi 5 sept · 08h00" />
        <Info k="Lieu RDV" v="Parking principal Télécom SudParis" />
        <Info k="Responsable" v="Ismaël Lepage (tour leader)" />
        <Info k="Destination" v={DESTINATION_CONFIDENTIELLE} />
        <div className="mt-4 flex gap-2">
          <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, bus: true } }); toast.success("Monté dans le bus aller"); }} className="flex-1 rounded-lg gradient-electric py-2.5 font-semibold text-black">Je suis monté</button>
          <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, bus: false } }); toast("Descendu"); }} className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm">Je suis descendu</button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">Statut : {b.checkin.bus ? "🟢 dans le bus" : "⚪ hors bus"}</div>
      </Card>

      <Card title="Bus retour" icon={<Bus className="h-5 w-5 text-electric" />}>
        <Info k="Bus" v={`${b.busRetourType ?? "—"} (n°${b.busRetour ?? "—"})`} />
        <Info k="Départ" v="Lundi 8 sept · 14h00" />
        <Info k="Lieu RDV" v="Parking camping Ty Nadan" />
        <Info k="Responsable" v="Ismaël Lepage" />
        <div className="mt-4 flex gap-2">
          <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, busRetour: true } }); toast.success("Monté dans le bus retour"); }} className="flex-1 rounded-lg gradient-electric py-2.5 font-semibold text-black">Je suis monté</button>
          <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, busRetour: false } }); }} className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm">Descendu</button>
        </div>
      </Card>

      <button onClick={() => { actions.addAlert({ type: "transport", braceletId: b.id, prenom: b.prenom, lieu: "Bus", priorite: "moyenne", notes: "Problème transport signalé" }); toast.success("Problème transport signalé"); }} className="w-full rounded-lg border border-danger/40 bg-danger/10 py-2.5 text-sm text-danger">
        Signaler un problème transport
      </button>
    </>
  );
}

function LogementTab({ b }: any) {
  return (
    <>
      <Card title="Mon logement" icon={<Home className="h-5 w-5 text-electric" />}>
        <Info k="Bungalow" v={b.bungalow ?? "—"} />
        <Info k="N° logement" v={b.numLogement ?? b.bungalow ?? "—"} />
        <Info k="Capacité" v="4 à 6 personnes" />
        <div className="mt-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Colocataires</div>
          <ul className="space-y-1">
            {b.colocataires.map((c: string, i: number) => <li key={i} className="rounded bg-card/40 px-3 py-1.5 text-sm">{c}</li>)}
          </ul>
        </div>
      </Card>
      <Card title="Plan camping">
        <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-lycan/30 to-background border border-border relative">
          <div className="absolute left-[30%] top-[35%] -translate-x-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rounded-full bg-electric ring-4 ring-electric/30 animate-pulse" />
            <div className="mt-1 text-xs font-semibold text-electric whitespace-nowrap">{b.bungalow}</div>
          </div>
        </div>
      </Card>
      <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, logement: true } }); toast.success("Check-in logement"); }} disabled={b.checkin.logement} className="w-full rounded-lg gradient-electric py-3 font-semibold text-black disabled:opacity-50">
        {b.checkin.logement ? "✓ Logement validé" : "Check-in logement"}
      </button>
      <button onClick={() => { actions.addAlert({ type: "logement", braceletId: b.id, prenom: b.prenom, lieu: b.bungalow ?? "Bungalow", priorite: "moyenne", notes: "Problème logement signalé" }); toast.success("Signalement envoyé"); }} className="w-full rounded-lg border border-danger/40 bg-danger/10 py-2.5 text-sm text-danger">
        Signaler un problème logement
      </button>
    </>
  );
}

function PlanningTab({ b }: any) {
  const [day, setDay] = useState(0);
  const d = PLANNING[day];
  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PLANNING.map((p, i) => (
          <button key={p.day} onClick={() => setDay(i)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${i === day ? "gradient-electric text-black font-semibold" : "bg-card border border-border"}`}>{p.day}</button>
        ))}
      </div>
      <Card title={d.day} icon={<Calendar className="h-5 w-5 text-electric" />}>
        <ul className="space-y-2">
          {d.items.map((it, i) => (
            <li key={i} className="rounded-lg bg-card/40 p-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-xs text-electric">{it.h}</div>
                  <div className="font-semibold text-sm mt-0.5">{it.t}</div>
                  <div className="text-xs text-muted-foreground">📍 {it.lieu}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => { actions.updateBracelet(b.id, { activites: { ...b.activites, [it.t]: "inscrit" } }); toast.success("J'y suis"); }} className="rounded bg-success/20 text-success px-2 py-0.5 text-[10px]">J'y suis</button>
                  <button onClick={() => { actions.addAlert({ type: "terrain", braceletId: b.id, prenom: b.prenom, lieu: it.lieu, priorite: "moyenne", notes: `Problème sur ${it.t}` }); toast("Signalé"); }} className="rounded bg-danger/20 text-danger px-2 py-0.5 text-[10px]">Signaler</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function SoireesTab({ b }: any) {
  const left = b.tickets_conso.filter((t: any) => !t.used).length;
  return (
    <>
      <Card title="Soirées & tickets conso" icon={<Beer className="h-5 w-5 text-electric" />}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-card/60 p-3"><div className="text-[10px] uppercase text-muted-foreground">Tickets</div><div className="display text-2xl text-electric">{left}/{b.tickets_conso.length}</div></div>
          <div className="rounded-xl bg-card/60 p-3"><div className="text-[10px] uppercase text-muted-foreground">Unité fort</div><div className="display text-2xl text-electric">{b.unite_fort.used ? "0" : "1"}/1</div></div>
          <div className="rounded-xl bg-card/60 p-3"><div className="text-[10px] uppercase text-muted-foreground">Bière</div><div className="display text-2xl text-electric">∞</div></div>
        </div>
      </Card>
      {[1, 2].map((soireeNum) => (
        <Card key={soireeNum} title={`Soirée ${soireeNum} (${soireeNum === 1 ? "Samedi" : "Dimanche"} 22h-04h)`}>
          <div className="space-y-2">
            {b.tickets_conso.filter((t: any) => (t.soiree ?? 1) === soireeNum).map((t: any) => (
              <div key={t.id} className={`flex items-center justify-between rounded-lg p-3 ${t.used ? "bg-card/30 opacity-50" : "bg-electric/10 border border-electric/30"}`}>
                <div><div className="font-semibold text-sm">Ticket {t.id}</div><div className="text-[10px] text-muted-foreground">{t.used ? `Utilisé · ${t.lieu}` : "Nominatif · disponible"}</div></div>
                {!t.used && <button onClick={() => { actions.useTicket(b.id, t.id); toast.success(`${t.id} utilisé`); }} className="rounded-lg gradient-electric px-3 py-1.5 text-xs font-semibold text-black">Utiliser</button>}
              </div>
            ))}
            {soireeNum === 1 && (
              <div className={`flex items-center justify-between rounded-lg p-3 ${b.unite_fort.used ? "bg-card/30 opacity-50" : "bg-lycan/15 border border-lycan/40"}`}>
                <div><div className="font-semibold text-sm">Unité alcool fort</div><div className="text-[10px] text-muted-foreground">{b.unite_fort.used ? `Utilisée · ${b.unite_fort.lieu}` : "Disponible"}</div></div>
                {!b.unite_fort.used && <button onClick={() => { actions.useUniteFort(b.id); toast.success("Unité fort utilisée"); }} className="rounded-lg bg-lycan px-3 py-1.5 text-xs font-semibold text-white">Utiliser</button>}
              </div>
            )}
          </div>
        </Card>
      ))}
      <Card title="Historique">
        <ul className="space-y-1 text-xs">
          {b.history.filter((h: any) => h.type.startsWith("conso")).map((h: any, i: number) => <li key={i} className="rounded bg-card/40 px-3 py-2"><span className="text-electric">{new Date(h.ts).toLocaleTimeString("fr")}</span> — {h.detail}</li>)}
          {!b.history.some((h: any) => h.type.startsWith("conso")) && <li className="text-muted-foreground">Aucune consommation.</li>}
        </ul>
      </Card>
    </>
  );
}

const REPAS = [
  { id: "brunch_sam", label: "Brunch samedi 11h-13h" },
  { id: "diner_sam", label: "Dîner samedi" },
  { id: "encas_sam", label: "Encas soirée samedi" },
  { id: "brunch_dim", label: "Brunch dimanche 11h-13h" },
  { id: "diner_dim", label: "Dîner dimanche" },
  { id: "midi_lun", label: "Repas lundi midi" },
];
function RepasTab({ b }: any) {
  return (
    <Card title="Restauration" icon={<UtensilsCrossed className="h-5 w-5 text-electric" />}>
      <div className="space-y-2">
        {REPAS.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg bg-card/40 p-3">
            <span className="text-sm">{r.label}</span>
            <button onClick={() => { actions.updateBracelet(b.id, { repas: { ...b.repas, [r.id]: !b.repas[r.id] } }); toast.success(b.repas[r.id] ? "Retiré" : "Récupéré"); }} className={`rounded-lg px-3 py-1 text-xs font-semibold ${b.repas[r.id] ? "bg-success text-white" : "gradient-electric text-black"}`}>{b.repas[r.id] ? "✓" : "Récupérer"}</button>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <input placeholder="Régime alimentaire" className="rounded-md border border-border bg-background px-3 py-2" />
        <input placeholder="Allergies" defaultValue={b.medical.allergies} className="rounded-md border border-border bg-background px-3 py-2" />
      </div>
      <button onClick={() => { actions.addAlert({ type: "terrain", braceletId: b.id, prenom: b.prenom, lieu: "Restauration", priorite: "basse", notes: "Problème repas" }); toast.success("Signalé"); }} className="mt-3 w-full rounded-lg border border-danger/40 bg-danger/10 py-2 text-xs text-danger">Signaler un problème repas</button>
    </Card>
  );
}

const GOODIES = [
  { key: "tshirt", label: "Tee-shirt blanc", sizes: ["S", "M", "L", "XL"] },
  { key: "bob", label: "Bob" },
  { key: "bandana", label: "Bandana" },
  { key: "ecocup", label: "Eco-cup" },
  { key: "sac", label: "Sac à cordon" },
];
function GoodiesTab({ b }: any) {
  return (
    <Card title="Goodies WEI" icon={<ShoppingBag className="h-5 w-5 text-electric" />}>
      <div className="space-y-2">
        {GOODIES.map((g) => {
          const got = b.goodies[g.key]?.recupere;
          return (
            <div key={g.key} className={`flex items-center justify-between rounded-lg p-3 ${got ? "bg-success/10 border border-success/30" : "bg-card/40"}`}>
              <div><div className="font-semibold text-sm">{g.label}</div>{g.sizes && <div className="text-[10px] text-muted-foreground">Taille : {b.goodies[g.key]?.taille ?? "M"}</div>}</div>
              <button onClick={() => { actions.updateBracelet(b.id, { goodies: { ...b.goodies, [g.key]: { ...b.goodies[g.key], recupere: !got } } }); toast.success(got ? "Retiré" : "Récupéré"); }} className={`rounded-lg px-3 py-1 text-xs font-semibold ${got ? "bg-success text-white" : "gradient-electric text-black"}`}>{got ? "✓" : "Récupérer"}</button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const ZONES = [
  { x: 50, y: 20, label: "Accueil" }, { x: 30, y: 35, label: "Bungalows" }, { x: 70, y: 35, label: "Piscine" },
  { x: 85, y: 55, label: "Plage" }, { x: 20, y: 60, label: "Rivière" }, { x: 55, y: 50, label: "Salle techno" },
  { x: 45, y: 70, label: "Bar/restau" }, { x: 75, y: 75, label: "Holy Color" }, { x: 25, y: 80, label: "PAPS" },
  { x: 60, y: 85, label: "Feu d'artifice" }, { x: 10, y: 20, label: "Parking" },
];
function CarteTab() {
  return (
    <Card title="Carte du camping Ty Nadan" icon={<Map className="h-5 w-5 text-electric" />}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-lycan/30 to-background border border-border">
        {ZONES.map((z) => (
          <div key={z.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
            <div className="h-3 w-3 rounded-full bg-electric shadow-electric ring-2 ring-electric/30" />
            <div className="mt-1 whitespace-nowrap text-[10px] font-semibold text-electric -translate-x-1/2">{z.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const ALERTS = [
  { type: "SOS", label: "SOS général", color: "bg-danger" },
  { type: "malaise", label: "Malaise", color: "bg-orange-500" },
  { type: "blessure", label: "Blessure", color: "bg-orange-600" },
  { type: "piqure", label: "Suspicion piqûre", color: "bg-red-700" },
  { type: "harcelement", label: "Harcèlement", color: "bg-purple-600" },
  { type: "perdu", label: "Personne perdue", color: "bg-yellow-600" },
  { type: "alcool", label: "Alcoolisation excessive", color: "bg-amber-600" },
  { type: "logement", label: "Problème logement", color: "bg-blue-600" },
  { type: "transport", label: "Problème transport", color: "bg-cyan-700" },
  { type: "terrain", label: "Problème terrain", color: "bg-blue-700" },
] as const;
function SecuriteTab({ b }: any) {
  const [active, setActive] = useState<typeof ALERTS[number] | null>(null);
  const [lieu, setLieu] = useState(b.bungalow ?? "");
  const [comm, setComm] = useState("");
  const [urgence, setUrgence] = useState<"haute" | "moyenne" | "basse">("moyenne");

  function submit() {
    if (!active) return;
    actions.addAlert({ type: active.type as any, braceletId: b.id, prenom: b.prenom, lieu: lieu || "Inconnu", priorite: urgence, notes: `${active.label}${comm ? " · " + comm : ""}` });
    toast.success(`« ${active.label} » envoyé au staff`);
    setActive(null); setComm("");
  }

  return (
    <>
      <Card title="Sécurité & urgence" icon={<AlertTriangle className="h-5 w-5 text-danger" />}>
        <p className="text-xs text-muted-foreground mb-3">Sélectionne le type d'incident, puis complète. Le staff est notifié immédiatement.</p>
        <div className="grid grid-cols-2 gap-2">
          {ALERTS.map((a) => (
            <button key={a.type} onClick={() => setActive(a)} className={`${a.color} rounded-xl px-3 py-3 text-xs font-semibold text-white shadow active:scale-95`}>{a.label}</button>
          ))}
        </div>
      </Card>

      {active && (
        <Card title={`Détails — ${active.label}`}>
          <div className="space-y-3">
            <div><label className="text-xs uppercase text-muted-foreground">Localisation</label><input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Ex : Bungalow B05, scène techno…" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-xs uppercase text-muted-foreground">Commentaire</label><textarea value={comm} onChange={(e) => setComm(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
            <div className="flex gap-1">
              {(["basse", "moyenne", "haute"] as const).map((u) => (
                <button key={u} onClick={() => setUrgence(u)} className={`flex-1 rounded-md px-2 py-1.5 text-xs ${urgence === u ? (u === "haute" ? "bg-danger text-white" : u === "moyenne" ? "bg-warning text-black" : "bg-muted") : "bg-card border border-border"}`}>{u}</button>
              ))}
            </div>
            <button onClick={submit} className="w-full rounded-lg gradient-electric py-3 font-semibold text-black">Envoyer au staff</button>
          </div>
        </Card>
      )}
    </>
  );
}

function MedicalTab({ b }: any) {
  const m = b.medical;
  return (
    <Card title="Mes infos médicales" icon={<Heart className="h-5 w-5 text-electric" />}>
      <p className="text-xs text-muted-foreground mb-3">Visibles uniquement par le staff PAPS autorisé en cas d'urgence.</p>
      <div className="space-y-3">
        <TA label="Allergies" v={m.allergies} on={(v) => actions.updateBracelet(b.id, { medical: { ...m, allergies: v } })} />
        <TA label="Traitements" v={m.traitements} on={(v) => actions.updateBracelet(b.id, { medical: { ...m, traitements: v } })} />
        <TA label="Pathologies" v={m.pathologies} on={(v) => actions.updateBracelet(b.id, { medical: { ...m, pathologies: v } })} />
        <F label="Contact d'urgence" v={m.contactUrgence} on={(v) => actions.updateBracelet(b.id, { medical: { ...m, contactUrgence: v } })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={m.consentement} onChange={(e) => actions.updateBracelet(b.id, { medical: { ...m, consentement: e.target.checked } })} className="h-4 w-4 accent-electric" />J'accepte que le PAPS consulte mes infos en cas d'urgence</label>
      </div>
    </Card>
  );
}
function F({ label, v, on }: any) { return <div><label className="text-xs uppercase text-muted-foreground">{label}</label><input value={v} onChange={(e) => on(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>; }
function TA({ label, v, on }: any) { return <div><label className="text-xs uppercase text-muted-foreground">{label}</label><textarea value={v} onChange={(e) => on(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>; }

const CONTACTS = [
  { name: "Barthélémy Ranchon", role: "Président" },
  { name: "Enzo Bect", role: "Trésorier" },
  { name: "Lucas Broussely", role: "Responsable événementiel" },
  { name: "Ines Tagliaferri", role: "Responsable sécurité-logistique" },
  { name: "Ismaël Lepage", role: "Tour leader" },
  { name: "Alexandre Goncalves", role: "Responsable sécurité Funbreak" },
  { name: "Franck Picaut", role: "Responsable secouriste" },
];
function ContactsTab() {
  return (
    <Card title="Contacts utiles" icon={<Phone className="h-5 w-5 text-electric" />}>
      <ul className="space-y-2">
        {CONTACTS.map((c) => <li key={c.name} className="flex items-center justify-between rounded-lg bg-card/40 p-3"><div><div className="font-semibold text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.role}</div></div><Phone className="h-4 w-4 text-electric" /></li>)}
      </ul>
    </Card>
  );
}

function BilletTab({ b }: any) {
  return (
    <Card title="Mon billet WEI Lycan" icon={<Ticket className="h-5 w-5 text-electric" />}>
      <div className="flex items-center justify-between rounded-xl bg-success/10 border border-success/30 p-4">
        <div><div className="text-success font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Billet valide</div><div className="text-xs text-muted-foreground mt-1">Highway to WEI — 5 au 8 sept 2025</div></div>
        <Zap className="h-8 w-8 text-electric" />
      </div>
      <div className="mt-4 grid place-items-center rounded-xl bg-white p-6">
        <div className="grid grid-cols-12 gap-px">{Array.from({ length: 144 }).map((_, i) => <div key={i} className="aspect-square w-3" style={{ background: ((i * 7 + b.id.length) % 3) === 0 ? "#fff" : "#000" }} />)}</div>
      </div>
      <div className="mt-3 text-center text-xs font-mono text-muted-foreground">{b.id}</div>
      <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, general: true } }); toast.success("Check-in général"); }} disabled={b.checkin.general} className="mt-4 w-full rounded-lg gradient-electric py-3 font-semibold text-black disabled:opacity-50">
        {b.checkin.general ? "✓ Check-in fait" : "Check-in général"}
      </button>
    </Card>
  );
}

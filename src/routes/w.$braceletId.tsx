import { createFileRoute, notFound } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { useState } from "react";
import { Ticket, Bus, Home, Calendar, Activity, Beer, UtensilsCrossed, ShoppingBag, Map, AlertTriangle, Heart, Phone, Zap, CheckCircle2, AlertOctagon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/w/$braceletId")({
  component: ParticipantView,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="display text-3xl text-electric">Bracelet introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cet ID NFC n'est pas reconnu dans le système Lycan WEI.</p>
      </div>
    </div>
  ),
  loader: ({ params }) => {
    if (!params.braceletId) throw notFound();
    return { id: params.braceletId };
  },
});

type Tab = "billet" | "transport" | "logement" | "planning" | "activites" | "soirees" | "repas" | "goodies" | "carte" | "securite" | "medical" | "contacts";

function ParticipantView() {
  const { id } = Route.useLoaderData();
  const bracelet = useWei((s) => s.bracelets.find((b) => b.id === id));
  const [tab, setTab] = useState<Tab>("billet");

  if (!bracelet) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="display text-3xl text-electric">Bracelet introuvable</h1>
          <p className="mt-2 text-sm text-muted-foreground">ID : <code className="text-electric">{id}</code></p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "billet", label: "Mon billet", icon: Ticket },
    { id: "transport", label: "Transport", icon: Bus },
    { id: "logement", label: "Logement", icon: Home },
    { id: "planning", label: "Planning", icon: Calendar },
    { id: "activites", label: "Activités", icon: Activity },
    { id: "soirees", label: "Soirées", icon: Beer },
    { id: "repas", label: "Restauration", icon: UtensilsCrossed },
    { id: "goodies", label: "Goodies", icon: ShoppingBag },
    { id: "carte", label: "Carte", icon: Map },
    { id: "securite", label: "Sécurité", icon: AlertTriangle },
    { id: "medical", label: "Médical", icon: Heart },
    { id: "contacts", label: "Contacts", icon: Phone },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative overflow-hidden gradient-electric p-6 text-black">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Zap className="h-3 w-3" /> Highway to WEI · 2025
            </div>
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs font-mono">{bracelet.id}</span>
          </div>
          <h1 className="display mt-2 text-4xl">{bracelet.prenom} {bracelet.nom}</h1>
          <div className="mt-1 text-sm opacity-80">{bracelet.ecole} · {bracelet.equipe ?? "Staff"}</div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Pill ok={bracelet.statut === "actif"}>Billet {bracelet.statut === "actif" ? "valide" : "inactif"}</Pill>
            {bracelet.bus && <Pill>Bus {bracelet.bus}</Pill>}
            {bracelet.bungalow && <Pill>{bracelet.bungalow}</Pill>}
          </div>
        </div>
      </header>

      {/* Quick SOS */}
      <button onClick={() => { actions.addAlert({ type: "SOS", braceletId: bracelet.id, prenom: bracelet.prenom, lieu: "Inconnu", priorite: "haute", notes: "Bouton SOS pressé depuis bracelet" }); toast.error("SOS envoyé — l'organisation est prévenue"); }}
        className="mx-4 -mt-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-full bg-danger px-6 py-3 font-bold text-white shadow-lg">
        <AlertOctagon className="h-5 w-5" /> URGENCE — Appeler le staff
      </button>

      {/* Tabs */}
      <nav className="sticky top-0 z-30 mt-4 flex gap-1 overflow-x-auto bg-background/90 px-4 py-2 backdrop-blur">
        {tabs.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap ${tab === t.id ? "gradient-electric text-black font-semibold" : "bg-card text-muted-foreground"}`}>
              <I className="h-3 w-3" /> {t.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 space-y-4">
        {tab === "billet" && <BilletTab b={bracelet} />}
        {tab === "transport" && <TransportTab b={bracelet} />}
        {tab === "logement" && <LogementTab b={bracelet} />}
        {tab === "planning" && <PlanningTab b={bracelet} />}
        {tab === "activites" && <ActivitesTab b={bracelet} />}
        {tab === "soirees" && <SoireesTab b={bracelet} />}
        {tab === "repas" && <RepasTab b={bracelet} />}
        {tab === "goodies" && <GoodiesTab b={bracelet} />}
        {tab === "carte" && <CarteTab />}
        {tab === "securite" && <SecuriteTab b={bracelet} />}
        {tab === "medical" && <MedicalTab b={bracelet} />}
        {tab === "contacts" && <ContactsTab />}
      </div>
    </div>
  );
}

function Pill({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return <span className={`rounded-full px-2 py-0.5 ${ok ? "bg-black/20" : "bg-black/10"}`}>{children}</span>;
}

function Card({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="display text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BilletTab({ b }: any) {
  return (
    <>
      <Card title="Billet WEI Lycan" icon={<Ticket className="h-5 w-5 text-electric" />}>
        <div className="flex items-center justify-between rounded-xl bg-success/10 border border-success/30 p-4">
          <div>
            <div className="text-success font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Billet valide</div>
            <div className="text-xs text-muted-foreground mt-1">Highway to WEI — 5 au 8 sept 2025 — Ty Nadan</div>
          </div>
          <Zap className="h-8 w-8 text-electric" />
        </div>
        <div className="mt-4 grid place-items-center rounded-xl bg-white p-6">
          <div className="grid grid-cols-12 gap-px">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="aspect-square w-3" style={{ background: Math.random() > 0.5 ? "#000" : "#fff" }} />
            ))}
          </div>
        </div>
        <div className="mt-3 text-center text-xs font-mono text-muted-foreground">{b.id}</div>
        <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, general: true } }); toast.success("Check-in général effectué"); }}
          disabled={b.checkin.general}
          className="mt-4 w-full rounded-lg gradient-electric py-3 font-semibold text-black disabled:opacity-50">
          {b.checkin.general ? "✓ Check-in fait" : "Check-in général"}
        </button>
      </Card>
    </>
  );
}

function TransportTab({ b }: any) {
  return (
    <Card title={`Bus ${b.bus ?? "—"}`} icon={<Bus className="h-5 w-5 text-electric" />}>
      <Info k="Trajet" v="Campus Évry → Ty Nadan (~10h avec pauses)" />
      <Info k="Départ" v="Vendredi 5 sept — 8h00" />
      <Info k="Lieu" v="Parking principal Télécom SudParis" />
      <Info k="Bus" v={`Bus n°${b.bus} — 60 places`} />
      <div className="mt-4 flex gap-2">
        <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, bus: true } }); toast.success("Monté dans le bus"); }}
          className="flex-1 rounded-lg gradient-electric py-2.5 font-semibold text-black">
          Je suis monté
        </button>
        <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, bus: false } }); toast("Descendu du bus"); }}
          className="flex-1 rounded-lg border border-border bg-card py-2.5 font-semibold">
          Je suis descendu
        </button>
      </div>
      <div className="mt-3 text-xs text-muted-foreground text-center">Statut : {b.checkin.bus ? "🟢 dans le bus" : "⚪ hors bus"} — visible par l'organisation</div>
    </Card>
  );
}

function LogementTab({ b }: any) {
  return (
    <Card title="Logement" icon={<Home className="h-5 w-5 text-electric" />}>
      <Info k="Bungalow" v={b.bungalow ?? "—"} />
      <Info k="Capacité" v="4 à 6 personnes" />
      <Info k="Colocataires" v="Léa, Hugo, Tom, Manon (exemple)" />
      <div className="mt-4 rounded-lg bg-card/60 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Consignes :</strong> respect du voisinage, pas de feu dans le bungalow, état des lieux à la sortie.
      </div>
      <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, logement: true } }); toast.success("Check-in logement effectué"); }}
        disabled={b.checkin.logement}
        className="mt-4 w-full rounded-lg gradient-electric py-3 font-semibold text-black disabled:opacity-50">
        {b.checkin.logement ? "✓ Logement validé" : "Check-in logement"}
      </button>
    </Card>
  );
}

const PLANNING = [
  { day: "Vendredi 5 sept", items: ["08h00 — Départ bus campus Évry", "18h00 — Arrivée Ty Nadan", "19h00 — Check-in & installation bungalows", "21h00 — Apéro d'accueil"] },
  { day: "Samedi 6 sept", items: ["11h-13h — Brunch", "15h-16h30 — Olympiades", "17h30-18h30 — Apéro mousse", "22h-04h — Soirée"] },
  { day: "Dimanche 7 sept", items: ["11h-13h — Brunch", "14h-17h — Activités au choix", "18h-19h — Holy Color", "22h — Feu d'artifice", "22h-04h — Soirée"] },
  { day: "Lundi 8 sept", items: ["10h — Check-out bungalows", "12h — Repas midi", "14h — Départ bus retour"] },
];

function PlanningTab({ b }: any) {
  return (
    <>
      {PLANNING.map((d) => (
        <Card key={d.day} title={d.day} icon={<Calendar className="h-5 w-5 text-electric" />}>
          <ul className="space-y-2">
            {d.items.map((it) => {
              const status = b.activites[it] ?? null;
              return (
                <li key={it} className="flex items-center justify-between rounded-lg bg-card/40 px-3 py-2">
                  <span className="text-sm">{it}</span>
                  <div className="flex gap-1">
                    {(["inscrit", "absent", "rappel"] as const).map((s) => (
                      <button key={s} onClick={() => actions.updateBracelet(b.id, { activites: { ...b.activites, [it]: s } })}
                        className={`rounded px-2 py-0.5 text-[10px] ${status === s ? "bg-electric text-black font-semibold" : "bg-background text-muted-foreground"}`}>
                        {s === "inscrit" ? "✓" : s === "absent" ? "✗" : "🔔"}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </>
  );
}

const ACTIVITES = [
  { name: "Taureau mécanique", lieu: "Zone funbreak", capacity: 1, time: "Samedi 14h-18h" },
  { name: "Pedal'Balayette", lieu: "Zone funbreak", capacity: 4, time: "Samedi 14h-18h" },
  { name: "Sumo", lieu: "Zone funbreak", capacity: 2, time: "Samedi 14h-18h" },
  { name: "Canoë-kayak", lieu: "Rivière", capacity: 30, time: "Dimanche 10h-17h" },
  { name: "Saut à l'élastique", lieu: "Pont d'Aulne", capacity: 8, time: "Dimanche 14h-17h" },
  { name: "Olympiades", lieu: "Terrain central", capacity: 350, time: "Samedi 15h-16h30" },
  { name: "Activités piscine chill", lieu: "Piscine camping", capacity: 60, time: "Tous les jours" },
  { name: "Apéro mousse", lieu: "Zone centrale", capacity: 350, time: "Samedi 17h30-18h30" },
  { name: "Holy Color", lieu: "Plage", capacity: 350, time: "Dimanche 18h-19h" },
  { name: "Feu d'artifice", lieu: "Plage", capacity: 350, time: "Dimanche 22h" },
];

function ActivitesTab({ b }: any) {
  return (
    <>
      {ACTIVITES.map((a) => (
        <Card key={a.name} title={a.name} icon={<Activity className="h-5 w-5 text-electric" />}>
          <Info k="Horaire" v={a.time} />
          <Info k="Lieu" v={a.lieu} />
          <Info k="Capacité" v={`${a.capacity} pers.`} />
          <div className="mt-3 flex gap-2">
            <button onClick={() => { actions.updateBracelet(b.id, { activites: { ...b.activites, [a.name]: "inscrit" } }); toast.success(`Inscrit à ${a.name}`); }}
              className="flex-1 rounded-lg gradient-electric py-2 text-sm font-semibold text-black">S'inscrire</button>
            <button onClick={() => { actions.addAlert({ type: "terrain", braceletId: b.id, prenom: b.prenom, lieu: a.lieu, priorite: "moyenne", notes: `Problème sur ${a.name}` }); toast("Problème signalé"); }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm">Signaler</button>
          </div>
        </Card>
      ))}
    </>
  );
}

function SoireesTab({ b }: any) {
  const remaining = b.tickets_conso.filter((t: any) => !t.used).length;
  return (
    <>
      <Card title="Soirées & tickets conso" icon={<Beer className="h-5 w-5 text-electric" />}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card/60 p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Tickets conso</div>
            <div className="display text-4xl text-electric mt-1">{remaining}/{b.tickets_conso.length}</div>
          </div>
          <div className="rounded-xl bg-card/60 p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Unité fort</div>
            <div className="display text-4xl text-electric mt-1">{b.unite_fort.used ? "0" : "1"}/1</div>
          </div>
        </div>
      </Card>

      <Card title="Mes tickets">
        <div className="space-y-2">
          {b.tickets_conso.map((t: any) => (
            <div key={t.id} className={`flex items-center justify-between rounded-lg p-3 ${t.used ? "bg-card/30 opacity-50" : "bg-electric/10 border border-electric/30"}`}>
              <div>
                <div className="font-semibold">Ticket conso {t.id}</div>
                <div className="text-xs text-muted-foreground">{t.used ? `Utilisé ${new Date(t.usedAt).toLocaleString("fr")} · ${t.lieu}` : "Disponible"}</div>
              </div>
              {!t.used && (
                <button onClick={() => { actions.useTicket(b.id, t.id); toast.success(`Ticket ${t.id} utilisé`); }}
                  className="rounded-lg gradient-electric px-3 py-1.5 text-sm font-semibold text-black">Utiliser</button>
              )}
            </div>
          ))}
          <div className={`flex items-center justify-between rounded-lg p-3 ${b.unite_fort.used ? "bg-card/30 opacity-50" : "bg-lycan/15 border border-lycan/40"}`}>
            <div>
              <div className="font-semibold">Unité alcool fort</div>
              <div className="text-xs text-muted-foreground">{b.unite_fort.used ? `Utilisée ${new Date(b.unite_fort.usedAt!).toLocaleString("fr")}` : "Disponible"}</div>
            </div>
            {!b.unite_fort.used && (
              <button onClick={() => { actions.useUniteFort(b.id); toast.success("Unité fort utilisée"); }}
                className="rounded-lg bg-lycan px-3 py-1.5 text-sm font-semibold text-white">Utiliser</button>
            )}
          </div>
        </div>
      </Card>

      <Card title="Historique consommations">
        <ul className="space-y-1 text-xs">
          {b.history.filter((h: any) => h.type.startsWith("conso")).map((h: any, i: number) => (
            <li key={i} className="rounded bg-card/40 px-3 py-2">
              <span className="text-electric">{new Date(h.ts).toLocaleTimeString("fr")}</span> — {h.detail}
            </li>
          ))}
          {!b.history.some((h: any) => h.type.startsWith("conso")) && <li className="text-muted-foreground">Aucune consommation enregistrée.</li>}
        </ul>
      </Card>
    </>
  );
}

const REPAS = [
  { id: "brunch_sam", label: "Brunch samedi 11h-13h" },
  { id: "encas_sam", label: "Encas samedi 14h-18h" },
  { id: "diner_sam", label: "Dîner samedi 19h-21h" },
  { id: "encas_soiree_sam", label: "Encas soirée 22h-4h" },
  { id: "brunch_dim", label: "Brunch dimanche 11h-13h" },
  { id: "diner_dim", label: "Dîner dimanche 19h-21h" },
];

function RepasTab({ b }: any) {
  return (
    <Card title="Restauration" icon={<UtensilsCrossed className="h-5 w-5 text-electric" />}>
      <div className="space-y-2">
        {REPAS.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg bg-card/40 p-3">
            <span className="text-sm">{r.label}</span>
            <button onClick={() => { actions.updateBracelet(b.id, { repas: { ...b.repas, [r.id]: !b.repas[r.id] } }); toast.success(b.repas[r.id] ? "Retiré" : "Repas récupéré"); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${b.repas[r.id] ? "bg-success text-white" : "gradient-electric text-black"}`}>
              {b.repas[r.id] ? "✓ Récupéré" : "Récupérer"}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <input placeholder="Régime alimentaire" className="rounded-md border border-border bg-background px-3 py-2" />
        <input placeholder="Allergies" className="rounded-md border border-border bg-background px-3 py-2" />
      </div>
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
              <div>
                <div className="font-semibold">{g.label}</div>
                {g.sizes && <div className="text-xs text-muted-foreground">Taille : {b.goodies[g.key]?.taille ?? "M"}</div>}
              </div>
              <button onClick={() => { actions.updateBracelet(b.id, { goodies: { ...b.goodies, [g.key]: { ...b.goodies[g.key], recupere: !got } } }); toast.success(got ? "Retiré" : `${g.label} récupéré`); }}
                disabled={got}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${got ? "bg-success text-white" : "gradient-electric text-black"}`}>
                {got ? "✓ Récupéré" : "Récupérer"}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const ZONES = [
  { x: 50, y: 20, label: "Accueil" }, { x: 30, y: 35, label: "Bungalows" }, { x: 70, y: 35, label: "Piscine" },
  { x: 85, y: 55, label: "Plage" }, { x: 20, y: 60, label: "Rivière / Canoë" }, { x: 55, y: 50, label: "Salle techno" },
  { x: 45, y: 70, label: "Bar/restau" }, { x: 75, y: 75, label: "Holy Color" }, { x: 25, y: 80, label: "PAPS" },
  { x: 60, y: 85, label: "Feu d'artifice" }, { x: 10, y: 20, label: "Parking" },
];

function CarteTab() {
  return (
    <Card title="Carte du camping Ty Nadan" icon={<Map className="h-5 w-5 text-electric" />}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-lycan/30 to-background border border-border">
        {/* Forest paths */}
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 75">
          <path d="M10 20 Q 30 40, 50 50 T 90 60" stroke="oklch(0.78 0.22 235)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
        </svg>
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
  { type: "bagarre", label: "Bagarre", color: "bg-red-600" },
  { type: "terrain", label: "Problème terrain", color: "bg-blue-700" },
  { type: "logement", label: "Problème logement", color: "bg-blue-600" },
  { type: "transport", label: "Problème transport", color: "bg-cyan-700" },
] as const;

function SecuriteTab({ b }: any) {
  return (
    <Card title="Signaler un incident" icon={<AlertTriangle className="h-5 w-5 text-danger" />}>
      <div className="grid grid-cols-2 gap-2">
        {ALERTS.map((a) => (
          <button key={a.type} onClick={() => { actions.addAlert({ type: a.type as any, braceletId: b.id, prenom: b.prenom, lieu: "À localiser", priorite: a.type === "SOS" ? "haute" : "moyenne", notes: a.label }); toast.success(`Alerte « ${a.label} » envoyée`); }}
            className={`${a.color} rounded-xl px-3 py-4 text-sm font-semibold text-white shadow-lg active:scale-95`}>
            {a.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

function MedicalTab({ b }: any) {
  const m = b.medical;
  return (
    <Card title="Mes infos médicales" icon={<Heart className="h-5 w-5 text-electric" />}>
      <div className="space-y-3">
        <Textarea label="Allergies" value={m.allergies} onChange={(v) => actions.updateBracelet(b.id, { medical: { ...m, allergies: v } })} />
        <Textarea label="Traitements" value={m.traitements} onChange={(v) => actions.updateBracelet(b.id, { medical: { ...m, traitements: v } })} />
        <Textarea label="Pathologies" value={m.pathologies} onChange={(v) => actions.updateBracelet(b.id, { medical: { ...m, pathologies: v } })} />
        <Field label="Contact d'urgence" value={m.contactUrgence} onChange={(v) => actions.updateBracelet(b.id, { medical: { ...m, contactUrgence: v } })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={m.consentement} onChange={(e) => actions.updateBracelet(b.id, { medical: { ...m, consentement: e.target.checked } })} className="h-4 w-4 accent-electric" />
          J'accepte que le staff PAPS consulte mes infos en cas d'urgence
        </label>
      </div>
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
    </div>
  );
}
function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
    </div>
  );
}

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
        {CONTACTS.map((c) => (
          <li key={c.name} className="flex items-center justify-between rounded-lg bg-card/40 p-3">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.role}</div>
            </div>
            <Phone className="h-4 w-4 text-electric" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-2 last:border-0">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{k}</span>
      <span className="text-sm">{v}</span>
    </div>
  );
}

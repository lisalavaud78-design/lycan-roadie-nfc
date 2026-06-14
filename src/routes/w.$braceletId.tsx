import { createFileRoute, notFound } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { useState, useMemo } from "react";
import { Ticket, Bus, Home, Calendar, Activity, Beer, UtensilsCrossed, ShoppingBag, Map, AlertTriangle, Heart, Phone, Zap, CheckCircle2, AlertOctagon, X, Check, Bell, RefreshCw, Coffee, Flame, PhoneCall, MapPin, Plus, ChevronRight } from "lucide-react";
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

      <div key={tab} className="animate-pop px-4 py-4 space-y-4">
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
  // QR déterministe (seedé par l'ID) — ne scintille plus à chaque render
  const qr = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < b.id.length; i++) seed = (seed * 31 + b.id.charCodeAt(i)) >>> 0;
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    return Array.from({ length: 144 }, () => rand() > 0.5);
  }, [b.id]);

  return (
    <Card title="Billet WEI Lycan" icon={<Ticket className="h-5 w-5 text-electric" />}>
      <div className="flex items-center justify-between rounded-xl border-2 border-(--ink) bg-success/15 p-4">
        <div>
          <div className="flex items-center gap-2 font-display font-extrabold text-success"><CheckCircle2 className="h-4 w-4" /> Billet valide</div>
          <div className="mt-1 text-xs font-medium text-muted-foreground">Highway to WEI — 5 au 8 sept 2025 — Ty Nadan</div>
        </div>
        <Zap className="h-8 w-8 text-electric" />
      </div>

      {/* Ticket-stub */}
      <div className="relative mt-4 overflow-hidden rounded-xl border-2 border-(--ink) bg-white">
        <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-(--ink) bg-card" />
        <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-(--ink) bg-card" />
        <div className="grid place-items-center p-6">
          <div className="grid grid-cols-12 gap-px rounded-md border-2 border-(--ink) bg-white p-2">
            {qr.map((on, i) => (
              <div key={i} className="aspect-square w-3" style={{ background: on ? "#0C1430" : "#fff" }} />
            ))}
          </div>
        </div>
        <div className="border-t-2 border-dashed border-(--ink) px-4 py-2.5 text-center font-display text-xs font-extrabold tracking-[0.2em] text-(--ink)">{b.id}</div>
      </div>

      <button onClick={() => { actions.updateBracelet(b.id, { checkin: { ...b.checkin, general: true } }); toast.success("Check-in général effectué"); }}
        disabled={b.checkin.general}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-(--ink) bg-accent py-3 font-extrabold text-(--ink) disabled:opacity-50">
        {b.checkin.general ? <><Check className="h-4 w-4" /> Check-in fait</> : "Check-in général"}
      </button>
    </Card>
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
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${b.checkin.bus ? "bg-success" : "bg-muted-foreground/40"}`} />
        {b.checkin.bus ? "Dans le bus" : "Hors bus"} — visible par l'organisation
      </div>
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
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-(--ink) bg-accent py-3 font-extrabold text-(--ink) disabled:opacity-50">
        {b.checkin.logement ? <><Check className="h-4 w-4" /> Logement validé</> : "Check-in logement"}
      </button>
    </Card>
  );
}

const PLANNING: { day: string; short: string; items: { t: string; title: string; zone: string; c: string; tag?: string; live?: boolean }[] }[] = [
  { day: "Vendredi 5 sept", short: "Ven", items: [
    { t: "08h00", title: "Départ bus campus Évry", zone: "Parking Télécom", c: "#FF6A1A", tag: "GO" },
    { t: "18h00", title: "Arrivée Ty Nadan", zone: "Accueil camping", c: "#2E6BFF" },
    { t: "19h00", title: "Check-in & bungalows", zone: "Bungalows", c: "#16B07A" },
    { t: "21h00", title: "Apéro d'accueil", zone: "Zone centrale", c: "#F4B400", tag: "BAR" },
  ] },
  { day: "Samedi 6 sept", short: "Sam", items: [
    { t: "11h00", title: "Brunch", zone: "Bar/restau", c: "#F4B400" },
    { t: "15h00", title: "Olympiades", zone: "Terrain central", c: "#FF6A1A", tag: "TEAM", live: true },
    { t: "17h30", title: "Apéro mousse", zone: "Zone centrale", c: "#FF4FA8", tag: "FUN" },
    { t: "22h00", title: "Grande soirée", zone: "Salle techno", c: "#7A4DFF", tag: "SOIRÉE" },
  ] },
  { day: "Dimanche 7 sept", short: "Dim", items: [
    { t: "11h00", title: "Brunch", zone: "Bar/restau", c: "#F4B400" },
    { t: "14h00", title: "Activités au choix", zone: "Zone funbreak", c: "#2E6BFF" },
    { t: "18h00", title: "Holy Color", zone: "Plage", c: "#FF4FA8", tag: "FUN" },
    { t: "22h00", title: "Feu d'artifice", zone: "Plage", c: "#FF6A1A", tag: "SHOW" },
    { t: "22h30", title: "Soirée", zone: "Salle techno", c: "#7A4DFF", tag: "SOIRÉE" },
  ] },
  { day: "Lundi 8 sept", short: "Lun", items: [
    { t: "10h00", title: "Check-out bungalows", zone: "Bungalows", c: "#16B07A" },
    { t: "12h00", title: "Repas midi", zone: "Bar/restau", c: "#F4B400" },
    { t: "14h00", title: "Départ bus retour", zone: "Parking", c: "#FF6A1A", tag: "GO" },
  ] },
];

function PlanningTab({ b }: any) {
  const [day, setDay] = useState(1); // Samedi par défaut (jour avec le créneau live)
  const d = PLANNING[day];
  return (
    <>
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-electric" />
        <h2 className="display text-xl">Le planning</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PLANNING.map((p, i) => (
          <button key={p.short} onClick={() => setDay(i)}
            className={`shrink-0 rounded-full border-2 border-(--ink) px-4 py-2 text-sm font-extrabold transition-colors ${i === day ? "bg-(--ink) text-white" : "bg-white text-(--ink) hover:bg-muted"}`}>
            {p.short}
          </button>
        ))}
      </div>

      <section className="glass rounded-2xl p-4">
        <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{d.day}</div>
        <div className="mt-3">
          {d.items.map((it, idx) => {
            const key = `${d.short}-${it.title}`;
            const status = b.activites[key] ?? null;
            const last = idx === d.items.length - 1;
            return (
              <div key={key} className="flex gap-3">
                <div className="w-12 shrink-0 pt-1 text-right font-display text-sm font-extrabold text-(--ink)">{it.t}</div>
                <div className="flex shrink-0 flex-col items-center">
                  <span className="relative mt-1 h-4 w-4">
                    {it.live && <span className="absolute -inset-1 rounded-full" style={{ background: it.c }}><span className="fest-ping absolute inset-0 rounded-full" style={{ background: it.c }} /></span>}
                    <span className="absolute inset-0 rounded-full border-[3px] border-(--ink)" style={{ background: it.c }} />
                  </span>
                  {!last && <span className="w-[3px] flex-1" style={{ background: "var(--muted)", minHeight: 22 }} />}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className={`rounded-xl border-2 border-(--ink) p-3 ${it.live ? "bg-secondary" : "bg-white"}`}>
                    {it.live && (
                      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-(--ink) px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-accent">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.c }} /> En ce moment
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-display text-[15px] font-extrabold leading-tight text-(--ink)">
                          {it.title}
                          {it.tag && <sup className="ml-1 text-[8px] font-extrabold tracking-wider" style={{ color: it.c }}>{it.tag}</sup>}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-muted-foreground">{it.zone}</div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex gap-1.5">
                      {([
                        { s: "inscrit", Icon: Check, on: "bg-success text-white" },
                        { s: "rappel", Icon: Bell, on: "bg-secondary text-(--ink)" },
                        { s: "absent", Icon: X, on: "bg-destructive text-white" },
                      ] as const).map(({ s, Icon, on }) => (
                        <button key={s} aria-label={s} onClick={() => actions.updateBracelet(b.id, { activites: { ...b.activites, [key]: status === s ? null : s } })}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-(--ink) transition-colors ${status === s ? on : "bg-white text-muted-foreground hover:bg-muted"}`}>
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                      <span className="ml-auto self-center text-xs font-bold text-muted-foreground">
                        {status === "inscrit" ? "Inscrit·e" : status === "rappel" ? "Rappel" : status === "absent" ? "Absent·e" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
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
  const total = b.tickets_conso.length;
  const remaining = b.tickets_conso.filter((t: any) => !t.used).length;
  const pct = total ? (remaining / total) * 100 : 0;
  const low = remaining <= 2;
  return (
    <>
      {/* Porte-monnaie conso */}
      <section className="rounded-2xl border-2 border-(--ink) bg-(--ink) p-5 hard-shadow">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-accent">
            <Beer className="h-3.5 w-3.5" /> Mes consos
          </span>
          <span className="font-display text-xs font-extrabold text-white/60">LYCAN WEI '25</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-black leading-none" style={{ color: low ? "#FF6A6A" : "var(--lime)" }}>{remaining}</span>
            <span className="text-sm font-bold text-white/70">/ {total} restants</span>
          </div>
          <button onClick={() => toast("Recharge dispo au bar central")}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-accent bg-accent px-4 py-2 text-sm font-extrabold text-(--ink) active:translate-y-0.5">
            <Plus className="h-4 w-4" /> Recharger
          </button>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full border-2 border-white/25 bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: low ? "#FF6A6A" : "var(--lime)" }} />
        </div>
        {low && <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#FFB4B4]"><AlertTriangle className="h-3.5 w-3.5" /> Plus que {remaining} ticket{remaining > 1 ? "s" : ""} — pense à recharger</div>}
      </section>

      {/* Tickets — style ticket-stub */}
      <Card title="Mes tickets" icon={<Ticket className="h-5 w-5 text-electric" />}>
        <div className="space-y-2.5">
          {b.tickets_conso.map((t: any) => (
            <div key={t.id} className={`relative flex items-center justify-between overflow-hidden rounded-xl border-2 border-(--ink) bg-white pl-4 pr-3 py-3 ${t.used ? "opacity-55" : ""}`}>
              <span className="absolute left-0 top-0 h-full w-2" style={{ background: t.used ? "var(--muted)" : "var(--lime)" }} />
              <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-(--ink) bg-background" />
              <div className="pl-2">
                <div className="font-display text-sm font-extrabold text-(--ink)">Ticket conso {t.id}</div>
                <div className="text-xs font-medium text-muted-foreground">{t.used ? `Utilisé ${new Date(t.usedAt).toLocaleString("fr")} · ${t.lieu}` : "Disponible"}</div>
              </div>
              {t.used
                ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Utilisé</span>
                : <button onClick={() => { actions.useTicket(b.id, t.id); toast.success(`Ticket ${t.id} utilisé`); }}
                    className="rounded-full border-2 border-(--ink) bg-accent px-4 py-1.5 text-sm font-extrabold text-(--ink) active:translate-y-0.5">Utiliser</button>}
            </div>
          ))}
          <div className={`relative flex items-center justify-between overflow-hidden rounded-xl border-2 border-(--ink) pl-4 pr-3 py-3 ${b.unite_fort.used ? "bg-white opacity-55" : "bg-secondary"}`}>
            <span className="absolute left-0 top-0 h-full w-2 bg-(--ink)" />
            <div className="pl-2">
              <div className="font-display text-sm font-extrabold text-(--ink)">Unité alcool fort</div>
              <div className="text-xs font-medium text-(--ink)/70">{b.unite_fort.used ? `Utilisée ${new Date(b.unite_fort.usedAt!).toLocaleString("fr")}` : "1 disponible"}</div>
            </div>
            {b.unite_fort.used
              ? <span className="inline-flex items-center gap-1 text-xs font-bold text-(--ink)/60"><Check className="h-4 w-4" /> Utilisée</span>
              : <button onClick={() => { actions.useUniteFort(b.id); toast.success("Unité fort utilisée"); }}
                  className="rounded-full border-2 border-(--ink) bg-(--ink) px-4 py-1.5 text-sm font-extrabold text-white active:translate-y-0.5">Utiliser</button>}
          </div>
        </div>
      </Card>

      <Card title="Historique" icon={<RefreshCw className="h-5 w-5 text-electric" />}>
        <ul className="space-y-1.5 text-xs">
          {b.history.filter((h: any) => h.type.startsWith("conso")).map((h: any, i: number) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border-2 border-(--ink)/10 bg-muted px-3 py-2">
              <span className="font-display font-extrabold text-electric">{new Date(h.ts).toLocaleTimeString("fr")}</span>
              <span className="font-medium text-(--ink)">{h.detail}</span>
            </li>
          ))}
          {!b.history.some((h: any) => h.type.startsWith("conso")) && (
            <li className="flex flex-col items-center gap-2 py-4 text-center text-muted-foreground">
              <Beer className="h-7 w-7 opacity-40" />
              <span className="font-medium">Aucune conso pour l'instant — la soirée commence bientôt</span>
            </li>
          )}
        </ul>
      </Card>
    </>
  );
}

const REPAS = [
  { id: "brunch_sam", day: "Samedi", label: "Brunch", time: "11h – 13h", icon: Coffee, c: "#F4B400" },
  { id: "encas_sam", day: "Samedi", label: "Encas", time: "14h – 18h", icon: Flame, c: "#FF6A1A" },
  { id: "diner_sam", day: "Samedi", label: "Dîner", time: "19h – 21h", icon: UtensilsCrossed, c: "#2E6BFF" },
  { id: "encas_soiree_sam", day: "Samedi", label: "Encas soirée", time: "22h – 4h", icon: Flame, c: "#7A4DFF" },
  { id: "brunch_dim", day: "Dimanche", label: "Brunch", time: "11h – 13h", icon: Coffee, c: "#F4B400" },
  { id: "diner_dim", day: "Dimanche", label: "Dîner", time: "19h – 21h", icon: UtensilsCrossed, c: "#16B07A" },
];

function RepasTab({ b }: any) {
  const next = REPAS.find((r) => !b.repas[r.id]);
  const days = Array.from(new Set(REPAS.map((r) => r.day)));
  return (
    <>
      {next && (
        <section className="rounded-2xl border-2 border-(--ink) bg-accent p-4 hard-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-(--ink)/70">Prochain repas</span>
            <next.icon className="h-5 w-5 text-(--ink)" />
          </div>
          <div className="mt-1 font-display text-2xl font-black text-(--ink)">{next.label} · {next.day}</div>
          <div className="text-sm font-bold text-(--ink)/70">{next.time} · Bar/restau central</div>
        </section>
      )}

      {days.map((day) => (
        <Card key={day} title={day} icon={<UtensilsCrossed className="h-5 w-5 text-electric" />}>
          <div className="space-y-2.5">
            {REPAS.filter((r) => r.day === day).map((r) => {
              const got = b.repas[r.id];
              const I = r.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border-2 border-(--ink) bg-white p-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-(--ink)" style={{ background: got ? "var(--muted)" : r.c }}><I className={`h-5 w-5 ${got ? "text-(--ink)/40" : "text-white"}`} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-extrabold text-(--ink)">{r.label}</div>
                    <div className="text-xs font-medium text-muted-foreground">{r.time}</div>
                  </div>
                  <button onClick={() => { actions.updateBracelet(b.id, { repas: { ...b.repas, [r.id]: !got } }); toast.success(got ? "Retiré" : "Repas récupéré"); }}
                    className={`inline-flex items-center gap-1 rounded-full border-2 border-(--ink) px-3.5 py-1.5 text-xs font-extrabold active:translate-y-0.5 ${got ? "bg-success text-white" : "bg-accent text-(--ink)"}`}>
                    {got ? <><Check className="h-3.5 w-3.5" /> Récupéré</> : "Récupérer"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card title="Mes préférences" icon={<Heart className="h-5 w-5 text-electric" />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Régime alimentaire</span>
            <input placeholder="Végé, sans porc…" className="mt-1 w-full rounded-lg border-2 border-(--ink) bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allergies</span>
            <input placeholder="Arachides, gluten…" className="mt-1 w-full rounded-lg border-2 border-(--ink) bg-white px-3 py-2 text-sm" />
          </label>
        </div>
      </Card>
    </>
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
            <div key={g.key} className={`flex items-center justify-between rounded-xl border-2 border-(--ink) p-3 ${got ? "bg-success/15" : "bg-white"}`}>
              <div>
                <div className="font-display text-sm font-extrabold text-(--ink)">{g.label}</div>
                {g.sizes && <div className="text-xs font-medium text-muted-foreground">Taille : {b.goodies[g.key]?.taille ?? "M"}</div>}
              </div>
              <button onClick={() => { actions.updateBracelet(b.id, { goodies: { ...b.goodies, [g.key]: { ...b.goodies[g.key], recupere: !got } } }); toast.success(got ? "Retiré" : `${g.label} récupéré`); }}
                disabled={got}
                className={`inline-flex items-center gap-1 rounded-full border-2 border-(--ink) px-3.5 py-1.5 text-xs font-extrabold active:translate-y-0.5 ${got ? "bg-success text-white" : "bg-accent text-(--ink)"}`}>
                {got ? <><Check className="h-3.5 w-3.5" /> Récupéré</> : "Récupérer"}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const ZONES = [
  { x: 50, y: 18, label: "Accueil", c: "#2E6BFF" }, { x: 28, y: 34, label: "Bungalows", c: "#16B07A" }, { x: 72, y: 32, label: "Piscine", c: "#2E6BFF" },
  { x: 86, y: 54, label: "Plage", c: "#F4B400" }, { x: 18, y: 58, label: "Canoë", c: "#16B07A" }, { x: 55, y: 48, label: "Salle techno", c: "#7A4DFF" },
  { x: 44, y: 70, label: "Bar/restau", c: "#F4B400" }, { x: 76, y: 76, label: "Holy Color", c: "#FF4FA8" }, { x: 24, y: 80, label: "PAPS", c: "#FF3B30" },
  { x: 62, y: 88, label: "Feu d'artifice", c: "#FF6A1A" }, { x: 12, y: 20, label: "Parking", c: "#0C1430" },
];

function CarteTab() {
  return (
    <Card title="Carte du camping Ty Nadan" icon={<Map className="h-5 w-5 text-electric" />}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-(--ink) bg-[#ECEFE6]">
        {/* dashed zones */}
        <div className="absolute left-[8%] top-[10%] h-[28%] w-[40%] rounded-2xl border-2 border-dashed border-(--ink)/15" />
        <div className="absolute right-[6%] top-[16%] h-[34%] w-[38%] rounded-2xl border-2 border-dashed border-(--ink)/15" />
        <div className="absolute bottom-[6%] left-[10%] h-[34%] w-[80%] rounded-2xl border-2 border-dashed border-(--ink)/15" />
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 75" preserveAspectRatio="none">
          <path d="M12 20 Q 35 42, 55 48 T 88 60" stroke="var(--ink)" strokeWidth="0.6" fill="none" strokeDasharray="2 2" />
        </svg>
        {ZONES.map((z) => (
          <div key={z.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-(--ink) bg-white px-2 py-1 hard-shadow-sm">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: z.c }} />
              <span className="whitespace-nowrap text-[10px] font-extrabold text-(--ink)">{z.label}</span>
            </div>
          </div>
        ))}
        {/* TOI marker */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: "40%", top: "60%" }}>
          <div className="relative mx-auto h-6 w-6">
            <span className="fest-ping absolute inset-0 rounded-full bg-electric opacity-40" />
            <span className="absolute inset-0 rounded-full border-[3px] border-(--ink) bg-electric" />
          </div>
          <div className="mt-1 -translate-x-1/2 rounded-full border-2 border-(--ink) bg-white px-2 py-0.5 text-center font-display text-[10px] font-black text-(--ink)">TOI</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[["#FF3B30", "Secours"], ["#F4B400", "Food"], ["#7A4DFF", "Soirée"], ["#16B07A", "Camping"]].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1.5 rounded-full border-2 border-(--ink) bg-white px-2.5 py-1 text-[11px] font-bold text-(--ink)">
            <span className="h-2 w-2 rounded-full" style={{ background: c as string }} /> {l}
          </span>
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

const DIRECT = [
  { name: "PC Sécurité", sub: "24h/24 · poste central", tel: "+33600000001", icon: AlertTriangle, bg: "#FF3B30" },
  { name: "Infirmerie (PAPS)", sub: "Village · à 80m de toi", tel: "+33600000002", icon: Heart, bg: "#0C1430" },
];

function SecuriteTab({ b }: any) {
  return (
    <>
      {/* SOS héros */}
      <section className="rounded-2xl border-2 border-(--ink) bg-white p-5 text-center hard-shadow">
        <div className="relative mx-auto h-40 w-40">
          <span className="fest-ping absolute inset-0 rounded-full bg-danger opacity-30" />
          <button onClick={() => { actions.addAlert({ type: "SOS", braceletId: b.id, prenom: b.prenom, lieu: "Position GPS", priorite: "haute", notes: "Bouton SOS pressé" }); toast.error("SOS envoyé — staff & infirmerie prévenus"); }}
            className="absolute inset-3 flex flex-col items-center justify-center rounded-full border-[3px] border-(--ink) bg-danger text-white active:translate-y-0.5"
            style={{ boxShadow: "0 6px 0 var(--ink)" }}>
            <AlertOctagon className="h-9 w-9" />
            <span className="mt-1 font-display text-lg font-black tracking-wide">SOS</span>
          </button>
        </div>
        <div className="mt-4 font-display text-base font-extrabold text-(--ink)">Appuie pour alerter</div>
        <div className="mt-1 text-xs font-medium text-muted-foreground">Le staff sécu &amp; l'infirmerie reçoivent ta position GPS en direct.</div>
      </section>

      {/* Contacts directs */}
      <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-(--ink)/60">Contacts directs</div>
      <div className="space-y-2.5">
        {DIRECT.map((c) => {
          const I = c.icon;
          return (
            <div key={c.name} className="flex items-center gap-3 rounded-xl border-2 border-(--ink) bg-white p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-(--ink)" style={{ background: c.bg }}><I className="h-5 w-5 text-white" /></span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-extrabold text-(--ink)">{c.name}</div>
                <div className="text-xs font-medium text-muted-foreground">{c.sub}</div>
              </div>
              <a href={`tel:${c.tel}`} aria-label={`Appeler ${c.name}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-(--ink) bg-accent text-(--ink) active:translate-y-0.5">
                <PhoneCall className="h-5 w-5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Incident précis */}
      <Card title="Signaler un incident" icon={<AlertTriangle className="h-5 w-5 text-danger" />}>
        <div className="grid grid-cols-2 gap-2">
          {ALERTS.filter((a) => a.type !== "SOS").map((a) => (
            <button key={a.type} onClick={() => { actions.addAlert({ type: a.type as any, braceletId: b.id, prenom: b.prenom, lieu: "À localiser", priorite: "moyenne", notes: a.label }); toast.success(`Alerte « ${a.label} » envoyée`); }}
              className={`${a.color} flex items-center gap-2 rounded-xl border-2 border-(--ink) px-3 py-3.5 text-left text-sm font-bold text-white active:translate-y-0.5`}>
              <AlertTriangle className="h-4 w-4 shrink-0 opacity-90" /> {a.label}
            </button>
          ))}
        </div>
      </Card>
    </>
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
  { name: "Barthélémy Ranchon", role: "Président", tel: "+33600000010" },
  { name: "Enzo Bect", role: "Trésorier", tel: "+33600000011" },
  { name: "Lucas Broussely", role: "Responsable événementiel", tel: "+33600000012" },
  { name: "Ines Tagliaferri", role: "Responsable sécurité-logistique", tel: "+33600000013" },
  { name: "Ismaël Lepage", role: "Tour leader", tel: "+33600000014" },
  { name: "Alexandre Goncalves", role: "Responsable sécurité Funbreak", tel: "+33600000015" },
  { name: "Franck Picaut", role: "Responsable secouriste", tel: "+33600000016" },
];
function ContactsTab() {
  const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <Card title="Contacts utiles" icon={<Phone className="h-5 w-5 text-electric" />}>
      <ul className="space-y-2.5">
        {CONTACTS.map((c, i) => {
          const colors = ["#FF6A1A", "#2E6BFF", "#FF4FA8", "#7A4DFF", "#16B07A", "#F4B400", "#FF3B30"];
          return (
            <li key={c.name} className="flex items-center gap-3 rounded-xl border-2 border-(--ink) bg-white p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--ink) font-display text-sm font-black text-white" style={{ background: colors[i % colors.length] }}>{initials(c.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-extrabold text-(--ink)">{c.name}</div>
                <div className="text-xs font-medium text-muted-foreground">{c.role}</div>
              </div>
              <a href={`tel:${c.tel}`} aria-label={`Appeler ${c.name}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-(--ink) bg-accent text-(--ink) active:translate-y-0.5">
                <PhoneCall className="h-5 w-5" />
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-(--ink)/10 py-2.5 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-right text-sm font-bold text-(--ink)">{v}</span>
    </div>
  );
}

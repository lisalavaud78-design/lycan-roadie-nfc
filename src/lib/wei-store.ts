// Local persistent store for LYCAN WEI NFC (no backend, localStorage based)
import { useSyncExternalStore } from "react";

export type Role = "participant" | "staff_bde" | "staff_bda" | "staff_asint" | "securite" | "paps" | "funbreak" | "vip" | "prestataire" | "bar";
export type School = "TSP" | "IMT-BS";

export interface StaffShift {
  id: string;
  date: string; // "Samedi 6 sept"
  debut: string; // "15:00"
  fin: string;
  mission: string;
  lieu: string;
  responsable: string;
  consignes: string;
  statut: "a_venir" | "en_cours" | "termine";
}

export interface Notif {
  id: string;
  ts: string;
  titre: string;
  text: string;
  lu: boolean;
  priorite: "info" | "urgent";
}

export interface Bracelet {
  id: string;
  url: string;
  prenom: string;
  nom: string;
  role: Role;
  ecole: School;
  bus: number | null;
  busAller: number | null;
  busAllerType: string | null;
  busRetour: number | null;
  busRetourType: string | null;
  bungalow: string | null;
  numLogement: string | null;
  colocataires: string[];
  equipe: string | null;
  zone: string | null;
  tickets_conso: { id: string; used: boolean; usedAt?: string; lieu?: string; soiree?: number }[];
  unite_fort: { used: boolean; usedAt?: string; lieu?: string };
  acces: string[];
  statut: "actif" | "inactif" | "perdu";
  checkin: { general: boolean; bus: boolean; busRetour: boolean; logement: boolean };
  goodies: Record<string, { recupere: boolean; taille?: string }>;
  medical: { allergies: string; traitements: string; pathologies: string; contactUrgence: string; consentement: boolean };
  activites: Record<string, "inscrit" | "absent" | "rappel" | null>;
  repas: Record<string, boolean>;
  history: { ts: string; type: string; detail: string }[];
  staffShifts: StaffShift[];
  notifications: Notif[];
}

export const BUS_TYPES = ["Welcome", "BDE / vieux", "M", "T", "A", "SP Pro", "ASINT"] as const;
export const DESTINATION_CONFIDENTIELLE = "Destination confidentielle révélée à l'arrivée";

export interface Alert {
  id: string;
  type: "SOS" | "malaise" | "blessure" | "piqure" | "harcelement" | "perdu" | "alcool" | "bagarre" | "terrain" | "logement" | "transport";
  braceletId: string;
  prenom: string;
  lieu: string;
  ts: string;
  priorite: "haute" | "moyenne" | "basse";
  statut: "ouverte" | "en_cours" | "cloturee";
  staffAssigne?: string;
  notes: string;
}

export type StaffGroup = "tous" | "securite" | "medical" | "bus" | "bar" | "activite" | "logement" | "bde" | "bda" | "asint" | "paps" | "goodies" | "restauration";

export interface StaffMessage {
  id: string;
  ts: string;
  from: string;
  to: StaffGroup;
  text: string;
  urgent?: boolean;
  lus?: number;
}

export interface ScanLog {
  id: string;
  ts: string;
  braceletId: string;
  prenom: string;
  type: "entree" | "ticket" | "fort" | "repas" | "goodies" | "activite" | "bus" | "logement" | "double_scan";
  lieu: string;
  ok: boolean;
  detail: string;
}

export interface ChatMessage {
  id: string;
  ts: string;
  role: "user" | "assistant";
  text: string;
}

// All 35 functional modules from the spec — each is a FIXED cost per event
export interface ModulesConfig {
  billet: boolean;
  identite: boolean;
  medical: boolean;
  urgence: boolean;
  partenaires: boolean;
  parking: boolean;
  plan: boolean;
  logistique: boolean;
  adn: boolean;
  parental: boolean;
  reseaux: boolean;
  reservations: boolean;
  transport: boolean;
  cashless: boolean;
  coordonnees_pro: boolean;
  carte_visite: boolean;
  carte_vitale: boolean;
  directives_medicales: boolean;
  contact_senior: boolean;
  tuteur: boolean;
  plan_soin: boolean;
  carte_etudiante: boolean;
  planning: boolean;
  acces_batiment: boolean;
  cv: boolean;
  linkedin: boolean;
  photos: boolean;
  reservation_salle: boolean;
  certif_medical: boolean;
  carte_grise: boolean;
  assurance: boolean;
  carnet_entretien: boolean;
  passeport_num: boolean;
  portfolio: boolean;
  site_web: boolean;
}

export interface WeiState {
  config: {
    nbParticipants: number;
    nbStaff: number;
    nbBus: number;
    ticketsConsoParPart: number;
    uniteFortParPart: number;
    designColor: string;
  };
  modules: ModulesConfig;
  bracelets: Bracelet[];
  alerts: Alert[];
  messages: StaffMessage[];
  scans: ScanLog[];
  chat: ChatMessage[];
}

const STORAGE_KEY = "lycan-wei-state-v5";

const PRENOMS = ["Lucas", "Emma", "Hugo", "Léa", "Nathan", "Chloé", "Tom", "Sarah", "Jules", "Manon", "Théo", "Camille", "Antoine", "Inès", "Maxime", "Clara", "Paul", "Louise", "Arthur", "Alice", "Ethan", "Romane", "Adam", "Jade", "Raphaël", "Mila", "Léo", "Anaïs", "Gabriel", "Eva"];
const NOMS = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Richard", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randId(prefix = "NFC") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function makeStaffShifts(role: Role): StaffShift[] {
  const base: Omit<StaffShift, "id" | "statut">[] = role === "paps" ? [
    { date: "Samedi 6 sept", debut: "14:00", fin: "20:00", mission: "Poste PAPS principal", lieu: "Tente médicale centrale", responsable: "Franck Picaut", consignes: "Surveillance olympiades + apéro mousse" },
    { date: "Samedi 6 sept", debut: "22:00", fin: "04:00", mission: "Poste PAPS soirée", lieu: "Soirée principale", responsable: "Franck Picaut", consignes: "Veille alcoolisation, malaises" },
  ] : role === "securite" ? [
    { date: "Vendredi 5 sept", debut: "18:00", fin: "23:00", mission: "Sécurité arrivée", lieu: "Entrée camping", responsable: "Inès Tagliaferri", consignes: "Contrôle bracelets + accueil" },
    { date: "Samedi 6 sept", debut: "22:00", fin: "04:00", mission: "Sécurité soirée", lieu: "Soirée techno", responsable: "Inès Tagliaferri", consignes: "Rondes, anti-intrusion, écoute radio" },
  ] : role === "bar" ? [
    { date: "Samedi 6 sept", debut: "22:00", fin: "04:00", mission: "Tenue bar central", lieu: "Bar central", responsable: "BDE", consignes: "Scan tickets conso, gestion unité fort" },
  ] : [
    { date: "Vendredi 5 sept", debut: "07:00", fin: "19:00", mission: "Encadrement bus", lieu: "Parking TSP → Ty Nadan", responsable: "Ismaël Lepage", consignes: "Appel, sécurité bus, pauses" },
    { date: "Samedi 6 sept", debut: "11:00", fin: "13:00", mission: "Brunch", lieu: "Salle restauration", responsable: "Lucas Broussely", consignes: "Service + check allergies" },
    { date: "Samedi 6 sept", debut: "15:00", fin: "16:30", mission: "Olympiades", lieu: "Terrain central", responsable: "BDA", consignes: "Animation jeux par équipe" },
  ];
  return base.map((s, i) => ({ ...s, id: `SH-${i}`, statut: i === 0 ? "termine" : i === 1 ? "en_cours" : "a_venir" }));
}

export function makeBracelet(role: Role, idx: number): Bracelet {
  const id = randId(role === "participant" ? "NFC" : "STF");
  const prenom = rand(PRENOMS);
  const nom = rand(NOMS);
  const ecole: School = Math.random() < 0.6 ? "TSP" : "IMT-BS";
  const isPart = role === "participant";
  const busAller = isPart ? (idx % 6) + 1 : null;
  const busRetour = isPart ? ((idx + 2) % 6) + 1 : null;
  const bungalow = isPart ? `B${String(Math.floor(idx / 5) + 1).padStart(2, "0")}` : null;
  // colocataires mock — generate 3-4 fake first names
  const coloc = isPart ? Array.from({ length: 3 + (idx % 2) }, () => `${rand(PRENOMS)} ${rand(NOMS)[0]}.`) : [];
  return {
    id,
    url: `https://lycan-wei-nfc.app/${isPart ? "w" : "s"}/${id}`,
    prenom,
    nom,
    role,
    ecole,
    bus: busAller,
    busAller,
    busAllerType: busAller != null ? BUS_TYPES[(idx % BUS_TYPES.length)] : null,
    busRetour,
    busRetourType: busRetour != null ? BUS_TYPES[((idx + 3) % BUS_TYPES.length)] : null,
    bungalow,
    numLogement: bungalow,
    colocataires: coloc,
    equipe: isPart ? `Équipe ${["Volt", "Storm", "Riff", "Nova", "Howl", "Steel"][idx % 6]}` : null,
    zone: isPart ? null : ["Bar central", "Soirée techno", "Bungalows B", "Entrée camping", "PAPS", "Funbreak"][idx % 6],
    tickets_conso: isPart ? [1, 2, 3].map((n) => ({ id: `T${n}`, used: false, soiree: n <= 2 ? 1 : 2 })) : [],
    unite_fort: { used: false },
    acces: isPart ? ["soiree", "activites", "repas"] : ["soiree", "activites", "repas", "backstage", "staff"],
    statut: "actif",
    checkin: { general: false, bus: false, busRetour: false, logement: false },
    goodies: { tshirt: { recupere: false, taille: "M" }, bob: { recupere: false }, bandana: { recupere: false }, ecocup: { recupere: false }, sac: { recupere: false } },
    medical: { allergies: "", traitements: "", pathologies: "", contactUrgence: "", consentement: false },
    activites: {},
    repas: {},
    history: [{ ts: new Date().toISOString(), type: "creation", detail: "Bracelet généré" }],
    staffShifts: isPart ? [] : makeStaffShifts(role),
    notifications: isPart ? [] : [
      { id: "N1", ts: new Date(Date.now() - 30 * 60_000).toISOString(), titre: "Briefing 21h", text: "Brief général staff salle principale.", lu: false, priorite: "info" },
      { id: "N2", ts: new Date(Date.now() - 10 * 60_000).toISOString(), titre: "Renfort demandé", text: "Renfort sécurité scène techno.", lu: false, priorite: "urgent" },
    ],
  };
}

function seed(): WeiState {
  const config = { nbParticipants: 350, nbStaff: 40, nbBus: 6, ticketsConsoParPart: 3, uniteFortParPart: 1, designColor: "electric" };
  const modules: ModulesConfig = {
    billet: true, identite: true, medical: true, urgence: true, partenaires: false, parking: true,
    plan: true, logistique: true, adn: false, parental: false, reseaux: false, reservations: true,
    transport: true, cashless: true, coordonnees_pro: false, carte_visite: false, carte_vitale: false,
    directives_medicales: false, contact_senior: false, tuteur: false, plan_soin: false,
    carte_etudiante: false, planning: true, acces_batiment: false, cv: false, linkedin: false,
    photos: true, reservation_salle: false, certif_medical: false, carte_grise: false,
    assurance: false, carnet_entretien: false, passeport_num: false, portfolio: false, site_web: false,
  };
  const bracelets: Bracelet[] = [];
  for (let i = 0; i < 60; i++) bracelets.push(makeBracelet("participant", i));
  const staffRoles: Role[] = ["staff_bde", "staff_bde", "staff_bde", "staff_bda", "staff_bda", "staff_asint", "staff_asint", "securite", "securite", "paps", "paps", "funbreak", "bar", "bar"];
  staffRoles.forEach((r, i) => bracelets.push(makeBracelet(r, i)));

  // Seed some used tickets / consumption for live realism
  for (let i = 0; i < 20; i++) {
    const b = bracelets[i];
    b.tickets_conso[0].used = true;
    b.tickets_conso[0].usedAt = new Date(Date.now() - Math.random() * 4 * 3600_000).toISOString();
    b.tickets_conso[0].lieu = ["Bar central", "Bar techno", "Bar pop/rap"][i % 3];
    if (i < 10) {
      b.tickets_conso[1].used = true;
      b.tickets_conso[1].usedAt = new Date(Date.now() - Math.random() * 2 * 3600_000).toISOString();
      b.tickets_conso[1].lieu = "Bar central";
    }
    if (i < 5) {
      b.unite_fort.used = true;
      b.unite_fort.usedAt = new Date(Date.now() - Math.random() * 3600_000).toISOString();
      b.unite_fort.lieu = "Bar central";
    }
    b.checkin.general = true;
    if (i < 40) b.checkin.bus = true;
    if (i < 35) b.checkin.logement = true;
  }
  // Seed some medical info
  bracelets[2].medical.allergies = "Arachides, fruits à coque";
  bracelets[5].medical.traitements = "Ventoline (asthme)";
  bracelets[8].medical.allergies = "Pénicilline";
  bracelets[12].medical.traitements = "Antihistaminique";

  // Seed alerts
  const alerts: Alert[] = [
    { id: "AL-1", type: "malaise", braceletId: bracelets[3].id, prenom: bracelets[3].prenom, lieu: "Soirée techno", ts: new Date(Date.now() - 25 * 60_000).toISOString(), priorite: "haute", statut: "en_cours", notes: "Malaise, prise en charge PAPS", staffAssigne: "PAPS-2" },
    { id: "AL-2", type: "perdu", braceletId: bracelets[7].id, prenom: bracelets[7].prenom, lieu: "Camping zone B", ts: new Date(Date.now() - 60 * 60_000).toISOString(), priorite: "moyenne", statut: "ouverte", notes: "Personne perdue, recherche en cours" },
    { id: "AL-3", type: "logement", braceletId: bracelets[11].id, prenom: bracelets[11].prenom, lieu: "Bungalow B05", ts: new Date(Date.now() - 90 * 60_000).toISOString(), priorite: "basse", statut: "cloturee", notes: "Problème de clé résolu" },
    { id: "AL-4", type: "alcool", braceletId: bracelets[15].id, prenom: bracelets[15].prenom, lieu: "Bar central", ts: new Date(Date.now() - 10 * 60_000).toISOString(), priorite: "moyenne", statut: "ouverte", notes: "Alcoolisation excessive signalée par le bar" },
    { id: "AL-5", type: "blessure", braceletId: bracelets[18].id, prenom: bracelets[18].prenom, lieu: "Taureau mécanique", ts: new Date(Date.now() - 3 * 3600_000).toISOString(), priorite: "moyenne", statut: "cloturee", notes: "Petite entorse, soins PAPS" },
    { id: "AL-6", type: "piqure", braceletId: bracelets[22].id, prenom: bracelets[22].prenom, lieu: "Soirée pop/rap", ts: new Date(Date.now() - 45 * 60_000).toISOString(), priorite: "haute", statut: "en_cours", notes: "Suspicion piqûre, protocole déclenché" },
  ];

  // Seed messages staff
  const messages: StaffMessage[] = [
    { id: "M-1", ts: new Date(Date.now() - 5 * 60_000).toISOString(), from: "Coord BDE", to: "tous", text: "Briefing staff 21h salle principale." },
    { id: "M-2", ts: new Date(Date.now() - 15 * 60_000).toISOString(), from: "Bar central", to: "bar", text: "Plus de bières blondes, reset stock 22h." },
    { id: "M-3", ts: new Date(Date.now() - 30 * 60_000).toISOString(), from: "PAPS", to: "securite", text: "Renfort demandé zone scène techno." },
    { id: "M-4", ts: new Date(Date.now() - 60 * 60_000).toISOString(), from: "Bus 3", to: "tous", text: "Tous les passagers présents, départ OK." },
  ];

  // Seed scan logs
  const scans: ScanLog[] = [];
  for (let i = 0; i < 25; i++) {
    const b = bracelets[Math.floor(Math.random() * 40)];
    const types: ScanLog["type"][] = ["ticket", "entree", "repas", "fort", "bus", "ticket", "ticket"];
    const t = types[i % types.length];
    scans.push({
      id: `S-${i}`,
      ts: new Date(Date.now() - i * 7 * 60_000).toISOString(),
      braceletId: b.id, prenom: b.prenom,
      type: t,
      lieu: ["Bar central", "Bar techno", "Bar pop/rap", "Entrée soirée", "Cantine"][i % 5],
      ok: i % 13 !== 0,
      detail: t === "ticket" ? "Ticket conso utilisé" : t === "fort" ? "Unité fort utilisée" : t === "entree" ? "Entrée soirée" : t === "repas" ? "Repas récupéré" : "Scan bus",
    });
  }

  return {
    config, modules, bracelets, alerts, messages, scans,
    chat: [{
      id: "msg-0", ts: new Date().toISOString(), role: "assistant",
      text: "Salut ! Je suis l'assistant IA du WEI Lycan. Dis-moi ce que tu veux configurer : nombre de participants, bus, tickets conso, modules NFC, génération de bracelets, devis…"
    }],
  };
}

let state: WeiState = (() => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  return s;
})();

const listeners = new Set<() => void>();
function emit() {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }
  listeners.forEach((l) => l());
}

export const weiStore = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  set: (updater: (s: WeiState) => WeiState) => { state = updater(state); emit(); },
  reset: () => { state = seed(); emit(); },
};

export function useWei<T>(selector: (s: WeiState) => T): T {
  return useSyncExternalStore(weiStore.subscribe, () => selector(state), () => selector(state));
}

function logScan(s: WeiState, scan: Omit<ScanLog, "id" | "ts">): ScanLog[] {
  return [{ ...scan, id: `S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: new Date().toISOString() }, ...s.scans].slice(0, 500);
}

// Actions
export const actions = {
  setConfig(patch: Partial<WeiState["config"]>) {
    weiStore.set((s) => ({ ...s, config: { ...s.config, ...patch } }));
  },
  setModule(key: keyof ModulesConfig, value: boolean) {
    weiStore.set((s) => ({ ...s, modules: { ...s.modules, [key]: value } }));
  },
  generateBracelets(role: Role, n: number) {
    weiStore.set((s) => {
      const existing = s.bracelets.filter((b) => b.role === role).length;
      const newOnes = Array.from({ length: n }, (_, i) => makeBracelet(role, existing + i));
      return { ...s, bracelets: [...s.bracelets, ...newOnes] };
    });
  },
  updateBracelet(id: string, patch: Partial<Bracelet>) {
    weiStore.set((s) => ({ ...s, bracelets: s.bracelets.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  },
  deleteBracelet(id: string) {
    weiStore.set((s) => ({ ...s, bracelets: s.bracelets.filter((b) => b.id !== id) }));
  },
  useTicket(braceletId: string, ticketId: string, lieu = "Bar central") {
    weiStore.set((s) => {
      const b = s.bracelets.find((x) => x.id === braceletId);
      if (!b) return s;
      const t = b.tickets_conso.find((x) => x.id === ticketId);
      if (!t) return s;
      if (t.used) {
        return { ...s, scans: logScan(s, { braceletId, prenom: b.prenom, type: "double_scan", lieu, ok: false, detail: `Tentative de double scan ticket ${ticketId}` }) };
      }
      return {
        ...s,
        bracelets: s.bracelets.map((bb) => bb.id !== braceletId ? bb : {
          ...bb,
          tickets_conso: bb.tickets_conso.map((x) => (x.id === ticketId ? { ...x, used: true, usedAt: new Date().toISOString(), lieu } : x)),
          history: [...bb.history, { ts: new Date().toISOString(), type: "conso", detail: `Ticket ${ticketId} utilisé à ${lieu}` }],
        }),
        scans: logScan(s, { braceletId, prenom: b.prenom, type: "ticket", lieu, ok: true, detail: `Ticket ${ticketId} utilisé` }),
      };
    });
  },
  useUniteFort(braceletId: string, lieu = "Bar central") {
    weiStore.set((s) => {
      const b = s.bracelets.find((x) => x.id === braceletId);
      if (!b) return s;
      if (b.unite_fort.used) {
        return { ...s, scans: logScan(s, { braceletId, prenom: b.prenom, type: "double_scan", lieu, ok: false, detail: "Tentative double scan unité fort" }) };
      }
      return {
        ...s,
        bracelets: s.bracelets.map((bb) => bb.id !== braceletId ? bb : {
          ...bb,
          unite_fort: { used: true, usedAt: new Date().toISOString(), lieu },
          history: [...bb.history, { ts: new Date().toISOString(), type: "conso_fort", detail: `Unité fort utilisée à ${lieu}` }],
        }),
        scans: logScan(s, { braceletId, prenom: b.prenom, type: "fort", lieu, ok: true, detail: "Unité fort utilisée" }),
      };
    });
  },
  scanEntree(braceletId: string, lieu = "Entrée soirée") {
    weiStore.set((s) => {
      const b = s.bracelets.find((x) => x.id === braceletId);
      if (!b) return { ...s, scans: logScan(s, { braceletId, prenom: "?", type: "entree", lieu, ok: false, detail: "Bracelet inconnu" }) };
      return { ...s, scans: logScan(s, { braceletId, prenom: b.prenom, type: "entree", lieu, ok: true, detail: "Entrée OK" }) };
    });
  },
  addAlert(a: Omit<Alert, "id" | "ts" | "statut">) {
    weiStore.set((s) => ({
      ...s,
      alerts: [{ ...a, id: `AL-${Date.now()}`, ts: new Date().toISOString(), statut: "ouverte" }, ...s.alerts],
    }));
  },
  updateAlert(id: string, patch: Partial<Alert>) {
    weiStore.set((s) => ({ ...s, alerts: s.alerts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  },
  deleteAlert(id: string) {
    weiStore.set((s) => ({ ...s, alerts: s.alerts.filter((a) => a.id !== id) }));
  },
  sendMessage(m: Omit<StaffMessage, "id" | "ts">) {
    weiStore.set((s) => ({ ...s, messages: [{ ...m, id: `M-${Date.now()}`, ts: new Date().toISOString() }, ...s.messages] }));
  },
  pushChat(m: Omit<ChatMessage, "id" | "ts">) {
    weiStore.set((s) => ({ ...s, chat: [...s.chat, { ...m, id: `C-${Date.now()}-${Math.random()}`, ts: new Date().toISOString() }] }));
  },
  editChat(id: string, text: string) {
    weiStore.set((s) => ({ ...s, chat: s.chat.map((c) => (c.id === id ? { ...c, text } : c)) }));
  },
  resetAll() { weiStore.reset(); },
};

// Pricing — FIXED costs per event (not multiplied by bracelets)
export const PRICES: Record<keyof ModulesConfig, number> = {
  billet: 5, identite: 3, medical: 10, urgence: 5, partenaires: 3, parking: 3,
  plan: 3, logistique: 3, adn: 7, parental: 3, reseaux: 2, reservations: 2,
  transport: 4, cashless: 10, coordonnees_pro: 7, carte_visite: 2, carte_vitale: 10,
  directives_medicales: 6, contact_senior: 3, tuteur: 4, plan_soin: 4,
  carte_etudiante: 2, planning: 2, acces_batiment: 4, cv: 2, linkedin: 2,
  photos: 8, reservation_salle: 3, certif_medical: 3, carte_grise: 10,
  assurance: 10, carnet_entretien: 6, passeport_num: 10, portfolio: 3, site_web: 2,
};

export const MODULE_LABELS: Record<keyof ModulesConfig, string> = {
  billet: "Billet & accès coupe-file",
  identite: "Identité du participant",
  medical: "Infos médicales",
  urgence: "Contact d'urgence",
  partenaires: "Réductions partenaires",
  parking: "Accès parking / camping",
  plan: "Plan interactif",
  logistique: "Infos logistiques",
  adn: "Document ADN",
  parental: "Autorisation parentale",
  reseaux: "Lien réseaux sociaux",
  reservations: "Réservations",
  transport: "Informations transport",
  cashless: "Paiement cashless",
  coordonnees_pro: "Coordonnées professionnelles",
  carte_visite: "Carte de visite numérique",
  carte_vitale: "Carte Vitale numérique",
  directives_medicales: "Directives médicales",
  contact_senior: "Contact établissement senior",
  tuteur: "Numéro du tuteur",
  plan_soin: "Plan de soin",
  carte_etudiante: "Carte étudiante",
  planning: "Emploi du temps",
  acces_batiment: "Accès bâtiment",
  cv: "CV",
  linkedin: "LinkedIn",
  photos: "Photos événement",
  reservation_salle: "Réservation de salle",
  certif_medical: "Certificat médical",
  carte_grise: "Carte grise",
  assurance: "Assurance",
  carnet_entretien: "Carnet d'entretien",
  passeport_num: "Passeport numérique",
  portfolio: "Portfolio",
  site_web: "Site web",
};

export const MODULE_CATEGORIES: Record<string, (keyof ModulesConfig)[]> = {
  "Événement WEI": ["billet", "identite", "medical", "urgence", "parking", "plan", "logistique", "reservations", "transport", "cashless", "photos", "partenaires", "parental", "reseaux"],
  "Étudiant": ["carte_etudiante", "planning", "acces_batiment", "cv", "linkedin", "reservation_salle", "certif_medical"],
  "Professionnel": ["coordonnees_pro", "carte_visite", "portfolio", "site_web"],
  "Santé": ["carte_vitale", "directives_medicales", "plan_soin"],
  "Senior": ["contact_senior", "tuteur"],
  "Véhicule": ["carte_grise", "assurance", "carnet_entretien", "passeport_num"],
  "Spécial": ["adn"],
};

export function computeQuote(s: WeiState) {
  const activeModules = (Object.keys(s.modules) as (keyof ModulesConfig)[]).filter((k) => s.modules[k]);

  // FIXED option costs — each module is a one-time fee per event
  const optionsFixes = activeModules.reduce((sum, k) => sum + PRICES[k], 0);

  // Variable per-bracelet matter costs
  const totalBracelets = s.config.nbParticipants + s.config.nbStaff;
  const tissuUnit = 0.89;
  const tissuCost = totalBracelets * tissuUnit;
  const chipUnit = totalBracelets >= 1000 ? 0.2 : totalBracelets >= 500 ? 0.3 : totalBracelets >= 100 ? 0.4 : 0.5;
  const chipCost = totalBracelets * chipUnit;
  const impressionUnit = 0.2;
  const impressionCost = totalBracelets * impressionUnit;
  const matiere = tissuCost + chipCost + impressionCost;

  const totalHT = optionsFixes + matiere;
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;
  const marge = totalHT - matiere;
  const coutParParticipant = totalTTC / Math.max(s.config.nbParticipants, 1);
  const coutParBracelet = totalTTC / Math.max(totalBracelets, 1);

  return {
    activeModules,
    optionsFixes,
    totalBracelets,
    tissuUnit, tissuCost,
    chipUnit, chipCost,
    impressionUnit, impressionCost,
    matiere,
    totalHT,
    tva,
    totalTTC,
    marge,
    coutParParticipant,
    coutParBracelet,
  };
}

// IA simulator
export function processAICommand(input: string): { reply: string; actions: string[] } {
  const t = input.toLowerCase();
  const acts: string[] = [];
  let reply = "";

  const nbMatch = t.match(/(\d+)\s*(participant|bracelet|bus|staff|sécurité|securite|conso|ticket)/);

  if (/participant/.test(t) && nbMatch) {
    const n = parseInt(nbMatch[1]);
    actions.setConfig({ nbParticipants: n });
    acts.push(`Participants → ${n}`);
    reply = `J'ai mis à jour le nombre de participants à ${n}. Devis recalculé automatiquement.`;
  } else if (/bus/.test(t) && nbMatch) {
    const n = parseInt(nbMatch[1]);
    actions.setConfig({ nbBus: n });
    acts.push(`Bus → ${n}`);
    reply = `OK, ${n} bus configurés (capacité 60 places chacun).`;
  } else if (/staff|sécurité|securite/.test(t) && nbMatch) {
    const n = parseInt(nbMatch[1]);
    actions.setConfig({ nbStaff: n });
    acts.push(`Staff → ${n}`);
    reply = `Staff mis à jour à ${n} bracelets.`;
  } else if (/ticket|conso/.test(t) && nbMatch) {
    const n = parseInt(nbMatch[1]);
    const fort = t.match(/(\d+)\s*(unit|fort|alcool)/);
    actions.setConfig({ ticketsConsoParPart: n, ...(fort && { uniteFortParPart: parseInt(fort[1]) }) });
    acts.push(`${n} tickets conso${fort ? ` + ${fort[1]} unité fort` : ""}`);
    reply = `Configuration conso : ${n} tickets par participant${fort ? ` + ${fort[1]} unité d'alcool fort` : ""}.`;
  } else if (/médical|medical|fiche/.test(t)) {
    actions.setModule("medical", true);
    acts.push("Module médical activé");
    reply = "Fiche médicale activée (+10€ fixe au devis).";
  } else if (/cashless|paiement/.test(t)) {
    actions.setModule("cashless", true);
    acts.push("Cashless activé");
    reply = "Paiement cashless activé (+10€ fixe au devis).";
  } else if (/soir[ée]e|accès soirée/.test(t)) {
    actions.setModule("billet", true);
    acts.push("Accès soirée activé");
    reply = "Accès soirée configuré via le module billet.";
  } else if (/devis|génér.*devis/.test(t)) {
    const q = computeQuote(state);
    reply = `Devis : ${q.activeModules.length} options fixes (${q.optionsFixes}€) + matière ${q.matiere.toFixed(0)}€ = ${q.totalHT.toFixed(0)}€ HT, ${q.totalTTC.toFixed(0)}€ TTC. Coût/pers : ${q.coutParParticipant.toFixed(2)}€.`;
    acts.push("Devis recalculé");
  } else if (/génér.*bracelet/.test(t)) {
    const current = state.bracelets.filter((b) => b.role === "participant").length;
    const need = state.config.nbParticipants - current;
    if (need > 0) actions.generateBracelets("participant", need);
    acts.push(`${need > 0 ? need : 0} bracelets générés`);
    reply = `Bracelets participants prêts : ${state.config.nbParticipants} au total. URLs NFC générées.`;
  } else if (/design|couleur|bleu/.test(t)) {
    actions.setConfig({ designColor: "electric" });
    acts.push("Design → bleu électrique");
    reply = "Design bracelet passé en bleu électrique Lycan.";
  } else {
    reply = "Je n'ai pas reconnu la commande exacte, mais essaie : « passe à 420 participants », « ajoute 6 bus », « active les fiches médicales », « génère le devis », « génère les bracelets ».";
  }
  return { reply, actions: acts };
}

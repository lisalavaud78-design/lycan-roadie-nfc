// Local persistent store for LYCAN WEI NFC (no backend, localStorage based)
import { useSyncExternalStore } from "react";

export type Role = "participant" | "staff_bde" | "staff_bda" | "staff_asint" | "securite" | "paps" | "funbreak" | "vip" | "prestataire";
export type School = "TSP" | "IMT-BS";

export interface Bracelet {
  id: string;
  url: string;
  prenom: string;
  nom: string;
  role: Role;
  ecole: School;
  bus: number | null;
  bungalow: string | null;
  equipe: string | null;
  tickets_conso: { id: string; used: boolean; usedAt?: string; lieu?: string }[];
  unite_fort: { used: boolean; usedAt?: string; lieu?: string };
  acces: string[];
  statut: "actif" | "inactif" | "perdu";
  checkin: { general: boolean; bus: boolean; logement: boolean };
  goodies: Record<string, { recupere: boolean; taille?: string }>;
  medical: { allergies: string; traitements: string; pathologies: string; contactUrgence: string; consentement: boolean };
  activites: Record<string, "inscrit" | "absent" | "rappel" | null>;
  repas: Record<string, boolean>;
  history: { ts: string; type: string; detail: string }[];
}

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

export interface StaffMessage {
  id: string;
  ts: string;
  from: string;
  to: "tous" | "securite" | "medical" | "bus" | "bar" | "activite";
  text: string;
}

export interface ChatMessage {
  id: string;
  ts: string;
  role: "user" | "assistant";
  text: string;
}

export interface ModulesConfig {
  billet: boolean;
  identite: boolean;
  medical: boolean;
  urgence: boolean;
  partenaires: boolean;
  parking: boolean;
  plan: boolean;
  logistique: boolean;
  parental: boolean;
  reservations: boolean;
  transport: boolean;
  cashless: boolean;
  carte_etudiante: boolean;
  planning: boolean;
  photos: boolean;
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
  chat: ChatMessage[];
}

const STORAGE_KEY = "lycan-wei-state-v1";

const PRENOMS = ["Lucas", "Emma", "Hugo", "Léa", "Nathan", "Chloé", "Tom", "Sarah", "Jules", "Manon", "Théo", "Camille", "Antoine", "Inès", "Maxime", "Clara", "Paul", "Louise", "Arthur", "Alice", "Ethan", "Romane", "Adam", "Jade", "Raphaël", "Mila", "Léo", "Anaïs", "Gabriel", "Eva"];
const NOMS = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Richard", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randId(prefix = "NFC") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function makeBracelet(role: Role, idx: number): Bracelet {
  const id = randId(role === "participant" ? "NFC" : "STF");
  const prenom = rand(PRENOMS);
  const nom = rand(NOMS);
  const ecole: School = Math.random() < 0.6 ? "TSP" : "IMT-BS";
  const isPart = role === "participant";
  return {
    id,
    url: `https://lycan-wei-nfc.app/w/${id}`,
    prenom,
    nom,
    role,
    ecole,
    bus: isPart ? (idx % 6) + 1 : null,
    bungalow: isPart ? `B${String(Math.floor(idx / 5) + 1).padStart(2, "0")}` : null,
    equipe: isPart ? `Équipe ${["Volt", "Storm", "Riff", "Nova", "Howl", "Steel"][idx % 6]}` : null,
    tickets_conso: isPart ? [1, 2, 3].map((n) => ({ id: `T${n}`, used: false })) : [],
    unite_fort: { used: false },
    acces: isPart ? ["soiree", "activites", "repas"] : ["soiree", "activites", "repas", "backstage", "staff"],
    statut: "actif",
    checkin: { general: false, bus: false, logement: false },
    goodies: { tshirt: { recupere: false, taille: "M" }, bob: { recupere: false }, bandana: { recupere: false }, ecocup: { recupere: false }, sac: { recupere: false } },
    medical: { allergies: "", traitements: "", pathologies: "", contactUrgence: "", consentement: false },
    activites: {},
    repas: {},
    history: [{ ts: new Date().toISOString(), type: "creation", detail: "Bracelet généré" }],
  };
}

function seed(): WeiState {
  const config = { nbParticipants: 350, nbStaff: 40, nbBus: 6, ticketsConsoParPart: 3, uniteFortParPart: 1, designColor: "electric" };
  const modules: ModulesConfig = {
    billet: true, identite: true, medical: true, urgence: true, partenaires: false, parking: true,
    plan: true, logistique: true, parental: false, reservations: true, transport: true, cashless: true,
    carte_etudiante: false, planning: true, photos: true, site_web: false,
  };
  // Generate a smaller initial pool — full 350 generated on demand
  const bracelets: Bracelet[] = [];
  for (let i = 0; i < 60; i++) bracelets.push(makeBracelet("participant", i));
  for (let i = 0; i < 8; i++) bracelets.push(makeBracelet(i < 3 ? "staff_bde" : i < 5 ? "staff_bda" : i < 6 ? "securite" : "paps", i));

  return {
    config, modules, bracelets,
    alerts: [],
    messages: [],
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
  useTicket(braceletId: string, ticketId: string, lieu = "Bar principal") {
    weiStore.set((s) => ({
      ...s,
      bracelets: s.bracelets.map((b) => {
        if (b.id !== braceletId) return b;
        const t = b.tickets_conso.find((x) => x.id === ticketId);
        if (!t || t.used) return b;
        return {
          ...b,
          tickets_conso: b.tickets_conso.map((x) => (x.id === ticketId ? { ...x, used: true, usedAt: new Date().toISOString(), lieu } : x)),
          history: [...b.history, { ts: new Date().toISOString(), type: "conso", detail: `Ticket ${ticketId} utilisé à ${lieu}` }],
        };
      }),
    }));
  },
  useUniteFort(braceletId: string, lieu = "Bar principal") {
    weiStore.set((s) => ({
      ...s,
      bracelets: s.bracelets.map((b) => {
        if (b.id !== braceletId || b.unite_fort.used) return b;
        return {
          ...b,
          unite_fort: { used: true, usedAt: new Date().toISOString(), lieu },
          history: [...b.history, { ts: new Date().toISOString(), type: "conso_fort", detail: `Unité fort utilisée à ${lieu}` }],
        };
      }),
    }));
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

// Pricing
export const PRICES: Record<keyof ModulesConfig, number> = {
  billet: 5, identite: 3, medical: 10, urgence: 5, partenaires: 3, parking: 3,
  plan: 3, logistique: 3, parental: 3, reservations: 2, transport: 4, cashless: 10,
  carte_etudiante: 2, planning: 2, photos: 8, site_web: 2,
};

export const MODULE_LABELS: Record<keyof ModulesConfig, string> = {
  billet: "Billet & coupe-file", identite: "Identité participant", medical: "Infos médicales",
  urgence: "Contact d'urgence", partenaires: "Réductions partenaires", parking: "Accès parking/camping",
  plan: "Plan interactif", logistique: "Infos logistiques", parental: "Autorisation parentale",
  reservations: "Réservations", transport: "Infos transport", cashless: "Paiement cashless",
  carte_etudiante: "Carte étudiante", planning: "Emploi du temps", photos: "Photos événement",
  site_web: "Site web",
};

export function computeQuote(s: WeiState) {
  const activeModules = (Object.keys(s.modules) as (keyof ModulesConfig)[]).filter((k) => s.modules[k]);
  const moduleTotal = activeModules.reduce((sum, k) => sum + PRICES[k], 0);
  const totalBracelets = s.config.nbParticipants + s.config.nbStaff;
  const tissuCost = totalBracelets * 0.89;
  const chipUnit = totalBracelets >= 1000 ? 0.2 : totalBracelets >= 100 ? 0.35 : 0.5;
  const chipCost = totalBracelets * chipUnit;
  const impressionCost = totalBracelets * 0.18;
  const matiere = tissuCost + chipCost + impressionCost;
  const htParPart = moduleTotal;
  const totalHT = htParPart * s.config.nbParticipants;
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;
  const marge = totalHT - matiere;
  const coutMoyen = totalTTC / Math.max(s.config.nbParticipants, 1);
  return { activeModules, moduleTotal, totalBracelets, tissuCost, chipCost, impressionCost, matiere, htParPart, totalHT, tva, totalTTC, marge, coutMoyen };
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
    reply = "Fiche médicale activée (+10€/participant).";
  } else if (/cashless|paiement/.test(t)) {
    actions.setModule("cashless", true);
    acts.push("Cashless activé");
    reply = "Paiement cashless activé (+10€/participant).";
  } else if (/soir[ée]e|accès soirée/.test(t)) {
    actions.setModule("billet", true);
    acts.push("Accès soirée activé");
    reply = "Accès soirée configuré via le module billet.";
  } else if (/devis|génér.*devis/.test(t)) {
    const q = computeQuote(state);
    reply = `Devis : ${q.activeModules.length} modules actifs, ${q.totalHT.toFixed(0)}€ HT, ${q.totalTTC.toFixed(0)}€ TTC pour ${state.config.nbParticipants} participants. Coût moyen : ${q.coutMoyen.toFixed(2)}€/pers.`;
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

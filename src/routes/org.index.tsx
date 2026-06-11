import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useWei, actions, processAICommand, computeQuote, MODULE_LABELS } from "@/lib/wei-store";
import { Send, Edit2, Check, X, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/")({
  component: AiAssistant,
});

// Guided question flow
const QUESTIONS = [
  { key: "participants", q: "Combien de participants attendez-vous ?", ph: "Ex : 350 participants" },
  { key: "bracelets_part", q: "Combien de bracelets participants ?", ph: "Ex : 350 bracelets participants" },
  { key: "bracelets_staff", q: "Combien de bracelets staff ?", ph: "Ex : 40 bracelets staff (BDE, BDA, ASINT, sécu, PAPS)" },
  { key: "types_staff", q: "Quels types de bracelets staff voulez-vous ?", ph: "Ex : BDE, BDA, ASINT, sécurité, PAPS, bar" },
  { key: "modules", q: "Quels modules NFC activer ?", ph: "Ex : médical, urgence, cashless, billet, transport, plan" },
  { key: "tickets", q: "Combien de tickets conso par participant ?", ph: "Ex : 3 tickets conso par personne" },
  { key: "unite_fort", q: "Combien d'unités d'alcool fort par participant ?", ph: "Ex : 1 unité alcool fort" },
  { key: "transport", q: "Combien de bus et quels types ?", ph: "Ex : 6 bus dont Welcome, BDE, M, T, A, SP Pro, ASINT" },
  { key: "logements", q: "Combien de bungalows et quelle capacité ?", ph: "Ex : 70 bungalows de 4 à 6 personnes" },
  { key: "securite", q: "Dispositif sécurité voulu ?", ph: "Ex : équipe sécurité Funbreak + ASINT en rondes" },
  { key: "medical", q: "Dispositif médical ?", ph: "Ex : PAPS sur site 24/7 + fiche médicale active" },
  { key: "design", q: "Quel design pour les bracelets ?", ph: "Ex : design bleu Lycan rock premium" },
  { key: "import", q: "Avez-vous une liste CSV à importer ?", ph: "Ex : oui, j'importerai un CSV participants + staff" },
  { key: "prestations", q: "Prestations souhaitées en plus ?", ph: "Ex : impression bracelets premium, formation staff, hotline" },
];

function AiAssistant() {
  const chat = useWei((s) => s.chat);
  const config = useWei((s) => s.config);
  const modules = useWei((s) => s.modules);
  const state = useWei((s) => s);
  const quote = computeQuote(state);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [chat, step]);

  const currentQuestion = QUESTIONS[step];
  const done = step >= QUESTIONS.length;

  function answer(text: string) {
    if (!text.trim() || done) return;
    const key = currentQuestion.key;
    setAnswers((a) => ({ ...a, [key]: text }));
    actions.pushChat({ role: "user", text });
    setInput("");
    setTimeout(() => {
      const { reply, actions: acts } = processAICommand(text);
      const next = QUESTIONS[step + 1];
      const composed = `${reply}${next ? `\n\nProchaine question : ${next.q}` : "\n\n✓ Configuration terminée. Va dans Devis ou Bracelets pour générer."}`;
      actions.pushChat({ role: "assistant", text: composed });
      if (acts.length) toast.success(acts.join(" · "));
      setStep((s) => s + 1);
    }, 250);
  }

  function saveEdit(qKey: string) {
    setAnswers((a) => ({ ...a, [qKey]: editText }));
    // Re-apply the command silently so config updates
    processAICommand(editText);
    toast.success("Réponse modifiée");
    setEditing(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="glass flex h-[calc(100vh-180px)] flex-col rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="rounded-lg bg-electric/15 p-2"><Sparkles className="h-5 w-5 text-electric" /></div>
          <div>
            <div className="display text-lg">Assistant IA Lycan</div>
            <div className="text-xs text-muted-foreground">Question {Math.min(step + 1, QUESTIONS.length)}/{QUESTIONS.length} — réponses modifiables à tout moment</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {/* Intro */}
          {chat.slice(0, 1).map((m) => (
            <div key={m.id} className="flex gap-2">
              <div className="max-w-[80%] rounded-2xl bg-card border border-border px-4 py-2.5 text-sm">{m.text}</div>
            </div>
          ))}

          {/* Past Q/A pairs */}
          {QUESTIONS.slice(0, step).map((Q) => {
            const ans = answers[Q.key];
            const isEditing = editing === Q.key;
            return (
              <div key={Q.key} className="space-y-2">
                <div className="flex gap-2">
                  <div className="max-w-[80%] rounded-2xl bg-card border border-border px-4 py-2.5 text-sm">
                    <span className="text-electric text-xs uppercase tracking-widest">Question</span>
                    <div className="mt-1">{Q.q}</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end items-start">
                  <div className="group max-w-[80%] rounded-2xl bg-electric text-black px-4 py-2.5 text-sm relative">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input value={editText} onChange={(e) => setEditText(e.target.value)} className="rounded bg-background text-foreground px-2 py-1 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit(Q.key)} />
                        <button onClick={() => saveEdit(Q.key)}><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditing(null)}><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{ans ?? "—"}</div>
                        <button onClick={() => { setEditing(Q.key); setEditText(ans ?? ""); }} className="ml-2 inline-flex items-center text-[10px] underline opacity-70 hover:opacity-100">
                          <Edit2 className="h-3 w-3 mr-0.5" /> Modifier
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current question */}
          {!done && (
            <div className="flex gap-2">
              <div className="max-w-[80%] rounded-2xl bg-electric/10 border border-electric/30 px-4 py-2.5 text-sm">
                <span className="text-electric text-xs uppercase tracking-widest flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Question {step + 1}/{QUESTIONS.length}</span>
                <div className="mt-1 font-medium">{currentQuestion.q}</div>
              </div>
            </div>
          )}
          {done && (
            <div className="flex gap-2">
              <div className="max-w-[80%] rounded-2xl bg-success/10 border border-success/30 px-4 py-2.5 text-sm">
                <span className="text-success text-xs uppercase tracking-widest">✓ Configuration terminée</span>
                <div className="mt-1">Tu peux maintenant générer les bracelets et exporter le devis.</div>
                <button onClick={() => { setStep(0); setAnswers({}); }} className="mt-2 rounded-md border border-success/40 px-3 py-1 text-xs">Recommencer</button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <form onSubmit={(e) => { e.preventDefault(); answer(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} disabled={done}
              placeholder={done ? "Configuration terminée" : currentQuestion.ph}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-electric focus:outline-none disabled:opacity-40" />
            <button type="submit" disabled={done} className="rounded-xl gradient-electric px-4 font-semibold text-black hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
          {!done && <p className="mt-2 text-[10px] text-muted-foreground">Astuce : tu peux modifier toute réponse précédente avec le bouton « Modifier » sans changer la question courante.</p>}
        </div>
      </div>

      <aside className="glass space-y-4 rounded-2xl p-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-electric">Résumé live</div>
          <h3 className="display mt-1 text-xl">Configuration WEI</h3>
        </div>
        <div className="space-y-2 text-sm">
          <Row k="Participants" v={config.nbParticipants} />
          <Row k="Staff" v={config.nbStaff} />
          <Row k="Bus" v={`${config.nbBus} × 60 = ${config.nbBus * 60} places`} />
          <Row k="Tickets conso / pers" v={config.ticketsConsoParPart} />
          <Row k="Unité fort / pers" v={config.uniteFortParPart} />
        </div>
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Modules actifs ({Object.values(modules).filter(Boolean).length})</div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(modules) as (keyof typeof modules)[]).filter((k) => modules[k]).slice(0, 14).map((k) => (
              <span key={k} className="rounded-full bg-electric/15 px-2 py-0.5 text-[10px] text-electric">{MODULE_LABELS[k]}</span>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <Row k="Options fixes" v={`${quote.optionsFixes.toFixed(0)} €`} />
          <Row k="Matière" v={`${quote.matiere.toFixed(0)} €`} />
          <Row k="Total HT" v={`${quote.totalHT.toFixed(0)} €`} />
          <Row k="TVA 20%" v={`${quote.tva.toFixed(0)} €`} />
          <Row k="Total TTC" v={`${quote.totalTTC.toFixed(0)} €`} bold />
          <Row k="Coût/pers" v={`${quote.coutParParticipant.toFixed(2)} €`} />
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: any; bold?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className={bold ? "display text-electric text-lg" : "text-foreground"}>{v}</span></div>;
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useWei, actions, processAICommand, computeQuote, MODULE_LABELS } from "@/lib/wei-store";
import { Send, Edit2, Check, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/")({
  component: AiAssistant,
});

const EXAMPLES = [
  "Ex : passe à 420 participants",
  "Ex : ajoute 1 unité + 3 tickets conso",
  "Ex : active les fiches médicales",
  "Ex : ajoute 7 bracelets sécurité",
  "Ex : génère le devis",
  "Ex : génère les bracelets",
];

function AiAssistant() {
  const chat = useWei((s) => s.chat);
  const config = useWei((s) => s.config);
  const modules = useWei((s) => s.modules);
  const state = useWei((s) => s);
  const quote = computeQuote(state);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [chat]);

  function send(text: string) {
    if (!text.trim()) return;
    actions.pushChat({ role: "user", text });
    setInput("");
    setTimeout(() => {
      const { reply, actions: acts } = processAICommand(text);
      actions.pushChat({ role: "assistant", text: reply });
      if (acts.length) toast.success(acts.join(" · "));
    }, 300);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="glass flex h-[calc(100vh-180px)] flex-col rounded-2xl">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="rounded-lg bg-electric/15 p-2"><Sparkles className="h-5 w-5 text-electric" /></div>
          <div>
            <div className="display text-lg">Assistant IA Lycan</div>
            <div className="text-xs text-muted-foreground">Configure ton WEI en langage naturel</div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {chat.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              <div className={`group relative max-w-[80%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-electric text-black" : "bg-card border border-border"}`}>
                {editing === m.id ? (
                  <div className="flex items-center gap-2">
                    <input value={editText} onChange={(e) => setEditText(e.target.value)} className="rounded bg-background px-2 py-1 text-sm text-foreground" autoFocus />
                    <button onClick={() => { actions.editChat(m.id, editText); setEditing(null); }} className="text-success"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(null)}><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                    <button onClick={() => { setEditing(m.id); setEditText(m.text); }}
                      className="absolute -top-2 -right-2 hidden rounded-full bg-background p-1 group-hover:block">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => send(ex.replace(/^Ex\s*:\s*/, ""))}
                className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground hover:border-electric hover:text-electric">
                {ex}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Dis ce que tu veux configurer…"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-electric focus:outline-none" />
            <button type="submit" className="rounded-xl gradient-electric px-4 font-semibold text-black hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Live summary panel */}
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
          <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Modules actifs</div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(modules) as (keyof typeof modules)[]).filter((k) => modules[k]).map((k) => (
              <span key={k} className="rounded-full bg-electric/15 px-2 py-0.5 text-xs text-electric">{MODULE_LABELS[k]}</span>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <Row k="Total HT" v={`${quote.totalHT.toFixed(0)} €`} />
          <Row k="TVA 20%" v={`${quote.tva.toFixed(0)} €`} />
          <Row k="Total TTC" v={`${quote.totalTTC.toFixed(0)} €`} bold />
          <Row k="Coût/pers" v={`${quote.coutMoyen.toFixed(2)} €`} />
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: any; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "display text-electric text-lg" : "text-foreground"}>{v}</span>
    </div>
  );
}

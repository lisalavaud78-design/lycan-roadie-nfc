import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions, type StaffGroup } from "@/lib/wei-store";
import { useState } from "react";
import { Send, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/messages")({
  component: Messages,
});

const GROUPS: { key: StaffGroup; label: string }[] = [
  { key: "tous", label: "Tout le staff" },
  { key: "securite", label: "Sécurité" },
  { key: "medical", label: "Médical / PAPS" },
  { key: "paps", label: "PAPS" },
  { key: "bus", label: "Staff bus" },
  { key: "bar", label: "Staff bar" },
  { key: "logement", label: "Staff logement" },
  { key: "activite", label: "Staff activités" },
  { key: "goodies", label: "Staff goodies" },
  { key: "restauration", label: "Restauration" },
  { key: "bde", label: "BDE" },
  { key: "bda", label: "BDA" },
  { key: "asint", label: "ASINT" },
];

function Messages() {
  const messages = useWei((s) => s.messages);
  const staffCount = useWei((s) => s.bracelets.filter((b) => b.role !== "participant").length);
  const [to, setTo] = useState<StaffGroup>("tous");
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);

  function send() {
    if (!text.trim()) return;
    actions.sendMessage({ from: "Org", to, text, urgent, lus: Math.floor(staffCount * 0.3) });
    setText(""); setUrgent(false);
    toast.success(`Message envoyé à ${to}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-3xl">Messages staff</h1>

      <div className="glass rounded-2xl p-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Cible</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {GROUPS.map((g) => (
            <button key={g.key} onClick={() => setTo(g.key)} className={`rounded-full px-3 py-1 text-xs ${to === g.key ? "gradient-electric text-black font-semibold" : "bg-card border border-border"}`}>{g.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="accent-danger" /> Urgent</label>
          <button onClick={send} className="rounded-lg gradient-electric px-4 font-semibold text-black"><Send className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="space-y-2">
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun message envoyé.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`glass rounded-xl p-3 ${m.urgent ? "border border-danger/40" : ""}`}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="text-electric">{m.from}</span> → <span className="rounded bg-card px-2">{m.to}</span>
              {m.urgent && <span className="rounded bg-danger/20 text-danger px-2">URGENT</span>}
              <span>· {new Date(m.ts).toLocaleString("fr")}</span>
              {typeof m.lus === "number" && <span className="ml-auto flex items-center gap-1"><CheckCheck className="h-3 w-3" /> {m.lus} lus</span>}
            </div>
            <div className="text-sm mt-1">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

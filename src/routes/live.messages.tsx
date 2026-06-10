import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/live/messages")({
  component: () => {
    const messages = useWei((s) => s.messages);
    const [to, setTo] = useState<"tous" | "securite" | "medical" | "bus" | "bar" | "activite">("tous");
    const [text, setText] = useState("");

    function send() {
      if (!text.trim()) return;
      actions.sendMessage({ from: "Org", to, text });
      setText("");
      toast.success(`Message envoyé à ${to}`);
    }

    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Messages staff</h1>
        <div className="glass rounded-2xl p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {(["tous", "securite", "medical", "bus", "bar", "activite"] as const).map((t) => (
              <button key={t} onClick={() => setTo(t)} className={`rounded-full px-3 py-1 text-xs ${to === t ? "gradient-electric text-black font-semibold" : "bg-card border border-border"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={send} className="rounded-lg gradient-electric px-4 font-semibold text-black"><Send className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="space-y-2">
          {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun message envoyé.</p>}
          {messages.map((m) => (
            <div key={m.id} className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="text-electric">{m.from}</span> → <span className="rounded bg-card px-2">{m.to}</span> · {new Date(m.ts).toLocaleString("fr")}</div>
              <div className="text-sm mt-1">{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/org/design")({
  component: Design,
});

const COLORS = [
  { id: "electric", name: "Bleu électrique", from: "#1e90ff", to: "#7df9ff" },
  { id: "lycan", name: "Lycan", from: "#1a2980", to: "#26d0ce" },
  { id: "midnight", name: "Minuit", from: "#0f2027", to: "#2c5364" },
  { id: "rock", name: "Rock", from: "#000000", to: "#434343" },
];

function Design() {
  const config = useWei((s) => s.config);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Design bracelet</h1>
        <p className="text-sm text-muted-foreground">Choisis l'apparence des bracelets NFC pour le WEI</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          <h2 className="display text-lg">Palette</h2>
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((c) => (
              <button key={c.id} onClick={() => actions.setConfig({ designColor: c.id })}
                className={`group rounded-2xl border-2 p-4 text-left transition-all ${config.designColor === c.id ? "border-electric shadow-electric" : "border-border hover:border-electric/40"}`}>
                <div className="h-20 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }} />
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-semibold">{c.name}</div>
                  {config.designColor === c.id && <Zap className="h-4 w-4 text-electric" />}
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono">{c.from} → {c.to}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="display text-lg">Aperçu</h2>
          <BraceletPreview color={COLORS.find((c) => c.id === config.designColor) ?? COLORS[0]} />
        </div>
      </div>
    </div>
  );
}

function BraceletPreview({ color }: { color: typeof COLORS[0] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mx-auto h-40 w-full max-w-sm rounded-full p-2 shadow-electric" style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
        <div className="flex h-full w-full items-center justify-between rounded-full bg-black/30 px-6 backdrop-blur">
          <div>
            <div className="display text-2xl text-white">LYCAN</div>
            <div className="text-xs uppercase tracking-widest text-white/80">Highway to WEI 2025</div>
          </div>
          <div className="rounded-full bg-white/15 p-3">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.5C7 9.5 17 9.5 19 12.5" /><path d="M8.5 15.5C10 14 14 14 15.5 15.5" /><circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">Bracelet tissu — puce NFC intégrée — fermeture sécurisée</div>
    </div>
  );
}

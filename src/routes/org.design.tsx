import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { Zap, ExternalLink, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [prestataire, setPrestataire] = useState(false);
  const [text, setText] = useState("LYCAN — Highway to WEI 2025");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Design bracelet</h1>
        <p className="text-sm text-muted-foreground">Définis l'apparence — ou délègue à un prestataire externe</p>
      </div>

      <div className="glass rounded-2xl p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={prestataire} onChange={(e) => setPrestataire(e.target.checked)} className="h-4 w-4 accent-electric" />
          <div>
            <div className="font-semibold">Je veux faire appel à un prestataire design</div>
            <div className="text-xs text-muted-foreground">Génération IA désactivée — fichier final fourni</div>
          </div>
        </label>
      </div>

      {prestataire ? (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="display text-lg">Fiche prestataire</h2>
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <Field label="Studio">Lycan Creative Studio</Field>
            <Field label="Contact">design@lycan-studio.fr</Field>
            <Field label="Délai">5 à 7 jours ouvrés</Field>
            <Field label="Tarif estimé">350 € HT (forfait création)</Field>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => toast.success("Devis design externe demandé")} className="rounded-lg gradient-electric px-4 py-2 font-semibold text-black">
              Demander un devis design externe
            </button>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 cursor-pointer hover:border-electric">
              <Upload className="h-4 w-4" /> Importer fichier final (.png, .svg, .pdf)
              <input type="file" accept=".png,.svg,.pdf" hidden onChange={() => toast.success("Fichier importé")} />
            </label>
            <a href="https://lycan-studio.fr" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-electric hover:underline">Site studio <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-3">
            <h2 className="display text-lg">Palette (auto-générée à partir de l'assistant IA)</h2>
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
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Texte bracelet</label>
              <input value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Logo (optionnel)</label>
              <label className="mt-1 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm cursor-pointer hover:border-electric">
                <Upload className="h-4 w-4" /> Importer un logo
                <input type="file" accept="image/*" hidden onChange={() => toast.success("Logo importé")} />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="display text-lg">Aperçu</h2>
            <BraceletPreview color={COLORS.find((c) => c.id === config.designColor) ?? COLORS[0]} text={text} />
          </div>
        </div>
      )}
    </div>
  );
}
function Field({ label, children }: any) { return <div><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="mt-1">{children}</div></div>; }
function BraceletPreview({ color, text }: any) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mx-auto h-40 w-full max-w-sm rounded-full p-2 shadow-electric" style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
        <div className="flex h-full w-full items-center justify-between rounded-full bg-black/30 px-6 backdrop-blur">
          <div>
            <div className="display text-xl text-white">{text}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/80">Highway to WEI 2025</div>
          </div>
          <div className="rounded-full bg-white/15 p-3">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.5C7 9.5 17 9.5 19 12.5" /><path d="M8.5 15.5C10 14 14 14 15.5 15.5" /><circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">Tissu · puce NFC intégrée · fermeture sécurisée</div>
    </div>
  );
}

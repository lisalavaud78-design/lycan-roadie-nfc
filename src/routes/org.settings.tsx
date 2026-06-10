import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions } from "@/lib/wei-store";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/org/settings")({
  component: Settings,
});

function Settings() {
  const config = useWei((s) => s.config);
  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">Paramètres</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <Field label="Participants" type="number" value={config.nbParticipants} onChange={(v) => actions.setConfig({ nbParticipants: +v })} />
        <Field label="Staff" type="number" value={config.nbStaff} onChange={(v) => actions.setConfig({ nbStaff: +v })} />
        <Field label="Bus" type="number" value={config.nbBus} onChange={(v) => actions.setConfig({ nbBus: +v })} />
        <Field label="Tickets conso / pers" type="number" value={config.ticketsConsoParPart} onChange={(v) => actions.setConfig({ ticketsConsoParPart: +v })} />
        <Field label="Unité fort / pers" type="number" value={config.uniteFortParPart} onChange={(v) => actions.setConfig({ uniteFortParPart: +v })} />
      </div>
      <button onClick={() => { actions.resetAll(); toast.success("Données réinitialisées"); }}
        className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20">
        <RotateCcw className="h-4 w-4" /> Réinitialiser toutes les données
      </button>
    </div>
  );
}
function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-electric focus:outline-none" />
    </div>
  );
}

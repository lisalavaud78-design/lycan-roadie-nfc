import { createFileRoute } from "@tanstack/react-router";
import { useWei, actions, MODULE_LABELS, PRICES, type ModulesConfig } from "@/lib/wei-store";

export const Route = createFileRoute("/org/modules")({
  component: Modules,
});

function Modules() {
  const modules = useWei((s) => s.modules);
  const keys = Object.keys(MODULE_LABELS) as (keyof ModulesConfig)[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-3xl">Configuration modules NFC</h1>
        <p className="text-sm text-muted-foreground">Active les fonctionnalités embarquées dans chaque bracelet</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {keys.map((k) => {
          const on = modules[k];
          return (
            <button key={k} onClick={() => actions.setModule(k, !on)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${on ? "border-electric bg-electric/5 shadow-electric" : "border-border bg-card hover:border-electric/40"}`}>
              <div>
                <div className="font-semibold">{MODULE_LABELS[k]}</div>
                <div className="text-xs text-muted-foreground">{PRICES[k]} € / participant</div>
              </div>
              <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-electric" : "bg-border"}`}>
                <div className={`h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

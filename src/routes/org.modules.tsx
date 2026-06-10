import { createFileRoute } from "@tanstack/react-router";
import { actions, MODULE_LABELS, MODULE_CATEGORIES, PRICES, useWei, type ModulesConfig } from "@/lib/wei-store";

export const Route = createFileRoute("/org/modules")({
  component: Modules,
});

function Modules() {
  const modules = useWei((s) => s.modules);
  const active = (Object.keys(modules) as (keyof ModulesConfig)[]).filter((k) => modules[k]);
  const total = active.reduce((s, k) => s + PRICES[k], 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="display text-3xl">Modules NFC</h1>
          <p className="text-sm text-muted-foreground">Chaque option est un coût <strong className="text-electric">fixe</strong> ajouté une seule fois au devis.</p>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-sm">
          <span className="text-muted-foreground">Total options actives :</span>{" "}
          <span className="display text-electric text-xl">{total} €</span>{" "}
          <span className="text-muted-foreground">· {active.length} modules</span>
        </div>
      </div>

      {Object.entries(MODULE_CATEGORIES).map(([cat, keys]) => (
        <section key={cat}>
          <h2 className="display text-xl mb-3 text-electric">{cat}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((k) => {
              const on = modules[k];
              return (
                <button key={k} onClick={() => actions.setModule(k, !on)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${on ? "border-electric bg-electric/5 shadow-electric" : "border-border bg-card hover:border-electric/40"}`}>
                  <div>
                    <div className="font-semibold">{MODULE_LABELS[k]}</div>
                    <div className="text-xs text-muted-foreground">{PRICES[k]} € fixe / événement</div>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${on ? "bg-electric" : "bg-border"}`}>
                    <div className={`h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

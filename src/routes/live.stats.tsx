import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/live/stats")({
  component: () => {
    const s = useWei((x) => x);
    const parts = s.bracelets.filter((b) => b.role === "participant");
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Statistiques</h1>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Kpi label="Total bracelets" value={s.bracelets.length} />
          <Kpi label="Participants" value={parts.length} />
          <Kpi label="Staff" value={s.bracelets.length - parts.length} />
          <Kpi label="Alertes total" value={s.alerts.length} />
          <Kpi label="Messages staff" value={s.messages.length} />
          <Kpi label="Goodies récupérés" value={parts.reduce((a, b) => a + Object.values(b.goodies).filter((g: any) => g.recupere).length, 0)} />
          <Kpi label="Repas pris" value={parts.reduce((a, b) => a + Object.values(b.repas).filter(Boolean).length, 0)} />
          <Kpi label="Activités inscrites" value={parts.reduce((a, b) => a + Object.values(b.activites).filter((x) => x === "inscrit").length, 0)} />
        </div>
      </div>
    );
  },
});
function Kpi({ label, value }: any) {
  return <div className="glass rounded-xl p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="display text-3xl mt-1 text-electric">{value}</div></div>;
}

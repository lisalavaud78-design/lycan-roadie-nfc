import { createFileRoute } from "@tanstack/react-router";
import { useWei } from "@/lib/wei-store";

export const Route = createFileRoute("/live/medical")({
  component: () => {
    const parts = useWei((s) => s.bracelets.filter((b) => b.role === "participant"));
    const allergiques = parts.filter((b) => b.medical.allergies.trim());
    const traitements = parts.filter((b) => b.medical.traitements.trim());
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl">Médical live</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi label="Allergies déclarées" value={allergiques.length} />
          <Kpi label="Traitements" value={traitements.length} />
          <Kpi label="Consentement PAPS" value={parts.filter((b) => b.medical.consentement).length} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Participants allergiques">
            {allergiques.length === 0 ? <p className="text-sm text-muted-foreground">Aucun.</p> : (
              <ul className="space-y-1 text-sm">
                {allergiques.map((b) => <li key={b.id} className="rounded bg-card/40 p-2"><strong>{b.prenom} {b.nom}</strong> — {b.medical.allergies}</li>)}
              </ul>
            )}
          </Section>
          <Section title="Traitements en cours">
            {traitements.length === 0 ? <p className="text-sm text-muted-foreground">Aucun.</p> : (
              <ul className="space-y-1 text-sm">
                {traitements.map((b) => <li key={b.id} className="rounded bg-card/40 p-2"><strong>{b.prenom} {b.nom}</strong> — {b.medical.traitements}</li>)}
              </ul>
            )}
          </Section>
        </div>
      </div>
    );
  },
});
function Kpi({ label, value }: any) {
  return <div className="glass rounded-xl p-4"><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="display text-3xl mt-1 text-electric">{value}</div></div>;
}
function Section({ title, children }: any) {
  return <div className="glass rounded-2xl p-5"><h2 className="display mb-3 text-lg">{title}</h2>{children}</div>;
}

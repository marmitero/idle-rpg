import { FACTION_LABEL, HEROES } from "@relicwake/content";
import { useGame } from "../state";

export function Roster() {
  const team = useGame((s) => s.team);
  return (
    <div className="panel">
      <h1>Relíquias</h1>
      <p className="muted">Time de 5 no Spire. Ira espera no banco.</p>
      <div className="grid3">
        {HEROES.map((h) => (
          <div key={h.id} className="card" style={{ outline: team.includes(h.id) ? "1px solid #e8b15a" : undefined }}>
            <img className="bust" src={h.art.bust} alt={h.name} />
            <div className="nm">{h.name}</div>
            <div className="ep">{FACTION_LABEL[h.faction]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { UI } from "@relicwake/content";
import { useGame, type Tab } from "../state";
import { Hub } from "./Hub";
import { Roster } from "./Roster";
import { Battle } from "./Battle";
import { Guild } from "./Guild";
import { Menu } from "./Menu";
import { ChromaImg } from "./ChromaImg";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "hub", label: "Hub", icon: UI.nav.hub },
  { id: "roster", label: "Relíquias", icon: UI.nav.roster },
  { id: "battle", label: "Spire", icon: UI.nav.battle },
  { id: "guild", label: "Guilda", icon: UI.nav.guild },
  { id: "menu", label: "Menu", icon: UI.nav.menu },
];

export function App() {
  const tab = useGame((s) => s.tab);
  const gold = useGame((s) => s.gold);
  const letters = useGame((s) => s.letters);
  const fighting = useGame((s) => s.fighting);
  const setTab = useGame((s) => s.setTab);

  return (
    <div className="shell">
      <div className="stage">
        <header className="topbar">
          <div className="chip">
            <ChromaImg src={UI.gold} alt="" />
            {gold}
          </div>
          <div className="chip">
            <ChromaImg src={UI.letters} alt="" />
            {letters}
          </div>
          <div className="chip grow" style={{ border: "none", background: "transparent" }}>
            Relicwake
          </div>
        </header>
        <main className="content">
          {tab === "hub" && <Hub />}
          {tab === "roster" && <Roster />}
          {tab === "battle" && <Battle />}
          {tab === "guild" && <Guild />}
          {tab === "menu" && <Menu />}
        </main>
        {!fighting && (
          <nav className="nav">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
                <ChromaImg src={t.icon} alt="" />
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

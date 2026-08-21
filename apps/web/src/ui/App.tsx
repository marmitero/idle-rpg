import { useEffect } from "react";
import { TUTORIAL_DONE, UI } from "@relicwake/content";
import { setBed, unlockAudio } from "../audio";
import { useGame, type Tab } from "../state";
import { Hub } from "./Hub";
import { Roster } from "./Roster";
import { Battle } from "./Battle";
import { Guild } from "./Guild";
import { Menu } from "./Menu";
import { Tutorial } from "./Tutorial";
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
  const dust = useGame((s) => s.dust);
  const email = useGame((s) => s.email);
  const wakerName = useGame((s) => s.wakerName);
  const fighting = useGame((s) => s.fighting);
  const ready = useGame((s) => s.ready);
  const error = useGame((s) => s.error);
  const tutorialStep = useGame((s) => s.tutorialStep);
  const setTab = useGame((s) => s.setTab);
  const hydrate = useGame((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      setBed(fighting ? "battle" : "hub");
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [fighting]);

  useEffect(() => {
    setBed(fighting ? "battle" : "hub");
  }, [fighting, tab]);

  const tutoring = ready && tutorialStep < TUTORIAL_DONE;

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
          <div className="chip">poeira {dust}</div>
          <div className="chip grow" style={{ border: "none", background: "transparent" }}>
            {wakerName ?? email ?? "Relicwake"}
          </div>
        </header>
        <main className="content">
          {!ready && <div className="panel">{error ? `API: ${error}` : "Acordando o Spire…"}</div>}
          {ready && tab === "hub" && <Hub />}
          {tab === "roster" && <Roster />}
          {tab === "battle" && <Battle />}
          {tab === "guild" && <Guild />}
          {tab === "menu" && <Menu />}
        </main>
        {tutoring && <Tutorial />}
        {!fighting && !tutoring && (
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

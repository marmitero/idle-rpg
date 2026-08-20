import { UI } from "@relicwake/content";

export function Guild() {
  return (
    <div className="hero-bg" style={{ backgroundImage: `url(${UI.guild})`, minHeight: "100%" }}>
      <div style={{ height: 220 }} />
      <div className="panel">
        <h1>Hall</h1>
        <p className="muted">
          A fortaleza da guilda. Hunt e war entram no systems-complete. Por ora, o sino rachado vigia.
        </p>
      </div>
    </div>
  );
}

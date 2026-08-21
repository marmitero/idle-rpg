/** CampaignMap — renderer (só apresentação; estado vem do controller).
 * Camadas: background → paths (SVG) → nós → header/seletor → painel. */

import type { StageNodeState } from "@relicwake/content";
import { screenPos, useCampaignMap } from "./controller";
import { BossNode, ChapterMarker, StageNode } from "./nodes";
import { StagePath } from "./StagePath";
import { StageInfoPanel } from "./StageInfoPanel";

export function CampaignMap() {
  const m = useCampaignMap();
  const { rect } = m;

  const stateOf = (id: string): StageNodeState =>
    m.nodes.find((n) => n.def.id === id)?.state ?? "locked";

  return (
    <div className="panel">
      <ChapterMarker
        number={m.chapter.def.number}
        title={m.chapter.def.title}
        blurb={m.chapter.def.description}
        done={m.chapter.done}
        total={m.chapter.total}
        stars={m.chapter.stars}
      />

      <div className="campaign-chapters">
        {m.chapters.map((c) => (
          <button
            key={c.def.id}
            className={`chapter-pill${c.def.id === m.chapter.def.id ? " on" : ""}${!c.unlocked ? " locked" : ""}`}
            onClick={() => m.setChapterId(c.def.id)}
          >
            {c.unlocked ? c.def.number : "🔒"}
          </button>
        ))}
      </div>

      <div className="campaign-wrap" ref={m.wrapRef}>
        <div
          className="campaign-content"
          ref={m.contentRef}
          style={{ width: rect.w, height: rect.h }}
        >
          <div className="campaign-bg" style={{ backgroundImage: `url(${m.chapter.def.background})` }} />
          <div className="campaign-bg-shade" />

          <StagePath rect={rect} nodes={m.nodes} stateOf={stateOf} />

          {m.nodes.map((n) => {
            const pos = screenPos(rect, n.def);
            const isCurrent = n.def.id === m.current;
            return n.def.type === "boss" ? (
              <BossNode
                key={n.def.id}
                def={n.def}
                state={n.state}
                stars={n.stars}
                isCurrent={isCurrent}
                left={pos.x}
                top={pos.y}
                onSelect={m.select}
              />
            ) : (
              <StageNode
                key={n.def.id}
                def={n.def}
                state={n.state}
                stars={n.stars}
                isCurrent={isCurrent}
                left={pos.x}
                top={pos.y}
                onSelect={m.select}
              />
            );
          })}
        </div>

        {m.selectedDef && (
          <StageInfoPanel
            def={m.selectedDef}
            state={m.nodes.find((n) => n.def.id === m.selectedDef!.id)?.state ?? "locked"}
            stars={m.progress.stars[m.selectedDef.id] ?? 0}
            onPlay={m.play}
            onClose={m.closePanel}
          />
        )}
      </div>
    </div>
  );
}

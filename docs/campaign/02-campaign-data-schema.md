# 02 — Campaign Data Schema

**Status:** v1 (2026-08-21) · **Arquivo:** `packages/content/src/campaign.ts`

Tudo em TypeScript (tipos são o schema). Exemplos JSON ilustrativos.

## CampaignDefinition

```ts
export type CampaignDefinition = {
  id: string;                    // "main_campaign"
  title: string;
  settings: { starSystem: "stars"; maxStars: 3 };  // configurável (stars | none futuro)
  chapters: CampaignChapterDef[];
};
export const CAMPAIGN: CampaignDefinition;
```

## ChapterDefinition

```ts
export type CampaignChapterDef = {
  id: string;                    // "chapter_1"
  number: number;
  title: string;                 // de CHAPTERS (nome PT-BR)
  description: string;           // blurb do capítulo
  background: string;            // asset do mapa (plate de bioma + overlay)
  bossStageId: string;           // "1-20"
  unlockRequirement: UnlockRequirement;  // cap. 2+ = chapter_completion
  stages: string[];              // ids ordenados (dados, não hardcode)
};
```

## StageDefinition

```ts
export type CampaignStageDef = {
  id: string;                    // "1-3" (mesmo id do gameplay)
  chapterId: string;
  chapterNumber: number;
  number: number;                // 1..20 no capítulo
  type: StageType;               // "normal" | "elite" | "boss" | "event" | "special"
  title: string;                 // nome do stage (STAGES)
  description: string;           // texto do capítulo + dica de tipo
  scene: string;                 // plate de batalha (bg)
  position: NodePosition;        // normalizado 0..1 no mapa do capítulo
  connections: string[];         // ids de destino (cadeia → boss)
  unlockRequirement: UnlockRequirement;
  rewards: { gold: number; wakeRate: number };
  recommendedPower: number;      // heurística de exibição (docs/04)
};
export type StageType = "normal" | "elite" | "boss" | "event" | "special";
```

`event`/`special` já existem no tipo (arquitetura preparada); o 1.0 usa
`normal` (1–9, 11–19), `elite` (estágio 10 = mini-boss) e `boss` (estágio 20).

## NodePosition (normalizado)

```json
{ "x": 0.42, "y": 0.55 }
```

Gerado pelo **módulo de dados** (serpentina de 4 colunas por capítulo; boss no
topo central). O renderer só consome — nunca calcula posição. Regras em docs/08.

## StageConnection

```ts
// stage.connections: string[] — para a cadeia do capítulo:
["1-4"]            // 1-3 → 1-4
["1-20"]           // 1-19 → boss
```

Tipos de estilo derivados do ESTADO no render (`main_path`, `completed_path`,
`locked_path`, `boss_path`) — o dado guarda só a topologia; o visual vem do
estado do par origem→destino (docs/04).

## UnlockRequirement (motor genérico)

```ts
export type UnlockRequirement =
  | { type: "none" }
  | { type: "previous_stage"; stageId: string }
  | { type: "multiple_stages"; requiredStages: string[] }
  | { type: "chapter_completion"; chapterId: string }
  | { type: "player_level"; level: number }
  | { type: "boss_defeated"; bossStageId: string };
```

Regras de avaliação em docs/06. Hoje usados: `none` (1-1), `previous_stage`
(cadeia linear) e `chapter_completion` (abertura de capítulo).

## Como adicionar um estágio/capítulo (sem tocar no renderer)

1. **Estágio:** incluir na projeção em `campaign.ts` (id, tipo, recompensas,
   requisito) — posição/conexões derivam do layout do capítulo. Se for conteúdo
   jogável, adicionar também em `STAGES` (gameplay) e o map o projeta.
2. **Capítulo:** adicionar em `CHAPTERS` (gameplay) — `campaign.ts` projeta
   automaticamente capítulo + 20 estágios + boss + requisito
   `chapter_completion` do capítulo anterior.
3. **Bifurcação futura:** trocar `connections`/`unlockRequirement` no dado;
   nenhuma mudança de lógica.

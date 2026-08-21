import { HERO_BY_ID, LOAN_HEROES, STARTERS, TUTORIAL_DONE } from "@relicwake/content";
import { bumpDaily, save, type Account } from "./store.ts";

const STARTER_IDS = new Set<string>(STARTERS.map((s) => s.id));

export type TutorialBody = {
  step?: unknown;
  name?: unknown;
  starterId?: unknown;
  pull?: unknown;
  reset?: unknown;
};

function loansAround(starter: string): string[] {
  const rest = LOAN_HEROES.filter((id) => id !== starter);
  return [starter, ...rest].slice(0, 5);
}

export async function applyTutorial(
  a: Account,
  body: TutorialBody,
): Promise<{ ok: true; account: Account } | { ok: false; error: string }> {
  if (body.reset === true) {
    a.tutorialStep = 0;
    a.wakerName = null;
    a.starterId = null;
    a.tutorialPull = false;
    a.directives = ["foco"];
    await save(a);
    return { ok: true, account: a };
  }
  const step = Number(body.step);
  if (!Number.isInteger(step) || step < 0 || step > TUTORIAL_DONE) return { ok: false, error: "bad_step" };
  if (step < a.tutorialStep) return { ok: true, account: a };
  if (step > a.tutorialStep + 1 && step !== TUTORIAL_DONE) return { ok: false, error: "step_skip" };

  if (body.name != null) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 24) return { ok: false, error: "bad_name" };
    a.wakerName = name;
  }
  if (step >= 2 && !a.wakerName) return { ok: false, error: "need_name" };

  if (body.starterId != null) {
    const id = String(body.starterId);
    if (!STARTER_IDS.has(id) || !HERO_BY_ID[id]) return { ok: false, error: "bad_starter" };
    a.starterId = id;
    a.team = loansAround(id);
    if (!a.owned.includes(id)) a.owned.unshift(id);
  }
  if (step >= 3 && !a.starterId) return { ok: false, error: "need_starter" };

  if (step >= 3 && a.directives.length === 0) a.directives = ["foco"];

  if (body.pull === true || step === 7) {
    if (!a.tutorialPull) {
      const gift = a.starterId === "hero.warrior" ? "hero.guardian" : "hero.warrior";
      if (!a.owned.includes(gift)) a.owned.push(gift);
      if (!a.team.includes(gift)) {
        a.team = [a.team[0] ?? gift, gift, ...a.team.slice(1)].filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 5);
      }
      a.tutorialPull = true;
      bumpDaily(a, "pull");
    }
  }

  if (step === TUTORIAL_DONE && a.directives.length < 3) {
    a.directives = ["foco", "guarda", "execute"];
  }

  a.tutorialStep = Math.max(a.tutorialStep, step);
  await save(a);
  return { ok: true, account: a };
}

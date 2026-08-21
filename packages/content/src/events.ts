export const SEASON = {
  id: "S0",
  name: "Emberwake",
  days: 28,
};

export const EVENTS = [
  {
    id: "event.login7",
    kind: "login" as const,
    name: "Sete toques",
    days: 7,
  },
  {
    id: "event.hunt_tide",
    kind: "hunt" as const,
    name: "Maré da caça",
    days: 14,
  },
  {
    id: "event.story_side",
    kind: "story" as const,
    name: "O arquivo que Moth escondeu",
    days: 10,
  },
];

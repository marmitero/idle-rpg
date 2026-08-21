/**
 * Asset Registry — caminhos e dados de apresentação centralizados
 * (docs/ui-redesign/02 e /04). O código não espalha paths de asset:
 * qualquer tela referencia UI_KIT / HUB_WORLD / HUD_RESOURCES daqui.
 */

// ── Kit (pele asset-driven de painéis/botões/barras) ────────────────────────
export const UI_KIT = {
  panel: "/assets/ui/kit/rw_ui_panel_ornate_256.png",
  button: "/assets/ui/kit/rw_ui_button_256.png",
  buttonPress: "/assets/ui/kit/rw_ui_button_press_256.png",
  barBg: "/assets/ui/kit/rw_ui_bar_bg_256.png",
  barFill: "/assets/ui/kit/rw_ui_bar_fill_256.png",
  cartouche: "/assets/ui/kit/rw_ui_header_cartouche_256.png",
  counterPlate: "/assets/ui/kit/rw_ui_plate_counter.png",
  sparkle: "/assets/vfx/rw_vfx_sparkle.png",
} as const;

export const HUB_PLAZA = "/assets/environments/hub/rw_env_hub_plaza.png";

export const HUD_RESOURCES = [
  { id: "gold", icon: "/assets/ui/icons/currency/rw_currency_gold.png" },
  { id: "letters", icon: "/assets/ui/icons/currency/rw_currency_letters.png" },
  { id: "dust", icon: "/assets/ui/icons/currency/rw_currency_dust.png" },
] as const;

export const HUB_DAILY_BOARD = "/assets/ui/world/rw_obj_hub_daily.png";

/** Ação semântica — o componente não conhece a lógica de navegação. */
export type HubAction = "open_tower" | "open_arena" | "open_honor" | "open_live" | "open_mail" | "collect";

export type HubWorldDef = {
  id: string;
  kind: "destination" | "collect";
  labelKey: string;
  asset: string;
  /** posição normalizada (0..1) do contêiner da cena */
  position: { x: number; y: number };
  /** tamanho responsivo do objeto (CSS clamp) */
  size: string;
  action: HubAction;
};

/** Destinos/objetos do mundo do hub — trocar asset/posição/label é DADO. */
export const HUB_WORLD: HubWorldDef[] = [
  {
    id: "font",
    kind: "collect",
    labelKey: "collect_wake",
    asset: "/assets/ui/world/rw_obj_hub_font.png",
    position: { x: 0.5, y: 0.2 },
    size: "clamp(96px, 30vw, 152px)",
    action: "collect",
  },
  {
    id: "tower",
    kind: "destination",
    labelKey: "tower",
    asset: "/assets/ui/world/rw_obj_hub_tower.png",
    position: { x: 0.24, y: 0.56 },
    size: "clamp(88px, 26vw, 136px)",
    action: "open_tower",
  },
  {
    id: "arena",
    kind: "destination",
    labelKey: "arena",
    asset: "/assets/ui/world/rw_obj_hub_arena.png",
    position: { x: 0.76, y: 0.56 },
    size: "clamp(84px, 24vw, 124px)",
    action: "open_arena",
  },
  {
    id: "pass",
    kind: "destination",
    labelKey: "live",
    asset: "/assets/ui/world/rw_obj_hub_pass.png",
    position: { x: 0.5, y: 0.66 },
    size: "clamp(84px, 24vw, 122px)",
    action: "open_live",
  },
  {
    id: "honor",
    kind: "destination",
    labelKey: "honor",
    asset: "/assets/ui/world/rw_obj_hub_honor.png",
    position: { x: 0.24, y: 0.86 },
    size: "clamp(76px, 22vw, 114px)",
    action: "open_honor",
  },
  {
    id: "mail",
    kind: "destination",
    labelKey: "mail",
    asset: "/assets/ui/world/rw_obj_hub_mail.png",
    position: { x: 0.76, y: 0.86 },
    size: "clamp(76px, 22vw, 114px)",
    action: "open_mail",
  },
];

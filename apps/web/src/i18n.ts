import { UI_STRINGS, type Locale } from "@relicwake/content";

const KEY = "relicwake.locale";

export function getLocale(): Locale {
  const v = localStorage.getItem(KEY);
  return v === "en" ? "en" : "pt-BR";
}

export function setLocale(l: Locale) {
  localStorage.setItem(KEY, l);
}

export function t(key: string, locale = getLocale()): string {
  return UI_STRINGS[locale][key] ?? UI_STRINGS["pt-BR"][key] ?? key;
}

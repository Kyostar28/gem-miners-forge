import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeKey = "green" | "yellow" | "white" | "blue";
export type Lang = "es" | "en";

export const THEMES: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: "green", label: "Neon Green", swatch: "#22ff88" },
  { key: "yellow", label: "Amber", swatch: "#ffd400" },
  { key: "white", label: "Light", swatch: "#f2f4f3" },
  { key: "blue", label: "Deep Blue", swatch: "#38b6ff" },
];

const T: Record<string, { es: string; en: string }> = {
  // nav
  "nav.dashboard": { es: "PANEL", en: "DASHBOARD" },
  "nav.games": { es: "JUEGOS", en: "GAMES" },
  "nav.shop": { es: "TIENDA", en: "SHOP" },
  "nav.marketplace": { es: "MERCADO", en: "MARKETPLACE" },
  "nav.forge": { es: "FORJA", en: "FORGE" },
  "nav.cloud": { es: "CLOUD MINING", en: "CLOUD MINING" },
  "nav.wallet": { es: "CARTERA", en: "WALLET" },
  "nav.ptc": { es: "PTC", en: "PTC" },
  "nav.offerwall": { es: "OFFERWALL", en: "OFFERWALL" },
  "nav.roulette": { es: "RULETA", en: "ROULETTE" },
  "nav.lottery": { es: "LOTERÍA", en: "LOTTERY" },
  "nav.leaderboard": { es: "CLASIFICACIÓN", en: "LEADERBOARD" },
  "nav.achievements": { es: "LOGROS", en: "ACHIEVEMENTS" },
  // sidebar
  "side.theme": { es: "TEMA", en: "THEME" },
  "side.lang": { es: "IDIOMA", en: "LANGUAGE" },
  "side.logout": { es: "CERRAR SESIÓN", en: "LOG OUT" },
  "side.rank": { es: "RANGO", en: "RANK" },
  // dashboard
  "dash.title": { es: "CENTRO DE OPERACIONES DE MINADO", en: "MINING OPERATIONS CENTER" },
  "dash.sub": {
    es: "Supervisa tu infraestructura, el rendimiento de tus racks y la distribución de poder en tiempo real.",
    en: "Monitor your infrastructure, rack performance and real-time hash power allocation.",
  },
  "dash.league": { es: "LIGA ACTUAL", en: "CURRENT LEAGUE" },
  "dash.pool": { es: "REWARDS POOL · 10 MIN", en: "REWARDS POOL · 10 MIN" },
  "dash.balances": { es: "BALANCES", en: "BALANCES" },
  "dash.inventory": { es: "INVENTARIO", en: "INVENTORY" },
  "dash.racks": { es: "INFRAESTRUCTURA · RACKS", en: "INFRASTRUCTURE · RACKS" },
  "inv.miners": { es: "MINEROS", en: "MINERS" },
  "inv.racks": { es: "RACKS", en: "RACKS" },
  "inv.parts": { es: "COMPONENTES", en: "PARTS" },
  "inv.boosters": { es: "BOOSTERS", en: "BOOSTERS" },
  "inv.empty": { es: "Sin unidades en esta categoría.", en: "No units in this category." },
  "inv.hintPick": {
    es: "Selecciona un slot vacío de un rack para instalar la unidad.",
    en: "Select an empty rack slot to install the unit.",
  },
  "inv.hint": {
    es: "Pulsa una unidad para seleccionarla y móntala en un rack. Pulsa una montada para devolverla al inventario.",
    en: "Tap a unit to select it and mount it on a rack. Tap a mounted one to send it back to inventory.",
  },
  "common.soon": { es: "Próximamente disponible en la tienda.", en: "Coming soon to the shop." },
  "common.balance": { es: "Balance", en: "Balance" },
  "common.claim": { es: "COBRAR", en: "CLAIM" },
  "common.play": { es: "JUGAR", en: "PLAY" },
  // avatar
  "avatar.title": { es: "ELIGE TU AVATAR", en: "CHOOSE YOUR AVATAR" },
};

interface Ctx {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  cycleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const UiCtx = createContext<Ctx | null>(null);
const KEY = "cryptominer:ui:v1";

export function UiProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("green");
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as { theme?: ThemeKey; lang?: Lang };
        if (p.theme) setThemeState(p.theme);
        if (p.lang) setLangState(p.lang);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, JSON.stringify({ theme, lang }));
  }, [theme, lang]);

  const setTheme = useCallback((t: ThemeKey) => setThemeState(t), []);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const cycleTheme = useCallback(
    () =>
      setThemeState((t) => {
        const i = THEMES.findIndex((x) => x.key === t);
        return THEMES[(i + 1) % THEMES.length].key;
      }),
    [],
  );
  const toggleLang = useCallback(() => setLangState((l) => (l === "es" ? "en" : "es")), []);
  const t = useCallback((key: string) => T[key]?.[lang] ?? key, [lang]);

  const value = useMemo(
    () => ({ theme, setTheme, cycleTheme, lang, setLang, toggleLang, t }),
    [theme, setTheme, cycleTheme, lang, setLang, toggleLang, t],
  );

  return <UiCtx.Provider value={value}>{children}</UiCtx.Provider>;
}

export function useUi() {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}

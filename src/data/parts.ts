// Componentes y boosters que el usuario puede acumular en su inventario.

export interface Part {
  key: string;
  name: string;
  desc: string;
  icon: string;
  /** bonus de hash en % que aporta al instalarse */
  bonusPct: number;
}

export const PARTS: Part[] = [
  { key: "psu", name: "PSU 1600W", desc: "Fuente redundante de grado datacenter.", icon: "🔌", bonusPct: 2 },
  { key: "fan", name: "Turbo Fan", desc: "Ventilador de alto flujo para el rack.", icon: "🌀", bonusPct: 3 },
  { key: "heatsink", name: "Copper Heatsink", desc: "Disipador de cobre puro.", icon: "🧊", bonusPct: 4 },
  { key: "board", name: "Control Board", desc: "Placa de control con firmware afinado.", icon: "🧩", bonusPct: 5 },
  { key: "cable", name: "Fiber Uplink", desc: "Enlace de fibra al pool, latencia mínima.", icon: "🧵", bonusPct: 6 },
];

export interface Booster {
  key: string;
  name: string;
  desc: string;
  icon: string;
  /** multiplicador temporal */
  mult: number;
  /** duración en horas */
  hours: number;
}

export const BOOSTERS: Booster[] = [
  { key: "x2h", name: "Overclock x2", desc: "Duplica tu hash rate durante 1 hora.", icon: "⚡", mult: 2, hours: 1 },
  { key: "x15", name: "Turbo x1.5", desc: "+50% de hash rate durante 6 horas.", icon: "🚀", mult: 1.5, hours: 6 },
  { key: "x3", name: "Nitro x3", desc: "Triplica tu hash rate durante 30 minutos.", icon: "🔥", mult: 3, hours: 0.5 },
  { key: "lucky", name: "Lucky Chip", desc: "Mejora la recompensa de los juegos arcade.", icon: "🍀", mult: 1.25, hours: 12 },
];

export const PART_MAP: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.key, p]));
export const BOOSTER_MAP: Record<string, Booster> = Object.fromEntries(BOOSTERS.map((b) => [b.key, b]));

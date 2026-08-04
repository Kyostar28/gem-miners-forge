// Salas de minado. Cada room admite un máximo de 6 racks.

export const ROOM_CAPACITY = 6;

export interface RoomModel {
  key: string;
  name: string;
  desc: string;
  price: number; // CT
  /** multiplicador de eficiencia aplicado a los racks de la sala */
  boost: number;
  icon: string;
}

export const ROOMS: RoomModel[] = [
  { key: "garage",   name: "Garaje",            desc: "Donde todo empieza. Un enchufe y mucha fe.",             price: 0,       boost: 1.0,  icon: "🏠" },
  { key: "basement", name: "Sótano Refrigerado",desc: "Fresco, oscuro y con extractor industrial.",             price: 12_000,  boost: 1.03, icon: "🧊" },
  { key: "bunker",   name: "Búnker Privado",    desc: "Hormigón, generador propio y cero curiosos.",            price: 45_000,  boost: 1.07, icon: "🛡" },
  { key: "warehouse",name: "Nave Industrial",   desc: "Techos altos, trifásica y filas de racks.",              price: 130_000, boost: 1.12, icon: "🏭" },
  { key: "datacore", name: "Data Center Tier-4",desc: "Redundancia total y refrigeración líquida.",             price: 400_000, boost: 1.18, icon: "🗄" },
  { key: "arctic",   name: "Estación Ártica",   desc: "Frío gratis a -35°C. Overclock permanente.",             price: 1_100_000, boost: 1.26, icon: "❄" },
  { key: "orbital",  name: "Plataforma Orbital",desc: "Vacío, energía solar directa y nada de vecinos.",        price: 3_000_000, boost: 1.35, icon: "🛰" },
];

export const ROOM_MAP: Record<string, RoomModel> = Object.fromEntries(ROOMS.map((r) => [r.key, r]));

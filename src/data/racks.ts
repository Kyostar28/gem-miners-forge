// Racks comprables en la shop. Cada uno define nº de slots y bonus de eficiencia.

export interface RackModel {
  key: string;
  name: string;
  desc: string;
  slots: number;
  price: number; // CT
  tier: "BASIC" | "PRO" | "ELITE" | "QUANTUM" | "MYTHIC";
  /** multiplicador de hash aplicado a los mineros montados */
  boost: number;
  icon: string;
}

export const RACKS: RackModel[] = [
  { key: "shelf",    name: "Wood Shelf",        desc: "Una tabla y bridas. Funciona… más o menos.", slots: 3,  price: 0,     tier: "BASIC",   boost: 1.0,  icon: "▤" },
  { key: "milk",     name: "Milk Crate Rig",    desc: "Caja de plástico reciclada con ventilador USB.", slots: 4, price: 800, tier: "BASIC",   boost: 1.02, icon: "▦" },
  { key: "opencase", name: "Open Frame 6U",     desc: "Estructura de aluminio abierta, 6 bahías.", slots: 6,  price: 2500,  tier: "PRO",     boost: 1.05, icon: "▩" },
  { key: "tower",    name: "Steel Tower 8U",    desc: "Torre de acero con extracción forzada.", slots: 8,  price: 6000,  tier: "PRO",     boost: 1.08, icon: "▥" },
  { key: "server",   name: "Server Rack 10U",   desc: "Rack de datacenter con raíles y PDU.", slots: 10, price: 14000, tier: "ELITE",   boost: 1.12, icon: "▧" },
  { key: "immersion",name: "Immersion Tank",    desc: "Inmersión en aceite dieléctrico. Silencioso y frío.", slots: 12, price: 32000, tier: "ELITE", boost: 1.18, icon: "◫" },
  { key: "cryo",     name: "Cryo Chamber",      desc: "Cámara criogénica a -40°C, overclock estable.", slots: 14, price: 70000, tier: "QUANTUM", boost: 1.25, icon: "❄" },
  { key: "plasma",   name: "Plasma Spine",      desc: "Columna de plasma con bus superconductor.", slots: 16, price: 150000, tier: "QUANTUM", boost: 1.32, icon: "⌁" },
  { key: "orbital",  name: "Orbital Pod",       desc: "Cápsula en órbita baja, refrigeración por vacío.", slots: 20, price: 320000, tier: "MYTHIC", boost: 1.45, icon: "◎" },
  { key: "singular", name: "Singularity Core",  desc: "Rack plegado en el espacio-tiempo. No preguntes.", slots: 24, price: 750000, tier: "MYTHIC", boost: 1.6, icon: "✦" },
];

export const RACK_MAP: Record<string, RackModel> = Object.fromEntries(RACKS.map((r) => [r.key, r]));

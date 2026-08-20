// Sistema de misiones: daily (00:00 UTC), weekly (lunes 00:00 UTC), monthly (día 1 00:00 UTC).
// Las tareas se eligen de forma pseudoaleatoria pero determinista según el periodo,
// así todos los tabs/recargas ven las mismas 7 tareas hasta el próximo reinicio.

export type QuestScope = "daily" | "weekly" | "monthly";

/** métricas acumulativas (contadores) o absolutas (estado actual) */
export type QuestMetric =
  | "claims"
  | "minersBought"
  | "racksBought"
  | "roomsBought"
  | "mounts"
  | "unmounts"
  | "gamesWon"
  | "arcadeWins"
  | "forgeCrafts"
  | "forgeUpgrades"
  | "dismantles"
  | "cloudDeposits"
  | "cloudClaims"
  | "withdrawals"
  | "boostsGained"
  | "ctEarned"
  | "ctSpent"
  | "shardsGained"
  | "spins"
  | "ptcViews"
  | "offers"
  | "lottery"
  | "sells"
  | "marketTrades"
  | "power"; // absoluta

export interface QuestDef {
  id: string;
  scope: QuestScope;
  title: string;
  metric: QuestMetric;
  target: number;
  /** recompensa en CT */
  ct: number;
  /** piezas comunes de recompensa */
  shards?: number;
  /** poder temporal (24h) de recompensa */
  th?: number;
}

/** las métricas absolutas no usan baseline de periodo */
export const ABSOLUTE_METRICS: QuestMetric[] = ["power"];

const d = (id: string, title: string, metric: QuestMetric, target: number, ct: number, extra: Partial<QuestDef> = {}): QuestDef =>
  ({ id, scope: "daily", title, metric, target, ct, ...extra });
const w = (id: string, title: string, metric: QuestMetric, target: number, ct: number, extra: Partial<QuestDef> = {}): QuestDef =>
  ({ id, scope: "weekly", title, metric, target, ct, ...extra });
const m = (id: string, title: string, metric: QuestMetric, target: number, ct: number, extra: Partial<QuestDef> = {}): QuestDef =>
  ({ id, scope: "monthly", title, metric, target, ct, ...extra });

export const DAILY_POOL: QuestDef[] = [
  d("d-claim-2", "Reclama 2 rewards pool", "claims", 2, 120, { shards: 1 }),
  d("d-claim-4", "Reclama 4 rewards pool", "claims", 4, 220, { shards: 2 }),
  d("d-claim-6", "Reclama 6 rewards pool", "claims", 6, 320, { shards: 2 }),
  d("d-game-1", "Gana 1 partida en GAMES", "gamesWon", 1, 100, { th: 0.5 }),
  d("d-game-3", "Gana 3 partidas en GAMES", "gamesWon", 3, 240, { th: 0.5 }),
  d("d-arcade-2", "Completa 2 juegos arcade", "arcadeWins", 2, 180, { th: 0.5 }),
  d("d-arcade-5", "Completa 5 juegos arcade", "arcadeWins", 5, 380, { th: 1 }),
  d("d-buy-1", "Compra 1 minero en la TIENDA", "minersBought", 1, 150),
  d("d-buy-3", "Compra 3 mineros en la TIENDA", "minersBought", 3, 400, { shards: 2 }),
  d("d-mount-2", "Instala 2 mineros en racks", "mounts", 2, 130),
  d("d-mount-5", "Instala 5 mineros en racks", "mounts", 5, 300),
  d("d-forge-1", "Fusiona 1 lote de piezas en la FORJA", "forgeCrafts", 1, 200, { shards: 1 }),
  d("d-dismantle-1", "Desguaza 1 unidad", "dismantles", 1, 120, { shards: 1 }),
  d("d-cloud-claim-1", "Reclama minado en CLOUD MINING", "cloudClaims", 1, 150),
  d("d-spin-1", "Gira la RULETA 1 vez", "spins", 1, 90),
  d("d-spin-3", "Gira la RULETA 3 veces", "spins", 3, 210),
  d("d-ptc-3", "Visualiza 3 anuncios PTC", "ptcViews", 3, 140),
  d("d-ptc-6", "Visualiza 6 anuncios PTC", "ptcViews", 6, 280),
  d("d-offer-1", "Completa 1 oferta del OFFERWALL", "offers", 1, 160),
  d("d-lottery-1", "Compra 1 boleto de LOTERÍA", "lottery", 1, 110),
  d("d-boost-2", "Consigue 2 boosts temporales", "boostsGained", 2, 170, { th: 0.5 }),
  d("d-ct-500", "Gana 500 CT en recompensas", "ctEarned", 500, 200),
  d("d-shards-4", "Obtén 4 piezas de forja", "shardsGained", 4, 190),
  d("d-power-25", "Alcanza 25 TH/s de poder", "power", 25, 150),
];

export const WEEKLY_POOL: QuestDef[] = [
  w("w-claim-25", "Reclama 25 rewards pool", "claims", 25, 900, { shards: 4 }),
  w("w-claim-40", "Reclama 40 rewards pool", "claims", 40, 1400, { shards: 6 }),
  w("w-game-12", "Gana 12 partidas en GAMES", "gamesWon", 12, 800, { th: 1 }),
  w("w-arcade-20", "Completa 20 juegos arcade", "arcadeWins", 20, 1200, { th: 1.5 }),
  w("w-buy-8", "Compra 8 mineros", "minersBought", 8, 1000, { shards: 4 }),
  w("w-rack-2", "Compra 2 racks nuevos", "racksBought", 2, 900),
  w("w-mount-15", "Instala 15 mineros en racks", "mounts", 15, 850),
  w("w-forge-5", "Fusiona 5 lotes en la FORJA", "forgeCrafts", 5, 950, { shards: 3 }),
  w("w-upgrade-2", "Mejora 2 mineros de tier", "forgeUpgrades", 2, 1300, { shards: 4 }),
  w("w-dismantle-6", "Desguaza 6 unidades", "dismantles", 6, 700, { shards: 3 }),
  w("w-cloud-3", "Reclama 3 veces en CLOUD MINING", "cloudClaims", 3, 800),
  w("w-cloud-dep-1", "Abre 1 contrato de cloud mining", "cloudDeposits", 1, 750),
  w("w-spin-15", "Gira la RULETA 15 veces", "spins", 15, 700),
  w("w-ptc-25", "Visualiza 25 anuncios PTC", "ptcViews", 25, 850),
  w("w-offer-5", "Completa 5 ofertas del OFFERWALL", "offers", 5, 900),
  w("w-lottery-5", "Compra 5 boletos de LOTERÍA", "lottery", 5, 650),
  w("w-ct-5000", "Gana 5.000 CT en recompensas", "ctEarned", 5000, 1100),
  w("w-spend-5000", "Invierte 5.000 CT en hardware", "ctSpent", 5000, 1000),
  w("w-sell-4", "Vende 4 unidades en MARKETPLACE", "sells", 4, 700),
  w("w-power-250", "Alcanza 250 TH/s de poder", "power", 250, 1200),
];

export const MONTHLY_POOL: QuestDef[] = [
  m("m-claim-120", "Reclama 120 rewards pool", "claims", 120, 4500, { shards: 12 }),
  m("m-claim-200", "Reclama 200 rewards pool", "claims", 200, 7000, { shards: 18 }),
  m("m-game-60", "Gana 60 partidas en GAMES", "gamesWon", 60, 4000, { th: 3 }),
  m("m-arcade-100", "Completa 100 juegos arcade", "arcadeWins", 100, 6000, { th: 4 }),
  m("m-buy-40", "Compra 40 mineros", "minersBought", 40, 5500, { shards: 12 }),
  m("m-rack-8", "Compra 8 racks", "racksBought", 8, 5000, { shards: 8 }),
  m("m-room-1", "Adquiere 1 sala nueva", "roomsBought", 1, 4800),
  m("m-mount-60", "Instala 60 mineros en racks", "mounts", 60, 4200),
  m("m-forge-25", "Fusiona 25 lotes en la FORJA", "forgeCrafts", 25, 5200, { shards: 10 }),
  m("m-upgrade-10", "Mejora 10 mineros de tier", "forgeUpgrades", 10, 7500, { shards: 15 }),
  m("m-cloud-15", "Reclama 15 veces en CLOUD MINING", "cloudClaims", 15, 4300),
  m("m-spin-80", "Gira la RULETA 80 veces", "spins", 80, 3800),
  m("m-ptc-120", "Visualiza 120 anuncios PTC", "ptcViews", 120, 4100),
  m("m-offer-25", "Completa 25 ofertas del OFFERWALL", "offers", 25, 5000),
  m("m-lottery-20", "Compra 20 boletos de LOTERÍA", "lottery", 20, 3600),
  m("m-ct-50000", "Gana 50.000 CT en recompensas", "ctEarned", 50000, 6500),
  m("m-spend-50000", "Invierte 50.000 CT en infraestructura", "ctSpent", 50000, 6000),
  m("m-withdraw-1", "Solicita 1 retiro en WALLET", "withdrawals", 1, 3500),
  m("m-power-2000", "Alcanza 2.000 TH/s de poder", "power", 2000, 8000, { shards: 20 }),
  m("m-boost-40", "Consigue 40 boosts temporales", "boostsGained", 40, 4400, { th: 5 }),
];

export const POOLS: Record<QuestScope, QuestDef[]> = {
  daily: DAILY_POOL,
  weekly: WEEKLY_POOL,
  monthly: MONTHLY_POOL,
};

export const QUEST_MAP: Record<string, QuestDef> = Object.fromEntries(
  [...DAILY_POOL, ...WEEKLY_POOL, ...MONTHLY_POOL].map((q) => [q.id, q]),
);

export const QUESTS_PER_SCOPE = 7;

// ---------- periodos UTC ----------

function utcMidnight(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function periodKey(scope: QuestScope, at = Date.now()): string {
  const dt = new Date(at);
  if (scope === "daily") return `D${dt.toISOString().slice(0, 10)}`;
  if (scope === "monthly") return `M${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
  // weekly: lunes 00:00 UTC
  const day = (dt.getUTCDay() + 6) % 7; // 0 = lunes
  const monday = new Date(utcMidnight(dt) - day * 86_400_000);
  return `W${monday.toISOString().slice(0, 10)}`;
}

/** timestamp del próximo reinicio del periodo */
export function periodEnd(scope: QuestScope, at = Date.now()): number {
  const dt = new Date(at);
  if (scope === "daily") return utcMidnight(dt) + 86_400_000;
  if (scope === "monthly") {
    const y = dt.getUTCFullYear();
    const mo = dt.getUTCMonth();
    return mo === 11 ? Date.UTC(y + 1, 0, 1) : Date.UTC(y, mo + 1, 1);
  }
  const day = (dt.getUTCDay() + 6) % 7;
  return utcMidnight(dt) + (7 - day) * 86_400_000;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** selecciona 7 tareas deterministas para el periodo indicado */
export function pickQuests(scope: QuestScope, key: string, seedExtra = ""): string[] {
  const pool = [...POOLS[scope]];
  const rand = rng(hash(`${scope}:${key}:${seedExtra}`));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUESTS_PER_SCOPE).map((q) => q.id);
}

export function fmtCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const dd = Math.floor(s / 86400);
  const hh = Math.floor((s % 86400) / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const base = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return dd > 0 ? `${dd}d ${base}` : base;
}

// EVENTOS ACTIVOS: barra progresiva de 25 recompensas que se llena con la EXP
// ganada en los drops de los juegos. Cada evento empieza a las 00:00 UTC, dura
// 72 h y 5 minutos después arranca el siguiente.
import { MINERS, type Tier } from "@/data/miners";
import { RACKS } from "@/data/racks";
import { RARITY_MAP, type Rarity } from "@/data/forge";

/** duración de un evento */
export const EVENT_MS = 72 * 60 * 60 * 1000;
/** pausa entre el final de un evento y el inicio del siguiente */
export const EVENT_GAP_MS = 5 * 60 * 1000;
export const EVENT_CYCLE_MS = EVENT_MS + EVENT_GAP_MS;
/** número de recompensas por evento */
export const EVENT_TIERS = 25;
/** exp de la primera recompensa */
export const EVENT_FIRST_EXP = 1500;
/** crecimiento del coste por nivel (≈200k exp acumulada al nivel 25) */
export const EVENT_GROWTH = 1.12;

/** ancla: 2026-01-01 00:00 UTC */
const ANCHOR = Date.UTC(2026, 0, 1);

export type EventReward =
  | { kind: "boost"; mult: number; hours: number }
  | { kind: "miner"; tier: Tier; id: number }
  | { kind: "rack"; key: string }
  | { kind: "shard"; rarity: Rarity; amount: number }
  | { kind: "ct"; amount: number };

export interface EventLevel {
  /** 1..25 */
  level: number;
  /** exp acumulada necesaria para reclamar */
  exp: number;
  reward: EventReward;
}

export interface EventDef {
  key: string;
  name: string;
  index: number;
  start: number;
  end: number;
  /** inicio del siguiente evento */
  next: number;
  levels: EventLevel[];
}

const NAMES = [
  "SOBRECARGA DE HASH",
  "TORMENTA DE BLOQUES",
  "FIEBRE DEL SILICIO",
  "PROTOCOLO FANTASMA",
  "NODO SINGULAR",
  "ECLIPSE DE RED",
  "FUSIÓN CUÁNTICA",
  "PULSO CRIPTO",
];

const TIER_ORDER_5: Tier[] = ["BASIC", "PRO", "ELITE", "QUANTUM", "MYTHIC"];
const RARITY_BY_STAGE: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** exp acumulada necesaria para el nivel dado (1-indexado) */
export function levelExp(level: number) {
  let acc = 0;
  for (let i = 0; i < level; i++) acc += EVENT_FIRST_EXP * Math.pow(EVENT_GROWTH, i);
  return Math.round(acc / 50) * 50;
}

function rewardFor(level: number, rnd: () => number): EventReward {
  const stage = Math.min(4, Math.floor((level - 1) / 5)); // 0..4
  if (level === EVENT_TIERS) {
    const pool = MINERS.filter((m) => m.tier === "MYTHIC");
    return { kind: "miner", tier: "MYTHIC", id: pool[Math.floor(rnd() * pool.length)].id };
  }
  const roll = rnd();
  if (roll < 0.24) {
    return { kind: "boost", mult: 2, hours: 24 };
  }
  if (roll < 0.46) {
    const tier = TIER_ORDER_5[stage];
    const pool = MINERS.filter((m) => m.tier === tier);
    return { kind: "miner", tier, id: pool[Math.floor(rnd() * pool.length)].id };
  }
  if (roll < 0.62) {
    const tier = TIER_ORDER_5[stage];
    const pool = RACKS.filter((r) => r.tier === tier);
    const list = pool.length ? pool : RACKS;
    return { kind: "rack", key: list[Math.floor(rnd() * list.length)].key };
  }
  if (roll < 0.84) {
    const rarity = RARITY_BY_STAGE[stage];
    const amount = Math.max(1, Math.round((5 - stage) * (0.6 + rnd())) );
    return { kind: "shard", rarity, amount };
  }
  const amount = Math.round(500 * Math.pow(2.1, stage) * (0.8 + rnd() * 0.6));
  return { kind: "ct", amount };
}

export function eventAt(now: number): EventDef {
  const index = Math.max(0, Math.floor((now - ANCHOR) / EVENT_CYCLE_MS));
  const start = ANCHOR + index * EVENT_CYCLE_MS;
  const key = `EV-${index}`;
  const rnd = mulberry(hash(key));
  const levels: EventLevel[] = Array.from({ length: EVENT_TIERS }, (_, i) => ({
    level: i + 1,
    exp: levelExp(i + 1),
    reward: rewardFor(i + 1, rnd),
  }));
  return {
    key,
    index,
    name: NAMES[index % NAMES.length],
    start,
    end: start + EVENT_MS,
    next: start + EVENT_CYCLE_MS,
    levels,
  };
}

export interface RewardView {
  icon: string;
  title: string;
  detail: string;
  color: string;
}

export function describeReward(r: EventReward): RewardView {
  switch (r.kind) {
    case "boost":
      return {
        icon: "⚡",
        title: `BOOST x${r.mult}`,
        detail: `Duplica tu poder actual ${r.hours} h`,
        color: "#ffd400",
      };
    case "miner": {
      const m = MINERS.find((x) => x.id === r.id);
      return {
        icon: "▣",
        title: m?.name ?? "MINERO",
        detail: `Minero ${r.tier}`,
        color: "#38b6ff",
      };
    }
    case "rack": {
      const rk = RACKS.find((x) => x.key === r.key);
      return {
        icon: rk?.icon ?? "▤",
        title: rk?.name ?? "RACK",
        detail: `Rack ${rk?.tier ?? ""} · ${rk?.slots ?? 0} slots`,
        color: "#b06bff",
      };
    }
    case "shard": {
      const d = RARITY_MAP[r.rarity];
      return {
        icon: "◈",
        title: `x${r.amount} PIEZA ${d.name.toUpperCase()}`,
        detail: "Recurso de forja",
        color: d.color,
      };
    }
    default:
      return { icon: "⛏", title: `+${r.amount} CT`, detail: "CryptoMiner Token", color: "#22ff88" };
  }
}

export function fmtLeft(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

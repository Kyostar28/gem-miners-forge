// Sistema de drops al completar un juego de la sección GAMES.
// Solo se obtiene UN drop por partida ganada (o nada).
import { COIN_MAP, COINS, fmtCoin } from "@/lib/coins";
import { RARITY_MAP, type Rarity } from "@/data/forge";

export type Drop =
  | { kind: "none" }
  | { kind: "shard"; rarity: Rarity; amount: number }
  | { kind: "coin"; coin: string; amount: number }
  | { kind: "exp"; amount: number }
  | { kind: "ct"; amount: number };

/** valor en USD del drop de cripto aleatoria */
export const COIN_DROP_USD = 0.0001;
export const EVENT_EXP = 500;

interface Entry {
  pct: number;
  roll: () => Drop;
}

const randomCoin = () => COINS[Math.floor(Math.random() * COINS.length)];

/** tabla de probabilidades (el resto hasta 100% es "nada") */
export const DROP_TABLE: Entry[] = [
  { pct: 5, roll: () => ({ kind: "shard", rarity: "COMMON", amount: 1 }) },
  {
    pct: 5,
    roll: () => {
      const c = randomCoin();
      return { kind: "coin", coin: c.key, amount: COIN_DROP_USD / (c.rate || 1) };
    },
  },
  { pct: 5, roll: () => ({ kind: "exp", amount: EVENT_EXP }) },
  { pct: 5, roll: () => ({ kind: "ct", amount: 1 }) },
  { pct: 5, roll: () => ({ kind: "ct", amount: 0.5 }) },
  { pct: 1, roll: () => ({ kind: "ct", amount: 10 }) },
  {
    pct: 1,
    roll: () => ({ kind: "shard", rarity: Math.random() < 0.5 ? "RARE" : "EPIC", amount: 1 }),
  },
  { pct: 0.5, roll: () => ({ kind: "shard", rarity: "LEGENDARY", amount: 1 }) },
  { pct: 0.1, roll: () => ({ kind: "shard", rarity: "MYTHIC", amount: 1 }) },
];

export function rollDrop(): Drop {
  const r = Math.random() * 100;
  let acc = 0;
  for (const e of DROP_TABLE) {
    acc += e.pct;
    if (r < acc) return e.roll();
  }
  return { kind: "none" };
}

export interface DropView {
  icon: string;
  title: string;
  detail: string;
  color: string;
}

export function describeDrop(d: Drop): DropView {
  switch (d.kind) {
    case "shard": {
      const r = RARITY_MAP[d.rarity];
      return {
        icon: "◈",
        title: `PIEZA ${r.name.toUpperCase()}`,
        detail: `+${d.amount} pieza para la forja`,
        color: r.color,
      };
    }
    case "coin": {
      const c = COIN_MAP[d.coin];
      return {
        icon: c?.icon ?? "◎",
        title: `${fmtCoin(d.coin, d.amount)} ${c?.symbol ?? d.coin}`,
        detail: `Cripto aleatoria · ≈ $${COIN_DROP_USD.toFixed(4)} USD`,
        color: c?.color ?? "#22ff88",
      };
    }
    case "exp":
      return {
        icon: "⭐",
        title: `+${d.amount} EXP`,
        detail: "Experiencia de Evento",
        color: "#ffd400",
      };
    case "ct":
      return {
        icon: "⛏",
        title: `+${d.amount} CT`,
        detail: "CryptoMiner Token",
        color: "#22ff88",
      };
    default:
      return { icon: "∅", title: "SIN DROP", detail: "Esta vez no cayó nada.", color: "#7c8a82" };
  }
}

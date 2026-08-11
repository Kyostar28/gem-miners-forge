// Sistema de FORJA: piezas (partes) por rareza, crafteo y mejora de mineros.
import { MINERS, TIER_ORDER, type Miner, type Tier } from "@/data/miners";
import shardImg from "@/assets/items/part-shard.png";

export const SHARD_IMAGE = shardImg;

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];

export interface RarityDef {
  key: Rarity;
  name: string;
  /** tier de minero que puede mejorar con estas piezas */
  tier: Tier;
  color: string;
  /** coste en CT de fusionar 10 piezas de esta rareza en 1 superior */
  craftCt: number;
}

export const RARITIES: RarityDef[] = [
  { key: "COMMON", name: "Común", tier: "BASIC", color: "#8fe3b0", craftCt: 250 },
  { key: "RARE", name: "Rara", tier: "PRO", color: "#38b6ff", craftCt: 900 },
  { key: "EPIC", name: "Épica", tier: "ELITE", color: "#b06bff", craftCt: 2600 },
  { key: "LEGENDARY", name: "Legendaria", tier: "QUANTUM", color: "#ffd400", craftCt: 7200 },
  { key: "MYTHIC", name: "Mítica", tier: "MYTHIC", color: "#ff5d5d", craftCt: 0 },
];

export const RARITY_MAP: Record<string, RarityDef> = Object.fromEntries(RARITIES.map((r) => [r.key, r]));

/** piezas necesarias para fusionar a la siguiente rareza */
export const CRAFT_COUNT = 10;
/** piezas necesarias para mejorar un minero de nivel */
export const UPGRADE_COUNT = 25;
/** bonus extra de hash sobre el doble al mejorar */
export const UPGRADE_BONUS = 0.2;

export const rarityForTier = (tier: Tier): Rarity => RARITIES.find((r) => r.tier === tier)!.key;

export const nextRarity = (r: Rarity): Rarity | null => {
  const i = RARITY_ORDER.indexOf(r);
  return i < 0 || i >= RARITY_ORDER.length - 1 ? null : RARITY_ORDER[i + 1];
};

export const nextTier = (t: Tier): Tier | null => {
  const i = TIER_ORDER.indexOf(t);
  return i < 0 || i >= TIER_ORDER.length - 1 ? null : TIER_ORDER[i + 1];
};

/** coste en CT de mejorar un minero concreto */
export const upgradeCost = (miner: Miner) => Math.round(miner.price * 1.5);

/**
 * Resultado de mejorar un minero: la unidad del siguiente tier cuyo hash rate
 * queda más cerca del doble + bonus del original.
 */
export function upgradeTarget(miner: Miner): Miner | null {
  const nt = nextTier(miner.tier);
  if (!nt) return null;
  const goal = miner.hashRate * (2 + UPGRADE_BONUS);
  const pool = MINERS.filter((m) => m.tier === nt);
  if (pool.length === 0) return null;
  return pool.reduce((best, m) =>
    Math.abs(m.hashRate - goal) < Math.abs(best.hashRate - goal) ? m : best,
  );
}

/** piezas obtenidas al desguazar un minero */
export const dismantleYield = (miner: Miner) => ({
  rarity: rarityForTier(miner.tier),
  amount: 3,
});

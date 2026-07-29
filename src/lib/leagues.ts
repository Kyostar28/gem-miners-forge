// League system: 8 leagues x 5 divisions (V -> I), exponential power requirements.

export interface League {
  key: string;
  name: string;
  /** css class with the league palette */
  cls: string;
}

export const LEAGUES: League[] = [
  { key: "bronze", name: "BRONZE", cls: "lg-bronze" },
  { key: "silver", name: "SILVER", cls: "lg-silver" },
  { key: "gold", name: "GOLD", cls: "lg-gold" },
  { key: "platinum", name: "PLATINUM", cls: "lg-platinum" },
  { key: "diamond", name: "DIAMOND", cls: "lg-diamond" },
  { key: "maestro", name: "MAESTRO", cls: "lg-maestro" },
  { key: "granmaestro", name: "GRAN MAESTRO", cls: "lg-granmaestro" },
  { key: "leyenda", name: "LEYENDA", cls: "lg-leyenda" },
];

export const DIVISIONS = ["V", "IV", "III", "II", "I"] as const;
export type Division = (typeof DIVISIONS)[number];

export const RANK_COUNT = LEAGUES.length * DIVISIONS.length; // 40

/** Power (TH/s) needed to ENTER rank index `i` (0 = Bronze V). Exponential. */
export function rankRequirement(i: number): number {
  if (i <= 0) return 0;
  return Math.round(25 * Math.pow(1.55, i - 1) * (1 + i * 0.05));
}

export interface RankInfo {
  index: number;
  league: League;
  division: Division;
  label: string;
  current: number;
  next: number | null;
  progress: number; // 0..1
  isMax: boolean;
}

export function getRank(power: number): RankInfo {
  let index = 0;
  for (let i = 0; i < RANK_COUNT; i++) {
    if (power >= rankRequirement(i)) index = i;
  }
  const league = LEAGUES[Math.floor(index / DIVISIONS.length)];
  const division = DIVISIONS[index % DIVISIONS.length];
  const current = rankRequirement(index);
  const isMax = index === RANK_COUNT - 1;
  const next = isMax ? null : rankRequirement(index + 1);
  const progress = isMax || next === null ? 1 : Math.min(1, Math.max(0, (power - current) / (next - current)));
  return {
    index,
    league,
    division,
    label: `${league.name} ${division}`,
    current,
    next,
    progress,
    isMax,
  };
}

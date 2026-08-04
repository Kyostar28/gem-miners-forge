import type { SaveState } from "@/lib/game-store";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  check: (s: SaveState, power: number) => boolean;
  reward: number; // CT
  /** exotic avatar key unlocked when claiming this achievement */
  avatar?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-rig", name: "FIRST RIG", description: "Own 2 miners.", reward: 50, check: (s) => s.owned.length >= 2 },
  { id: "farm", name: "SMALL FARM", description: "Own 10 miners.", reward: 250, check: (s) => s.owned.length >= 10, avatar: "x-diamond" },
  { id: "warehouse", name: "WAREHOUSE", description: "Own 25 miners.", reward: 1000, check: (s) => s.owned.length >= 25, avatar: "x-overlord" },
  { id: "power-100", name: "100 TH/s", description: "Reach 100 TH/s of mining power.", reward: 100, check: (_s, p) => p >= 100, avatar: "x-ghost" },
  { id: "power-1k", name: "1K TH/s", description: "Reach 1,000 TH/s of mining power.", reward: 600, check: (_s, p) => p >= 1000, avatar: "x-phoenix" },
  { id: "power-10k", name: "10K TH/s", description: "Reach 10,000 TH/s of mining power.", reward: 4000, check: (_s, p) => p >= 10000, avatar: "x-dragon" },
  { id: "ltc-holder", name: "LTC HOLDER", description: "Hold 0.5 LTC.", reward: 300, check: (s) => s.ltc >= 0.5, avatar: "x-oracle" },
  { id: "rich", name: "WHALE", description: "Hold 25,000 CT.", reward: 2000, check: (s) => s.ct >= 25000, avatar: "x-deity" },
  { id: "cycles", name: "PATIENT MINER", description: "Claim 5 reward pools.", reward: 400, check: (s) => s.claimed >= 5, avatar: "x-void" },
  { id: "memory", name: "SHARP MIND", description: "Win the crypto memory game 3 times.", reward: 200, check: (s) => s.games.memoryWins >= 3, avatar: "x-overmind" },
  { id: "snake", name: "HASH SNAKE", description: "Score 15+ in Snake.", reward: 250, check: (s) => s.games.snakeBest >= 15, avatar: "x-satoshi" },
];

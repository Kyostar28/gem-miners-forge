import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MINERS, type Miner } from "@/data/miners";
import { COINS } from "@/lib/coins";
import { RACK_MAP, type RackModel } from "@/data/racks";


const KEY = "cryptominer:save:v1";
export const CYCLE_MS = 10 * 60 * 1000; // rewards pool every 10 minutes
export const POOL_CT = 12_000; // legacy export
export const POOL_LTC = 6; // legacy export
export const NETWORK_POWER = 250_000; // total network hash power (TH/s)

export interface Withdrawal {
  id: string;
  coin: string;
  amount: number;
  address: string;
  at: number;
  status: "PENDING" | "SENT";
}

export interface Rig {
  id: string;
  model: string; // RackModel key
  slots: (number | null)[]; // miner ids
}

export interface CloudDeposit {
  id: string;
  coin: string;
  amount: number;
  start: number;
  /** last claim timestamp — accrual base */
  last: number;
  source: "balance" | "external";
}

/** daily yield of a cloud mining contract */
export const CLOUD_DAILY = 0.0003; // 0.03% / 24h
export const DAY_MS = 86_400_000;

export interface SaveState {
  username: string;
  ct: number;
  ltc: number;
  /** balances of the other minable coins */
  coins: Record<string, number>;
  owned: number[]; // miner ids owned (inventory + mounted)
  /** racks owned by the user */
  rigs: Rig[];
  /** cloud mining contracts */
  cloud: CloudDeposit[];
  /** split weights per coin key (relative, normalized on use) */
  splits: Record<string, number>;
  cycleStart: number;
  claimed: number; // count of claimed cycles
  games: { memoryWins: number; snakeBest: number };
  /** arcade results: slug -> { best, wins } */
  arcade: Record<string, { best: number; wins: number }>;
  /** extra TH/s earned playing games */
  bonusPower: number;
  achievements: string[];
  withdrawals: Withdrawal[];
}


const defaultSplits = (): Record<string, number> => {
  const s: Record<string, number> = {};
  for (const c of COINS) s[c.key] = c.key === "CT" ? 60 : c.key === "LTC" ? 40 : 0;
  return s;
};

const emptyCoins = (): Record<string, number> => {
  const s: Record<string, number> = {};
  for (const c of COINS) if (c.key !== "CT" && c.key !== "LTC") s[c.key] = 0;
  return s;
};

const newRig = (model: string): Rig => ({
  id: Math.random().toString(16).slice(2, 10),
  model,
  slots: Array.from({ length: RACK_MAP[model]?.slots ?? 3 }, () => null),
});

const initial = (username: string): SaveState => ({
  username,
  ct: 500,
  ltc: 0,
  coins: emptyCoins(),
  owned: [1],
  rigs: [{ ...newRig("shelf"), slots: [1, null, null] }],
  cloud: [],
  splits: defaultSplits(),
  cycleStart: Date.now(),
  claimed: 0,
  games: { memoryWins: 0, snakeBest: 0 },
  arcade: {},
  bonusPower: 0,
  achievements: [],
  withdrawals: [],
});

/** fills missing fields on saves created by older versions */
function migrate(raw: Partial<SaveState> & { splitCt?: number }): SaveState {
  const base = initial(raw.username ?? "miner");
  const splits = { ...base.splits, ...(raw.splits ?? {}) };
  if (!raw.splitCt === undefined) { /* noop */ }
  if (!raw.splits && typeof raw.splitCt === "number") {
    splits.CT = raw.splitCt;
    splits.LTC = 100 - raw.splitCt;
  }
  // older saves had no rigs: auto-mount every owned miner into shelves
  let rigs = raw.rigs;
  if (!rigs) {
    const owned = raw.owned ?? [];
    rigs = [];
    for (let i = 0; i < Math.max(1, Math.ceil(owned.length / 3)); i++) {
      const chunk = owned.slice(i * 3, i * 3 + 3);
      rigs.push({ ...newRig("shelf"), slots: [chunk[0] ?? null, chunk[1] ?? null, chunk[2] ?? null] });
    }
  }
  return {
    ...base,
    ...raw,
    rigs,
    cloud: raw.cloud ?? [],
    coins: { ...base.coins, ...(raw.coins ?? {}) },
    splits,
    games: { ...base.games, ...(raw.games ?? {}) },
    arcade: raw.arcade ?? {},
    bonusPower: raw.bonusPower ?? 0,
    achievements: raw.achievements ?? [],

    withdrawals: raw.withdrawals ?? [],
  };
}

interface Ctx {
  ready: boolean;
  state: SaveState | null;
  login: (username: string) => void;
  logout: () => void;
  update: (patch: Partial<SaveState> | ((s: SaveState) => Partial<SaveState>)) => void;
  power: number;
  basePower: number;
  ownedMiners: { miner: Miner; count: number }[];
  buy: (miner: Miner) => boolean;
  sell: (miner: Miner) => boolean;
  claim: () => void;
  timeLeft: number;
  /** legacy CT/LTC estimate */
  estimate: { ct: number; ltc: number };
  /** estimate per coin key for the current cycle */
  estimates: Record<string, number>;
  splitPct: Record<string, number>;
  setSplits: (s: Record<string, number>) => void;
  balance: (key: string) => number;
  awardPower: (thps: number) => void;
  recordArcade: (slug: string, score: number, won: boolean) => void;
  withdraw: (coin: string, amount: number, address: string) => string | null;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SaveState | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef<SaveState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(migrate(JSON.parse(raw)));
    } catch {
      /* ignore corrupt save */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
    else localStorage.removeItem(KEY);
  }, [state, ready]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const update: Ctx["update"] = useCallback((patch) => {
    setState((s) => {
      if (!s) return s;
      const p = typeof patch === "function" ? patch(s) : patch;
      return { ...s, ...p };
    });
  }, []);

  const login = useCallback((username: string) => setState(initial(username.trim())), []);
  const logout = useCallback(() => setState(null), []);

  const ownedMiners = useMemo(() => {
    if (!state) return [];
    const counts = new Map<number, number>();
    for (const id of state.owned) counts.set(id, (counts.get(id) ?? 0) + 1);
    return [...counts.entries()]
      .map(([id, count]) => ({ miner: MINERS.find((m) => m.id === id)!, count }))
      .filter((x) => x.miner)
      .sort((a, b) => b.miner.hashRate - a.miner.hashRate);
  }, [state]);

  const basePower = useMemo(
    () => ownedMiners.reduce((sum, o) => sum + o.miner.hashRate * o.count, 0),
    [ownedMiners],
  );
  const power = basePower + (state?.bonusPower ?? 0);

  const buy = useCallback(
    (miner: Miner) => {
      const s = stateRef.current;
      if (!s || s.ct < miner.price) return false;
      update({ ct: s.ct - miner.price, owned: [...s.owned, miner.id] });
      return true;
    },
    [update],
  );

  const sell = useCallback(
    (miner: Miner) => {
      const s = stateRef.current;
      if (!s) return false;
      const i = s.owned.indexOf(miner.id);
      if (i === -1) return false;
      const owned = [...s.owned];
      owned.splice(i, 1);
      update({ ct: s.ct + Math.round(miner.price * 0.7), owned });
      return true;
    },
    [update],
  );

  const share = power / (NETWORK_POWER + power);

  const splitPct = useMemo(() => {
    const splits = state?.splits ?? defaultSplits();
    const total = COINS.reduce((t, c) => t + (splits[c.key] ?? 0), 0);
    const out: Record<string, number> = {};
    for (const c of COINS) out[c.key] = total > 0 ? ((splits[c.key] ?? 0) / total) * 100 : 0;
    return out;
  }, [state?.splits]);

  const estimates = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of COINS) out[c.key] = c.pool * share * (splitPct[c.key] / 100);
    return out;
  }, [share, splitPct]);

  const estimate = useMemo(() => ({ ct: estimates.CT ?? 0, ltc: estimates.LTC ?? 0 }), [estimates]);

  const elapsed = state ? now - state.cycleStart : 0;
  const timeLeft = Math.max(0, CYCLE_MS - elapsed);

  const claim = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (Date.now() - s.cycleStart < CYCLE_MS) return;
    const coins = { ...s.coins };
    for (const c of COINS) {
      if (c.key === "CT" || c.key === "LTC") continue;
      coins[c.key] = (coins[c.key] ?? 0) + (estimates[c.key] ?? 0);
    }
    update({
      ct: s.ct + (estimates.CT ?? 0),
      ltc: s.ltc + (estimates.LTC ?? 0),
      coins,
      cycleStart: Date.now(),
      claimed: s.claimed + 1,
    });
  }, [estimates, update]);

  const setSplits = useCallback((splits: Record<string, number>) => update({ splits }), [update]);

  const balance = useCallback(
    (key: string) => {
      const s = stateRef.current;
      if (!s) return 0;
      if (key === "CT") return s.ct;
      if (key === "LTC") return s.ltc;
      return s.coins[key] ?? 0;
    },
    [],
  );

  const awardPower = useCallback((thps: number) => update((s) => ({ bonusPower: s.bonusPower + thps })), [update]);

  const recordArcade = useCallback(
    (slug: string, score: number, won: boolean) =>
      update((s) => {
        const prev = s.arcade[slug] ?? { best: 0, wins: 0 };
        return {
          arcade: {
            ...s.arcade,
            [slug]: { best: Math.max(prev.best, score), wins: prev.wins + (won ? 1 : 0) },
          },
        };
      }),
    [update],
  );

  const withdraw = useCallback(
    (coin: string, amount: number, address: string): string | null => {
      const s = stateRef.current;
      if (!s) return "Sesión no iniciada.";
      if (!address.trim() || address.trim().length < 8) return "Dirección inválida.";
      if (!(amount > 0)) return "Cantidad inválida.";
      const bal = coin === "CT" ? s.ct : coin === "LTC" ? s.ltc : (s.coins[coin] ?? 0);
      if (amount > bal) return "Saldo insuficiente.";
      const entry: Withdrawal = {
        id: Math.random().toString(16).slice(2, 10).toUpperCase(),
        coin,
        amount,
        address: address.trim(),
        at: Date.now(),
        status: "PENDING",
      };
      const patch: Partial<SaveState> = { withdrawals: [entry, ...s.withdrawals].slice(0, 50) };
      if (coin === "CT") patch.ct = s.ct - amount;
      else if (coin === "LTC") patch.ltc = s.ltc - amount;
      else patch.coins = { ...s.coins, [coin]: (s.coins[coin] ?? 0) - amount };
      update(patch);
      return null;
    },
    [update],
  );

  const value: Ctx = {
    ready,
    state,
    login,
    logout,
    update,
    power,
    basePower,
    ownedMiners,
    buy,
    sell,
    claim,
    timeLeft,
    estimate,
    estimates,
    splitPct,
    setSplits,
    balance,
    awardPower,
    recordArcade,
    withdraw,
  };

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

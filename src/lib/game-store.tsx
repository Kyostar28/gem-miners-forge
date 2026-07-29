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

const KEY = "cryptominer:save:v1";
export const CYCLE_MS = 10 * 60 * 1000; // rewards pool every 10 minutes
export const POOL_CT = 12_000; // CT distributed per cycle across the network
export const POOL_LTC = 6; // LTC distributed per cycle across the network
export const NETWORK_POWER = 250_000; // total network hash power (TH/s)

export interface SaveState {
  username: string;
  ct: number;
  ltc: number;
  owned: number[]; // miner ids (repeatable)
  splitCt: number; // 0..100, rest goes to LTC
  cycleStart: number;
  claimed: number; // count of claimed cycles
  games: { memoryWins: number; snakeBest: number };
  achievements: string[];
}

const initial = (username: string): SaveState => ({
  username,
  ct: 500,
  ltc: 0,
  owned: [1],
  splitCt: 60,
  cycleStart: Date.now(),
  claimed: 0,
  games: { memoryWins: 0, snakeBest: 0 },
  achievements: [],
});

interface Ctx {
  ready: boolean;
  state: SaveState | null;
  login: (username: string) => void;
  logout: () => void;
  update: (patch: Partial<SaveState> | ((s: SaveState) => Partial<SaveState>)) => void;
  power: number;
  ownedMiners: { miner: Miner; count: number }[];
  buy: (miner: Miner) => boolean;
  sell: (miner: Miner) => boolean;
  claim: () => void;
  timeLeft: number;
  estimate: { ct: number; ltc: number };
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
      if (raw) setState(JSON.parse(raw) as SaveState);
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

  const power = useMemo(
    () => ownedMiners.reduce((sum, o) => sum + o.miner.hashRate * o.count, 0),
    [ownedMiners],
  );

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
  const estimate = useMemo(() => {
    const splitCt = state?.splitCt ?? 60;
    return {
      ct: POOL_CT * share * (splitCt / 100),
      ltc: POOL_LTC * share * ((100 - splitCt) / 100),
    };
  }, [share, state?.splitCt]);

  const elapsed = state ? now - state.cycleStart : 0;
  const timeLeft = Math.max(0, CYCLE_MS - elapsed);

  const claim = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (Date.now() - s.cycleStart < CYCLE_MS) return;
    update({
      ct: s.ct + estimate.ct,
      ltc: s.ltc + estimate.ltc,
      cycleStart: Date.now(),
      claimed: s.claimed + 1,
    });
  }, [estimate, update]);

  const value: Ctx = {
    ready,
    state,
    login,
    logout,
    update,
    power,
    ownedMiners,
    buy,
    sell,
    claim,
    timeLeft,
    estimate,
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

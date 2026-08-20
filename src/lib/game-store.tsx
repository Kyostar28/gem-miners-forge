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
import { ROOM_CAPACITY, ROOM_MAP, type RoomModel } from "@/data/rooms";
import {
  CRAFT_COUNT,
  RARITY_MAP,
  UPGRADE_COUNT,
  dismantleYield,
  nextRarity,
  rarityForTier,
  upgradeCost,
  upgradeTarget,
} from "@/data/forge";
import { getRank } from "@/lib/leagues";
import {
  ABSOLUTE_METRICS,
  QUEST_MAP,
  periodEnd,
  periodKey,
  pickQuests,
  type QuestDef,
  type QuestMetric,
  type QuestScope,
} from "@/lib/quests";


const KEY = "cryptominer:save:v1";
export const CYCLE_MS = 10 * 60 * 1000; // rewards pool every 10 minutes
/** los boosts de poder ganados jugando duran 24 horas */
export const BOOST_MS = 24 * 60 * 60 * 1000;
/** poder temporal que otorga completar cualquier juego */
export const GAME_BOOST_TH = 0.5;
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
  /** id of the room this rack lives in */
  room: string;
}

export interface Room {
  id: string;
  model: string; // RoomModel key
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
  /** avatar key from src/data/avatars.ts */
  avatar: string;
  /** base avatar chosen at signup (never changes) */
  baseAvatar: string;
  ct: number;
  ltc: number;
  /** balances of the other minable coins */
  coins: Record<string, number>;
  /** exotic avatars unlocked through achievements */
  unlockedAvatars: string[];
  owned: number[]; // miner ids owned (inventory + mounted)
  /** mining rooms owned — each holds up to 6 racks */
  rooms: Room[];
  /** racks owned by the user */
  rigs: Rig[];
  /** spare parts owned: key -> count */
  parts: Record<string, number>;
  /** boosters owned: key -> count */
  boosters: Record<string, number>;
  /** forge shards owned: rarity -> count */
  shards: Record<string, number>;
  /** cloud mining contracts */
  cloud: CloudDeposit[];
  /** split weights per coin key (relative, normalized on use) */
  splits: Record<string, number>;
  cycleStart: number;
  claimed: number; // count of claimed cycles
  games: { memoryWins: number; snakeBest: number };
  /** arcade results: slug -> { best, wins } */
  arcade: Record<string, { best: number; wins: number }>;
  /** legacy: poder extra permanente (ya no se usa para nuevas recompensas) */
  bonusPower: number;
  /** boosts temporales de poder ganados en juegos: caducan a las 24h */
  boosts: { id: string; th: number; src: string; until: number }[];
  achievements: string[];
  withdrawals: Withdrawal[];
  /** contadores acumulativos usados por las misiones */
  counters: Record<string, number>;
  /** estado de misiones por periodo */
  quests: Record<QuestScope, QuestPeriod>;
}

export interface QuestPeriod {
  /** clave del periodo UTC actual */
  key: string;
  /** ids de las 7 tareas del periodo */
  ids: string[];
  /** snapshot de contadores al iniciar el periodo */
  base: Record<string, number>;
  /** ids ya reclamados */
  claimed: string[];
}

export interface QuestView {
  def: QuestDef;
  progress: number;
  done: boolean;
  claimed: boolean;
}

/** cada rank (liga/división) aumenta el rewards pool un 10% sobre el anterior */
export const LEAGUE_POOL_STEP = 0.1;
export function leaguePoolMult(power: number) {
  return Math.pow(1 + LEAGUE_POOL_STEP, getRank(power).index);
}

const SCOPES: QuestScope[] = ["daily", "weekly", "monthly"];

const newQuestPeriod = (scope: QuestScope, counters: Record<string, number>, seed = ""): QuestPeriod => {
  const key = periodKey(scope);
  return { key, ids: pickQuests(scope, key, seed), base: { ...counters }, claimed: [] };
};

const initialQuests = (seed = ""): Record<QuestScope, QuestPeriod> => ({
  daily: newQuestPeriod("daily", {}, seed),
  weekly: newQuestPeriod("weekly", {}, seed),
  monthly: newQuestPeriod("monthly", {}, seed),
});



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

const uid = () => Math.random().toString(16).slice(2, 10);

/** incrementa varios contadores de misiones sobre un estado */
const cnt = (s: SaveState, deltas: Partial<Record<QuestMetric, number>>): Record<string, number> => {
  const out = { ...(s.counters ?? {}) };
  for (const [k, v] of Object.entries(deltas)) out[k] = (out[k] ?? 0) + (v ?? 0);
  return out;
};

const newRig = (model: string, room: string): Rig => ({
  id: uid(),
  model,
  room,
  slots: Array.from({ length: RACK_MAP[model]?.slots ?? 3 }, () => null),
});

const FIRST_ROOM = "room-1";

const initial = (username: string, avatar = "visor"): SaveState => ({
  username,
  avatar,
  baseAvatar: avatar,
  ct: 500,
  ltc: 0,
  coins: emptyCoins(),
  unlockedAvatars: [],
  owned: [1],
  rooms: [{ id: FIRST_ROOM, model: "garage" }],
  rigs: [{ ...newRig("shelf", FIRST_ROOM), slots: [1, null, null] }],
  parts: {},
  boosters: {},
  shards: { COMMON: 10 },
  cloud: [],

  splits: defaultSplits(),
  cycleStart: Date.now(),
  claimed: 0,
  games: { memoryWins: 0, snakeBest: 0 },
  arcade: {},
  bonusPower: 0,
  boosts: [],
  achievements: [],
  withdrawals: [],
  counters: {},
  quests: initialQuests(username),
});

/** fills missing fields on saves created by older versions */
function migrate(raw: Partial<SaveState> & { splitCt?: number }): SaveState {
  const base = initial(raw.username ?? "miner");
  const splits = { ...base.splits, ...(raw.splits ?? {}) };
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
      rigs.push({ ...newRig("shelf", FIRST_ROOM), slots: [chunk[0] ?? null, chunk[1] ?? null, chunk[2] ?? null] });
    }
  }

  // rooms: older saves had a flat rack list — split it into rooms of 6
  let rooms = raw.rooms;
  if (!rooms || rooms.length === 0) {
    const needed = Math.max(1, Math.ceil(rigs.length / ROOM_CAPACITY));
    rooms = Array.from({ length: needed }, (_, i) => ({
      id: i === 0 ? FIRST_ROOM : `room-${i + 1}`,
      model: i === 0 ? "garage" : "basement",
    }));
  }
  const roomIds = new Set(rooms.map((r) => r.id));
  const fill: Record<string, number> = {};
  rigs = rigs.map((r) => {
    let room = r.room && roomIds.has(r.room) ? r.room : "";
    if (!room) {
      const target = rooms!.find((rm) => (fill[rm.id] ?? 0) < ROOM_CAPACITY) ?? rooms![rooms!.length - 1];
      room = target.id;
    }
    fill[room] = (fill[room] ?? 0) + 1;
    return { ...r, room };
  });

  return {
    ...base,
    ...raw,
    avatar: raw.avatar ?? "visor",
    baseAvatar: raw.baseAvatar ?? raw.avatar ?? "visor",
    unlockedAvatars: raw.unlockedAvatars ?? [],
    rooms,
    rigs,
    parts: raw.parts ?? {},
    boosters: raw.boosters ?? {},
    shards: raw.shards ?? { COMMON: 10 },
    cloud: raw.cloud ?? [],

    coins: { ...base.coins, ...(raw.coins ?? {}) },
    splits,
    games: { ...base.games, ...(raw.games ?? {}) },
    arcade: raw.arcade ?? {},
    bonusPower: raw.bonusPower ?? 0,
    boosts: (raw.boosts ?? []).filter((b) => b.until > Date.now()),
    achievements: raw.achievements ?? [],

    withdrawals: raw.withdrawals ?? [],
    counters: raw.counters ?? {},
    quests: rollQuests(raw.quests ?? initialQuests(raw.username ?? ""), raw.counters ?? {}, raw.username ?? ""),
  };
}

/** rota los periodos vencidos generando nuevas tareas aleatorias */
function rollQuests(
  q: Record<QuestScope, QuestPeriod>,
  counters: Record<string, number>,
  seed: string,
): Record<QuestScope, QuestPeriod> {
  const out = { ...q };
  let changed = false;
  for (const scope of SCOPES) {
    const cur = out[scope];
    if (!cur || cur.key !== periodKey(scope)) {
      out[scope] = newQuestPeriod(scope, counters, seed);
      changed = true;
    }
  }
  return changed ? out : q;
}

interface Ctx {
  ready: boolean;
  state: SaveState | null;
  login: (username: string, avatar?: string) => void;
  logout: () => void;
  update: (patch: Partial<SaveState> | ((s: SaveState) => Partial<SaveState>)) => void;
  power: number;
  basePower: number;
  /** unmounted miners (inventory) */
  ownedMiners: { miner: Miner; count: number }[];
  /** rigs with their model + mounted miners */
  rigs: { rig: Rig; model: RackModel; miners: (Miner | null)[]; power: number }[];
  /** rooms with their model and racks */
  rooms: { room: Room; model: RoomModel; rigIds: string[]; free: number }[];
  buy: (miner: Miner) => boolean;
  sell: (miner: Miner) => boolean;
  buyRack: (model: RackModel, roomId?: string) => boolean;
  buyRoom: (model: RoomModel) => boolean;
  unlockAvatar: (key: string) => void;
  mount: (minerId: number, rigId: string, slot: number) => boolean;
  unmount: (rigId: string, slot: number) => void;
  claim: () => void;
  timeLeft: number;
  /** legacy CT/LTC estimate */
  estimate: { ct: number; ltc: number };
  /** estimate per coin key for the current cycle */
  estimates: Record<string, number>;
  splitPct: Record<string, number>;
  setSplits: (s: Record<string, number>) => void;
  balance: (key: string) => number;
  awardPower: (thps: number, src?: string) => void;
  /** poder temporal activo (TH/s) y sus boosts vigentes */
  boostPower: number;
  activeBoosts: { id: string; th: number; src: string; until: number }[];
  /** fusiona 10 piezas de una rareza en 1 de la siguiente (paga CT) */
  forgeCraft: (rarity: string) => string | null;
  /** mejora un minero al siguiente tier gastando piezas + CT */
  forgeUpgrade: (minerId: number) => string | null;
  /** desguaza un minero del inventario y devuelve piezas */
  dismantle: (minerId: number) => string | null;
  recordArcade: (slug: string, score: number, won: boolean) => void;
  withdraw: (coin: string, amount: number, address: string) => string | null;
  cloudDeposit: (coin: string, amount: number, source: "balance" | "external") => string | null;
  cloudMined: (dep: CloudDeposit, at?: number) => number;
  cloudClaim: (id: string) => void;
  cloudClose: (id: string) => void;
  /** incrementa un contador de misiones */
  bump: (metric: QuestMetric, n?: number) => void;
  /** misiones del periodo actual por scope */
  quests: Record<QuestScope, QuestView[]>;
  /** timestamp del próximo reinicio por scope */
  questReset: Record<QuestScope, number>;
  claimQuest: (scope: QuestScope, id: string) => void;
  /** multiplicador de rewards pool según liga/división (+10% por rank) */
  poolMult: number;
  now: number;
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

  const login = useCallback(
    (username: string, avatar = "visor") => setState(initial(username.trim(), avatar)),
    [],
  );
  const logout = useCallback(() => setState(null), []);

  /** miner ids currently mounted in rigs (multiset) */
  const mountedIds = useMemo(() => {
    const list: number[] = [];
    for (const r of state?.rigs ?? []) for (const id of r.slots) if (id != null) list.push(id);
    return list;
  }, [state?.rigs]);

  /** inventory = owned minus mounted */
  const ownedMiners = useMemo(() => {
    if (!state) return [];
    const counts = new Map<number, number>();
    for (const id of state.owned) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const id of mountedIds) counts.set(id, (counts.get(id) ?? 0) - 1);
    return [...counts.entries()]
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ miner: MINERS.find((m) => m.id === id)!, count }))
      .filter((x) => x.miner)
      .sort((a, b) => b.miner.hashRate - a.miner.hashRate);
  }, [state, mountedIds]);

  const rigs = useMemo(() => {
    const roomsList = state?.rooms ?? [];
    return (state?.rigs ?? []).map((rig) => {
      const model = RACK_MAP[rig.model] ?? RACK_MAP.shelf;
      const rm = roomsList.find((r) => r.id === rig.room);
      const boost = (ROOM_MAP[rm?.model ?? "garage"]?.boost ?? 1) * model.boost;
      const miners = rig.slots.map((id) => (id == null ? null : (MINERS.find((m) => m.id === id) ?? null)));
      const rigPower = miners.reduce((s, m) => s + (m ? m.hashRate * boost : 0), 0);
      return { rig, model, miners, power: rigPower };
    });
  }, [state?.rigs, state?.rooms]);

  const rooms = useMemo(() => {
    const list = state?.rooms ?? [];
    return list.map((room) => {
      const model = ROOM_MAP[room.model] ?? ROOM_MAP.garage;
      const rigIds = (state?.rigs ?? []).filter((r) => r.room === room.id).map((r) => r.id);
      return { room, model, rigIds, free: Math.max(0, ROOM_CAPACITY - rigIds.length) };
    });
  }, [state?.rooms, state?.rigs]);

  /** only mounted miners produce hash power */
  const basePower = useMemo(() => rigs.reduce((sum, r) => sum + r.power, 0), [rigs]);
  const activeBoosts = useMemo(
    () => (state?.boosts ?? []).filter((b) => b.until > now),
    [state?.boosts, now],
  );
  const boostPower = useMemo(() => activeBoosts.reduce((s, b) => s + b.th, 0), [activeBoosts]);
  const power = basePower + (state?.bonusPower ?? 0) + boostPower;

  const buyRack = useCallback(
    (model: RackModel, roomId?: string) => {
      const s = stateRef.current;
      if (!s || s.ct < model.price) return false;
      const count = (id: string) => s.rigs.filter((r) => r.room === id).length;
      const target =
        (roomId && count(roomId) < ROOM_CAPACITY ? roomId : null) ??
        s.rooms.find((r) => count(r.id) < ROOM_CAPACITY)?.id;
      if (!target) return false; // every room is full: buy another room
      update({
        ct: s.ct - model.price,
        rigs: [...s.rigs, newRig(model.key, target)],
        counters: cnt(s, { racksBought: 1, ctSpent: model.price }),
      });
      return true;
    },
    [update],
  );

  const buyRoom = useCallback(
    (model: RoomModel) => {
      const s = stateRef.current;
      if (!s || s.ct < model.price) return false;
      update({
        ct: s.ct - model.price,
        rooms: [...s.rooms, { id: `room-${uid()}`, model: model.key }],
        counters: cnt(s, { roomsBought: 1, ctSpent: model.price }),
      });
      return true;
    },
    [update],
  );

  const unlockAvatar = useCallback(
    (key: string) =>
      update((s) => (s.unlockedAvatars.includes(key) ? {} : { unlockedAvatars: [...s.unlockedAvatars, key] })),
    [update],
  );

  const mount = useCallback(
    (minerId: number, rigId: string, slot: number) => {
      const s = stateRef.current;
      if (!s) return false;
      const rigsNext = s.rigs.map((r) => {
        if (r.id !== rigId) return r;
        const slots = [...r.slots];
        if (slots[slot] != null) return r;
        slots[slot] = minerId;
        return { ...r, slots };
      });
      update({ rigs: rigsNext, counters: cnt(s, { mounts: 1 }) });
      return true;
    },
    [update],
  );

  const unmount = useCallback(
    (rigId: string, slot: number) => {
      const s = stateRef.current;
      if (!s) return;
      update({
        rigs: s.rigs.map((r) => {
          if (r.id !== rigId) return r;
          const slots = [...r.slots];
          slots[slot] = null;
          return { ...r, slots };
        }),
      });
    },
    [update],
  );


  const buy = useCallback(
    (miner: Miner) => {
      const s = stateRef.current;
      if (!s || s.ct < miner.price) return false;
      update({ ct: s.ct - miner.price, owned: [...s.owned, miner.id], counters: cnt(s, { minersBought: 1, ctSpent: miner.price }) });
      return true;
    },
    [update],
  );

  const sell = useCallback(
    (miner: Miner) => {
      const s = stateRef.current;
      if (!s) return false;
      // only unmounted units can be sold
      const mounted = s.rigs.flatMap((r) => r.slots).filter((id) => id === miner.id).length;
      const total = s.owned.filter((id) => id === miner.id).length;
      if (total - mounted <= 0) return false;
      const i = s.owned.indexOf(miner.id);
      const owned = [...s.owned];
      owned.splice(i, 1);
      update({ ct: s.ct + Math.round(miner.price * 0.7), owned, counters: cnt(s, { sells: 1, marketTrades: 1 }) });
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

  /** +10% de rewards pool por cada rank (liga/división) alcanzado */
  const poolMult = useMemo(() => leaguePoolMult(power), [power]);

  const bump = useCallback(
    (metric: QuestMetric, n = 1) =>
      update((s) => ({ counters: { ...(s.counters ?? {}), [metric]: (s.counters?.[metric] ?? 0) + n } })),
    [update],
  );

  const estimates = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of COINS) out[c.key] = c.pool * share * (splitPct[c.key] / 100) * poolMult;
    return out;
  }, [share, splitPct, poolMult]);

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
      shards: { ...s.shards, COMMON: (s.shards?.COMMON ?? 0) + 2 },
      counters: {
        ...(s.counters ?? {}),
        claims: (s.counters?.claims ?? 0) + 1,
        ctEarned: (s.counters?.ctEarned ?? 0) + (estimates.CT ?? 0),
        shardsGained: (s.counters?.shardsGained ?? 0) + 2,
      },
    });
  }, [estimates, update]);

  // ---------- MISIONES ----------
  /** rota los periodos vencidos (00:00 UTC diario, lunes, día 1) */
  useEffect(() => {
    if (!ready || !state) return;
    const next = rollQuests(state.quests, state.counters ?? {}, state.username);
    if (next !== state.quests) update({ quests: next });
  }, [ready, state, now, update]);

  const questReset = useMemo(
    () => ({ daily: periodEnd("daily", now), weekly: periodEnd("weekly", now), monthly: periodEnd("monthly", now) }),
    [now],
  );

  const quests = useMemo(() => {
    const out = { daily: [], weekly: [], monthly: [] } as Record<QuestScope, QuestView[]>;
    if (!state) return out;
    for (const scope of SCOPES) {
      const period = state.quests?.[scope];
      if (!period) continue;
      out[scope] = period.ids
        .map((id) => QUEST_MAP[id])
        .filter(Boolean)
        .map((def) => {
          const absolute = ABSOLUTE_METRICS.includes(def.metric);
          const raw = absolute
            ? def.metric === "power"
              ? power
              : 0
            : (state.counters?.[def.metric] ?? 0) - (period.base?.[def.metric] ?? 0);
          const progress = Math.max(0, Math.min(def.target, raw));
          return { def, progress, done: progress >= def.target, claimed: period.claimed.includes(def.id) };
        });
    }
    return out;
  }, [state, power]);

  const claimQuest = useCallback(
    (scope: QuestScope, id: string) => {
      const s = stateRef.current;
      if (!s) return;
      const view = quests[scope].find((q) => q.def.id === id);
      if (!view || !view.done || view.claimed) return;
      const { def } = view;
      const period = s.quests[scope];
      update({
        ct: s.ct + def.ct,
        shards: def.shards ? { ...s.shards, COMMON: (s.shards?.COMMON ?? 0) + def.shards } : s.shards,
        boosts: def.th
          ? [
              ...(s.boosts ?? []).filter((b) => b.until > Date.now()),
              { id: uid(), th: def.th, src: `quest:${def.id}`, until: Date.now() + BOOST_MS },
            ]
          : s.boosts,
        quests: { ...s.quests, [scope]: { ...period, claimed: [...period.claimed, id] } },
      });
    },
    [quests, update],
  );

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

  /** otorga poder de minado TEMPORAL: caduca a las 24 horas */
  const awardPower = useCallback(
    (thps: number, src = "game") =>
      update((s) => ({
        boosts: [
          ...(s.boosts ?? []).filter((b) => b.until > Date.now()),
          { id: uid(), th: thps, src, until: Date.now() + BOOST_MS },
        ],
        counters: cnt(s, { boostsGained: 1 }),
      })),
    [update],
  );

  const recordArcade = useCallback(
    (slug: string, score: number, won: boolean) =>
      update((s) => {
        const prev = s.arcade[slug] ?? { best: 0, wins: 0 };
        return {
          arcade: {
            ...s.arcade,
            [slug]: { best: Math.max(prev.best, score), wins: prev.wins + (won ? 1 : 0) },
          },
          counters: cnt(s, won ? { arcadeWins: 1, gamesWon: 1 } : {}),
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
      const patch: Partial<SaveState> = {
        withdrawals: [entry, ...s.withdrawals].slice(0, 50),
        counters: cnt(s, { withdrawals: 1 }),
      };
      if (coin === "CT") patch.ct = s.ct - amount;
      else if (coin === "LTC") patch.ltc = s.ltc - amount;
      else patch.coins = { ...s.coins, [coin]: (s.coins[coin] ?? 0) - amount };
      update(patch);
      return null;
    },
    [update],
  );

  // ---------- CLOUD MINING ----------
  const addBalance = (s: SaveState, coin: string, amount: number): Partial<SaveState> =>
    coin === "CT"
      ? { ct: s.ct + amount }
      : coin === "LTC"
        ? { ltc: s.ltc + amount }
        : { coins: { ...s.coins, [coin]: (s.coins[coin] ?? 0) + amount } };

  const cloudDeposit = useCallback(
    (coin: string, amount: number, source: "balance" | "external"): string | null => {
      const s = stateRef.current;
      if (!s) return "Sesión no iniciada.";
      if (!(amount > 0)) return "Cantidad inválida.";
      const patch: Partial<SaveState> = {};
      if (source === "balance") {
        const bal = coin === "CT" ? s.ct : coin === "LTC" ? s.ltc : (s.coins[coin] ?? 0);
        if (amount > bal) return "Saldo insuficiente en tu balance.";
        if (coin === "CT") patch.ct = s.ct - amount;
        else if (coin === "LTC") patch.ltc = s.ltc - amount;
        else patch.coins = { ...s.coins, [coin]: (s.coins[coin] ?? 0) - amount };
      }
      const dep: CloudDeposit = {
        id: Math.random().toString(16).slice(2, 10).toUpperCase(),
        coin,
        amount,
        start: Date.now(),
        last: Date.now(),
        source,
      };
      update({ ...patch, cloud: [dep, ...s.cloud], counters: cnt(s, { cloudDeposits: 1 }) });
      return null;
    },
    [update],
  );

  const cloudMined = useCallback(
    (dep: CloudDeposit, at: number = Date.now()) =>
      Math.max(0, dep.amount * CLOUD_DAILY * ((at - dep.last) / DAY_MS)),
    [],
  );

  const cloudClaim = useCallback(
    (id: string) => {
      const s = stateRef.current;
      if (!s) return;
      const dep = s.cloud.find((d) => d.id === id);
      if (!dep) return;
      const mined = cloudMined(dep);
      if (mined <= 0) return;
      update({
        ...addBalance(s, dep.coin, mined),
        cloud: s.cloud.map((d) => (d.id === id ? { ...d, last: Date.now() } : d)),
        counters: cnt(s, { cloudClaims: 1 }),
      });
    },
    [update, cloudMined],
  );

  /** close a contract: mined + principal go back to the balance */
  const cloudClose = useCallback(
    (id: string) => {
      const s = stateRef.current;
      if (!s) return;
      const dep = s.cloud.find((d) => d.id === id);
      if (!dep) return;
      const total = cloudMined(dep) + dep.amount;
      update({ ...addBalance(s, dep.coin, total), cloud: s.cloud.filter((d) => d.id !== id) });
    },
    [update, cloudMined],
  );

  // ---------- FORJA ----------
  const forgeCraft = useCallback(
    (rarity: string): string | null => {
      const s = stateRef.current;
      if (!s) return "Sesión no iniciada.";
      const def = RARITY_MAP[rarity];
      const next = def ? nextRarity(def.key) : null;
      if (!def || !next) return "Esta rareza no se puede fusionar.";
      if ((s.shards[rarity] ?? 0) < CRAFT_COUNT) return `Necesitas ${CRAFT_COUNT} piezas ${def.name.toLowerCase()}s.`;
      if (s.ct < def.craftCt) return "CT insuficiente.";
      update({
        ct: s.ct - def.craftCt,
        shards: {
          ...s.shards,
          [rarity]: (s.shards[rarity] ?? 0) - CRAFT_COUNT,
          [next]: (s.shards[next] ?? 0) + 1,
        },
        counters: cnt(s, { forgeCrafts: 1, ctSpent: def.craftCt }),
      });
      return null;
    },
    [update],
  );

  const forgeUpgrade = useCallback(
    (minerId: number): string | null => {
      const s = stateRef.current;
      if (!s) return "Sesión no iniciada.";
      const miner = MINERS.find((m) => m.id === minerId);
      if (!miner) return "Minero desconocido.";
      const mounted = s.rigs.flatMap((r) => r.slots).filter((id) => id === minerId).length;
      if (s.owned.filter((id) => id === minerId).length - mounted <= 0)
        return "Desmonta la unidad del rack antes de forjarla.";
      const target = upgradeTarget(miner);
      if (!target) return "Esta unidad ya está en el tier máximo.";
      const rarity = rarityForTier(miner.tier);
      if ((s.shards[rarity] ?? 0) < UPGRADE_COUNT)
        return `Necesitas ${UPGRADE_COUNT} piezas ${RARITY_MAP[rarity].name.toLowerCase()}s.`;
      const cost = upgradeCost(miner);
      if (s.ct < cost) return "CT insuficiente.";
      const owned = [...s.owned];
      owned.splice(owned.indexOf(minerId), 1);
      owned.push(target.id);
      update({
        ct: s.ct - cost,
        owned,
        shards: { ...s.shards, [rarity]: (s.shards[rarity] ?? 0) - UPGRADE_COUNT },
        counters: cnt(s, { forgeUpgrades: 1, ctSpent: cost }),
      });
      return null;
    },
    [update],
  );

  const dismantle = useCallback(
    (minerId: number): string | null => {
      const s = stateRef.current;
      if (!s) return "Sesión no iniciada.";
      const miner = MINERS.find((m) => m.id === minerId);
      if (!miner) return "Minero desconocido.";
      const mounted = s.rigs.flatMap((r) => r.slots).filter((id) => id === minerId).length;
      if (s.owned.filter((id) => id === minerId).length - mounted <= 0)
        return "Desmonta la unidad del rack antes de desguazarla.";
      const { rarity, amount } = dismantleYield(miner);
      const owned = [...s.owned];
      owned.splice(owned.indexOf(minerId), 1);
      update({
        owned,
        shards: { ...s.shards, [rarity]: (s.shards[rarity] ?? 0) + amount },
        counters: cnt(s, { dismantles: 1, shardsGained: amount }),
      });
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
    rigs,
    rooms,
    buy,
    sell,
    buyRack,
    buyRoom,
    unlockAvatar,
    mount,
    unmount,
    claim,
    timeLeft,
    estimate,
    estimates,
    splitPct,
    setSplits,
    balance,
    awardPower,
    boostPower,
    activeBoosts,
    forgeCraft,
    forgeUpgrade,
    dismantle,
    recordArcade,
    withdraw,
    cloudDeposit,
    cloudMined,
    cloudClaim,
    cloudClose,
    bump,
    quests,
    questReset,
    claimQuest,
    poolMult,
    now,
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

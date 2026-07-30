import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import type { ArcadeApi } from "@/components/ArcadeShell";

export interface ArcadeGame {
  slug: string;
  name: string;
  icon: string;
  description: string;
  help: string;
  target: number;
  /** TH/s otorgados al completar */
  reward: number;
  Game: ComponentType<{ api: ArcadeApi }>;
}

const COIN_SET = [
  { sym: "BTC", icon: "₿", color: "#f7931a" },
  { sym: "ETH", icon: "Ξ", color: "#8c8cff" },
  { sym: "SOL", icon: "◎", color: "#14f195" },
  { sym: "DOGE", icon: "Ð", color: "#c2a633" },
  { sym: "XMR", icon: "ɱ", color: "#ff6600" },
  { sym: "TRX", icon: "⟁", color: "#ff0630" },
];

const rnd = (n: number) => Math.floor(Math.random() * n);

/* ------------------------------------------------------------------ 1. WHACK */
function BotWhack({ api }: { api: ArcadeApi }) {
  const [cell, setCell] = useState({ i: rnd(9), bad: false });
  useEffect(() => {
    const t = setInterval(() => setCell({ i: rnd(9), bad: Math.random() < 0.3 }), 950);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="cm-grid9">
      {Array.from({ length: 9 }).map((_, i) => {
        const on = cell.i === i;
        return (
          <button
            key={i}
            type="button"
            className={`cm-hole ${on ? (cell.bad ? "is-bad" : "is-good") : ""}`}
            onClick={() => {
              if (!on) return;
              if (cell.bad) api.hit();
              else api.add();
              setCell({ i: rnd(9), bad: Math.random() < 0.3 });
            }}
            aria-label={on ? (cell.bad ? "virus" : "bloque") : "vacío"}
          >
            {on ? (cell.bad ? "☠" : "⛏") : ""}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- 2. REACTION */
function ReflexHash({ api }: { api: ArcadeApi }) {
  const [go, setGo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arm = useCallback(() => {
    setGo(false);
    timer.current = setTimeout(() => setGo(true), 800 + rnd(2200));
  }, []);
  useEffect(() => {
    arm();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [arm]);
  return (
    <button
      type="button"
      className={`cm-reflex ${go ? "is-go" : ""}`}
      onClick={() => {
        if (go) api.add();
        else {
          api.hit();
          if (timer.current) clearTimeout(timer.current);
        }
        arm();
      }}
    >
      {go ? "¡HASH! CLIC" : "ESPERA…"}
    </button>
  );
}

/* ------------------------------------------------------------------ 3. SIMON */
function NodeSequence({ api }: { api: ArcadeApi }) {
  const [seq, setSeq] = useState<number[]>([rnd(4)]);
  const [flash, setFlash] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    setShowing(true);
    setIdx(0);
    let i = 0;
    const t = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(t);
        setFlash(null);
        setShowing(false);
        return;
      }
      const v = seq[i];
      setFlash(v);
      setTimeout(() => setFlash(null), 320);
      i++;
    }, 620);
    return () => clearInterval(t);
  }, [seq]);

  const press = (v: number) => {
    if (showing) return;
    if (seq[idx] === v) {
      if (idx + 1 === seq.length) {
        api.add();
        setSeq((s) => [...s, rnd(4)]);
      } else setIdx(idx + 1);
    } else {
      api.hit();
      setSeq((s) => [...s]);
    }
  };

  return (
    <div className="cm-simon">
      <p className="cm-note">{showing ? "MEMORIZA…" : "REPITE LA SECUENCIA"}</p>
      <div className="cm-simon__pads">
        {[0, 1, 2, 3].map((v) => (
          <button
            key={v}
            type="button"
            className={`cm-pad cm-pad--${v} ${flash === v ? "is-flash" : ""}`}
            onClick={() => press(v)}
            aria-label={`Nodo ${v + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- 4. MATH */
function HashMath({ api }: { api: ArcadeApi }) {
  const [q, setQ] = useState(() => makeQ());
  function makeQ() {
    const a = 2 + rnd(18);
    const b = 2 + rnd(18);
    const mul = Math.random() < 0.4;
    const res = mul ? a * b : a + b;
    const opts = [res, res + 1 + rnd(4), Math.max(0, res - 1 - rnd(4)), res + 5 + rnd(9)].sort(() => Math.random() - 0.5);
    return { text: `${a} ${mul ? "×" : "+"} ${b}`, res, opts };
  }
  return (
    <div className="cm-quiz">
      <div className="cm-quiz__q">{q.text} = ?</div>
      <div className="cm-quiz__opts">
        {q.opts.map((o, i) => (
          <button
            key={i}
            type="button"
            className="cm-btn cm-btn--ghost"
            onClick={() => {
              if (o === q.res) api.add();
              else api.hit();
              setQ(makeQ());
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 5. CATCHER */
function CoinCatcher({ api }: { api: ArcadeApi }) {
  const [x, setX] = useState(50);
  const [coin, setCoin] = useState({ x: rnd(90) + 5, y: 0 });
  const xRef = useRef(50);
  xRef.current = x;

  useEffect(() => {
    const t = setInterval(() => {
      setCoin((c) => {
        if (c.y >= 88) {
          if (Math.abs(c.x - xRef.current) <= 12) api.add();
          else api.hit();
          return { x: rnd(90) + 5, y: 0 };
        }
        return { ...c, y: c.y + 4 };
      });
    }, 60);
    return () => clearInterval(t);
  }, [api]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setX((v) => Math.max(6, v - 8));
      if (e.key === "ArrowRight") setX((v) => Math.min(94, v + 8));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="cm-field"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setX(Math.min(94, Math.max(6, ((e.clientX - r.left) / r.width) * 100)));
      }}
    >
      <span className="cm-coin" style={{ left: `${coin.x}%`, top: `${coin.y}%` }}>◉</span>
      <span className="cm-basket" style={{ left: `${x}%` }}>▬</span>
    </div>
  );
}

/* ----------------------------------------------------------------- 6. DODGER */
function BlockDodge({ api }: { api: ArcadeApi }) {
  const [x, setX] = useState(50);
  const [blocks, setBlocks] = useState<{ id: number; x: number; y: number }[]>([]);
  const xRef = useRef(50);
  xRef.current = x;
  const idRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBlocks((bs) => {
        const next = bs
          .map((b) => ({ ...b, y: b.y + 5 }))
          .filter((b) => {
            if (b.y >= 82 && b.y <= 94 && Math.abs(b.x - xRef.current) < 9) {
              api.hit();
              return false;
            }
            if (b.y > 100) {
              api.add();
              return false;
            }
            return true;
          });
        if (Math.random() < 0.35) next.push({ id: idRef.current++, x: rnd(90) + 5, y: 0 });
        return next;
      });
    }, 90);
    return () => clearInterval(t);
  }, [api]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setX((v) => Math.max(5, v - 9));
      if (e.key === "ArrowRight") setX((v) => Math.min(95, v + 9));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="cm-field"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setX(Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100)));
      }}
    >
      {blocks.map((b) => (
        <span key={b.id} className="cm-block" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
      ))}
      <span className="cm-ship" style={{ left: `${x}%` }}>▲</span>
    </div>
  );
}

/* ----------------------------------------------------------------- 7. TYPING */
function HexTyper({ api }: { api: ArcadeApi }) {
  const gen = () => Array.from({ length: 4 }, () => "0123456789abcdef"[rnd(16)]).join("");
  const [word, setWord] = useState(gen);
  const [val, setVal] = useState("");
  return (
    <form
      className="cm-typer"
      onSubmit={(e) => {
        e.preventDefault();
        if (val.trim().toLowerCase() === word) api.add();
        else api.hit();
        setWord(gen());
        setVal("");
      }}
    >
      <div className="cm-typer__word">0x{word}</div>
      <input className="cm-input" autoFocus value={val} onChange={(e) => setVal(e.target.value)} aria-label="Escribe el hash" placeholder="escribe el hash…" />
      <button type="submit" className="cm-btn">ENVIAR</button>
    </form>
  );
}

/* ---------------------------------------------------------------- 8. ODD ONE */
function OddOneOut({ api }: { api: ArcadeApi }) {
  const build = () => {
    const [a, b] = [rnd(COIN_SET.length), rnd(COIN_SET.length)];
    const base = COIN_SET[a];
    const odd = COIN_SET[(a + 1 + (b % (COIN_SET.length - 1))) % COIN_SET.length];
    return { base, odd, pos: rnd(9) };
  };
  const [g, setG] = useState(build);
  return (
    <div className="cm-grid9 cm-grid9--icons">
      {Array.from({ length: 9 }).map((_, i) => {
        const c = i === g.pos ? g.odd : g.base;
        return (
          <button
            key={i}
            type="button"
            className="cm-hole cm-hole--icon"
            style={{ color: c.color }}
            onClick={() => {
              if (i === g.pos) api.add();
              else api.hit();
              setG(build());
            }}
            aria-label={c.sym}
          >
            {c.icon}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ 9. FLASH */
function CoinFlash({ api }: { api: ArcadeApi }) {
  const [target, setTarget] = useState(() => rnd(COIN_SET.length));
  const [show, setShow] = useState(true);
  const opts = useMemo(() => {
    const set = new Set<number>([target]);
    while (set.size < 4) set.add(rnd(COIN_SET.length));
    return [...set].sort(() => Math.random() - 0.5);
  }, [target]);

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div className="cm-flashgame">
      {show ? (
        <div className="cm-flashgame__coin" style={{ color: COIN_SET[target].color }}>{COIN_SET[target].icon}</div>
      ) : (
        <>
          <p className="cm-note">¿Qué moneda apareció?</p>
          <div className="cm-quiz__opts">
            {opts.map((i) => (
              <button
                key={i}
                type="button"
                className="cm-btn cm-btn--ghost"
                onClick={() => {
                  if (i === target) api.add();
                  else api.hit();
                  setTarget(rnd(COIN_SET.length));
                }}
              >
                {COIN_SET[i].icon} {COIN_SET[i].sym}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- 10. TIMING */
function PrecisionStop({ api }: { api: ArcadeApi }) {
  const [pos, setPos] = useState(0);
  const dir = useRef(1);
  const running = useRef(true);
  useEffect(() => {
    const t = setInterval(() => {
      if (!running.current) return;
      setPos((p) => {
        let n = p + dir.current * 3;
        if (n >= 100) { n = 100; dir.current = -1; }
        if (n <= 0) { n = 0; dir.current = 1; }
        return n;
      });
    }, 30);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="cm-timing">
      <div className="cm-timing__track">
        <div className="cm-timing__zone" />
        <div className="cm-timing__cursor" style={{ left: `${pos}%` }} />
      </div>
      <button
        type="button"
        className="cm-btn"
        onClick={() => {
          if (pos >= 40 && pos <= 60) api.add();
          else api.hit();
        }}
      >
        STOP
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- 11. TRIVIA */
const TRIVIA = [
  { q: "¿Qué cripto usa el símbolo ₿?", o: ["Bitcoin", "Ethereum", "Solana"], a: 0 },
  { q: "¿Quién creó Bitcoin (seudónimo)?", o: ["Vitalik", "Satoshi Nakamoto", "CZ"], a: 1 },
  { q: "¿Qué red usa 'gas' para las fees?", o: ["Ethereum", "Litecoin", "Monero"], a: 0 },
  { q: "¿Cuál es una memecoin?", o: ["XMR", "DOGE", "TRX"], a: 1 },
  { q: "¿Qué cripto prioriza la privacidad?", o: ["Monero", "Solana", "Polygon"], a: 0 },
  { q: "¿Cuántos BTC existirán como máximo?", o: ["21 millones", "100 millones", "Infinitos"], a: 0 },
  { q: "¿Qué es un ASIC?", o: ["Una wallet", "Hardware de minado", "Un exchange"], a: 1 },
  { q: "POL es el token de…", o: ["Polkadot", "Polygon", "Polymath"], a: 1 },
  { q: "¿Qué mide TH/s?", o: ["Poder de hash", "Precio", "Latencia"], a: 0 },
  { q: "Litecoin se considera…", o: ["La plata del Bitcoin", "Una stablecoin", "Un NFT"], a: 0 },
];
function CryptoTrivia({ api }: { api: ArcadeApi }) {
  const [i, setI] = useState(() => rnd(TRIVIA.length));
  const q = TRIVIA[i];
  return (
    <div className="cm-quiz">
      <div className="cm-quiz__q">{q.q}</div>
      <div className="cm-quiz__opts cm-quiz__opts--col">
        {q.o.map((o, k) => (
          <button
            key={k}
            type="button"
            className="cm-btn cm-btn--ghost"
            onClick={() => {
              if (k === q.a) api.add();
              else api.hit();
              setI(rnd(TRIVIA.length));
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 12. SHOOTER */
function TargetHunter({ api }: { api: ArcadeApi }) {
  const [p, setP] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const t = setInterval(() => setP({ x: 8 + rnd(84), y: 10 + rnd(75) }), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="cm-field cm-field--hunt" onClick={() => api.hit()}>
      <button
        type="button"
        className="cm-target"
        style={{ left: `${p.x}%`, top: `${p.y}%` }}
        onClick={(e) => {
          e.stopPropagation();
          api.add();
          setP({ x: 8 + rnd(84), y: 10 + rnd(75) });
        }}
        aria-label="Objetivo"
      >
        ◎
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- 13. COLORMATCH */
function ColorMatch({ api }: { api: ArcadeApi }) {
  const [t, setT] = useState(() => rnd(COIN_SET.length));
  const opts = useMemo(() => {
    const set = new Set<number>([t]);
    while (set.size < 4) set.add(rnd(COIN_SET.length));
    return [...set].sort(() => Math.random() - 0.5);
  }, [t]);
  return (
    <div className="cm-flashgame">
      <div className="cm-flashgame__coin" style={{ color: COIN_SET[t].color }}>{COIN_SET[t].sym}</div>
      <p className="cm-note">Elige el color de esta moneda</p>
      <div className="cm-swatches">
        {opts.map((i) => (
          <button
            key={i}
            type="button"
            className="cm-swatch"
            style={{ background: COIN_SET[i].color }}
            aria-label={`Color ${i + 1}`}
            onClick={() => {
              if (i === t) api.add();
              else api.hit();
              setT(rnd(COIN_SET.length));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const ARCADE_GAMES: ArcadeGame[] = [
  { slug: "bot-whack", name: "Bot Whack", icon: "⛏", target: 12, reward: 25, description: "Golpea bloques, evita virus.", help: "Haz clic en ⛏ para puntuar. Tocar ☠ cuesta una vida.", Game: BotWhack },
  { slug: "reflex-hash", name: "Reflex Hash", icon: "⚡", target: 8, reward: 20, description: "Reacciona cuando el nodo se ilumine.", help: "Haz clic solo cuando aparezca ¡HASH!. Adelantarte cuesta una vida.", Game: ReflexHash },
  { slug: "node-sequence", name: "Node Sequence", icon: "🔊", target: 6, reward: 40, description: "Repite la secuencia de nodos.", help: "Memoriza el patrón y repítelo. Un fallo cuesta una vida.", Game: NodeSequence },
  { slug: "hash-math", name: "Hash Math", icon: "🧮", target: 10, reward: 30, description: "Resuelve operaciones rápidas.", help: "Elige el resultado correcto. Fallar cuesta una vida.", Game: HashMath },
  { slug: "coin-catcher", name: "Coin Catcher", icon: "🪙", target: 12, reward: 35, description: "Atrapa las monedas que caen.", help: "Mueve el colector con el ratón o las flechas. Moneda perdida = vida.", Game: CoinCatcher },
  { slug: "block-dodge", name: "Block Dodge", icon: "🛡", target: 15, reward: 35, description: "Esquiva los bloques corruptos.", help: "Muévete con el ratón o las flechas. Choque = vida.", Game: BlockDodge },
  { slug: "hex-typer", name: "Hex Typer", icon: "⌨", target: 8, reward: 30, description: "Teclea los hashes al vuelo.", help: "Escribe el hash mostrado y pulsa enter. Error = vida.", Game: HexTyper },
  { slug: "odd-one-out", name: "Odd One Out", icon: "🔍", target: 10, reward: 25, description: "Encuentra la cripto distinta.", help: "Haz clic en el icono diferente. Fallar cuesta una vida.", Game: OddOneOut },
  { slug: "coin-flash", name: "Coin Flash", icon: "✦", target: 10, reward: 30, description: "Recuerda la moneda que parpadeó.", help: "Mira la moneda y elige cuál era. Fallar cuesta una vida.", Game: CoinFlash },
  { slug: "precision-stop", name: "Precision Stop", icon: "🎯", target: 8, reward: 35, description: "Detén la barra en la zona verde.", help: "Pulsa STOP dentro de la zona verde. Fuera = vida.", Game: PrecisionStop },
  { slug: "crypto-trivia", name: "Crypto Trivia", icon: "❓", target: 8, reward: 40, description: "Preguntas rápidas sobre cripto.", help: "Acierta 8 preguntas. Cada fallo cuesta una vida.", Game: CryptoTrivia },
  { slug: "target-hunter", name: "Target Hunter", icon: "◎", target: 12, reward: 30, description: "Caza el nodo que se mueve.", help: "Haz clic en el objetivo. Clic fuera = vida.", Game: TargetHunter },
  { slug: "color-match", name: "Color Match", icon: "🎨", target: 10, reward: 25, description: "Asocia la moneda con su color.", help: "Elige el color correcto de la moneda. Fallar cuesta una vida.", Game: ColorMatch },
];

export const ARCADE_MAP = Object.fromEntries(ARCADE_GAMES.map((g) => [g.slug, g]));

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, GAME_BOOST_TH } from "@/lib/game-store";

export const Route = createFileRoute("/games/memory")({
  head: () => ({
    meta: [
      { title: "Crypto Memory — Empareja 6 criptos | CryptoMiner" },
      { name: "description", content: "Juego de memoria con 6 criptomonedas: BTC, ETH, LTC, DOGE, SOL y CT. 3 vidas y +50 TH/s de poder al completarlo." },
      { property: "og:title", content: "Crypto Memory — CryptoMiner" },
      { property: "og:description", content: "Empareja las 6 criptos con 3 vidas y gana poder de minado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoryGame,
});

const COINS = [
  { sym: "BTC", icon: "₿", color: "#f7931a" },
  { sym: "ETH", icon: "Ξ", color: "#8c8cff" },
  { sym: "LTC", icon: "Ł", color: "#a6b0c3" },
  { sym: "DOGE", icon: "Ð", color: "#c2a633" },
  { sym: "SOL", icon: "◎", color: "#14f195" },
  { sym: "CT", icon: "⛏", color: "#22ff88" },
];

const FREE_MISSES = 6;
const REWARD = GAME_BOOST_TH; // TH/s temporales (24h)

interface Card {
  id: number;
  sym: string;
  icon: string;
  color: string;
}

function shuffle(): Card[] {
  const deck = [...COINS, ...COINS].map((c, i) => ({ ...c, id: i }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryGame() {
  const { update, awardPower, bump } = useGame();
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState<"won" | "over" | null>(null);

  const lives = Math.max(0, 3 - Math.max(0, misses - FREE_MISSES));

  const reset = useCallback(() => {
    setDeck(shuffle());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setMisses(0);
    setDone(null);
  }, []);

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    if (flipped.length !== 2 || done) return;
    const [a, b] = flipped.map((i) => deck[i]);
    setMoves((m) => m + 1);
    if (a.sym === b.sym) {
      setMatched((m) => [...m, a.sym]);
      setFlipped([]);
    } else {
      setMisses((m) => m + 1);
      const t = setTimeout(() => setFlipped([]), 750);
      return () => clearTimeout(t);
    }
  }, [flipped, deck, done]);

  useEffect(() => {
    if (done) return;
    if (lives <= 0) setDone("over");
    else if (deck.length > 0 && matched.length === COINS.length) setDone("won");
  }, [lives, matched.length, deck.length, done]);

  const claimReward = useCallback(() => {
    awardPower(REWARD, "memory");
    update((s) => ({ games: { ...s.games, memoryWins: s.games.memoryWins + 1 } }));
    bump("gamesWon");
  }, [awardPower, update, bump]);


  return (
    <AppShell title="CRYPTO MEMORY" subtitle="Empareja las 6 criptos. Tras 6 fallos, cada error cuesta una vida.">
      <div className="cm-gamebar">
        <span className="cm-chip">INTENTOS {moves}</span>
        <span className="cm-chip">PARES {matched.length}/6</span>
        <span className="cm-chip cm-chip--lives">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? "cm-life is-on" : "cm-life"}>♥</span>
          ))}
        </span>
        <span className="cm-chip cm-chip--ct">PREMIO +{REWARD} TH/s · 24H</span>
        <button type="button" className="cm-btn" onClick={reset}>REINICIAR</button>
        <Link to="/games" className="cm-btn cm-btn--ghost">MENÚ</Link>
      </div>

      {done ? (
        <div className={`cm-over cm-over--${done}`}>
          <div className="cm-over__icon" aria-hidden>{done === "won" ? "🏆" : "💀"}</div>
          <h3>{done === "won" ? "¡COMPLETADO!" : "GAME OVER"}</h3>
          <p>{done === "won" ? `Reclama tu recompensa: +${REWARD} TH/s temporales durante 24 horas.` : "Perdiste tus 3 vidas."}</p>
          {done === "won" ? <ClaimReward reward={REWARD} onClaim={claimReward} /> : null}
          <div className="cm-over__actions">
            <button type="button" className="cm-btn" onClick={reset}>EMPEZAR DE NUEVO</button>
            <Link to="/games" className="cm-btn cm-btn--ghost">VOLVER AL MENÚ</Link>
          </div>
        </div>

      ) : (
        <div className="cm-memory">
          {deck.map((c, i) => {
            const open = flipped.includes(i) || matched.includes(c.sym);
            return (
              <button
                key={c.id}
                type="button"
                className={`cm-mcard ${open ? "is-open" : ""}`}
                style={open ? ({ "--coin": c.color } as React.CSSProperties) : undefined}
                onClick={() => {
                  if (open || flipped.length === 2) return;
                  setFlipped((f) => [...f, i]);
                }}
                aria-label={open ? c.sym : "carta oculta"}
              >
                <span className="cm-mcard__face">{open ? c.icon : "?"}</span>
                {open ? <span className="cm-mcard__sym">{c.sym}</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

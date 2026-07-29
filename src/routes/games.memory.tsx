import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame } from "@/lib/game-store";

export const Route = createFileRoute("/games/memory")({
  head: () => ({
    meta: [
      { title: "Crypto Memory — Empareja 6 criptos | CryptoMiner" },
      { name: "description", content: "Juego de memoria con 6 criptomonedas: BTC, ETH, LTC, DOGE, SOL y CT. Gana hasta 300 CT Token." },
      { property: "og:title", content: "Crypto Memory — CryptoMiner" },
      { property: "og:description", content: "Empareja las 6 criptos en pocos intentos y gana CT." },
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
  const { update } = useGame();
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [reward, setReward] = useState<number | null>(null);

  const reset = useCallback(() => {
    setDeck(shuffle());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setReward(null);
  }, []);

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped.map((i) => deck[i]);
    setMoves((m) => m + 1);
    if (a.sym === b.sym) {
      setMatched((m) => [...m, a.sym]);
      setFlipped([]);
    } else {
      const t = setTimeout(() => setFlipped([]), 750);
      return () => clearTimeout(t);
    }
  }, [flipped, deck]);

  const won = matched.length === COINS.length && deck.length > 0;

  useEffect(() => {
    if (!won || reward !== null) return;
    const prize = Math.max(50, 300 - (moves - 6) * 20);
    setReward(prize);
    update((s) => ({ ct: s.ct + prize, games: { ...s.games, memoryWins: s.games.memoryWins + 1 } }));
  }, [won, reward, moves, update]);

  return (
    <AppShell title="CRYPTO MEMORY" subtitle="Empareja las 6 criptos. Menos intentos = más CT.">
      <div className="cm-gamebar">
        <span className="cm-chip">INTENTOS {moves}</span>
        <span className="cm-chip">PARES {matched.length}/6</span>
        <button type="button" className="cm-btn" onClick={reset}>
          REINICIAR
        </button>
      </div>

      {won ? <p className="cm-win">¡GANASTE! +{reward} CT acreditados.</p> : null}

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
    </AppShell>
  );
}

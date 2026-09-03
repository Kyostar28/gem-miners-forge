import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ClaimReward } from "@/components/ClaimReward";
import { useGame, GAME_BOOST_TH } from "@/lib/game-store";

export const Route = createFileRoute("/games/snake")({
  head: () => ({
    meta: [
      { title: "Hash Snake — Recoge bloques y gana TH/s | CryptoMiner" },
      { name: "description", content: "Snake en versión minera: recoge 15 bloques de hash con 3 vidas y gana +45 TH/s de poder de minado." },
      { property: "og:title", content: "Hash Snake — CryptoMiner" },
      { property: "og:description", content: "Snake retro verde neón con 3 vidas. Completa el reto y suma poder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SnakeGame,
});

const N = 18;
const CELL = 18;
const TARGET = 15;
const REWARD = GAME_BOOST_TH; // TH/s temporales (24h)

type P = { x: number; y: number };

function SnakeGame() {
  const { update, claimGameReward, state, bump } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snake = useRef<P[]>([{ x: 8, y: 8 }]);
  const dir = useRef<P>({ x: 1, y: 0 });
  const nextDir = useRef<P>({ x: 1, y: 0 });
  const food = useRef<P>({ x: 12, y: 8 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<"idle" | "playing" | "over" | "won">("idle");

  const respawn = useCallback(() => {
    snake.current = [{ x: 8, y: 8 }];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    food.current = { x: 12, y: 8 };
  }, []);

  const reset = useCallback(() => {
    respawn();
    setScore(0);
    setLives(3);
    setStatus("playing");
  }, [respawn]);

  const turn = useCallback((x: number, y: number) => {
    if (dir.current.x === -x && dir.current.y === -y) return;
    nextDir.current = { x, y };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, P> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        turn(d.x, d.y);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      dir.current = nextDir.current;
      const head = {
        x: snake.current[0].x + dir.current.x,
        y: snake.current[0].y + dir.current.y,
      };
      const hit =
        head.x < 0 || head.y < 0 || head.x >= N || head.y >= N ||
        snake.current.some((s) => s.x === head.x && s.y === head.y);
      if (hit) {
        respawn();
        setLives((l) => {
          const left = l - 1;
          if (left <= 0) setStatus("over");
          return Math.max(0, left);
        });
        return;
      }
      const body = [head, ...snake.current];
      if (head.x === food.current.x && head.y === food.current.y) {
        setScore((s) => {
          const next = s + 1;
          if (next >= TARGET) setStatus("won");
          return next;
        });
        let f: P;
        do {
          f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
        } while (body.some((b) => b.x === f.x && b.y === f.y));
        food.current = f;
      } else {
        body.pop();
      }
      snake.current = body;

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#050a07";
      ctx.fillRect(0, 0, N * CELL, N * CELL);
      ctx.strokeStyle = "rgba(34,255,136,.07)";
      for (let i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, N * CELL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(N * CELL, i * CELL); ctx.stroke();
      }
      ctx.fillStyle = "#ffcc22";
      ctx.shadowColor = "#ffcc22"; ctx.shadowBlur = 12;
      ctx.fillRect(food.current.x * CELL + 3, food.current.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowColor = "#22ff88"; ctx.shadowBlur = 10;
      body.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#22ff88" : "#0aa055";
        ctx.fillRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4);
      });
      ctx.shadowBlur = 0;
    }, 130);
    return () => clearInterval(id);
  }, [status, respawn]);

  useEffect(() => {
    if (status !== "over" && status !== "won") return;
    update((s) => ({ games: { ...s.games, snakeBest: Math.max(s.games.snakeBest, score) } }));
  }, [status, score, update]);

  const claimReward = useCallback(() => {
    const drop = claimGameReward(REWARD, "snake");
    bump("gamesWon");
  }, [claimGameReward, bump]);


  return (
    <AppShell title="HASH SNAKE" subtitle={`Recoge ${TARGET} bloques de hash con 3 vidas. Flechas o WASD.`}>
      <div className="cm-gamebar">
        <span className="cm-chip">SCORE {score}/{TARGET}</span>
        <span className="cm-chip cm-chip--lives">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? "cm-life is-on" : "cm-life"}>♥</span>
          ))}
        </span>
        <span className="cm-chip">RÉCORD {state?.games.snakeBest ?? 0}</span>
        <span className="cm-chip cm-chip--ct">PREMIO +{REWARD} TH/s · 24H</span>
        <button type="button" className="cm-btn" onClick={reset}>
          {status === "playing" ? "REINICIAR" : "JUGAR"}
        </button>
        <Link to="/games" className="cm-btn cm-btn--ghost">MENÚ</Link>
      </div>

      {status === "over" || status === "won" ? (
        <div className={`cm-over cm-over--${status}`}>
          <div className="cm-over__icon" aria-hidden>{status === "won" ? "🏆" : "💀"}</div>
          <h3>{status === "won" ? "¡COMPLETADO!" : "GAME OVER"}</h3>
          <p>{status === "won" ? `Reclama tu recompensa: +${REWARD} TH/s temporales durante 24 horas.` : `Perdiste tus 3 vidas con ${score} bloques.`}</p>
          {status === "won" ? <ClaimReward reward={REWARD} onClaim={claimReward} /> : null}
          <div className="cm-over__actions">
            <button type="button" className="cm-btn" onClick={reset}>EMPEZAR DE NUEVO</button>
            <Link to="/games" className="cm-btn cm-btn--ghost">VOLVER AL MENÚ</Link>
          </div>
        </div>
      ) : (
        <div className="cm-snakewrap">
          <canvas ref={canvasRef} width={N * CELL} height={N * CELL} className="cm-canvas" />
          <div className="cm-dpad">
            <button type="button" onClick={() => turn(0, -1)} aria-label="Arriba">▲</button>
            <div>
              <button type="button" onClick={() => turn(-1, 0)} aria-label="Izquierda">◀</button>
              <button type="button" onClick={() => turn(1, 0)} aria-label="Derecha">▶</button>
            </div>
            <button type="button" onClick={() => turn(0, 1)} aria-label="Abajo">▼</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

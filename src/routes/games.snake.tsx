import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame } from "@/lib/game-store";

export const Route = createFileRoute("/games/snake")({
  head: () => ({
    meta: [
      { title: "Hash Snake — Recoge bloques y gana CT | CryptoMiner" },
      { name: "description", content: "Snake en versión minera: recoge bloques de hash sin chocar y gana 10 CT Token por bloque." },
      { property: "og:title", content: "Hash Snake — CryptoMiner" },
      { property: "og:description", content: "Snake retro verde neón. Cada bloque minado son 10 CT." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SnakeGame,
});

const N = 18;
const CELL = 18;

type P = { x: number; y: number };

function SnakeGame() {
  const { update, state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snake = useRef<P[]>([{ x: 8, y: 8 }]);
  const dir = useRef<P>({ x: 1, y: 0 });
  const nextDir = useRef<P>({ x: 1, y: 0 });
  const food = useRef<P>({ x: 12, y: 8 });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);

  const reset = useCallback(() => {
    snake.current = [{ x: 8, y: 8 }];
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
    food.current = { x: 12, y: 8 };
    setScore(0);
    setOver(false);
    setRunning(true);
  }, []);

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
    if (!running) return;
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
        setRunning(false);
        setOver(true);
        return;
      }
      const body = [head, ...snake.current];
      if (head.x === food.current.x && head.y === food.current.y) {
        setScore((s) => s + 1);
        update((s) => ({ ct: s.ct + 10 }));
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
  }, [running, update]);

  useEffect(() => {
    if (!over) return;
    update((s) => ({ games: { ...s.games, snakeBest: Math.max(s.games.snakeBest, score) } }));
  }, [over, score, update]);

  return (
    <AppShell title="HASH SNAKE" subtitle="Recoge bloques de hash. Cada bloque = 10 CT. Flechas o WASD.">
      <div className="cm-gamebar">
        <span className="cm-chip">SCORE {score}</span>
        <span className="cm-chip">RÉCORD {state?.games.snakeBest ?? 0}</span>
        <button type="button" className="cm-btn" onClick={reset}>
          {running ? "REINICIAR" : "JUGAR"}
        </button>
      </div>

      {over ? <p className="cm-win cm-win--bad">GAME OVER — {score} bloques minados ({score * 10} CT).</p> : null}

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
    </AppShell>
  );
}

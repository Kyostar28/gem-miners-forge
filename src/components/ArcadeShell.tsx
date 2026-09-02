import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ClaimReward } from "@/components/ClaimReward";
import { useGame, fmt } from "@/lib/game-store";
import type { ArcadeGame } from "@/games/arcade";

export interface ArcadeApi {
  score: number;
  lives: number;
  target: number;
  add: (n?: number) => void;
  hit: () => void;
  finish: () => void;
}

export function ArcadeShell({ game }: { game: ArcadeGame }) {
  const { awardPower, recordArcade, state } = useGame();
  const [status, setStatus] = useState<"idle" | "playing" | "over" | "won">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [run, setRun] = useState(0);
  const settled = useRef(false);

  const start = useCallback(() => {
    settled.current = false;
    setScore(0);
    setLives(3);
    setRun((r) => r + 1);
    setStatus("playing");
  }, []);

  const add = useCallback((n = 1) => setScore((s) => s + n), []);
  const hit = useCallback(() => setLives((l) => Math.max(0, l - 1)), []);
  const finish = useCallback(() => setStatus("won"), []);

  useEffect(() => {
    if (status !== "playing") return;
    if (lives <= 0) setStatus("over");
    else if (score >= game.target) setStatus("won");
  }, [status, lives, score, game.target]);

  useEffect(() => {
    if (status === "idle" || status === "playing" || settled.current) return;
    settled.current = true;
    recordArcade(game.slug, score, status === "won");
  }, [status, score, game.slug, recordArcade]);


  const best = state?.arcade[game.slug]?.best ?? 0;
  const Game = game.Game;

  return (
    <AppShell title={game.name.toUpperCase()} subtitle={game.description}>
      <div className="cm-gamebar">
        <span className="cm-chip">SCORE {score}/{game.target}</span>
        <span className="cm-chip cm-chip--lives">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? "cm-life is-on" : "cm-life"}>♥</span>
          ))}
        </span>
        <span className="cm-chip">RÉCORD {best}</span>
        <span className="cm-chip cm-chip--ct">PREMIO +{game.reward} TH/s · 24H</span>
        <Link to="/games" className="cm-btn cm-btn--ghost">MENÚ</Link>
      </div>

      <div className="cm-arcade">
        <div className="cm-arcade__stage">
          {status === "playing" ? (
            <Game key={run} api={{ score, lives, target: game.target, add, hit, finish }} />
          ) : (
            <ArcadeOverlay
              status={status}
              score={score}
              game={game}
              onStart={start}
              onClaim={() => awardPower(game.reward, game.slug)}
            />
          )}
        </div>

        <p className="cm-note">{game.help}</p>
      </div>
    </AppShell>
  );
}

function ArcadeOverlay({
  status,
  score,
  game,
  onStart,
  onClaim,
}: {
  status: "idle" | "over" | "won";
  score: number;
  game: ArcadeGame;
  onStart: () => void;
  onClaim: () => void;
}) {
  return (
    <div className={`cm-over cm-over--${status}`}>
      <div className="cm-over__icon" aria-hidden>{status === "won" ? "🏆" : status === "over" ? "💀" : game.icon}</div>
      <h3>
        {status === "idle" ? "LISTO PARA MINAR" : status === "won" ? "¡COMPLETADO!" : "GAME OVER"}
      </h3>
      <p>
        {status === "idle"
          ? `Llega a ${game.target} puntos con 3 vidas.`
          : status === "won"
            ? `Reclama tu recompensa: +${game.reward} TH/s temporales durante 24 horas.`
            : `Perdiste tus 3 vidas con ${score} puntos.`}
      </p>
      {status === "won" ? <ClaimReward reward={game.reward} onClaim={onClaim} /> : null}
      <div className="cm-over__actions">
        <button type="button" className="cm-btn" onClick={onStart}>
          {status === "idle" ? "JUGAR" : "EMPEZAR DE NUEVO"}
        </button>
        <Link to="/games" className="cm-btn cm-btn--ghost">VOLVER AL MENÚ</Link>
      </div>
    </div>
  );
}


export function Stage({ children }: { children: ReactNode }) {
  return <div className="cm-stagebox">{children}</div>;
}

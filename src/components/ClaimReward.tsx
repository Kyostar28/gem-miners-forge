import { useEffect, useRef, useState } from "react";

const DURATION = 10000;
const STEPS = [
  "INICIANDO NODO",
  "FIRMANDO TRANSACCIÓN",
  "PROPAGANDO EN LA RED",
  "VALIDANDO BLOQUE",
  "CONFIRMANDO HASH",
];

/**
 * Botón de reclamo con barra blockchain 3D de 10 s y mensaje de éxito.
 * `onClaim` se ejecuta una sola vez al terminar la animación.
 */
export function ClaimReward({
  reward,
  onClaim,
  label = "CLAIM REWARD",
}: {
  reward: number;
  onClaim: () => void;
  label?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "mining" | "done">("idle");
  const [pct, setPct] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    if (phase !== "mining") return;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / DURATION);
      setPct(p * 100);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        if (!fired.current) {
          fired.current = true;
          onClaim();
        }
        setPhase("done");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, onClaim]);

  if (phase === "idle") {
    return (
      <button type="button" className="cm-btn cm-btn--claim" onClick={() => setPhase("mining")}>
        ⛏ {label} · +{reward} TH/s
      </button>
    );
  }

  if (phase === "mining") {
    const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))];
    return (
      <div className="cm-chain" role="status" aria-live="polite">
        <div className="cm-chain__label">
          <span>{step}</span>
          <b>{Math.round(pct)}%</b>
        </div>
        <div className="cm-chain__track">
          <div className="cm-chain__fill" style={{ width: `${pct}%` }}>
            <span className="cm-chain__shine" />
          </div>
        </div>
        <div className="cm-chain__blocks" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={pct >= (i + 1) * 10 ? "is-on" : ""} />
          ))}
        </div>
        <p className="cm-note cm-note--xs">Sincronizando recompensa con la cadena…</p>
      </div>
    );
  }

  return (
    <div className="cm-chain cm-chain--ok" role="status" aria-live="polite">
      <div className="cm-chain__ok">✔ RECOMPENSA CONFIRMADA</div>
      <p className="cm-chain__amount">+{reward} TH/s</p>
      <p className="cm-note cm-note--xs">Poder de minado temporal activo durante 24 horas.</p>
    </div>
  );
}

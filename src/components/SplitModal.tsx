import { useEffect, useState } from "react";
import { COINS, fmtCoin } from "@/lib/coins";
import { useGame } from "@/lib/game-store";

export function SplitModal({ onClose }: { onClose: () => void }) {
  const { state, setSplits, power, estimates } = useGame();
  const [draft, setDraft] = useState<Record<string, number>>(() => ({ ...(state?.splits ?? {}) }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = COINS.reduce((t, c) => t + (draft[c.key] ?? 0), 0);
  const pct = (k: string) => (total > 0 ? ((draft[k] ?? 0) / total) * 100 : 0);

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-label="Split power">
      <div className="cm-modal__backdrop" onClick={onClose} />
      <div className="cm-modal__box">
        <header className="cm-modal__head">
          <div>
            <h2>SPLIT POWER</h2>
            <p className="cm-note">Reparte tus {power.toLocaleString("en-US")} TH/s entre las monedas minables.</p>
          </div>
          <button type="button" className="cm-modal__x" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="cm-modal__bar">
          {COINS.filter((c) => pct(c.key) > 0).map((c) => (
            <span key={c.key} style={{ width: `${pct(c.key)}%`, background: c.color }} title={`${c.symbol} ${pct(c.key).toFixed(1)}%`} />
          ))}
          {total === 0 ? <span className="cm-modal__bar--empty">SIN ASIGNAR</span> : null}
        </div>

        <div className="cm-modal__list">
          {COINS.map((c) => (
            <div className="cm-splitrow" key={c.key} style={{ ["--coin" as string]: c.color }}>
              <div className="cm-splitrow__id">
                <span className="cm-splitrow__icon">{c.icon}</span>
                <div>
                  <b>{c.symbol}</b>
                  <small>{c.name}</small>
                </div>
              </div>
              <input
                className="cm-range cm-range--coin"
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft[c.key] ?? 0}
                aria-label={`Poder asignado a ${c.symbol}`}
                onChange={(e) => setDraft((d) => ({ ...d, [c.key]: Number(e.target.value) }))}
              />
              <div className="cm-splitrow__pct">{pct(c.key).toFixed(1)}%</div>
              <div className="cm-splitrow__est">
                ≈ {fmtCoin(c.key, ((c.pool * (power / (250000 + power))) * pct(c.key)) / 100)} / ciclo
              </div>
            </div>
          ))}
        </div>

        <footer className="cm-modal__foot">
          <span className="cm-note">
            Peso total {total} · actual: {COINS.filter((c) => (estimates[c.key] ?? 0) > 0).map((c) => c.symbol).join(" · ") || "—"}
          </span>
          <div className="cm-modal__actions">
            <button type="button" className="cm-btn cm-btn--ghost" onClick={() => setDraft(Object.fromEntries(COINS.map((c) => [c.key, 10])))}>
              REPARTIR IGUAL
            </button>
            <button
              type="button"
              className="cm-btn"
              disabled={total === 0}
              onClick={() => {
                setSplits(draft);
                onClose();
              }}
            >
              GUARDAR SPLIT
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

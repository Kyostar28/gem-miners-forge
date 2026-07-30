import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SplitModal } from "@/components/SplitModal";
import { useGame, fmt, CYCLE_MS, NETWORK_POWER } from "@/lib/game-store";
import { COINS, fmtCoin } from "@/lib/coins";
import { getRank, rankRequirement, RANK_COUNT } from "@/lib/leagues";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Tu sala de minado | CryptoMiner" },
      { name: "description", content: "Consulta tus racks, poder de minado, liga actual, balances multi-cripto y reparte tu poder entre BTC, ETH, SOL, LTC y más." },
      { property: "og:title", content: "Dashboard — Tu sala de minado" },
      { property: "og:description", content: "Racks activos, liga, progreso y rewards pool multi-cripto cada 10 minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function DashboardPage() {
  const { state, power, basePower, ownedMiners, claim, timeLeft, estimates, splitPct, balance } = useGame();
  const [split, setSplit] = useState(false);
  if (!state) return <AppShell title="DASHBOARD">{null}</AppShell>;

  const rank = getRank(power);
  const share = (power / (NETWORK_POWER + power)) * 100;
  const ready = timeLeft <= 0;
  const active = COINS.filter((c) => splitPct[c.key] > 0);

  const units = ownedMiners.flatMap((o) => Array.from({ length: o.count }, () => o.miner));
  const racks: (typeof units)[] = [];
  for (let i = 0; i < units.length; i += 6) racks.push(units.slice(i, i + 6));

  return (
    <AppShell title="SALA DE MINADO" subtitle={`Bienvenido de vuelta, @${state.username}. Tus máquinas nunca duermen.`}>
      <section className="cm-cols">
        {/* LEAGUE */}
        <div className={`cm-panel cm-league ${rank.league.cls}`}>
          <div className="cm-panel__title">LIGA ACTUAL</div>
          <div className="cm-league__badge">
            <div className="cm-league__frame">
              <span className="cm-league__div">{rank.division}</span>
            </div>
            <div>
              <div className="cm-league__name">{rank.league.name}</div>
              <div className="cm-league__meta">
                División {rank.division} · Rank {rank.index + 1}/{RANK_COUNT}
              </div>
            </div>
          </div>

          <div className="cm-progress" role="progressbar" aria-valuenow={Math.round(rank.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="cm-progress__fill" style={{ width: `${rank.progress * 100}%` }} />
          </div>
          <div className="cm-league__req">
            {rank.isMax ? (
              <span>MÁXIMO RANGO ALCANZADO — {fmt(power)} TH/s</span>
            ) : (
              <>
                <span>{fmt(power)} TH/s</span>
                <span>faltan {fmt(Math.max(0, (rank.next ?? 0) - power))} TH/s → {rankRequirement(rank.index + 1).toLocaleString()} TH/s</span>
              </>
            )}
          </div>
          <p className="cm-note">
            Rigs {fmt(basePower)} TH/s + bonus de juegos {fmt(state.bonusPower)} TH/s
          </p>
        </div>

        {/* REWARDS POOL */}
        <div className="cm-panel">
          <div className="cm-panel__title">REWARDS POOL · CICLO 10 MIN</div>
          <div className="cm-pool__timer">
            <span className={`cm-pool__clock ${ready ? "is-ready" : ""}`}>{ready ? "READY" : clock(timeLeft)}</span>
            <button type="button" className="cm-btn" disabled={!ready} onClick={claim}>
              CLAIM
            </button>
          </div>
          <div className="cm-progress cm-progress--thin">
            <div className="cm-progress__fill" style={{ width: `${100 - (timeLeft / CYCLE_MS) * 100}%` }} />
          </div>
          <p className="cm-note">Tu share de red: {share.toFixed(3)}% · 10 monedas minables</p>

          <button type="button" className="cm-btn cm-btn--ghost cm-btn--full" onClick={() => setSplit(true)}>
            ⇄ AJUSTAR SPLIT POWER
          </button>

          <div className="cm-splitbar">
            {active.map((c) => (
              <span key={c.key} style={{ width: `${splitPct[c.key]}%`, background: c.color }} title={`${c.symbol} ${splitPct[c.key].toFixed(1)}%`} />
            ))}
          </div>

          <div className="cm-est cm-est--multi">
            {active.map((c) => (
              <div className="cm-est__item" key={c.key} style={{ ["--coin" as string]: c.color }}>
                <span className="cm-est__k">{c.icon} {c.symbol} · {splitPct[c.key].toFixed(0)}%</span>
                <span className="cm-est__v">{fmtCoin(c.key, estimates[c.key] ?? 0)}</span>
              </div>
            ))}
            {active.length === 0 ? <p className="cm-note">No has asignado poder a ninguna moneda.</p> : null}
          </div>
        </div>

        {/* BALANCES */}
        <div className="cm-panel">
          <div className="cm-panel__title">BALANCES</div>
          <div className="cm-walletgrid cm-walletgrid--compact">
            {COINS.map((c) => (
              <div className="cm-coinrow" key={c.key} style={{ ["--coin" as string]: c.color }}>
                <span className="cm-coinrow__icon">{c.icon}</span>
                <span className="cm-coinrow__sym">{c.symbol}</span>
                <span className="cm-coinrow__val">{fmtCoin(c.key, balance(c.key))}</span>
              </div>
            ))}
          </div>
          <div className="cm-statgrid">
            <div><span>PODER</span><b>{fmt(power)} TH/s</b></div>
            <div><span>MÁQUINAS</span><b>{state.owned.length}</b></div>
            <div><span>RACKS</span><b>{racks.length}</b></div>
            <div><span>CICLOS</span><b>{state.claimed}</b></div>
          </div>
        </div>
      </section>

      <h2 className="cm-h2">TUS RACKS</h2>
      {racks.length === 0 ? (
        <p className="cm-note">No tienes máquinas. Ve a la SHOP y compra tu primer minero.</p>
      ) : (
        <div className="cm-racks">
          {racks.map((rack, ri) => (
            <div className="cm-rack" key={ri}>
              <div className="cm-rack__head">
                RACK-{String(ri + 1).padStart(2, "0")}
                <span>{fmt(rack.reduce((s, m) => s + m.hashRate, 0))} TH/s</span>
              </div>
              <div className="cm-rack__slots">
                {Array.from({ length: 6 }).map((_, si) => {
                  const m = rack[si];
                  return (
                    <div className={`cm-slot ${m ? `tier-${m.tier.toLowerCase()} is-on` : ""}`} key={si} title={m?.name}>
                      {m ? (
                        <>
                          <img src={m.image} alt={m.name} loading="lazy" />
                          <span className="cm-slot__led" aria-hidden />
                        </>
                      ) : (
                        <span className="cm-slot__empty">EMPTY</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {split ? <SplitModal onClose={() => setSplit(false)} /> : null}
    </AppShell>
  );
}

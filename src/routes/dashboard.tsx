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
      { name: "description", content: "Consulta tus racks, inventario, poder de minado, liga actual, balances multi-cripto y reparte tu poder entre BTC, ETH, SOL, LTC y más." },
      { property: "og:title", content: "Dashboard — Tu sala de minado" },
      { property: "og:description", content: "Racks activos, inventario, liga, progreso y rewards pool multi-cripto cada 10 minutos." },
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
  const {
    state, power, basePower, ownedMiners, rigs, mount, unmount,
    claim, timeLeft, estimates, splitPct, balance,
  } = useGame();
  const [split, setSplit] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  if (!state) return <AppShell title="DASHBOARD">{null}</AppShell>;

  const rank = getRank(power);
  const share = (power / (NETWORK_POWER + power)) * 100;
  const ready = timeLeft <= 0;
  const active = COINS.filter((c) => splitPct[c.key] > 0);
  const invCount = ownedMiners.reduce((s, o) => s + o.count, 0);

  const onSlot = (rigId: string, slot: number, filled: boolean) => {
    if (filled) {
      unmount(rigId, slot);
      return;
    }
    if (picked != null) {
      mount(picked, rigId, slot);
      setPicked(null);
    }
  };

  return (
    <AppShell title="SALA DE MINADO" subtitle={`Bienvenido de vuelta, @${state.username}. Tus máquinas nunca duermen.`}>
      <section className="cm-cols cm-cols--compact">
        {/* LEAGUE */}
        <div className={`cm-panel cm-panel--sm cm-league ${rank.league.cls}`}>
          <div className="cm-panel__title">LIGA ACTUAL</div>
          <div className="cm-league__badge">
            <div className="cm-league__frame">
              <span className="cm-league__div">{rank.division}</span>
            </div>
            <div>
              <div className="cm-league__name">{rank.league.name}</div>
              <div className="cm-league__meta">Rank {rank.index + 1}/{RANK_COUNT} · {fmt(power)} TH/s</div>
            </div>
          </div>

          <div className="cm-progress cm-progress--thin" role="progressbar" aria-valuenow={Math.round(rank.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="cm-progress__fill" style={{ width: `${rank.progress * 100}%` }} />
          </div>
          <div className="cm-league__req">
            {rank.isMax ? (
              <span>MÁXIMO RANGO</span>
            ) : (
              <>
                <span>+{fmt(Math.max(0, (rank.next ?? 0) - power))} TH/s</span>
                <span>→ {rankRequirement(rank.index + 1).toLocaleString()} TH/s</span>
              </>
            )}
          </div>
        </div>

        {/* REWARDS POOL */}
        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">REWARDS POOL · 10 MIN</div>
          <div className="cm-pool__timer">
            <span className={`cm-pool__clock ${ready ? "is-ready" : ""}`}>{ready ? "READY" : clock(timeLeft)}</span>
            <button type="button" className="cm-btn" disabled={!ready} onClick={claim}>CLAIM</button>
            <button type="button" className="cm-btn cm-btn--ghost" onClick={() => setSplit(true)}>⇄ SPLIT</button>
          </div>
          <div className="cm-progress cm-progress--thin">
            <div className="cm-progress__fill" style={{ width: `${100 - (timeLeft / CYCLE_MS) * 100}%` }} />
          </div>
          <div className="cm-splitbar">
            {active.map((c) => (
              <span key={c.key} style={{ width: `${splitPct[c.key]}%`, background: c.color }} title={`${c.symbol} ${splitPct[c.key].toFixed(1)}%`} />
            ))}
          </div>
          <div className="cm-est cm-est--chips">
            {active.map((c) => (
              <span className="cm-estchip" key={c.key} style={{ ["--coin" as string]: c.color }}>
                {c.icon} {fmtCoin(c.key, estimates[c.key] ?? 0)} {c.symbol}
              </span>
            ))}
            {active.length === 0 ? <span className="cm-note">Sin poder asignado.</span> : null}
          </div>
          <p className="cm-note cm-note--xs">Share de red {share.toFixed(3)}%</p>
        </div>

        {/* BALANCES */}
        <div className="cm-panel cm-panel--sm">
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
            <div><span>MONTADOS</span><b>{rigs.reduce((s, r) => s + r.miners.filter(Boolean).length, 0)}</b></div>
            <div><span>RACKS</span><b>{rigs.length}</b></div>
            <div><span>INVENTARIO</span><b>{invCount}</b></div>
          </div>
          <p className="cm-note cm-note--xs">Rigs {fmt(basePower)} + bonus {fmt(state.bonusPower)} TH/s</p>
        </div>
      </section>

      {/* INVENTORY */}
      <h2 className="cm-h2">INVENTARIO ({invCount})</h2>
      <p className="cm-note">
        {picked != null
          ? "Ahora pulsa un slot vacío de un rack para montarlo."
          : "Pulsa un minero para seleccionarlo y móntalo en un rack. Pulsa un minero montado para devolverlo al inventario."}
      </p>
      {invCount === 0 ? (
        <p className="cm-note">Inventario vacío. Compra hardware en la SHOP.</p>
      ) : (
        <div className="cm-inv">
          {ownedMiners.map(({ miner, count }) => (
            <button
              type="button"
              key={miner.id}
              className={`cm-invcard tier-${miner.tier.toLowerCase()} ${picked === miner.id ? "is-picked" : ""}`}
              onClick={() => setPicked((p) => (p === miner.id ? null : miner.id))}
            >
              <img src={miner.image} alt={miner.name} loading="lazy" />
              <b>{miner.name}</b>
              <span>{fmt(miner.hashRate)} TH/s</span>
              <em className="cm-invcard__x">x{count}</em>
            </button>
          ))}
        </div>
      )}

      <h2 className="cm-h2">TUS RACKS</h2>
      {rigs.length === 0 ? (
        <p className="cm-note">No tienes racks. Cómprate uno en la SHOP.</p>
      ) : (
        <div className="cm-racks">
          {rigs.map(({ rig, model, miners, power: rp }, ri) => (
            <div className="cm-rack" key={rig.id}>
              <div className="cm-rack__head">
                <span>{model.icon} {model.name.toUpperCase()} · RACK-{String(ri + 1).padStart(2, "0")}</span>
                <span>{fmt(rp)} TH/s · x{model.boost}</span>
              </div>
              <div className="cm-rack__slots">
                {miners.map((m, si) => (
                  <button
                    type="button"
                    className={`cm-slot ${m ? `tier-${m.tier.toLowerCase()} is-on` : ""} ${!m && picked != null ? "is-target" : ""}`}
                    key={si}
                    title={m ? `${m.name} — quitar` : "Slot vacío"}
                    onClick={() => onSlot(rig.id, si, !!m)}
                  >
                    {m ? (
                      <>
                        <img src={m.image} alt={m.name} loading="lazy" />
                        <span className="cm-slot__led" aria-hidden />
                        <span className="cm-slot__remove" aria-hidden>✕</span>
                      </>
                    ) : (
                      <span className="cm-slot__empty">EMPTY</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {split ? <SplitModal onClose={() => setSplit(false)} /> : null}
    </AppShell>
  );
}

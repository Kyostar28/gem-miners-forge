import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";
import {
  CRAFT_COUNT,
  RARITIES,
  RARITY_MAP,
  SHARD_IMAGE,
  UPGRADE_COUNT,
  nextRarity,
  rarityForTier,
  upgradeCost,
  upgradeTarget,
} from "@/data/forge";

export const Route = createFileRoute("/forja")({
  head: () => ({
    meta: [
      { title: "Forja — Mejora tus mineros con piezas | CryptoMiner" },
      {
        name: "description",
        content:
          "Fusiona piezas de hardware por rareza y forja tus mineros al siguiente nivel para duplicar su poder de minado.",
      },
      { property: "og:title", content: "Forja de hardware — CryptoMiner" },
      {
        property: "og:description",
        content: "Fusiona 10 piezas para subir de rareza y gasta 25 piezas + CT para mejorar un minero de nivel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgePage,
});

function ForgePage() {
  const { state, ownedMiners, forgeCraft, forgeUpgrade, dismantle } = useGame();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return null;
  const shards = state.shards ?? {};

  const run = (err: string | null, okText: string) =>
    setMsg(err ? { ok: false, text: err } : { ok: true, text: okText });

  return (
    <AppShell
      title="FORJA DE HARDWARE"
      subtitle="Fusiona piezas por rareza y mejora tus unidades al siguiente nivel de minado."
    >
      {msg ? <p className={`cm-note ${msg.ok ? "" : "cm-note--warn"}`}>{msg.text}</p> : null}

      <h2 className="cm-h2">INVENTARIO DE PIEZAS</h2>
      <div className="cm-forge__bank">
        {RARITIES.map((r) => (
          <div className="cm-shard" key={r.key} style={{ borderColor: r.color }}>
            <img
              src={SHARD_IMAGE}
              alt={`Pieza ${r.name}`}
              width={512}
              height={512}
              loading="lazy"
              style={{ filter: `drop-shadow(0 0 10px ${r.color})`, ["--sh" as string]: r.color }}
            />
            <b style={{ color: r.color }}>{r.name.toUpperCase()}</b>
            <em>x{shards[r.key] ?? 0}</em>
          </div>
        ))}
      </div>

      <h2 className="cm-h2">FUSIÓN DE PIEZAS · {CRAFT_COUNT} → 1</h2>
      <div className="cm-forge__grid">
        {RARITIES.filter((r) => nextRarity(r.key)).map((r) => {
          const next = RARITY_MAP[nextRarity(r.key)!];
          const have = shards[r.key] ?? 0;
          const can = have >= CRAFT_COUNT && state.ct >= r.craftCt;
          return (
            <div className="cm-forge__card" key={r.key} style={{ borderColor: r.color }}>
              <div className="cm-forge__recipe">
                <span style={{ color: r.color }}>{CRAFT_COUNT}x {r.name}</span>
                <b>→</b>
                <span style={{ color: next.color }}>1x {next.name}</span>
              </div>
              <div className="cm-forge__meta">
                <span>Tienes: {have}</span>
                <span>Coste: {fmt(r.craftCt)} CT</span>
              </div>
              <button
                type="button"
                className="cm-btn cm-btn--full"
                disabled={!can}
                onClick={() => run(forgeCraft(r.key), `Forjaste 1 pieza ${next.name.toLowerCase()}.`)}
              >
                FUSIONAR
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="cm-h2">MEJORA DE MINEROS · {UPGRADE_COUNT} PIEZAS + CT</h2>
      <p className="cm-note cm-note--xs">
        Al forjar una unidad se consume y se transforma en un modelo del siguiente tier, duplicando su poder de minado
        más un bonus. Solo puedes forjar unidades que estén en el inventario (desmontadas).
      </p>
      {ownedMiners.length === 0 ? (
        <p className="cm-note">No tienes unidades desmontadas en el inventario.</p>
      ) : (
        <div className="cm-list">
          {ownedMiners.map(({ miner, count }) => {
            const target = upgradeTarget(miner);
            const rarity = RARITY_MAP[rarityForTier(miner.tier)];
            const cost = upgradeCost(miner);
            const have = shards[rarity.key] ?? 0;
            const can = !!target && have >= UPGRADE_COUNT && state.ct >= cost;
            return (
              <div className={`cm-row tier-${miner.tier.toLowerCase()}`} key={miner.id}>
                <img src={miner.image} alt={miner.name} className="cm-row__img" loading="lazy" />
                <div className="cm-row__main">
                  <b>
                    {miner.name} <small>x{count}</small>
                  </b>
                  <span>
                    {miner.tier} · {fmt(miner.hashRate)} TH/s
                    {target ? ` → ${target.tier} · ${fmt(target.hashRate)} TH/s` : " · TIER MÁXIMO"}
                  </span>
                  <span style={{ color: rarity.color }}>
                    {UPGRADE_COUNT}x pieza {rarity.name.toLowerCase()} ({have}/{UPGRADE_COUNT}) · {fmt(cost)} CT
                  </span>
                </div>
                <div className="cm-forge__actions">
                  <button
                    type="button"
                    className="cm-btn"
                    disabled={!can}
                    onClick={() =>
                      run(forgeUpgrade(miner.id), `${miner.name} forjado a ${target?.name ?? ""}.`)
                    }
                  >
                    FORJAR
                  </button>
                  <button
                    type="button"
                    className="cm-btn cm-btn--ghost"
                    onClick={() => run(dismantle(miner.id), `Desguazaste ${miner.name}: +3 piezas ${rarity.name.toLowerCase()}s.`)}
                  >
                    DESGUAZAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";
import { useToast } from "@/lib/toast";
import { MINERS } from "@/data/miners";
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
  const { push } = useToast();
  const [pending, setPending] = useState<Pending | null>(null);

  if (!state) return null;
  const shards = state.shards ?? {};

  const run = (err: string | null, ok: { icon: string; title: string; detail: string; color: string }) => {
    setPending(null);
    if (err) push({ tone: "warn", title: "FORJA CANCELADA", detail: err });
    else push({ tone: "ok", icon: ok.icon, title: ok.title, detail: ok.detail, color: ok.color });
  };

  const confirm = () => {
    if (!pending) return;
    if (pending.kind === "craft") {
      const next = RARITY_MAP[nextRarity(pending.rarity)!];
      run(forgeCraft(pending.rarity), {
        icon: "◈",
        title: `+1 PIEZA ${next.name.toUpperCase()}`,
        detail: `Fusionaste ${CRAFT_COUNT} piezas ${RARITY_MAP[pending.rarity].name.toLowerCase()}s.`,
        color: next.color,
      });
      return;
    }
    const miner = MINERS.find((m) => m.id === pending.minerId)!;
    if (pending.kind === "upgrade") {
      const target = upgradeTarget(miner);
      run(forgeUpgrade(miner.id), {
        icon: "⚙",
        title: `${target?.name ?? "UNIDAD"} FORJADA`,
        detail: `${miner.name} → ${target?.tier} · ${fmt(target?.hashRate ?? 0)} TH/s`,
        color: RARITY_MAP[rarityForTier(target?.tier ?? miner.tier)].color,
      });
      return;
    }
    const rar = RARITY_MAP[rarityForTier(miner.tier)];
    run(dismantle(miner.id), {
      icon: "◈",
      title: `+3 PIEZAS ${rar.name.toUpperCase()}S`,
      detail: `Desguazaste ${miner.name}.`,
      color: rar.color,
    });
  };

  return (
    <AppShell
      title="FORJA DE HARDWARE"
      subtitle="Fusiona piezas por rareza y mejora tus unidades al siguiente nivel de minado."
    >

      <h2 className="cm-h2">INVENTARIO DE PIEZAS</h2>
      <div className="cm-forge__bank">
        {RARITIES.map((r, i) => (
          <div className="cm-shard" key={r.key} style={{ borderColor: r.color }}>
            <img
              src={SHARD_IMAGE}
              alt={`Pieza ${r.name}`}
              width={512}
              height={512}
              loading="lazy"
              style={{ filter: `hue-rotate(${i * 62}deg) saturate(1.2) drop-shadow(0 0 10px ${r.color})` }}
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
                onClick={() => setPending({ kind: "craft", rarity: r.key })}
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
                    onClick={() => setPending({ kind: "upgrade", minerId: miner.id })}
                  >
                    FORJAR
                  </button>
                  <button
                    type="button"
                    className="cm-btn cm-btn--ghost"
                    onClick={() => setPending({ kind: "dismantle", minerId: miner.id })}
                  >
                    DESGUAZAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pending ? <ForgePreview pending={pending} onBack={() => setPending(null)} onConfirm={confirm} /> : null}
    </AppShell>
  );
}

type Pending =
  | { kind: "craft"; rarity: string }
  | { kind: "upgrade"; minerId: number }
  | { kind: "dismantle"; minerId: number };

function ForgePreview({
  pending,
  onBack,
  onConfirm,
}: {
  pending: Pending;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const shardIdx = (key: string) => RARITIES.findIndex((r) => r.key === key);

  let title = "";
  let costLine = "";
  let from: { img?: string; label: string; sub: string; color: string; hue?: number } | null = null;
  let to: { img?: string; label: string; sub: string; color: string; hue?: number } | null = null;

  if (pending.kind === "craft") {
    const r = RARITY_MAP[pending.rarity];
    const n = RARITY_MAP[nextRarity(pending.rarity)!];
    title = "VISTA PREVIA · FUSIÓN DE PIEZAS";
    costLine = `Consume ${CRAFT_COUNT}x pieza ${r.name.toLowerCase()} + ${fmt(r.craftCt)} CT`;
    from = { img: SHARD_IMAGE, label: `${CRAFT_COUNT}x ${r.name}`, sub: "material", color: r.color, hue: shardIdx(r.key) * 62 };
    to = { img: SHARD_IMAGE, label: `1x ${n.name}`, sub: "resultado", color: n.color, hue: shardIdx(n.key) * 62 };
  } else {
    const miner = MINERS.find((m) => m.id === pending.minerId)!;
    const rar = RARITY_MAP[rarityForTier(miner.tier)];
    if (pending.kind === "upgrade") {
      const target = upgradeTarget(miner);
      title = "VISTA PREVIA · MEJORA DE MINERO";
      costLine = `Consume 1x ${miner.name}, ${UPGRADE_COUNT}x pieza ${rar.name.toLowerCase()} + ${fmt(upgradeCost(miner))} CT`;
      from = { img: miner.image, label: miner.name, sub: `${miner.tier} · ${fmt(miner.hashRate)} TH/s`, color: rar.color };
      to = target
        ? {
            img: target.image,
            label: target.name,
            sub: `${target.tier} · ${fmt(target.hashRate)} TH/s`,
            color: RARITY_MAP[rarityForTier(target.tier)].color,
          }
        : null;
    } else {
      title = "VISTA PREVIA · DESGUACE";
      costLine = `Consume 1x ${miner.name}`;
      from = { img: miner.image, label: miner.name, sub: `${miner.tier} · ${fmt(miner.hashRate)} TH/s`, color: rar.color };
      to = { img: SHARD_IMAGE, label: `3x ${rar.name}`, sub: "resultado", color: rar.color, hue: shardIdx(rar.key) * 62 };
    }
  }

  const cell = (d: NonNullable<typeof from>) => (
    <div className="cm-preview__cell" style={{ borderColor: d.color }}>
      {d.img ? (
        <img
          src={d.img}
          alt={d.label}
          loading="lazy"
          style={d.hue != null ? { filter: `hue-rotate(${d.hue}deg) saturate(1.2) drop-shadow(0 0 10px ${d.color})` } : undefined}
        />
      ) : null}
      <b style={{ color: d.color }}>{d.label}</b>
      <small>{d.sub}</small>
    </div>
  );

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="cm-modal__backdrop" onClick={onBack} />
      <div className="cm-modal__box cm-preview">
        <header className="cm-modal__head">
          <div>
            <h2>{title}</h2>
            <p className="cm-note">{costLine}</p>
          </div>
          <button type="button" className="cm-modal__x" onClick={onBack} aria-label="Cerrar">✕</button>
        </header>

        <div className="cm-preview__flow">
          {from ? cell(from) : null}
          <span className="cm-preview__arrow" aria-hidden>➜</span>
          {to ? cell(to) : <p className="cm-note cm-note--warn">Sin resultado disponible.</p>}
        </div>

        <div className="cm-modal__foot">
          <span className="cm-note cm-note--xs">Esta operación no se puede revertir.</span>
          <div className="cm-modal__actions">
            <button type="button" className="cm-btn" onClick={onConfirm}>CONTINUAR</button>
            <button type="button" className="cm-btn cm-btn--ghost" onClick={onBack}>VOLVER</button>
          </div>
        </div>
      </div>
    </div>
  );
}

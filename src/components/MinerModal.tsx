import { useEffect } from "react";
import type { Miner } from "@/data/miners";
import { RARITY_MAP, rarityForTier } from "@/data/forge";
import { fmt } from "@/lib/game-store";

/** Ficha completa de un minero montado, con opción de desinstalarlo. */
export function MinerModal({
  miner,
  rackName,
  slot,
  boost,
  onUninstall,
  onClose,
}: {
  miner: Miner;
  rackName: string;
  slot: number;
  boost: number;
  onUninstall: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rarity = RARITY_MAP[rarityForTier(miner.tier)];

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-label={miner.name}>
      <div className="cm-modal__backdrop" onClick={onClose} />
      <div className={`cm-modal__box cm-minermodal tier-${miner.tier.toLowerCase()}`}>
        <header className="cm-modal__head">
          <div>
            <h2>{miner.name.toUpperCase()}</h2>
            <p className="cm-note">{miner.unit} · unidad instalada en {rackName} · slot {slot + 1}</p>
          </div>
          <button type="button" className="cm-modal__x" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="cm-minermodal__top">
          <div className="cm-minermodal__art">
            <img src={miner.image} alt={miner.name} loading="lazy" />
          </div>
          <div className="cm-minermodal__specs">
            <div><span>TIER</span><b>{miner.tier}</b></div>
            <div><span>RAREZA</span><b style={{ color: rarity.color }}>{rarity.name.toUpperCase()}</b></div>
            <div><span>HASH BASE</span><b>{fmt(miner.hashRate)} TH/s</b></div>
            <div><span>CON RACK x{boost}</span><b>{fmt(miner.hashRate * boost, 1)} TH/s</b></div>
            <div><span>VALOR</span><b>{fmt(miner.price)} CT</b></div>
            <div><span>REVENTA</span><b>{fmt(Math.round(miner.price * 0.7))} CT</b></div>
          </div>
        </div>

        <p className="cm-note cm-minermodal__desc">{miner.description}</p>

        <div className="cm-modal__foot">
          <span className="cm-note cm-note--xs">Al desinstalar, la unidad vuelve a tu inventario.</span>
          <div className="cm-modal__actions">
            <button type="button" className="cm-btn cm-btn--danger" onClick={onUninstall}>
              DESINSTALAR MINERO
            </button>
            <button type="button" className="cm-btn cm-btn--ghost" onClick={onClose}>
              VOLVER AL PANEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

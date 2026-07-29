import type { Miner, Tier } from "@/data/miners";

const tierClass: Record<Tier, string> = {
  BASIC:   "tier-basic",
  PRO:     "tier-pro",
  ELITE:   "tier-elite",
  QUANTUM: "tier-quantum",
  MYTHIC:  "tier-mythic",
};

export function MinerCard({
  miner,
  onBuy,
  disabled,
  label = "PURCHASE",
  badge,
}: {
  miner: Miner;
  onBuy?: () => void;
  disabled?: boolean;
  label?: string;
  badge?: string;
}) {
  return (
    <article className={`miner-card ${tierClass[miner.tier]}`}>
      <header className="miner-card__head">
        <span className={`miner-tier ${tierClass[miner.tier]}`}>{miner.tier}</span>
        <span className="miner-unit">{badge ?? miner.unit}</span>
      </header>

      <div className="miner-stage">
        {/* animated scanlines */}
        <div className="scanlines" aria-hidden />
        {/* pulsing glow behind sprite */}
        <div className="miner-glow" aria-hidden />
        {/* hashing particles */}
        <div className="hash-particles" aria-hidden>
          <span /><span /><span /><span /><span /><span />
        </div>
        {/* the sprite itself */}
        <img
          src={miner.image}
          alt={miner.name}
          loading="lazy"
          width={512}
          height={512}
          className="miner-sprite"
        />
        {/* corner LED */}
        <span className="miner-led" aria-hidden />
        {/* live hash readout */}
        <div className="miner-readout" aria-hidden>
          0x{miner.id.toString(16).padStart(4, "0")}
        </div>
      </div>

      <div className="miner-body">
        <h3 className="miner-name">{miner.name}</h3>
        <p className="miner-desc">{miner.description}</p>

        <div className="miner-stats">
          <div>
            <div className="miner-stats__label">HASH RATE</div>
            <div className="miner-stats__value">
              <span className="bolt">⚡</span> {miner.hashRate.toLocaleString()} TH/s
            </div>
          </div>
          <div className="miner-stats--right">
            <div className="miner-stats__label">PRICE</div>
            <div className="miner-stats__value">{miner.price.toLocaleString()} CT</div>
          </div>
        </div>

        <button type="button" className="miner-buy" onClick={onBuy} disabled={disabled}>
          {label}
        </button>
      </div>
    </article>
  );
}

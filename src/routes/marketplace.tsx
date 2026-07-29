import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { MinerCard } from "@/components/MinerCard";
import { useGame, fmt } from "@/lib/game-store";
import { MINERS } from "@/data/miners";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Vende y consigue ofertas | CryptoMiner" },
      { name: "description", content: "Revende tus mineros al 70% de su valor o consigue ofertas del mercado negro con descuento." },
      { property: "og:title", content: "Marketplace — CryptoMiner" },
      { property: "og:description", content: "Compra-venta de hardware de minado entre usuarios del mercado negro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const { ownedMiners, sell, buy, state } = useGame();

  // deterministic daily deals
  const deals = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return Array.from({ length: 8 }, (_, i) => {
      const idx = (day * 37 + i * 13) % MINERS.length;
      const off = 10 + ((day + i * 7) % 5) * 5;
      return { miner: MINERS[idx], off, price: Math.round(MINERS[idx].price * (1 - off / 100)) };
    });
  }, []);

  return (
    <AppShell title="MARKETPLACE" subtitle="Mercado negro: revende tu hardware o pilla ofertas del día.">
      <h2 className="cm-h2">OFERTAS DEL DÍA</h2>
      <div className="cm-grid">
        {deals.map((d, i) => (
          <MinerCard
            key={`${d.miner.id}-${i}`}
            miner={{ ...d.miner, price: d.price }}
            badge={`-${d.off}%`}
            label={`COMPRAR ${fmt(d.price)} CT`}
            disabled={!state || state.ct < d.price}
            onBuy={() => buy({ ...d.miner, price: d.price })}
          />
        ))}
      </div>

      <h2 className="cm-h2">TU INVENTARIO</h2>
      {ownedMiners.length === 0 ? (
        <p className="cm-note">No tienes hardware para vender.</p>
      ) : (
        <div className="cm-list">
          {ownedMiners.map(({ miner, count }) => (
            <div className={`cm-row tier-${miner.tier.toLowerCase()}`} key={miner.id}>
              <img src={miner.image} alt={miner.name} className="cm-row__img" loading="lazy" />
              <div className="cm-row__main">
                <b>{miner.name}</b>
                <span>
                  {miner.tier} · {fmt(miner.hashRate)} TH/s · x{count}
                </span>
              </div>
              <button type="button" className="cm-btn cm-btn--ghost" onClick={() => sell(miner)}>
                VENDER {fmt(Math.round(miner.price * 0.7))} CT
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

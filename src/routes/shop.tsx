import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MINERS, TIER_ORDER, type Tier } from "@/data/miners";
import { MinerCard } from "@/components/MinerCard";
import { AppShell } from "@/components/AppShell";
import { useGame } from "@/lib/game-store";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Dark Web Shop — CryptoMiner" },
      { name: "description", content: "Compra hardware de minado virtual: 100 mineros únicos desde USB sticks hasta rigs cuánticos legendarios." },
      { property: "og:title", content: "Dark Web Shop — CryptoMiner" },
      { property: "og:description", content: "100 mineros virtuales a la venta, de Basic a Mythic. Sube tu hash rate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type Filter = "ALL" | Tier;

function ShopPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { buy, state } = useGame();

  const filtered = useMemo(
    () => (filter === "ALL" ? MINERS : MINERS.filter((m) => m.tier === filter)),
    [filter],
  );

  return (
    <AppShell title="DARK WEB SHOP" subtitle={`Compra hardware para subir tu hash rate — ${MINERS.length} unidades en stock.`}>
      <nav className="cm-tabs" aria-label="Filter miners by tier">
        <button type="button" className={`cm-tab ${filter === "ALL" ? "is-active" : ""}`} onClick={() => setFilter("ALL")}>
          ALL ({MINERS.length})
        </button>
        {TIER_ORDER.map((tier) => (
          <button
            key={tier}
            type="button"
            className={`cm-tab ${filter === tier ? "is-active" : ""}`}
            onClick={() => setFilter(tier)}
          >
            {tier} ({MINERS.filter((m) => m.tier === tier).length})
          </button>
        ))}
      </nav>

      <div className="cm-grid">
        {filtered.map((m) => (
          <MinerCard
            key={m.id}
            miner={m}
            onBuy={() => buy(m)}
            disabled={!state || state.ct < m.price}
          />
        ))}
      </div>
    </AppShell>
  );
}

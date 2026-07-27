import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MINERS, TIER_ORDER, type Tier } from "@/data/miners";
import { MinerCard } from "@/components/MinerCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Web Shop — CryptoMiner" },
      { name: "description", content: "Purchase virtual mining hardware — 50 unique miners from USB sticks to legendary quantum rigs. Increase your hash rate." },
      { property: "og:title", content: "Dark Web Shop — CryptoMiner" },
      { property: "og:description", content: "50 unique virtual miners for sale. Basic to Mythic tier — every rig animated and ready to hash." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

type Filter = "ALL" | Tier;

function Shop() {
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? MINERS : MINERS.filter((m) => m.tier === filter)),
    [filter],
  );

  return (
    <div className="cm-shell">
      <div className="cm-container">
        <div className="cm-header">
          <span aria-hidden>🛒</span>
          <h1>DARK WEB SHOP<span className="cm-cursor">&nbsp;</span></h1>
        </div>
        <p className="cm-sub">Purchase hardware to increase your hash rate. — 50 units in stock.</p>

        <nav className="cm-tabs" aria-label="Filter miners by tier">
          <button
            type="button"
            className={`cm-tab ${filter === "ALL" ? "is-active" : ""}`}
            onClick={() => setFilter("ALL")}
          >
            ALL ({MINERS.length})
          </button>
          {TIER_ORDER.map((tier) => {
            const count = MINERS.filter((m) => m.tier === tier).length;
            return (
              <button
                key={tier}
                type="button"
                className={`cm-tab ${filter === tier ? "is-active" : ""}`}
                onClick={() => setFilter(tier)}
              >
                {tier} ({count})
              </button>
            );
          })}
        </nav>

        <div className="cm-grid">
          {filtered.map((m) => (
            <MinerCard key={m.id} miner={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

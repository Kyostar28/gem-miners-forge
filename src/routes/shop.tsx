import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MINERS, TIER_ORDER, type Tier } from "@/data/miners";
import { RACKS } from "@/data/racks";
import { MinerCard } from "@/components/MinerCard";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Dark Web Shop — CryptoMiner" },
      { name: "description", content: "Compra hardware de minado virtual: 100 mineros únicos y 10 racks, desde estanterías de madera hasta núcleos de singularidad." },
      { property: "og:title", content: "Dark Web Shop — CryptoMiner" },
      { property: "og:description", content: "100 mineros y 10 racks a la venta, de Basic a Mythic. Sube tu hash rate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type Filter = "ALL" | Tier;

function ShopPage() {
  const [tab, setTab] = useState<"MINERS" | "RACKS">("MINERS");
  const [filter, setFilter] = useState<Filter>("ALL");
  const { buy, buyRack, state } = useGame();

  const filtered = useMemo(
    () => (filter === "ALL" ? MINERS : MINERS.filter((m) => m.tier === filter)),
    [filter],
  );

  const owned = (key: string) => (state?.rigs ?? []).filter((r) => r.model === key).length;

  return (
    <AppShell title="DARK WEB SHOP" subtitle={`Hardware y racks — ${MINERS.length} mineros y ${RACKS.length} racks en stock.`}>
      <nav className="cm-tabs" aria-label="Shop sections">
        <button type="button" className={`cm-tab ${tab === "MINERS" ? "is-active" : ""}`} onClick={() => setTab("MINERS")}>
          ⛏ MINEROS ({MINERS.length})
        </button>
        <button type="button" className={`cm-tab ${tab === "RACKS" ? "is-active" : ""}`} onClick={() => setTab("RACKS")}>
          ▤ RACKS ({RACKS.length})
        </button>
      </nav>

      {tab === "MINERS" ? (
        <>
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
              <MinerCard key={m.id} miner={m} onBuy={() => buy(m)} disabled={!state || state.ct < m.price} />
            ))}
          </div>
        </>
      ) : (
        <div className="cm-rackshop">
          {RACKS.map((r) => (
            <article className={`cm-rackcard tier-${r.tier.toLowerCase()}`} key={r.key}>
              <div className="cm-rackcard__icon" aria-hidden>{r.icon}</div>
              <div className="cm-rackcard__body">
                <header>
                  <b>{r.name}</b>
                  <span className="cm-rackcard__tier">{r.tier}</span>
                </header>
                <p>{r.desc}</p>
                <div className="cm-rackcard__stats">
                  <span>SLOTS <b>{r.slots}</b></span>
                  <span>BOOST <b>x{r.boost}</b></span>
                  <span>TUYOS <b>{owned(r.key)}</b></span>
                </div>
              </div>
              <button
                type="button"
                className="cm-btn"
                disabled={!state || state.ct < r.price}
                onClick={() => buyRack(r)}
              >
                {r.price === 0 ? "GRATIS" : `${fmt(r.price)} CT`}
              </button>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

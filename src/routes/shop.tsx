import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MINERS, TIER_ORDER, type Tier } from "@/data/miners";
import { RACKS } from "@/data/racks";
import { ROOMS, ROOM_CAPACITY } from "@/data/rooms";
import { MinerCard } from "@/components/MinerCard";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Mercado de hardware — Mineros, racks y salas | CryptoMiner" },
      { name: "description", content: "Adquiere hardware de minado virtual: 100 mineros únicos, 10 racks y 7 salas de operaciones. Cada sala admite hasta 6 racks." },
      { property: "og:title", content: "Mercado de hardware — CryptoMiner" },
      { property: "og:description", content: "Mineros de Basic a Mythic, racks industriales y salas con bonus de eficiencia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

type Filter = "ALL" | Tier;

function ShopPage() {
  const [tab, setTab] = useState<"MINERS" | "RACKS" | "ROOMS">("MINERS");
  const [filter, setFilter] = useState<Filter>("ALL");
  const { buy, buyRack, buyRoom, rooms, state } = useGame();

  const filtered = useMemo(
    () => (filter === "ALL" ? MINERS : MINERS.filter((m) => m.tier === filter)),
    [filter],
  );

  const owned = (key: string) => (state?.rigs ?? []).filter((r) => r.model === key).length;
  const freeSlots = rooms.reduce((s, r) => s + r.free, 0);

  return (
    <AppShell
      title="MERCADO DE HARDWARE"
      subtitle={`${MINERS.length} mineros, ${RACKS.length} racks y ${ROOMS.length} salas disponibles · cada sala soporta un máximo de ${ROOM_CAPACITY} racks.`}
    >
      <nav className="cm-tabs" aria-label="Shop sections">
        <button type="button" className={`cm-tab ${tab === "MINERS" ? "is-active" : ""}`} onClick={() => setTab("MINERS")}>
          ⛏ MINEROS ({MINERS.length})
        </button>
        <button type="button" className={`cm-tab ${tab === "RACKS" ? "is-active" : ""}`} onClick={() => setTab("RACKS")}>
          ▤ RACKS ({RACKS.length})
        </button>
        <button type="button" className={`cm-tab ${tab === "ROOMS" ? "is-active" : ""}`} onClick={() => setTab("ROOMS")}>
          🏠 SALAS ({ROOMS.length})
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

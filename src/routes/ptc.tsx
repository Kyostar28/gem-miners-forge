import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/ptc")({
  head: () => ({
    meta: [
      { title: "PTC — Anuncios remunerados | CryptoMiner" },
      {
        name: "description",
        content:
          "Visualiza anuncios patrocinados durante unos segundos y recibe CT Token directo a tu balance operativo.",
      },
      { property: "og:title", content: "PTC — Anuncios remunerados" },
      { property: "og:description", content: "Ingresos pasivos viendo anuncios verificados del ecosistema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PtcPage,
});

interface Ad {
  id: string;
  title: string;
  desc: string;
  seconds: number;
  reward: number;
}

const ADS: Ad[] = [
  { id: "a1", title: "HASHNODE POOL", desc: "Pool multi-cripto con comisión 0.5%.", seconds: 5, reward: 15 },
  { id: "a2", title: "COLDVAULT WALLET", desc: "Custodia fría con firma múltiple.", seconds: 8, reward: 25 },
  { id: "a3", title: "ASIC OUTLET", desc: "Hardware reacondicionado con garantía.", seconds: 10, reward: 35 },
  { id: "a4", title: "GREENWATT ENERGY", desc: "Energía renovable para granjas de minado.", seconds: 12, reward: 45 },
  { id: "a5", title: "CHAINDESK ANALYTICS", desc: "Métricas on-chain en tiempo real.", seconds: 15, reward: 60 },
  { id: "a6", title: "NODE INSURANCE", desc: "Cobertura de downtime para tus racks.", seconds: 20, reward: 90 },
];

function PtcPage() {
  const { state, update } = useGame();
  const [active, setActive] = useState<Ad | null>(null);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (!active) return;
    if (left <= 0) {
      update((s) => ({ ct: s.ct + active.reward }));
      setDone((d) => [...d, active.id]);
      setActive(null);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [active, left, update]);

  if (!state) return <AppShell title="PTC">{null}</AppShell>;

  return (
    <AppShell
      title="PTC · ANUNCIOS PATROCINADOS"
      subtitle="Campañas verificadas del ecosistema. Mantén el anuncio abierto hasta completar el temporizador para acreditar la recompensa."
    >
      <div className="cm-list">
        {ADS.map((ad) => {
          const claimed = done.includes(ad.id);
          const running = active?.id === ad.id;
          return (
            <div className="cm-listrow" key={ad.id}>
              <div>
                <b>{ad.title}</b>
                <small>{ad.desc}</small>
              </div>
              <span className="cm-chip cm-chip--ct">+{ad.reward} CT</span>
              <button
                type="button"
                className="cm-btn"
                disabled={claimed || !!active}
                onClick={() => {
                  setActive(ad);
                  setLeft(ad.seconds);
                }}
              >
                {claimed ? "COMPLETADO" : running ? `${left}s` : `VER ${ad.seconds}s`}
              </button>
            </div>
          );
        })}
      </div>
      <p className="cm-note">Balance operativo: {fmt(state.ct, 2)} CT</p>
    </AppShell>
  );
}

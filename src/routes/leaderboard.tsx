import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";
import { getRank } from "@/lib/leagues";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Top mineros | CryptoMiner" },
      { name: "description", content: "Ranking global de mineros por poder de hash, liga y recompensas estimadas por ciclo." },
      { property: "og:title", content: "Leaderboard — CryptoMiner" },
      { property: "og:description", content: "Compite por el top del ranking global de poder de minado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

const BOTS = [
  ["0xNakamoto", 148000], ["hashlord", 96500], ["v0id_runner", 71200], ["mineral_kid", 52300],
  ["ghost_asic", 38900], ["neonrig", 26400], ["cold_wallet", 17800], ["darkpool", 11250],
  ["shibarmy", 7400], ["byte_bandit", 4900], ["rig_gremlin", 3100], ["novice_hash", 1850],
  ["usb_boy", 940], ["pi_farmer", 420], ["newbie404", 130],
] as const;

function LeaderboardPage() {
  const { state, power } = useGame();

  const rows = useMemo(() => {
    const all = [
      ...BOTS.map(([name, p]) => ({ name, power: p, me: false })),
      { name: state?.username ?? "you", power, me: true },
    ];
    return all.sort((a, b) => b.power - a.power);
  }, [state?.username, power]);

  return (
    <AppShell title="LEADERBOARD" subtitle="Ranking global por poder de minado. Sube de liga para escalar posiciones.">
      <div className="cm-panel">
        <div className="cm-lb">
          {rows.map((r, i) => {
            const rank = getRank(r.power);
            return (
              <div className={`cm-lb__row ${r.me ? "is-me" : ""} ${rank.league.cls}`} key={r.name + i}>
                <span className="cm-lb__pos">#{i + 1}</span>
                <span className="cm-lb__name">@{r.name}{r.me ? " (tú)" : ""}</span>
                <span className="cm-lb__league">{rank.label}</span>
                <span className="cm-lb__power">⚡ {fmt(r.power)} TH/s</span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

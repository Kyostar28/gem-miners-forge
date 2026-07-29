import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Logros — Recompensas de CT | CryptoMiner" },
      { name: "description", content: "Completa logros de minado, colección y juegos para reclamar recompensas en CT Token." },
      { property: "og:title", content: "Logros — CryptoMiner" },
      { property: "og:description", content: "Desbloquea logros y reclama CT Token extra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { state, power, update } = useGame();
  if (!state) return <AppShell title="LOGROS">{null}</AppShell>;

  const done = ACHIEVEMENTS.filter((a) => a.check(state, power)).length;

  return (
    <AppShell title="LOGROS" subtitle={`${done}/${ACHIEVEMENTS.length} desbloqueados. Reclama tu CT.`}>
      <div className="cm-ach">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(state, power);
          const claimed = state.achievements.includes(a.id);
          return (
            <div className={`cm-ach__card ${unlocked ? "is-on" : ""}`} key={a.id}>
              <div className="cm-ach__icon">{claimed ? "✔" : unlocked ? "🏆" : "🔒"}</div>
              <div className="cm-ach__main">
                <b>{a.name}</b>
                <span>{a.description}</span>
              </div>
              <button
                type="button"
                className="cm-btn cm-btn--ghost"
                disabled={!unlocked || claimed}
                onClick={() =>
                  update((s) => ({ ct: s.ct + a.reward, achievements: [...s.achievements, a.id] }))
                }
              >
                {claimed ? "RECLAMADO" : `+${fmt(a.reward)} CT`}
              </button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

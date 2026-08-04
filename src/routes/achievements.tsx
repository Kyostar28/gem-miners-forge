import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useGame, fmt } from "@/lib/game-store";
import { AVATAR_MAP } from "@/data/avatars";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Logros — CT y avatares exóticos | CryptoMiner" },
      { name: "description", content: "Completa logros de minado, colección y arcade para reclamar CT Token y desbloquear 10 avatares exóticos únicos." },
      { property: "og:title", content: "Logros — CryptoMiner" },
      { property: "og:description", content: "Reclama CT extra y consigue avatares exóticos de rareza mítica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { state, power, update, unlockAvatar } = useGame();
  if (!state) return <AppShell title="LOGROS">{null}</AppShell>;

  const done = ACHIEVEMENTS.filter((a) => a.check(state, power)).length;

  return (
    <AppShell
      title="SALA DE LOGROS"
      subtitle={`${done}/${ACHIEVEMENTS.length} objetivos completados · reclama CT Token y desbloquea avatares exóticos de edición limitada.`}
    >
      <div className="cm-ach">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(state, power);
          const claimed = state.achievements.includes(a.id);
          const av = a.avatar ? AVATAR_MAP[a.avatar] : null;
          return (
            <div className={`cm-ach__card ${unlocked ? "is-on" : ""} ${claimed ? "is-done" : ""}`} key={a.id}>
              <div className="cm-ach__icon">{claimed ? "✔" : unlocked ? "🏆" : "🔒"}</div>
              <div className="cm-ach__main">
                <b>{a.name}</b>
                <span>{a.description}</span>
                {av ? (
                  <span className="cm-ach__reward">
                    <img src={av.src} alt={av.name} width={512} height={512} loading="lazy" />
                    AVATAR EXÓTICO · {av.name}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="cm-btn cm-btn--ghost"
                disabled={!unlocked || claimed}
                onClick={() => {
                  update((s) => ({ ct: s.ct + a.reward, achievements: [...s.achievements, a.id] }));
                  if (a.avatar) unlockAvatar(a.avatar);
                }}
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

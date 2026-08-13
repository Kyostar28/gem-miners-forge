import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";
import { ARCADE_GAMES } from "@/games/arcade";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Games — 15 arcades que dan poder de minado | CryptoMiner" },
      { name: "description", content: "15 minijuegos arcade con 3 vidas: complétalos y gana TH/s extra de poder de minado para tu granja." },
      { property: "og:title", content: "Games — CryptoMiner" },
      { property: "og:description", content: "Memory, Snake y 13 arcades más. Cada victoria suma TH/s." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { state, boostPower } = useGame();
  return (
    <AppShell
      title="GAMES"
      subtitle={`15 arcades con 3 vidas. Complétalos y gana poder de minado. Cada victoria da +0.5 TH/s durante 24 h. Boost activo: ${fmt(boostPower, 1)} TH/s.`}
    >
      <div className="cm-games">
        <Link to="/games/memory" className="cm-gamecard">
          <div className="cm-gamecard__art" aria-hidden>🧠</div>
          <b>CRYPTO MEMORY</b>
          <span>Empareja 6 criptomonedas. 3 vidas. Recompensa +0.5 TH/s por 24 h.</span>
          <em>Victorias: {state?.games.memoryWins ?? 0}</em>
        </Link>
        <Link to="/games/snake" className="cm-gamecard">
          <div className="cm-gamecard__art" aria-hidden>🐍</div>
          <b>HASH SNAKE</b>
          <span>Recoge 15 bloques sin chocar. 3 vidas. Recompensa +0.5 TH/s por 24 h.</span>
          <em>Récord: {state?.games.snakeBest ?? 0}</em>
        </Link>

        {ARCADE_GAMES.map((g) => {
          const st = state?.arcade[g.slug];
          return (
            <Link key={g.slug} to="/games/$slug" params={{ slug: g.slug }} className="cm-gamecard">
              <div className="cm-gamecard__art" aria-hidden>{g.icon}</div>
              <b>{g.name.toUpperCase()}</b>
              <span>{g.description} Meta {g.target} pts · +{g.reward} TH/s por 24 h.</span>
              <em>Récord: {st?.best ?? 0} · Victorias: {st?.wins ?? 0}</em>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

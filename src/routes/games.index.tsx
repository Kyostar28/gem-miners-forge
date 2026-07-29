import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useGame } from "@/lib/game-store";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Games — Minijuegos para ganar CT | CryptoMiner" },
      { name: "description", content: "Juega al Memory de criptos y al Hash Snake para ganar CT Token extra en tu cuenta." },
      { property: "og:title", content: "Games — CryptoMiner" },
      { property: "og:description", content: "Dos minijuegos cripto: Memory Cards y Snake. Gana CT jugando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { state } = useGame();
  return (
    <AppShell title="GAMES" subtitle="Minijuegos del terminal. Gana CT Token extra.">
      <div className="cm-games">
        <Link to="/games/memory" className="cm-gamecard">
          <div className="cm-gamecard__art" aria-hidden>🧠</div>
          <b>CRYPTO MEMORY</b>
          <span>Empareja 6 criptomonedas en el menor número de intentos. Recompensa hasta 300 CT.</span>
          <em>Victorias: {state?.games.memoryWins ?? 0}</em>
        </Link>
        <Link to="/games/snake" className="cm-gamecard">
          <div className="cm-gamecard__art" aria-hidden>🐍</div>
          <b>HASH SNAKE</b>
          <span>Recoge bloques de hash sin chocar. 10 CT por bloque recogido.</span>
          <em>Récord: {state?.games.snakeBest ?? 0}</em>
        </Link>
      </div>
    </AppShell>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArcadeShell } from "@/components/ArcadeShell";
import { ARCADE_MAP } from "@/games/arcade";

export const Route = createFileRoute("/games/$slug")({
  head: ({ params }) => {
    const g = ARCADE_MAP[params.slug];
    const title = g ? `${g.name} — Arcade minero | CryptoMiner` : "Arcade | CryptoMiner";
    const desc = g
      ? `${g.description} Completa el reto con 3 vidas y gana +${g.reward} TH/s de poder de minado.`
      : "Minijuegos arcade que dan poder de minado.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArcadeRoute,
});

function ArcadeRoute() {
  const { slug } = Route.useParams();
  const game = ARCADE_MAP[slug];
  if (!game) throw notFound();
  return <ArcadeShell game={game} />;
}

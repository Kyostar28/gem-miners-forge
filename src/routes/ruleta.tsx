import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/ruleta")({
  head: () => ({
    meta: [
      { title: "Ruleta — Sorteo de recompensas | CryptoMiner" },
      {
        name: "description",
        content:
          "Gira la ruleta operativa y consigue CT Token, poder de hash extra o multiplicadores para tu granja de minado.",
      },
      { property: "og:title", content: "Ruleta — Sorteo de recompensas" },
      { property: "og:description", content: "Un giro por sesión con premios en CT y TH/s." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoulettePage,
});

interface Prize {
  label: string;
  ct: number;
  th: number;
  color: string;
}

const PRIZES: Prize[] = [
  { label: "50 CT", ct: 50, th: 0, color: "#22ff88" },
  { label: "2 TH/s", ct: 0, th: 2, color: "#22e0ff" },
  { label: "150 CT", ct: 150, th: 0, color: "#a855ff" },
  { label: "NADA", ct: 0, th: 0, color: "#4a7a5c" },
  { label: "400 CT", ct: 400, th: 0, color: "#ffcc22" },
  { label: "8 TH/s", ct: 0, th: 8, color: "#ff4dff" },
  { label: "25 CT", ct: 25, th: 0, color: "#22ff88" },
  { label: "1000 CT", ct: 1000, th: 0, color: "#ff7b00" },
];

const SPIN_COST = 100;

function RoulettePage() {
  const { state, update, awardPower, bump } = useGame();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);

  if (!state) return <AppShell title="RULETA">{null}</AppShell>;

  const slice = 360 / PRIZES.length;
  const gradient = PRIZES.map((p, i) => `${p.color} ${i * slice}deg ${(i + 1) * slice}deg`).join(", ");

  const spin = () => {
    if (spinning || state.ct < SPIN_COST) return;
    const idx = Math.floor(Math.random() * PRIZES.length);
    const target = 360 * 6 + (360 - (idx * slice + slice / 2));
    setSpinning(true);
    setResult(null);
    update((s) => ({ ct: s.ct - SPIN_COST }));
    bump("spins");
    setAngle((a) => a + target);
    window.setTimeout(() => {
      const p = PRIZES[idx];
      if (p.ct > 0) update((s) => ({ ct: s.ct + p.ct }));
      if (p.th > 0) awardPower(p.th, "ruleta");
      setResult(p);
      setSpinning(false);
    }, 4200);
  };

  return (
    <AppShell
      title="RULETA OPERATIVA"
      subtitle={`Cada giro cuesta ${SPIN_COST} CT y reparte premios en CT Token y poder de hash permanente.`}
    >
      <div className="cm-wheelwrap">
        <div className="cm-wheel__pin" aria-hidden />
        <div
          className="cm-wheel"
          style={{ background: `conic-gradient(${gradient})`, transform: `rotate(${angle}deg)` }}
        >
          {PRIZES.map((p, i) => (
            <span
              key={p.label + i}
              className="cm-wheel__lbl"
              style={{ transform: `rotate(${i * slice + slice / 2}deg) translateY(-108px)` }}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className="cm-wheel__actions">
          <button type="button" className="cm-btn" disabled={spinning || state.ct < SPIN_COST} onClick={spin}>
            {spinning ? "GIRANDO…" : `GIRAR · ${SPIN_COST} CT`}
          </button>
          <p className="cm-note">
            {result
              ? result.ct === 0 && result.th === 0
                ? "Sin premio en este giro. Vuelve a intentarlo."
                : `Premio acreditado: ${result.label}`
              : `Balance: ${fmt(state.ct, 2)} CT`}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

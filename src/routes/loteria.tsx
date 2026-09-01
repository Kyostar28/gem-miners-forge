import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/loteria")({
  head: () => ({
    meta: [
      { title: "Lotería — Sorteo del pool | CryptoMiner" },
      {
        name: "description",
        content:
          "Compra boletos con CT Token y participa en el sorteo del bote comunitario de la red de minado CryptoMiner.",
      },
      { property: "og:title", content: "Lotería — Sorteo del pool" },
      { property: "og:description", content: "Bote acumulado en CT Token con sorteo instantáneo de 6 números." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LotteryPage,
});

const TICKET = 250;
const POOL_BASE = 25_000;

function pick6() {
  const set = new Set<number>();
  while (set.size < 6) set.add(1 + Math.floor(Math.random() * 49));
  return [...set].sort((a, b) => a - b);
}

function LotteryPage() {
  const { state, update, bump } = useGame();
  const [ticket, setTicket] = useState<number[] | null>(null);
  const [draw, setDraw] = useState<number[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!state) return <AppShell title="LOTERÍA">{null}</AppShell>;

  const jackpot = POOL_BASE + state.claimed * 500;

  const buy = () => {
    if (state.ct < TICKET) {
      setMsg("Saldo insuficiente para adquirir el boleto.");
      return;
    }
    update((s) => ({ ct: s.ct - TICKET }));
    bump("lottery");
    setTicket(pick6());
    setDraw(null);
    setMsg(null);
  };

  const run = () => {
    if (!ticket) return;
    const d = pick6();
    setDraw(d);
    const hits = ticket.filter((n) => d.includes(n)).length;
    const table: Record<number, number> = { 0: 0, 1: 0, 2: 150, 3: 750, 4: 4000, 5: 20000, 6: jackpot };
    const prize = table[hits] ?? 0;
    if (prize > 0) update((s) => ({ ct: s.ct + prize }));
    setMsg(hits >= 2 ? `${hits} aciertos · premio de ${fmt(prize)} CT acreditado.` : `${hits} aciertos · sin premio.`);
    setTicket(null);
  };

  return (
    <AppShell
      title="LOTERÍA DE LA RED"
      subtitle="Bote comunitario alimentado por las comisiones del pool. Cada boleto genera 6 números entre el 1 y el 49."
    >
      <section className="cm-cols cm-cols--compact">
        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">BOTE ACUMULADO</div>
          <div className="cm-jackpot">{fmt(jackpot)} CT</div>
          <p className="cm-note cm-note--xs">Boleto: {TICKET} CT · Balance: {fmt(state.ct, 2)} CT</p>
          <div className="cm-pool__timer">
            <button type="button" className="cm-btn" onClick={buy} disabled={!!ticket}>
              COMPRAR BOLETO
            </button>
            <button type="button" className="cm-btn cm-btn--ghost" onClick={run} disabled={!ticket}>
              SORTEAR
            </button>
          </div>
        </div>

        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">TU BOLETO</div>
          <div className="cm-balls">
            {(ticket ?? [0, 0, 0, 0, 0, 0]).map((n, i) => (
              <span className="cm-ball" key={i}>{n || "—"}</span>
            ))}
          </div>
          <div className="cm-panel__title">NÚMEROS SORTEADOS</div>
          <div className="cm-balls">
            {(draw ?? [0, 0, 0, 0, 0, 0]).map((n, i) => (
              <span className={`cm-ball ${draw && ticket === null && n ? "is-on" : ""}`} key={i}>{n || "—"}</span>
            ))}
          </div>
          {msg ? <p className="cm-note cm-note--xs">{msg}</p> : null}
        </div>

        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">TABLA DE PREMIOS</div>
          <div className="cm-statgrid">
            <div><span>2 ACIERTOS</span><b>150 CT</b></div>
            <div><span>3 ACIERTOS</span><b>750 CT</b></div>
            <div><span>4 ACIERTOS</span><b>4.000 CT</b></div>
            <div><span>5 ACIERTOS</span><b>20.000 CT</b></div>
            <div><span>6 ACIERTOS</span><b>BOTE</b></div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

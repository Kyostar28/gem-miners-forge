import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";

export const Route = createFileRoute("/offerwall")({
  head: () => ({
    meta: [
      { title: "Offerwall — Tareas patrocinadas | CryptoMiner" },
      {
        name: "description",
        content:
          "Completa misiones y encuestas patrocinadas para obtener CT Token y poder de hash adicional para tu operación.",
      },
      { property: "og:title", content: "Offerwall — Tareas patrocinadas" },
      { property: "og:description", content: "Misiones diarias con recompensas en CT y TH/s." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferwallPage,
});

interface Offer {
  id: string;
  provider: string;
  title: string;
  desc: string;
  ct: number;
  th: number;
  tier: "basic" | "pro" | "elite" | "quantum";
}

const OFFERS: Offer[] = [
  { id: "o1", provider: "SURVEYNET", title: "Encuesta rápida", desc: "3 preguntas sobre hábitos de trading.", ct: 40, th: 0, tier: "basic" },
  { id: "o2", provider: "APPCHAIN", title: "Prueba una dApp", desc: "Abre la app y crea una cartera de prueba.", ct: 80, th: 2, tier: "basic" },
  { id: "o3", provider: "MINEQUEST", title: "Misión diaria", desc: "Mantén tus racks al 100% durante un ciclo.", ct: 120, th: 4, tier: "pro" },
  { id: "o4", provider: "NODELAB", title: "Registro verificado", desc: "Verifica tu correo en el partner.", ct: 200, th: 6, tier: "pro" },
  { id: "o5", provider: "HASHARENA", title: "Torneo arcade", desc: "Gana 3 partidas en la sección Juegos.", ct: 350, th: 12, tier: "elite" },
  { id: "o6", provider: "ORBITAL", title: "Contrato cloud", desc: "Activa un contrato de Cloud Mining.", ct: 600, th: 25, tier: "elite" },
  { id: "o7", provider: "SINGULARITY", title: "Escala tu granja", desc: "Alcanza 10 mineros montados.", ct: 1200, th: 60, tier: "quantum" },
];

function OfferwallPage() {
  const { state, update, awardPower } = useGame();
  const [done, setDone] = useState<string[]>([]);

  if (!state) return <AppShell title="OFFERWALL">{null}</AppShell>;

  return (
    <AppShell
      title="OFFERWALL · MISIONES PATROCINADAS"
      subtitle="Colaboraciones con partners del sector. Cada misión completada acredita CT Token y poder de hash permanente."
    >
      <div className="cm-offers">
        {OFFERS.map((o) => (
          <div className={`cm-offer tier-${o.tier}`} key={o.id}>
            <div className="cm-offer__head">
              <span>{o.provider}</span>
              <b>{o.title}</b>
            </div>
            <p>{o.desc}</p>
            <div className="cm-offer__rew">
              <span className="cm-chip cm-chip--ct">+{o.ct} CT</span>
              {o.th > 0 ? <span className="cm-chip">+{o.th} TH/s</span> : null}
            </div>
            <button
              type="button"
              className="cm-btn cm-btn--full"
              disabled={done.includes(o.id)}
              onClick={() => {
                update((s) => ({ ct: s.ct + o.ct }));
                if (o.th > 0) awardPower(o.th);
                setDone((d) => [...d, o.id]);
              }}
            >
              {done.includes(o.id) ? "COMPLETADA" : "COMPLETAR"}
            </button>
          </div>
        ))}
      </div>
      <p className="cm-note">Balance operativo: {fmt(state.ct, 2)} CT</p>
    </AppShell>
  );
}

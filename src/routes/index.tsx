import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/game-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login — CryptoMiner Dark Web" },
      { name: "description", content: "Entra a CryptoMiner con solo un username y empieza a minar CT Token y LTC con tus racks virtuales." },
      { property: "og:title", content: "Login — CryptoMiner Dark Web" },
      { property: "og:description", content: "Accede a tu sala de minado virtual: racks, ligas, juegos y rewards pool cada 10 minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, state, ready } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    if (ready && state) navigate({ to: "/dashboard" });
  }, [ready, state, navigate]);

  return (
    <div className="cm-shell cm-login">
      <form
        className="cm-login__box"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          login(name);
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="cm-brand cm-brand--lg">
          <span className="cm-brand__dot" aria-hidden />
          CRYPTO<span>MINER</span>
        </div>
        <p className="cm-login__msg">
          &gt; acceso restringido. identifícate para abrir tu sala de minado
          <span className="cm-cursor">&nbsp;</span>
        </p>

        <label className="cm-label" htmlFor="username">
          USERNAME
        </label>
        <input
          id="username"
          className="cm-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="satoshi_01"
          maxLength={20}
          autoComplete="off"
        />

        <button type="submit" className="cm-btn cm-btn--full" disabled={!name.trim()}>
          ENTRAR
        </button>
        <p className="cm-login__hint">Sin contraseña. Tu progreso se guarda en este dispositivo.</p>
      </form>
    </div>
  );
}

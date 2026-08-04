import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/game-store";
import { AVATARS } from "@/data/avatars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso de operador — CryptoMiner Dark Web" },
      { name: "description", content: "Crea tu operador con un username y elige uno de los 40 avatares de robot minero para abrir tu sala de minado virtual." },
      { property: "og:title", content: "Acceso de operador — CryptoMiner" },
      { property: "og:description", content: "Elige avatar, entra sin contraseña y gestiona racks, ligas, juegos y rewards pool cada 10 minutos." },
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
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (ready && state) navigate({ to: "/dashboard" });
  }, [ready, state, navigate]);

  return (
    <div className="cm-shell cm-login">
      <form
        className="cm-login__box cm-login__box--wide"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !avatar) return;
          login(name, avatar);
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="cm-brand cm-brand--lg">
          <span className="cm-brand__dot" aria-hidden />
          CRYPTO<span>MINER</span>
        </div>
        <p className="cm-login__msg">
          &gt; registro de operador. tu avatar se elige una sola vez
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

        <div className="cm-login__avatars">
          <div className="cm-label cm-label--row">
            <span>AVATAR DE OPERADOR</span>
            <small>{avatar ? "seleccionado" : `${AVATARS.length} disponibles`}</small>
          </div>
          <div className="cm-avatars cm-avatars--pick">
            {AVATARS.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`cm-avatar ${avatar === a.key ? "is-on" : ""}`}
                onClick={() => setAvatar(a.key)}
                title={a.name}
              >
                <img src={a.src} alt={a.name} width={512} height={512} loading="lazy" />
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="cm-btn cm-btn--full" disabled={!name.trim() || !avatar}>
          CREAR OPERADOR
        </button>
        <p className="cm-login__hint">
          Sin contraseña. El avatar es permanente: solo los avatares exóticos de LOGROS podrán sustituirlo.
        </p>
      </form>
    </div>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useGame, fmt } from "@/lib/game-store";
import { getRank } from "@/lib/leagues";

const NAV = [
  { to: "/dashboard", label: "DASHBOARD", icon: "▚" },
  { to: "/games", label: "GAMES", icon: "◉" },
  { to: "/shop", label: "SHOP", icon: "🛒" },
  { to: "/marketplace", label: "MARKETPLACE", icon: "⇄" },
  { to: "/leaderboard", label: "LEADERBOARD", icon: "★" },
  { to: "/achievements", label: "LOGROS", icon: "🏆" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { state, ready, logout, power } = useGame();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !state) navigate({ to: "/" });
  }, [ready, state, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready || !state) {
    return (
      <div className="cm-shell">
        <div className="cm-container cm-boot">booting terminal<span className="cm-cursor">&nbsp;</span></div>
      </div>
    );
  }

  const rank = getRank(power);

  return (
    <div className="cm-shell cm-app">
      <aside className={`cm-side ${open ? "is-open" : ""}`}>
        <div className="cm-brand">
          <span className="cm-brand__dot" aria-hidden />
          CRYPTO<span>MINER</span>
        </div>

        <div className={`cm-side__user ${rank.league.cls}`}>
          <div className="cm-side__name">@{state.username}</div>
          <div className="cm-side__rank">{rank.label}</div>
        </div>

        <nav className="cm-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="cm-nav__link"
              activeProps={{ className: "cm-nav__link is-active" }}
              activeOptions={{ exact: false }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="cm-side__bal">
          <div className="cm-bal">
            <span className="cm-bal__k">CT</span>
            <span className="cm-bal__v">{fmt(state.ct, 2)}</span>
          </div>
          <div className="cm-bal cm-bal--ltc">
            <span className="cm-bal__k">LTC</span>
            <span className="cm-bal__v">{fmt(state.ltc, 5)}</span>
          </div>
        </div>

        <button type="button" className="cm-logout" onClick={logout}>
          LOG OUT
        </button>
      </aside>

      <main className="cm-main">
        <header className="cm-topbar">
          <button type="button" className="cm-burger" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            ☰
          </button>
          <div>
            <h1 className="cm-title">{title}</h1>
            {subtitle ? <p className="cm-sub">{subtitle}</p> : null}
          </div>
          <div className="cm-topbar__bal">
            <span className="cm-chip">⚡ {fmt(power)} TH/s</span>
            <span className="cm-chip cm-chip--ct">{fmt(state.ct, 0)} CT</span>
            <span className="cm-chip cm-chip--ltc">{fmt(state.ltc, 4)} LTC</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useGame, fmt } from "@/lib/game-store";
import { getRank, RANK_COUNT } from "@/lib/leagues";
import { COINS, fmtCoin } from "@/lib/coins";

const NAV = [
  { to: "/dashboard", label: "DASHBOARD", icon: "▚" },
  { to: "/games", label: "GAMES", icon: "◉" },
  { to: "/shop", label: "SHOP", icon: "🛒" },
  { to: "/marketplace", label: "MARKETPLACE", icon: "⇄" },
  { to: "/wallet", label: "WALLET", icon: "◈" },
  { to: "/leaderboard", label: "LEADERBOARD", icon: "★" },
  { to: "/achievements", label: "LOGROS", icon: "🏆" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { state, ready, logout, power, balance } = useGame();
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
  const initials = state.username.slice(0, 2).toUpperCase();
  const topCoins = COINS.filter((c) => balance(c.key) > 0).slice(0, 3);

  return (
    <div className="cm-shell cm-app">
      <aside className={`cm-side ${open ? "is-open" : ""}`}>
        <div className="cm-brand">
          <span className="cm-brand__dot" aria-hidden />
          CRYPTO<span>MINER</span>
        </div>

        {/* professional user / league card */}
        <div className={`cm-usercard ${rank.league.cls}`}>
          <div className="cm-usercard__top">
            <div className="cm-usercard__avatar">
              {initials}
              <span className="cm-usercard__status" aria-hidden />
            </div>
            <div className="cm-usercard__id">
              <b>@{state.username}</b>
              <small>ID #{String(state.owned.length * 7 + state.claimed + 1024).padStart(6, "0")}</small>
            </div>
          </div>

          <div className="cm-usercard__league">
            <div className="cm-usercard__crest">
              <span>{rank.division}</span>
            </div>
            <div>
              <div className="cm-usercard__lname">{rank.league.name}</div>
              <div className="cm-usercard__lmeta">RANK {rank.index + 1}/{RANK_COUNT}</div>
            </div>
          </div>

          <div className="cm-progress cm-progress--thin" role="progressbar" aria-valuenow={Math.round(rank.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="cm-progress__fill" style={{ width: `${rank.progress * 100}%` }} />
          </div>
          <div className="cm-usercard__foot">
            <span>⚡ {fmt(power)} TH/s</span>
            <span>{rank.isMax ? "MAX" : `${Math.round(rank.progress * 100)}%`}</span>
          </div>
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
            {topCoins
              .filter((c) => c.key !== "CT")
              .map((c) => (
                <span className="cm-chip" key={c.key} style={{ color: c.color, borderColor: c.color }}>
                  {fmtCoin(c.key, balance(c.key))} {c.symbol}
                </span>
              ))}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useGame, fmt } from "@/lib/game-store";
import { getRank, RANK_COUNT } from "@/lib/leagues";
import { COINS, fmtCoin } from "@/lib/coins";
import { useUi, THEMES, type ThemeKey, type Lang } from "@/lib/ui-prefs";
import { AVATARS, EXOTIC_AVATARS, AVATAR_MAP } from "@/data/avatars";

const NAV = [
  { to: "/dashboard", key: "nav.dashboard", icon: "▚" },
  { to: "/games", key: "nav.games", icon: "◉" },
  { to: "/shop", key: "nav.shop", icon: "🛒" },
  { to: "/marketplace", key: "nav.marketplace", icon: "⇄" },
  { to: "/forja", key: "nav.forge", icon: "⚒" },
  { to: "/cloud", key: "nav.cloud", icon: "☁" },
  { to: "/wallet", key: "nav.wallet", icon: "◈" },
  { to: "/ptc", key: "nav.ptc", icon: "▶" },
  { to: "/offerwall", key: "nav.offerwall", icon: "▦" },
  { to: "/ruleta", key: "nav.roulette", icon: "◍" },
  { to: "/loteria", key: "nav.lottery", icon: "❖" },
  { to: "/leaderboard", key: "nav.leaderboard", icon: "★" },
  { to: "/achievements", key: "nav.achievements", icon: "🏆" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { state, ready, logout, power, balance, update } = useGame();
  const { t, theme, setTheme, lang, setLang } = useUi();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"theme" | "lang" | null>(null);
  const [avatarPicker, setAvatarPicker] = useState(false);
  const [balOpen, setBalOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !state) navigate({ to: "/" });
  }, [ready, state, navigate]);

  useEffect(() => {
    setOpen(false);
    setPanel(null);
    setBalOpen(false);
  }, [pathname]);

  if (!ready || !state) {
    return (
      <div className="cm-shell">
        <div className="cm-container cm-boot">booting terminal<span className="cm-cursor">&nbsp;</span></div>
      </div>
    );
  }

  const rank = getRank(power);
  const avatar = AVATAR_MAP[state.avatar] ?? AVATARS[0];
  const baseAvatar = AVATARS.find((a) => a.key === (state.baseAvatar ?? state.avatar)) ?? AVATARS[0];

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
            <button
              type="button"
              className="cm-usercard__avatar"
              onClick={() => setAvatarPicker(true)}
              title={t("avatar.title")}
            >
              <img src={avatar.src} alt={avatar.name} width={512} height={512} loading="lazy" />
              <span className="cm-usercard__status" aria-hidden />
            </button>
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
              <div className="cm-usercard__lmeta">{t("side.rank")} {rank.index + 1}/{RANK_COUNT}</div>
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
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="cm-side__prefs">
          <div className="cm-prefs">
            <button type="button" className="cm-pref" onClick={() => setPanel((p) => (p === "theme" ? null : "theme"))}>
              <span className="cm-pref__dot" style={{ background: THEMES.find((x) => x.key === theme)?.swatch }} />
              {t("side.theme")}
            </button>
            <button type="button" className="cm-pref" onClick={() => setPanel((p) => (p === "lang" ? null : "lang"))}>
              <span aria-hidden>🌐</span>
              {lang.toUpperCase()}
            </button>
          </div>

          {panel === "theme" ? (
            <div className="cm-pref__pop">
              {THEMES.map((th) => (
                <button
                  key={th.key}
                  type="button"
                  className={`cm-pref__opt ${theme === th.key ? "is-on" : ""}`}
                  onClick={() => {
                    setTheme(th.key as ThemeKey);
                    setPanel(null);
                  }}
                >
                  <span className="cm-pref__dot" style={{ background: th.swatch }} />
                  {th.label}
                </button>
              ))}
            </div>
          ) : null}

          {panel === "lang" ? (
            <div className="cm-pref__pop">
              {(["es", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`cm-pref__opt ${lang === l ? "is-on" : ""}`}
                  onClick={() => {
                    setLang(l);
                    setPanel(null);
                  }}
                >
                  <span aria-hidden>{l === "es" ? "🇪🇸" : "🇬🇧"}</span>
                  {l === "es" ? "Español" : "English"}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button type="button" className="cm-logout" onClick={logout}>
          {t("side.logout")}
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
            <div className="cm-baldrop">
              <button
                type="button"
                className={`cm-baldrop__btn ${balOpen ? "is-open" : ""}`}
                onClick={() => setBalOpen((v) => !v)}
                aria-expanded={balOpen}
              >
                <span className="cm-chip cm-chip--ct">{fmt(state.ct, 0)} CT</span>
                <span aria-hidden>▾</span>
              </button>
              {balOpen ? (
                <div className="cm-baldrop__pop">
                  <div className="cm-baldrop__head">{t("nav.wallet")}</div>
                  {COINS.map((c) => (
                    <div className="cm-baldrop__row" key={c.key} style={{ ["--coin" as string]: c.color }}>
                      <span className="cm-baldrop__ic">{c.icon}</span>
                      <span className="cm-baldrop__sym">{c.symbol}</span>
                      <span className="cm-baldrop__val">{fmtCoin(c.key, balance(c.key))}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {children}
      </main>

      {avatarPicker ? (
        <div className="cm-modal" role="dialog" aria-modal="true">
          <div className="cm-modal__backdrop" onClick={() => setAvatarPicker(false)} />
          <div className="cm-modal__box">
            <div className="cm-modal__head">
              <span>{t("avatar.title")}</span>
              <button type="button" className="cm-modal__x" onClick={() => setAvatarPicker(false)}>
                ✕
              </button>
            </div>
            <p className="cm-note cm-note--xs">
              El avatar base se elige al crear la cuenta. Los avatares exóticos se desbloquean en LOGROS.
            </p>
            <div className="cm-avatars">
              <button type="button" className={`cm-avatar ${state.avatar === baseAvatar.key ? "is-on" : ""}`} onClick={() => { update({ avatar: baseAvatar.key }); setAvatarPicker(false); }}>
                <img src={baseAvatar.src} alt={baseAvatar.name} width={512} height={512} loading="lazy" />
                <span>{baseAvatar.name}</span>
              </button>
              {EXOTIC_AVATARS.map((a) => {
                const locked = !(state.unlockedAvatars ?? []).includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    className={`cm-avatar cm-avatar--exotic ${state.avatar === a.key ? "is-on" : ""} ${locked ? "is-locked" : ""}`}
                    disabled={locked}
                    onClick={() => {
                      update({ avatar: a.key });
                      setAvatarPicker(false);
                    }}
                  >
                    <img src={a.src} alt={a.name} width={512} height={512} loading="lazy" />
                    <span>{locked ? "🔒 BLOQUEADO" : a.name}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}

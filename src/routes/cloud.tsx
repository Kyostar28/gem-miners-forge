import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt, CLOUD_DAILY, DAY_MS } from "@/lib/game-store";
import { COINS, COIN_MAP, fmtCoin } from "@/lib/coins";
import { getPrices } from "@/lib/prices.functions";

export const Route = createFileRoute("/cloud")({
  head: () => ({
    meta: [
      { title: "Cloud Mining — Deposita y mina 0.03% diario | CryptoMiner" },
      { name: "description", content: "Activa contratos de minería en la nube depositando cripto de tu balance o desde una wallet externa y gana un 0.03% cada 24 horas en tiempo real." },
      { property: "og:title", content: "Cloud Mining — 0.03% diario" },
      { property: "og:description", content: "Contratos de minería en la nube con precios reales de mercado y claim en vivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CloudPage,
});

function fakeAddress(coin: string) {
  return `${coin.toLowerCase()}1q${coin}x7f4d92kchainpoolcm0deposit`.slice(0, 34);
}

function CloudPage() {
  const { state, balance, cloudDeposit, cloudMined, cloudClaim, cloudClose } = useGame();
  const fetchPrices = useServerFn(getPrices);
  const { data: priceData } = useQuery({
    queryKey: ["prices"],
    queryFn: () => fetchPrices(),
    refetchInterval: 60_000,
  });

  const [coin, setCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"balance" | "external">("balance");
  const [msg, setMsg] = useState<string | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const prices = priceData?.prices ?? {};
  const usd = (key: string, amt: number) => (prices[key] ?? COIN_MAP[key]?.rate ?? 0) * amt;

  const deposits = state?.cloud ?? [];
  const totals = useMemo(() => {
    let dep = 0;
    let mined = 0;
    for (const d of deposits) {
      dep += usd(d.coin, d.amount);
      mined += usd(d.coin, cloudMined(d, tick));
    }
    return { dep, mined };
  }, [deposits, tick, prices, cloudMined]);

  if (!state) return <AppShell title="CLOUD MINING">{null}</AppShell>;

  const amt = Number(amount);
  const daily = amt > 0 ? amt * CLOUD_DAILY : 0;

  const submit = () => {
    const err = cloudDeposit(coin, amt, source);
    setMsg(err ?? `Contrato activo: ${fmtCoin(coin, amt)} ${coin} minando 0.03% / 24h.`);
    if (!err) setAmount("");
  };

  return (
    <AppShell title="CLOUD MINING" subtitle="Deposita cripto y mina 0.03% cada 24h. Sin hardware, sin ruido.">
      <section className="cm-cols cm-cols--compact">
        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">NUEVO CONTRATO</div>
          <label className="cm-field">
            <span>MONEDA</span>
            <select className="cm-input" value={coin} onChange={(e) => setCoin(e.target.value)}>
              {COINS.map((c) => (
                <option key={c.key} value={c.key}>{c.icon} {c.symbol} — {fmtCoin(c.key, balance(c.key))} disp.</option>
              ))}
            </select>
          </label>

          <div className="cm-tabs cm-tabs--mini">
            <button type="button" className={`cm-tab ${source === "balance" ? "is-active" : ""}`} onClick={() => setSource("balance")}>DESDE BALANCE</button>
            <button type="button" className={`cm-tab ${source === "external" ? "is-active" : ""}`} onClick={() => setSource("external")}>DEPÓSITO EXTERNO</button>
          </div>

          <label className="cm-field">
            <span>CANTIDAD ({coin})</span>
            <input className="cm-input" inputMode="decimal" value={amount} placeholder="0.00" onChange={(e) => setAmount(e.target.value)} />
          </label>

          {source === "external" ? (
            <div className="cm-depositbox">
              <span>Envía {coin} a esta dirección y confirma el importe:</span>
              <code>{fakeAddress(coin)}</code>
            </div>
          ) : null}

          <div className="cm-statgrid">
            <div><span>PRECIO {coin}</span><b>${(prices[coin] ?? COIN_MAP[coin]?.rate ?? 0).toLocaleString("en-US", { maximumFractionDigits: 6 })}</b></div>
            <div><span>VALOR</span><b>${usd(coin, amt || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}</b></div>
            <div><span>GANANCIA 24H</span><b>{fmtCoin(coin, daily)} {coin}</b></div>
            <div><span>EN USD / 24H</span><b>${usd(coin, daily).toLocaleString("en-US", { maximumFractionDigits: 4 })}</b></div>
          </div>

          <button type="button" className="cm-btn cm-btn--full" onClick={submit} disabled={!(amt > 0)}>
            ACTIVAR MINERÍA
          </button>
          {msg ? <p className="cm-note">{msg}</p> : null}
        </div>

        <div className="cm-panel cm-panel--sm">
          <div className="cm-panel__title">RESUMEN</div>
          <div className="cm-statgrid">
            <div><span>CONTRATOS</span><b>{deposits.length}</b></div>
            <div><span>DEPOSITADO</span><b>${totals.dep.toLocaleString("en-US", { maximumFractionDigits: 2 })}</b></div>
            <div><span>MINADO AHORA</span><b>${totals.mined.toLocaleString("en-US", { maximumFractionDigits: 6 })}</b></div>
            <div><span>TASA</span><b>0.03% / 24h</b></div>
          </div>
          <p className="cm-note cm-note--xs">
            Precios {priceData?.live ? "en vivo (CoinGecko)" : "de referencia"} · actualizados cada 60s
          </p>
        </div>
      </section>

      <h2 className="cm-h2">CONTRATOS ACTIVOS</h2>
      {deposits.length === 0 ? (
        <p className="cm-note">Sin contratos. Activa uno arriba para empezar a minar en la nube.</p>
      ) : (
        <div className="cm-cloudlist">
          {deposits.map((d) => {
            const mined = cloudMined(d, tick);
            const c = COIN_MAP[d.coin];
            const pct = Math.min(1, (tick - d.last) / DAY_MS);
            return (
              <article className="cm-cloudcard" key={d.id} style={{ ["--coin" as string]: c?.color }}>
                <header>
                  <span className="cm-cloudcard__coin">{c?.icon} {d.coin}</span>
                  <span className="cm-cloudcard__id">#{d.id}</span>
                </header>
                <div className="cm-cloudcard__row"><span>DEPOSITADO</span><b>{fmtCoin(d.coin, d.amount)}</b></div>
                <div className="cm-cloudcard__row"><span>MINADO</span><b className="cm-live">{mined.toFixed(Math.min(8, (c?.decimals ?? 2) + 4))}</b></div>
                <div className="cm-cloudcard__row"><span>VALOR MINADO</span><b>${usd(d.coin, mined).toLocaleString("en-US", { maximumFractionDigits: 6 })}</b></div>
                <div className="cm-progress cm-progress--thin"><div className="cm-progress__fill" style={{ width: `${pct * 100}%` }} /></div>
                <div className="cm-cloudcard__actions">
                  <button type="button" className="cm-btn" onClick={() => cloudClaim(d.id)} disabled={mined <= 0}>CLAIM</button>
                  <button type="button" className="cm-btn cm-btn--ghost" onClick={() => cloudClose(d.id)}>CERRAR</button>
                </div>
                <p className="cm-note cm-note--xs">
                  Origen: {d.source === "balance" ? "balance interno" : "wallet externa"} · {fmt(CLOUD_DAILY * 100 * 100) / 100}0.03% diario
                </p>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

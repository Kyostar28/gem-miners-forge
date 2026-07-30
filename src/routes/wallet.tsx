import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGame, fmt } from "@/lib/game-store";
import { COINS, COIN_MAP, fmtCoin } from "@/lib/coins";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Retira tus criptos minadas | CryptoMiner" },
      { name: "description", content: "Consulta el balance de tus 10 criptomonedas minadas, su valor estimado y solicita retiros a tu dirección externa." },
      { property: "og:title", content: "Wallet — CryptoMiner" },
      { property: "og:description", content: "Balances multi-cripto, valor estimado y retiros con historial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { state, balance, withdraw } = useGame();
  const [coin, setCoin] = useState("CT");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state) return <AppShell title="WALLET">{null}</AppShell>;

  const selected = COIN_MAP[coin];
  const bal = balance(coin);
  const totalCt = COINS.reduce((t, c) => t + balance(c.key) * c.rate, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (value < selected.min) {
      setMsg({ ok: false, text: `El retiro mínimo de ${selected.symbol} es ${fmtCoin(coin, selected.min)}.` });
      return;
    }
    const err = withdraw(coin, value, address);
    if (err) setMsg({ ok: false, text: err });
    else {
      setMsg({ ok: true, text: `Retiro de ${fmtCoin(coin, value)} ${selected.symbol} enviado a procesar.` });
      setAmount("");
    }
  };

  return (
    <AppShell title="WALLET" subtitle="Tus balances minados y solicitudes de retiro.">
      <section className="cm-cols">
        <div className="cm-panel">
          <div className="cm-panel__title">PORTAFOLIO · VALOR ≈ {fmt(totalCt, 2)} CT</div>
          <div className="cm-walletgrid">
            {COINS.map((c) => (
              <button
                type="button"
                key={c.key}
                className={`cm-coinrow cm-coinrow--btn ${coin === c.key ? "is-sel" : ""}`}
                style={{ ["--coin" as string]: c.color }}
                onClick={() => setCoin(c.key)}
              >
                <span className="cm-coinrow__icon">{c.icon}</span>
                <span className="cm-coinrow__sym">{c.symbol}</span>
                <span className="cm-coinrow__val">{fmtCoin(c.key, balance(c.key))}</span>
                <span className="cm-coinrow__ct">≈ {fmt(balance(c.key) * c.rate, 2)} CT</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cm-panel">
          <div className="cm-panel__title">SOLICITAR RETIRO</div>
          <form onSubmit={submit}>
            <label className="cm-label" htmlFor="w-coin">MONEDA</label>
            <select id="w-coin" className="cm-input" value={coin} onChange={(e) => setCoin(e.target.value)}>
              {COINS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.symbol} — {fmtCoin(c.key, balance(c.key))} disponible
                </option>
              ))}
            </select>

            <label className="cm-label" htmlFor="w-addr">DIRECCIÓN {selected.symbol}</label>
            <input
              id="w-addr"
              className="cm-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Pega tu dirección ${selected.symbol}`}
            />

            <label className="cm-label" htmlFor="w-amt">
              CANTIDAD · mín {fmtCoin(coin, selected.min)} {selected.symbol}
            </label>
            <div className="cm-amountrow">
              <input
                id="w-amt"
                className="cm-input"
                type="number"
                step="any"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <button type="button" className="cm-btn cm-btn--ghost" onClick={() => setAmount(String(bal))}>
                MAX
              </button>
            </div>

            <button type="submit" className="cm-btn cm-btn--full">RETIRAR</button>
          </form>
          {msg ? <p className={msg.ok ? "cm-win" : "cm-win cm-win--bad"}>{msg.text}</p> : null}
          <p className="cm-note">Los retiros se procesan en el siguiente ciclo de red (simulado).</p>
        </div>
      </section>

      <h2 className="cm-h2">HISTORIAL DE RETIROS</h2>
      {state.withdrawals.length === 0 ? (
        <p className="cm-note">Todavía no has solicitado ningún retiro.</p>
      ) : (
        <div className="cm-table">
          <div className="cm-table__row cm-table__row--head">
            <span>ID</span><span>MONEDA</span><span>CANTIDAD</span><span>DIRECCIÓN</span><span>FECHA</span><span>ESTADO</span>
          </div>
          {state.withdrawals.map((w) => (
            <div className="cm-table__row" key={w.id}>
              <span>#{w.id}</span>
              <span>{COIN_MAP[w.coin]?.symbol ?? w.coin}</span>
              <span>{fmtCoin(w.coin, w.amount)}</span>
              <span className="cm-trunc">{w.address}</span>
              <span>{new Date(w.at).toLocaleString("es-ES")}</span>
              <span className="cm-badge">{w.status}</span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

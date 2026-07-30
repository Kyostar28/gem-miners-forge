// Monedas minables del pool. El poder de minado se reparte entre ellas (split power).

export interface Coin {
  key: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  /** cantidad repartida en toda la red por ciclo de 10 min */
  pool: number;
  decimals: number;
  /** valor aproximado en CT (para la wallet) */
  rate: number;
  /** retiro mínimo */
  min: number;
}

export const COINS: Coin[] = [
  { key: "CT",   name: "CryptoMiner Token", symbol: "CT",   icon: "⛏", color: "#22ff88", pool: 12000,        decimals: 2, rate: 1,       min: 500 },
  { key: "LTC",  name: "Litecoin",          symbol: "LTC",  icon: "Ł", color: "#a6b0c3", pool: 6,            decimals: 6, rate: 900,     min: 0.02 },
  { key: "BTC",  name: "Bitcoin",           symbol: "BTC",  icon: "₿", color: "#f7931a", pool: 0.05,         decimals: 8, rate: 95000,   min: 0.0002 },
  { key: "ETH",  name: "Ethereum",          symbol: "ETH",  icon: "Ξ", color: "#8c8cff", pool: 1.2,          decimals: 6, rate: 3200,    min: 0.005 },
  { key: "SOL",  name: "Solana",            symbol: "SOL",  icon: "◎", color: "#14f195", pool: 20,           decimals: 4, rate: 180,     min: 0.1 },
  { key: "POL",  name: "Polygon",           symbol: "POL",  icon: "⬡", color: "#8247e5", pool: 5000,         decimals: 3, rate: 0.6,     min: 50 },
  { key: "SHIB", name: "Shiba Inu",         symbol: "SHIB", icon: "🐕", color: "#ffa409", pool: 40_000_000,   decimals: 0, rate: 0.00002, min: 500000 },
  { key: "DOGE", name: "Dogecoin",          symbol: "DOGE", icon: "Ð", color: "#c2a633", pool: 9000,         decimals: 2, rate: 0.28,    min: 100 },
  { key: "TRX",  name: "Tron",              symbol: "TRX",  icon: "⟁", color: "#ff0630", pool: 12000,        decimals: 2, rate: 0.22,    min: 200 },
  { key: "XMR",  name: "Monero",            symbol: "XMR",  icon: "ɱ", color: "#ff6600", pool: 8,            decimals: 6, rate: 210,     min: 0.05 },
];

export const COIN_MAP: Record<string, Coin> = Object.fromEntries(COINS.map((c) => [c.key, c]));

export function fmtCoin(key: string, amount: number) {
  const c = COIN_MAP[key];
  const d = c?.decimals ?? 2;
  return amount.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

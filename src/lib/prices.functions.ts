import { createServerFn } from "@tanstack/react-start";

/** CoinGecko ids for our minable coins (CT is our own token, fixed at 1 USD). */
const IDS: Record<string, string> = {
  LTC: "litecoin",
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  POL: "polygon-ecosystem-token",
  SHIB: "shiba-inu",
  DOGE: "dogecoin",
  TRX: "tron",
  XMR: "monero",
};

const FALLBACK: Record<string, number> = {
  CT: 1, LTC: 90, BTC: 95000, ETH: 3200, SOL: 180,
  POL: 0.6, SHIB: 0.00002, DOGE: 0.28, TRX: 0.22, XMR: 210,
};

export interface PriceMap {
  prices: Record<string, number>;
  live: boolean;
  at: number;
}

export const getPrices = createServerFn({ method: "GET" }).handler(async (): Promise<PriceMap> => {
  const ids = Object.values(IDS).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const prices: Record<string, number> = { CT: 1 };
    for (const [sym, id] of Object.entries(IDS)) {
      prices[sym] = data[id]?.usd ?? FALLBACK[sym];
    }
    return { prices, live: true, at: Date.now() };
  } catch {
    return { prices: { ...FALLBACK }, live: false, at: Date.now() };
  }
});

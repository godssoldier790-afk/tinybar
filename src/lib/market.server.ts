import { CHAINS, matchAsset, looksLikeEvm, looksLikeTokenId, VERIFIED_ASSETS } from "./registry";
import { formatHbar } from "./format";
import type {
  ChainMarket,
  ChartPoint,
  ChartRange,
  HbarSnapshot,
  NetworkPulse,
  VenueQuote,
  VerifyResult,
} from "./market";

const MIRROR = "https://mainnet.mirrornode.hedera.com/api/v1";
const BINANCE = "https://data-api.binance.vision/api/v3";
const COINBASE = "https://api.coinbase.com/v2";
const COINBASE_EX = "https://api.exchange.coinbase.com";
const KRAKEN = "https://api.kraken.com/0/public";
const OKX = "https://www.okx.com/api/v5";

const cache = new Map<string, { at: number; value: unknown }>();

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        accept: "application/json",
        "user-agent": "Tinybar/1.0 (Hedera HBAR tracker)",
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

type MirrorSupply = {
  released_supply: string;
  total_supply: string;
};
type MirrorRate = {
  current_rate: { cent_equivalent: number; hbar_equivalent: number };
};
type MirrorBlock = {
  number: number;
  count: number;
  hapi_version: string;
  timestamp: { from: string; to: string };
};
type MirrorNode = {
  node_id: number;
  description?: string;
  stake?: number;
};
type MirrorTx = {
  transaction_id: string;
  name: string;
  result: string;
  charged_tx_fee: number;
  valid_start_timestamp: string;
};
type MirrorToken = {
  token_id: string;
  name: string;
  symbol: string;
  decimals: string;
  total_supply: string;
  deleted: boolean;
};
type MirrorContract = {
  contract_id: string;
  evm_address: string;
  deleted?: boolean;
  memo?: string;
};

function parseHost(description?: string): { host: string; location: string } {
  if (!description) return { host: "Unknown", location: "—" };
  const cleaned = description.replace(/^Hosted by\s+/i, "");
  const [host, location] = cleaned.split("|").map((s) => s.trim());
  return { host: host || cleaned, location: location || "—" };
}

function hederaTimestampToMs(ts: string): number {
  const [sec, nanos] = ts.split(".");
  const s = Number(sec);
  if (!Number.isFinite(s)) return Date.now();
  const n = Number((nanos ?? "0").slice(0, 3).padEnd(3, "0"));
  return s * 1000 + (Number.isFinite(n) ? n : 0);
}

async function fetchNetwork(): Promise<NetworkPulse> {
  const [supplyRes, rateRes, blocksRes, nodesRes, txRes] = await Promise.allSettled([
    fetchJson<MirrorSupply>(`${MIRROR}/network/supply`),
    fetchJson<MirrorRate>(`${MIRROR}/network/exchangerate`),
    fetchJson<{ blocks: MirrorBlock[] }>(`${MIRROR}/blocks?limit=25&order=desc`),
    fetchJson<{ nodes: MirrorNode[] }>(`${MIRROR}/network/nodes?limit=100`),
    fetchJson<{ transactions: MirrorTx[] }>(`${MIRROR}/transactions?limit=8&order=desc`),
  ]);

  const supply = supplyRes.status === "fulfilled" ? supplyRes.value : null;
  const rate = rateRes.status === "fulfilled" ? rateRes.value : null;
  const blocks = blocksRes.status === "fulfilled" ? blocksRes.value.blocks : [];
  const nodes = nodesRes.status === "fulfilled" ? nodesRes.value.nodes : [];
  const txs = txRes.status === "fulfilled" ? txRes.value.transactions : [];

  let oracleUsd: number | null = null;
  if (rate?.current_rate?.hbar_equivalent) {
    oracleUsd = rate.current_rate.cent_equivalent / rate.current_rate.hbar_equivalent / 100;
  }

  let tps: number | null = null;
  let txInWindow: number | null = null;
  if (blocks.length >= 2) {
    const newest = hederaTimestampToMs(blocks[0].timestamp.to);
    const oldest = hederaTimestampToMs(blocks[blocks.length - 1].timestamp.from);
    const spanSec = Math.max(1, (newest - oldest) / 1000);
    txInWindow = blocks.reduce((sum, b) => sum + (b.count ?? 0), 0);
    tps = txInWindow / spanSec;
  }

  return {
    circulatingHbar: supply ? formatHbar(supply.released_supply) : 0,
    totalHbar: supply ? formatHbar(supply.total_supply) : 50_000_000_000,
    oracleUsd,
    latestBlock: blocks[0]?.number ?? null,
    hapiVersion: blocks[0]?.hapi_version ?? null,
    tps,
    txInWindow,
    nodeCount: nodes.length,
    nodes: nodes.map((n) => {
      const { host, location } = parseHost(n.description);
      return { id: n.node_id, host, location, stakeHbar: formatHbar(n.stake ?? 0) };
    }),
    recentTx: txs.map((t) => ({
      id: t.transaction_id,
      type: t.name,
      result: t.result,
      feeHbar: formatHbar(t.charged_tx_fee),
      timestamp: t.valid_start_timestamp,
    })),
  };
}

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
};

async function fetchBinanceTickers(symbols: string[]): Promise<Map<string, BinanceTicker>> {
  const encoded = encodeURIComponent(JSON.stringify(symbols));
  const rows = await fetchJson<BinanceTicker[]>(`${BINANCE}/ticker/24hr?symbols=${encoded}`);
  return new Map(rows.map((r) => [r.symbol, r]));
}

async function fetchVenues(hbarTicker: BinanceTicker | undefined, oracleUsd: number | null): Promise<VenueQuote[]> {
  const [cb, kr, okx] = await Promise.allSettled([
    fetchJson<{ data: { amount: string } }>(`${COINBASE}/prices/HBAR-USD/spot`),
    fetchJson<{ result?: Record<string, { c?: string[]; h?: string[]; l?: string[]; v?: string[]; p?: string[]; o?: string }> }>(
      `${KRAKEN}/Ticker?pair=HBARUSD`,
    ),
    fetchJson<{ data?: Array<{ last: string; open24h: string; volCcy24h: string; high24h: string; low24h: string }> }>(
      `${OKX}/market/ticker?instId=HBAR-USDT`,
    ),
  ]);

  const venues: VenueQuote[] = [
    {
      venue: "Hedera oracle",
      pair: "HBAR/USD",
      price: oracleUsd,
      changePct: null,
      volume: null,
      high: null,
      low: null,
    },
  ];

  if (hbarTicker) {
    venues.push({
      venue: "Binance",
      pair: "HBAR/USDT",
      price: num(hbarTicker.lastPrice),
      changePct: num(hbarTicker.priceChangePercent),
      volume: num(hbarTicker.quoteVolume),
      high: num(hbarTicker.highPrice),
      low: num(hbarTicker.lowPrice),
    });
  }

  if (cb.status === "fulfilled") {
    venues.push({
      venue: "Coinbase",
      pair: "HBAR/USD",
      price: num(cb.value.data?.amount),
      changePct: null,
      volume: null,
      high: null,
      low: null,
    });
  }

  if (kr.status === "fulfilled") {
    const row = Object.values(kr.value.result ?? {})[0];
    const last = num(row?.c?.[0]);
    const open = num(row?.o);
    const changePct = last != null && open ? ((last - open) / open) * 100 : null;
    venues.push({
      venue: "Kraken",
      pair: "HBAR/USD",
      price: last,
      changePct,
      volume: num(row?.v?.[1]) != null && last != null ? num(row?.v?.[1])! * last : null,
      high: num(row?.h?.[1]),
      low: num(row?.l?.[1]),
    });
  }

  if (okx.status === "fulfilled") {
    const row = okx.value.data?.[0];
    const last = num(row?.last);
    const open = num(row?.open24h);
    const changePct = last != null && open ? ((last - open) / open) * 100 : null;
    venues.push({
      venue: "OKX",
      pair: "HBAR/USDT",
      price: last,
      changePct,
      volume: num(row?.volCcy24h),
      high: num(row?.high24h),
      low: num(row?.low24h),
    });
  }

  return venues;
}

export async function fetchSnapshot(): Promise<HbarSnapshot> {
  return cached("snapshot", 15_000, async () => {
    const symbols = CHAINS.map((c) => c.binanceSymbol).filter((s): s is string => Boolean(s));
    const [network, tickersRes, chart1d] = await Promise.all([
      fetchNetwork(),
      fetchBinanceTickers(symbols).catch(() => new Map<string, BinanceTicker>()),
      fetchChart("1d").catch(() => [] as ChartPoint[]),
    ]);

    const hbarTicker = tickersRes.get("HBARUSDT");
    const venues = await fetchVenues(hbarTicker, network.oracleUsd);

    const quoted = venues.map((v) => v.price).filter((p): p is number => p != null && p > 0);
    const price =
      quoted.length > 0 ? quoted.reduce((a, b) => a + b, 0) / quoted.length : (hbarTicker ? num(hbarTicker.lastPrice) : network.oracleUsd);

    const changePct =
      venues.find((v) => v.venue === "Binance")?.changePct ??
      venues.find((v) => v.changePct != null)?.changePct ??
      null;

    const high24h = venues.reduce<number | null>((acc, v) => {
      if (v.high == null) return acc;
      return acc == null ? v.high : Math.max(acc, v.high);
    }, null);
    const low24h = venues.reduce<number | null>((acc, v) => {
      if (v.low == null) return acc;
      return acc == null ? v.low : Math.min(acc, v.low);
    }, null);
    const volume24h = venues.reduce((sum, v) => sum + (v.volume ?? 0), 0) || null;

    const circulatingHbar = network.circulatingHbar || null;
    const maxHbar = network.totalHbar || 50_000_000_000;
    const marketCap = price != null && circulatingHbar ? price * circulatingHbar : null;

    const chains: ChainMarket[] = CHAINS.map((chain) => {
      const t = chain.binanceSymbol ? tickersRes.get(chain.binanceSymbol) : undefined;
      return {
        ...chain,
        price: t ? num(t.lastPrice) : chain.id === "hedera" ? price : null,
        changePct: t ? num(t.priceChangePercent) : chain.id === "hedera" ? changePct : null,
        volume: t ? num(t.quoteVolume) : null,
      };
    });

    return {
      price,
      changePct,
      high24h,
      low24h,
      volume24h,
      marketCap,
      circulatingHbar,
      maxHbar,
      asOf: Date.now(),
      chart1d,
      venues,
      chains,
      network,
      assets: VERIFIED_ASSETS,
    };
  });
}

const RANGE_TO_KLINE: Record<ChartRange, { interval: string; limit: number }> = {
  "1d": { interval: "15m", limit: 96 },
  "7d": { interval: "1h", limit: 168 },
  "30d": { interval: "4h", limit: 180 },
  "1y": { interval: "1d", limit: 365 },
};

export async function fetchChart(range: ChartRange): Promise<ChartPoint[]> {
  return cached(`chart:${range}`, 30_000, async () => {
    const { interval, limit } = RANGE_TO_KLINE[range];
    try {
      const rows = await fetchJson<Array<[number, string, string, string, string]>>(
        `${BINANCE}/klines?symbol=HBARUSDT&interval=${interval}&limit=${limit}`,
      );
      return rows.map((row) => ({ t: row[0], price: Number(row[4]) }));
    } catch {
      const gran = range === "1d" ? 900 : range === "7d" ? 3600 : range === "30d" ? 21600 : 86400;
      const rows = await fetchJson<Array<[number, number, number, number, number]>>(
        `${COINBASE_EX}/products/HBAR-USD/candles?granularity=${gran}`,
      );
      return rows
        .slice()
        .reverse()
        .map((row) => ({ t: row[0] * 1000, price: row[4] }));
    }
  });
}

export async function verifyQuery(query: string): Promise<VerifyResult> {
  const q = query.trim();
  const match = matchAsset(q);

  if (match) {
    return {
      query: q,
      match,
      lookup: null,
      status: match.verification,
      headline:
        match.verification === "canonical"
          ? "Canonical HBAR"
          : match.verification === "official-wrapper"
            ? "Official wrapped HBAR"
            : match.verification === "ecosystem"
              ? "Ecosystem-verified WHBAR"
              : match.verification === "related"
                ? "Related to HBAR — not the native coin"
                : "Listed asset",
      detail: match.note,
    };
  }

  if (looksLikeTokenId(q)) {
    try {
      const token = await fetchJson<MirrorToken>(`${MIRROR}/tokens/${encodeURIComponent(q)}`);
      const symbol = (token.symbol || "").toUpperCase();
      const lookalike = symbol === "HBAR" || symbol === "WHBAR" || /hbar/i.test(token.name || "");
      return {
        query: q,
        match: null,
        lookup: {
          kind: "token",
          name: token.name,
          symbol: token.symbol,
          tokenId: token.token_id,
          totalSupply: token.total_supply,
          decimals: token.decimals,
          deleted: token.deleted,
        },
        status: lookalike ? "lookalike" : "unknown",
        headline: lookalike ? "Unverified lookalike" : "Not a verified HBAR asset",
        detail: lookalike
          ? `${token.name} (${token.symbol}) uses an HBAR-like name but is not in the Tinybar registry. Do not treat it as canonical HBAR.`
          : `Hedera token ${token.token_id} is ${token.name} (${token.symbol}). It is not a verified HBAR contract.`,
      };
    } catch {
      return {
        query: q,
        match: null,
        lookup: { kind: "none" },
        status: "unknown",
        headline: "Token not found",
        detail: "The Hedera mirror node has no token with that ID.",
      };
    }
  }

  if (looksLikeEvm(q)) {
    const known = VERIFIED_ASSETS.find((a) => a.evmAddress?.toLowerCase() === q.toLowerCase());
    if (known) return verifyQuery(known.id);
    try {
      const contract = await fetchJson<MirrorContract>(`${MIRROR}/contracts/${q.toLowerCase()}`);
      return {
        query: q,
        match: null,
        lookup: {
          kind: "contract",
          tokenId: contract.contract_id,
          evmAddress: contract.evm_address,
          name: contract.memo || "Hedera EVM contract",
          deleted: contract.deleted,
        },
        status: "unknown",
        headline: "Unverified EVM contract",
        detail: `Contract ${contract.contract_id} exists on Hedera EVM but is not a Tinybar-verified HBAR wrapper.`,
      };
    } catch {
      return {
        query: q,
        match: null,
        lookup: { kind: "none" },
        status: "unknown",
        headline: "Address not on Hedera",
        detail: "This EVM address is not a known Hedera contract and is not a verified HBAR asset. Official WHBAR on other networks has not been issued by Hedera.",
      };
    }
  }

  return {
    query: q,
    match: null,
    lookup: null,
    status: "unknown",
    headline: "Nothing matched",
    detail: "Paste a Hedera token ID (0.0.x), an EVM address, or a ticker like HBAR / WHBAR.",
  };
}

import type { ChainRecord, HbarAsset, Verification } from "./registry";

export type VenueQuote = {
  venue: string;
  pair: string;
  price: number | null;
  changePct: number | null;
  volume: number | null;
  high: number | null;
  low: number | null;
};

export type ChainMarket = ChainRecord & {
  price: number | null;
  changePct: number | null;
  volume: number | null;
};

export type NetworkNode = {
  id: number;
  host: string;
  location: string;
  stakeHbar: number;
};

export type NetworkTx = {
  id: string;
  type: string;
  result: string;
  feeHbar: number;
  timestamp: string;
};

export type NetworkPulse = {
  circulatingHbar: number;
  totalHbar: number;
  oracleUsd: number | null;
  latestBlock: number | null;
  hapiVersion: string | null;
  tps: number | null;
  txInWindow: number | null;
  nodeCount: number;
  nodes: NetworkNode[];
  recentTx: NetworkTx[];
};

export type HbarSnapshot = {
  price: number | null;
  changePct: number | null;
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  circulatingHbar: number | null;
  maxHbar: number | null;
  asOf: number;
  chart1d: ChartPoint[];
  venues: VenueQuote[];
  chains: ChainMarket[];
  network: NetworkPulse;
  assets: HbarAsset[];
};

export type ChartPoint = { t: number; price: number };
export type ChartRange = "1d" | "7d" | "30d" | "1y";

export type VerifyResult = {
  query: string;
  match: HbarAsset | null;
  lookup: {
    kind: "token" | "contract" | "none";
    name?: string;
    symbol?: string;
    tokenId?: string;
    evmAddress?: string;
    totalSupply?: string;
    decimals?: string;
    deleted?: boolean;
  } | null;
  status: Verification | "unknown" | "lookalike";
  headline: string;
  detail: string;
};

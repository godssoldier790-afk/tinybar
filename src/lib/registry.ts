export type Verification =
  | "canonical"
  | "official-wrapper"
  | "ecosystem"
  | "pegged"
  | "related"
  | "none";

export type HbarAsset = {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  chainFamily: string;
  kind: "native" | "wrapped" | "pegged" | "derivative";
  verification: Exclude<Verification, "none">;
  tokenId?: string;
  evmAddress?: string;
  decimals: number;
  explorer: string;
  note: string;
};

export type ChainRecord = {
  id: string;
  name: string;
  native: string;
  family: string;
  consensus: string;
  binanceSymbol?: string;
  verification: Verification;
  hbarNote: string;
};

export const VERIFIED_ASSETS: HbarAsset[] = [
  {
    id: "hbar-native",
    name: "Hedera",
    symbol: "HBAR",
    chain: "Hedera Hashgraph",
    chainFamily: "hedera",
    kind: "native",
    verification: "canonical",
    decimals: 8,
    explorer: "https://hashscan.io/mainnet",
    note: "Native cryptocurrency of Hedera. Issued by the network itself — not a smart contract.",
  },
  {
    id: "whbar-erc20",
    name: "Wrapped HBAR",
    symbol: "WHBAR",
    chain: "Hedera EVM",
    chainFamily: "hedera",
    kind: "wrapped",
    verification: "official-wrapper",
    tokenId: "0.0.8840785",
    evmAddress: "0xb1F616b8134F602c3Bb465fB5b5e6565cCAd37Ed",
    decimals: 8,
    explorer: "https://hashscan.io/mainnet/contract/0.0.8840785",
    note: "Official ERC-20 wrapper published by Hedera. Deposit native HBAR to mint 1:1 WHBAR.",
  },
  {
    id: "whbar-saucer",
    name: "Wrapped Hbar",
    symbol: "WHBAR",
    chain: "Hedera Token Service",
    chainFamily: "hedera",
    kind: "wrapped",
    verification: "ecosystem",
    tokenId: "0.0.1456986",
    evmAddress: "0x00000000000000000000000000000000016316ba",
    decimals: 8,
    explorer: "https://hashscan.io/mainnet/token/0.0.1456986",
    note: "SaucerSwap HTS wrapped HBAR — the liquidity standard on Hedera DeFi.",
  },
  {
    id: "hbarx-stader",
    name: "Stader HBARX",
    symbol: "HBARX",
    chain: "Hedera Token Service",
    chainFamily: "hedera",
    kind: "derivative",
    verification: "related",
    tokenId: "0.0.834116",
    decimals: 8,
    explorer: "https://hashscan.io/mainnet/token/0.0.834116",
    note: "Liquid-staking derivative of HBAR. Related, not a 1:1 wrapper of the native coin.",
  },
];

export const CHAINS: ChainRecord[] = [
  {
    id: "hedera",
    name: "Hedera Hashgraph",
    native: "HBAR",
    family: "Hashgraph",
    consensus: "Hashgraph",
    binanceSymbol: "HBARUSDT",
    verification: "canonical",
    hbarNote: "Canonical HBAR. The only chain that issues the native coin.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    native: "BTC",
    family: "UTXO",
    consensus: "Proof of Work",
    binanceSymbol: "BTCUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    native: "ETH",
    family: "EVM",
    consensus: "Proof of Stake",
    binanceSymbol: "ETHUSDT",
    verification: "none",
    hbarNote: "Official WHBAR on other EVMs is not issued. Treat any ETH-chain HBAR as unverified.",
  },
  {
    id: "bnb",
    name: "BNB Chain",
    native: "BNB",
    family: "EVM",
    consensus: "Proof of Staked Authority",
    binanceSymbol: "BNBUSDT",
    verification: "none",
    hbarNote: "Exchange-pegged tokens may exist. Not Hedera-issued.",
  },
  {
    id: "solana",
    name: "Solana",
    native: "SOL",
    family: "SVM",
    consensus: "Proof of Stake",
    binanceSymbol: "SOLUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "xrp",
    name: "XRP Ledger",
    native: "XRP",
    family: "XRPL",
    consensus: "Federated consensus",
    binanceSymbol: "XRPUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "cardano",
    name: "Cardano",
    native: "ADA",
    family: "eUTXO",
    consensus: "Ouroboros",
    binanceSymbol: "ADAUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    native: "AVAX",
    family: "EVM",
    consensus: "Snowman",
    binanceSymbol: "AVAXUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "polkadot",
    name: "Polkadot",
    native: "DOT",
    family: "Substrate",
    consensus: "NPoS",
    binanceSymbol: "DOTUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "cosmos",
    name: "Cosmos Hub",
    native: "ATOM",
    family: "Cosmos",
    consensus: "Tendermint",
    binanceSymbol: "ATOMUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "near",
    name: "NEAR",
    native: "NEAR",
    family: "NEAR",
    consensus: "Nightshade",
    binanceSymbol: "NEARUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "sui",
    name: "Sui",
    native: "SUI",
    family: "Move",
    consensus: "Mysticeti",
    binanceSymbol: "SUIUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "aptos",
    name: "Aptos",
    native: "APT",
    family: "Move",
    consensus: "BFT",
    binanceSymbol: "APTUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "tron",
    name: "TRON",
    native: "TRX",
    family: "TRON",
    consensus: "DPoS",
    binanceSymbol: "TRXUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "ton",
    name: "TON",
    native: "TON",
    family: "TON",
    consensus: "Catchain",
    binanceSymbol: "TONUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "litecoin",
    name: "Litecoin",
    native: "LTC",
    family: "UTXO",
    consensus: "Proof of Work",
    binanceSymbol: "LTCUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    native: "DOGE",
    family: "UTXO",
    consensus: "Proof of Work",
    binanceSymbol: "DOGEUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "polygon",
    name: "Polygon",
    native: "POL",
    family: "EVM",
    consensus: "Proof of Stake",
    binanceSymbol: "POLUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    native: "ARB",
    family: "EVM L2",
    consensus: "Optimistic rollup",
    binanceSymbol: "ARBUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "optimism",
    name: "Optimism",
    native: "OP",
    family: "EVM L2",
    consensus: "Optimistic rollup",
    binanceSymbol: "OPUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "base",
    name: "Base",
    native: "ETH",
    family: "EVM L2",
    consensus: "Optimistic rollup",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
  {
    id: "sei",
    name: "Sei",
    native: "SEI",
    family: "EVM",
    consensus: "Twin-turbo",
    binanceSymbol: "SEIUSDT",
    verification: "none",
    hbarNote: "No Hedera-issued HBAR.",
  },
];

export const VERIFICATION_LABEL: Record<Verification, string> = {
  canonical: "Canonical",
  "official-wrapper": "Official wrapper",
  ecosystem: "Ecosystem verified",
  pegged: "Exchange peg",
  related: "Related",
  none: "No verified HBAR",
};

const TOKEN_ID_RE = /^0\.0\.\d+$/;
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

export function normalizeQuery(raw: string): string {
  return raw.trim();
}

export function matchAsset(query: string): HbarAsset | undefined {
  const q = normalizeQuery(query);
  if (!q) return undefined;
  const lower = q.toLowerCase();
  const compact = lower.replace(/\s+/g, "");

  if (compact === "hbar" || compact === "hedera" || compact === "native") {
    return VERIFIED_ASSETS.find((a) => a.id === "hbar-native");
  }

  return VERIFIED_ASSETS.find((asset) => {
    if (asset.tokenId && asset.tokenId === q) return true;
    if (asset.evmAddress && asset.evmAddress.toLowerCase() === lower) return true;
    if (asset.symbol.toLowerCase() === lower) return true;
    if (asset.name.toLowerCase() === lower) return true;
    if (asset.id === lower) return true;
    return false;
  });
}

export function looksLikeTokenId(query: string): boolean {
  return TOKEN_ID_RE.test(normalizeQuery(query));
}

export function looksLikeEvm(query: string): boolean {
  return EVM_RE.test(normalizeQuery(query));
}

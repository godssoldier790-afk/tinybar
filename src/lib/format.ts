function compactNumber(value: number, suffixScale: Array<[number, string]>): string {
  const abs = Math.abs(value);
  for (const [div, suffix] of suffixScale) {
    if (abs >= div) {
      const n = value / div;
      const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2;
      return `${n.toFixed(digits)}${suffix}`;
    }
  }
  return value.toFixed(0);
}

const SCALE: Array<[number, string]> = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (Math.abs(value) < 1000) return formatUsd(value);
  return `$${compactNumber(value, SCALE)}`;
}

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (Math.abs(value) < 1000) return formatInt(value);
  return compactNumber(value, SCALE);
}

export function formatUsd(value: number | null | undefined, digits?: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (digits != null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }
  if (Math.abs(value) < 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInt(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPct(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatHbar(tinybars: number | string | null | undefined): number {
  if (tinybars == null) return 0;
  const n = typeof tinybars === "string" ? Number(tinybars) : tinybars;
  if (!Number.isFinite(n)) return 0;
  return n / 1e8;
}

export function shortenAddress(value: string, left = 6, right = 4): string {
  if (value.length <= left + right + 1) return value;
  return `${value.slice(0, left)}…${value.slice(-right)}`;
}

export function timeAgo(isoOrMs: string | number): string {
  const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(ms)) return "—";
  const delta = Math.max(0, Date.now() - ms);
  const sec = Math.floor(delta / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

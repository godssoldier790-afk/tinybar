import { ExternalLink } from "lucide-react";
import type { NetworkPulse as Pulse } from "@/lib/market";
import { formatCompact, formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md bg-elevated p-4">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

export function NetworkPulse({ network }: { network: Pulse }) {
  const pct = network.totalHbar > 0 ? Math.min(100, (network.circulatingHbar / network.totalHbar) * 100) : 0;
  const maxStake = Math.max(...network.nodes.map((n) => n.stakeHbar), 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Circulating" value={formatCompact(network.circulatingHbar)} hint="Released HBAR" />
        <Stat label="Max supply" value={formatCompact(network.totalHbar)} hint="50B cap" />
        <Stat
          label="Network TPS"
          value={network.tps != null ? network.tps.toFixed(2) : "—"}
          hint={network.txInWindow != null ? `${formatInt(network.txInWindow)} tx in sample` : undefined}
        />
        <Stat
          label="Latest block"
          value={network.latestBlock != null ? formatInt(network.latestBlock) : "—"}
          hint={network.hapiVersion ? `HAPI ${network.hapiVersion}` : undefined}
        />
      </div>

      <div className="rounded-lg bg-elevated p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs tracking-wide text-muted uppercase">Released supply</p>
          <p className="font-mono text-xs tabular-nums text-muted">{pct.toFixed(1)}% of cap</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-subtle">
          Oracle {formatUsd(network.oracleUsd, 5)} · {formatInt(network.nodeCount)} council nodes
        </p>
      </div>

      <div>
        <h3 className="font-display text-sm font-medium">Council nodes</h3>
        <p className="mt-1 text-xs text-muted">Stake-weighted hosts currently registered on mainnet.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {network.nodes.map((node) => (
            <li key={node.id} className="rounded-md bg-elevated p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium">{node.host}</p>
                <p className="font-mono text-[10px] text-subtle">#{node.id}</p>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">{node.location}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent/80"
                  style={{ width: `${(node.stakeHbar / maxStake) * 100}%` }}
                />
              </div>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-subtle">
                {formatCompact(node.stakeHbar)} HBAR staked
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-sm font-medium">Latest transactions</h3>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md bg-elevated">
          {network.recentTx.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs">{tx.id}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {tx.type.replaceAll("_", " ")} · fee {tx.feeHbar.toLocaleString(undefined, { maximumFractionDigits: 8 })} HBAR
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={cn("text-xs", tx.result === "SUCCESS" ? "text-up" : "text-down")}>{tx.result}</span>
                <a
                  href={`https://hashscan.io/mainnet/transaction/${tx.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-11 items-center justify-center text-muted hover:text-fg"
                  aria-label="Open on HashScan"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

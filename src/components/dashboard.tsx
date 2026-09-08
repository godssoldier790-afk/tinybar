import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BadgeCheck, Radio } from "lucide-react";
import { getSnapshot } from "@/lib/queries";
import type { HbarSnapshot } from "@/lib/market";
import { formatCompact, formatPct, formatUsd, formatUsdCompact, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TinybarMark, ColorRail } from "@/components/mark";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChart } from "@/components/price-chart";
import { VerifyPanel } from "@/components/verify-panel";
import { ChainAtlas } from "@/components/chain-atlas";
import { NetworkPulse } from "@/components/network-pulse";
import { VenueTape } from "@/components/venue-tape";

function LiveDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-40" />
      <span className="relative inline-flex size-2 rounded-full bg-up" />
    </span>
  );
}

function RelativeTime({ at }: { at: number }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!at) return;
    const tick = () => setLabel(timeAgo(at));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, [at]);
  if (!label) return null;
  return <span className="font-mono tabular-nums">{label}</span>;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-md bg-elevated px-4 py-3">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-sm leading-snug break-words tabular-nums",
          tone === "up" && "text-up",
          tone === "down" && "text-down",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export function Dashboard({ initial }: { initial: HbarSnapshot | null }) {
  const { data, isPending, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ["snapshot"],
    queryFn: () => getSnapshot(),
    initialData: initial ?? undefined,
    initialDataUpdatedAt: initial?.asOf,
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <ColorRail />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-16 sm:px-6 sm:pt-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-sm bg-elevated">
            <TinybarMark className="size-5" />
          </span>
          <div>
            <p className="font-display text-base leading-none font-semibold tracking-tight">Tinybar</p>
            <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">Verified HBAR ledger</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <LiveDot />
          <span className="hidden text-up sm:inline">Live</span>
          <RelativeTime at={dataUpdatedAt} />
        </div>
      </header>

      <main className="mt-8 flex-1">
        {isPending ? (
          <DashboardSkeleton />
        ) : isError || !data ? (
          <div className="rounded-xl bg-surface p-8 text-center shadow-[var(--shadow-border)]">
            <p className="font-display text-lg">Market data is unreachable</p>
            <p className="mt-2 text-sm text-muted">
              {error instanceof Error ? error.message : "Try again in a moment."}
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="canonical">
                  <BadgeCheck className="size-3.5" />
                  Canonical HBAR
                </Badge>
                <Badge>
                  <Radio className="size-3.5" />
                  Hedera Hashgraph
                </Badge>
              </div>
              <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">HBAR / USD</p>
                  <p className="font-display text-5xl leading-none font-medium tracking-tight sm:text-6xl">
                    <span className="tabular-nums">{formatUsd(data.price, 5)}</span>
                  </p>
                </div>
                <p
                  className={cn(
                    "font-mono text-lg tabular-nums",
                    (data.changePct ?? 0) >= 0 ? "text-up" : "text-down",
                  )}
                >
                  {formatPct(data.changePct)} <span className="text-sm text-muted">24h</span>
                </p>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                Native cryptocurrency of Hedera. Official wrappers live only on Hedera EVM and HTS.
                Other chains have not been issued verified HBAR by Hedera.
              </p>
            </section>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Market cap" value={formatUsdCompact(data.marketCap)} />
              <Stat label="24h volume" value={formatUsdCompact(data.volume24h)} />
              <Stat label="Circulating" value={formatCompact(data.circulatingHbar)} />
              <Stat label="Max supply" value={formatCompact(data.maxHbar)} />
              <Stat label="24h low" value={formatUsd(data.low24h, 4)} tone="down" />
              <Stat label="24h high" value={formatUsd(data.high24h, 4)} tone="up" />
            </div>

            <div className="mt-4">
              <PriceChart changePct={data.changePct} initial1d={data.chart1d} />
            </div>

            <Tabs defaultValue="verify" className="mt-6">
              <TabsList>
                <TabsTrigger value="verify">Verify</TabsTrigger>
                <TabsTrigger value="chains">Chains</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="venues">Venues</TabsTrigger>
              </TabsList>
              <TabsContent value="verify">
                <VerifyPanel assets={data.assets} />
              </TabsContent>
              <TabsContent value="chains">
                <ChainAtlas chains={data.chains} />
              </TabsContent>
              <TabsContent value="network">
                <NetworkPulse network={data.network} />
              </TabsContent>
              <TabsContent value="venues">
                <VenueTape venues={data.venues} mid={data.price} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="mt-12 flex flex-col gap-1 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5">
          <Activity className="size-3.5" />
          Hedera mirror node, Binance Vision, Coinbase, Kraken, OKX
        </p>
        <p>Not financial advice. Verify contracts before you transact.</p>
      </footer>
      </div>
    </div>
  );
}

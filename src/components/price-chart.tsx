import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getChart } from "@/lib/queries";
import type { ChartPoint, ChartRange } from "@/lib/market";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const RANGES: { id: ChartRange; label: string }[] = [
  { id: "1d", label: "1D" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "1y", label: "1Y" },
];

function tickLabel(t: number, range: ChartRange) {
  const d = new Date(t);
  if (range === "1d") {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (range === "1y") {
    return d.toLocaleDateString("en-US", { month: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PriceChart({
  changePct,
  initial1d,
}: {
  changePct: number | null;
  initial1d: ChartPoint[];
}) {
  const [range, setRange] = useState<ChartRange>("1d");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data, isPending } = useQuery({
    queryKey: ["chart", range],
    queryFn: () => getChart({ data: { range } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: mounted,
    initialData: range === "1d" && initial1d.length > 1 ? initial1d : undefined,
  });

  const up = (changePct ?? 0) >= 0;
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const fillId = up ? "hbarUp" : "hbarDown";

  const points = data ?? [];
  const domain = useMemo((): [number, number] => {
    if (!points.length) return [0, 1];
    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.08 || min * 0.01;
    return [min - pad, max + pad];
  }, [points]);

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-medium tracking-tight">HBAR price</h2>
        <div className="flex gap-1 rounded-md bg-elevated p-1">
          {RANGES.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant="ghost"
              aria-pressed={range === r.id}
              className={cn(
                "h-8 min-w-11 px-2.5 text-xs",
                range === r.id && "bg-surface text-fg shadow-[var(--shadow-border-hover)]",
              )}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-56 w-full sm:h-72">
        {!mounted || (isPending && points.length < 2) ? (
          <Skeleton className="h-full w-full rounded-md" />
        ) : points.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Chart unavailable right now.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="hbarUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-up)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-up)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hbarDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-down)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-down)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={(t) => tickLabel(Number(t), range)}
                minTickGap={48}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={domain}
                width={64}
                tickFormatter={(v) => formatUsd(Number(v), Number(v) < 1 ? 4 : 2)}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-elevated)",
                  border: "none",
                  boxShadow: "var(--shadow-border)",
                  borderRadius: 8,
                  color: "var(--color-fg)",
                  fontSize: 12,
                }}
                labelFormatter={(t) =>
                  new Date(Number(t)).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }
                formatter={(value) => [formatUsd(Number(value), 5), "HBAR"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={1.75}
                fill={`url(#${fillId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

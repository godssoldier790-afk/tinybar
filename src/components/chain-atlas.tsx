import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ChainMarket } from "@/lib/market";
import { VERIFICATION_LABEL, type Verification } from "@/lib/registry";
import { formatPct, formatUsd, formatUsdCompact } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Filter = "all" | "verified" | "none";

function badgeTone(v: Verification): "canonical" | "warn" | "default" {
  if (v === "canonical" || v === "official-wrapper" || v === "ecosystem") return "canonical";
  if (v === "related" || v === "pegged") return "warn";
  return "default";
}

export function ChainAtlas({ chains }: { chains: ChainMarket[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return chains.filter((c) => {
      if (filter === "verified" && c.verification === "none") return false;
      if (filter === "none" && c.verification !== "none") return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.native.toLowerCase().includes(needle) ||
        c.family.toLowerCase().includes(needle)
      );
    });
  }, [chains, q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chains"
            className="pl-9"
            aria-label="Search chains"
          />
        </div>
        <div className="flex gap-1 rounded-md bg-elevated p-1">
          {(
            [
              ["all", "All"],
              ["verified", "Verified HBAR"],
              ["none", "No HBAR"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant="ghost"
              className={cn("h-8 px-3 text-xs", filter === id && "bg-surface text-fg shadow-[var(--shadow-border-hover)]")}
              onClick={() => setFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-elevated text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Chain</th>
              <th className="px-4 py-3 font-medium">Native</th>
              <th className="px-4 py-3 font-medium">Spot</th>
              <th className="px-4 py-3 font-medium">24h</th>
              <th className="px-4 py-3 font-medium">Volume</th>
              <th className="px-4 py-3 font-medium">HBAR status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const up = (c.changePct ?? 0) >= 0;
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted">
                      {c.family} · {c.consensus}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.native}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{formatUsd(c.price)}</td>
                  <td className={cn("px-4 py-3 font-mono tabular-nums", c.changePct == null ? "text-muted" : up ? "text-up" : "text-down")}>
                    {formatPct(c.changePct)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted">{formatUsdCompact(c.volume)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={badgeTone(c.verification)}>{VERIFICATION_LABEL[c.verification]}</Badge>
                    <p className="mt-1 max-w-xs text-xs leading-snug text-muted">{c.hbarNote}</p>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                  No chains match that filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

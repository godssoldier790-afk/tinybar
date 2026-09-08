import type { VenueQuote } from "@/lib/market";
import { formatPct, formatUsd, formatUsdCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

export function VenueTape({ venues, mid }: { venues: VenueQuote[]; mid: number | null }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-[var(--shadow-border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-elevated text-xs tracking-wide text-muted uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Venue</th>
            <th className="px-4 py-3 font-medium">Pair</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">vs mid</th>
            <th className="px-4 py-3 font-medium">24h</th>
            <th className="px-4 py-3 font-medium">Volume</th>
            <th className="px-4 py-3 font-medium">Range</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((v) => {
            const delta = v.price != null && mid ? ((v.price - mid) / mid) * 100 : null;
            const up = (v.changePct ?? 0) >= 0;
            return (
              <tr key={v.venue} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{v.venue}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{v.pair}</td>
                <td className="px-4 py-3 font-mono tabular-nums">{formatUsd(v.price, 5)}</td>
                <td
                  className={cn(
                    "px-4 py-3 font-mono tabular-nums",
                    delta == null ? "text-muted" : delta >= 0 ? "text-up" : "text-down",
                  )}
                >
                  {delta == null ? "—" : formatPct(delta, 3)}
                </td>
                <td className={cn("px-4 py-3 font-mono tabular-nums", v.changePct == null ? "text-muted" : up ? "text-up" : "text-down")}>
                  {formatPct(v.changePct)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-muted">{formatUsdCompact(v.volume)}</td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted">
                  {v.low != null && v.high != null ? `${formatUsd(v.low, 4)} – ${formatUsd(v.high, 4)}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

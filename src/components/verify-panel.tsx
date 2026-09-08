import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, Copy, ExternalLink, Search, ShieldAlert, ShieldQuestion } from "lucide-react";
import { verifyAsset } from "@/lib/queries";
import { VERIFICATION_LABEL, type HbarAsset, type Verification } from "@/lib/registry";
import type { HbarSnapshot, VerifyResult } from "@/lib/market";
import { shortenAddress } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toneFor(v: Verification | VerifyResult["status"]): "canonical" | "warn" | "down" | "default" {
  if (v === "canonical" || v === "official-wrapper" || v === "ecosystem") return "canonical";
  if (v === "related" || v === "pegged") return "warn";
  if (v === "lookalike") return "down";
  return "default";
}

function Copyable({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-muted hover:text-fg"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      <Copy className="size-3.5" />
      <span className="tabular-nums">{copied ? "Copied" : shortenAddress(value, 8, 6)}</span>
    </button>
  );
}

function AssetCard({ asset }: { asset: HbarAsset }) {
  return (
    <article className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-sm font-medium">{asset.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {asset.symbol} · {asset.chain}
          </p>
        </div>
        <Badge tone={toneFor(asset.verification)}>{VERIFICATION_LABEL[asset.verification]}</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{asset.note}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {asset.tokenId ? <Copyable value={asset.tokenId} /> : null}
        {asset.evmAddress ? <Copyable value={asset.evmAddress} /> : null}
        <a
          href={asset.explorer}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs text-accent hover:opacity-80"
        >
          Explorer
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

function ResultIcon({ status }: { status: VerifyResult["status"] }) {
  if (status === "canonical" || status === "official-wrapper" || status === "ecosystem") {
    return <BadgeCheck className="size-5 text-blue" />;
  }
  if (status === "lookalike") return <ShieldAlert className="size-5 text-down" />;
  return <ShieldQuestion className="size-5 text-warn" />;
}

export function VerifyPanel({ assets }: { assets: HbarSnapshot["assets"] }) {
  const [query, setQuery] = useState("");
  const mutation = useMutation({
    mutationFn: (q: string) => verifyAsset({ data: { query: q } }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    mutation.mutate(query.trim());
  }

  const result = mutation.data;

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="verify-query">
          Token ID or contract address
        </label>
        <Input
          id="verify-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste 0.0.x, 0x address, or HBAR"
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" className="sm:w-36" disabled={mutation.isPending}>
          <Search className="size-4" />
          {mutation.isPending ? "Checking" : "Verify"}
        </Button>
      </form>

      {result ? (
        <div className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
          <div className="flex items-start gap-3">
            <ResultIcon status={result.status} />
            <div className="min-w-0">
              <p className="font-display text-sm font-medium">{result.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{result.detail}</p>
              {result.lookup?.tokenId || result.lookup?.evmAddress ? (
                <div className="mt-2 flex flex-wrap gap-3">
                  {result.lookup.tokenId ? <Copyable value={result.lookup.tokenId} /> : null}
                  {result.lookup.evmAddress ? <Copyable value={result.lookup.evmAddress} /> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}

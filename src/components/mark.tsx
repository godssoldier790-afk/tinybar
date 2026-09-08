import { cn } from "@/lib/utils";

export function TinybarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true">
      <rect x="7.2" y="2.5" width="2.6" height="19" rx="1.3" fill="var(--color-blue)" />
      <rect x="14.2" y="2.5" width="2.6" height="19" rx="1.3" fill="var(--color-green)" />
      <rect x="2.5" y="8.2" width="19" height="2.6" rx="1.3" fill="var(--color-yellow)" />
      <rect x="2.5" y="13.2" width="19" height="2.6" rx="1.3" fill="var(--color-red)" />
    </svg>
  );
}

export function ColorRail({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-1 w-full overflow-hidden", className)} aria-hidden="true">
      <span className="h-full flex-1 bg-blue" />
      <span className="h-full flex-1 bg-green" />
      <span className="h-full flex-1 bg-yellow" />
      <span className="h-full flex-1 bg-red" />
    </div>
  );
}

import { cn } from "@/lib/utils";

export function TinybarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(className)}
      role="img"
      aria-label="Hedera"
    >
      <title>Hedera</title>
      <path
        fill="currentColor"
        d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm4.9571 17.3963h-1.5812V14.01H8.6224v3.3777H7.0498V6.6037H8.631v3.3845h6.7535V6.6037h1.5812zm-1.5812-6.2592H8.6224v1.7241h6.7535Z"
      />
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

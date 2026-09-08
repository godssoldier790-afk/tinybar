import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        default: "bg-elevated text-muted",
        accent: "bg-accent text-accent-fg",
        up: "bg-up/15 text-up",
        down: "bg-down/15 text-down",
        warn: "bg-warn/15 text-warn",
        canonical: "bg-blue/15 text-blue",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}

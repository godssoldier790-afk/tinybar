import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-11 w-full items-center gap-1 overflow-x-auto rounded-md bg-elevated p-1",
        "sm:w-auto",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 min-w-20 shrink-0 items-center justify-center rounded-sm px-3 text-sm font-medium text-muted",
        "transition-[background-color,color,opacity] duration-150",
        "hover:text-fg",
        "data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-[var(--shadow-border-hover)]",
        "focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-5 outline-none", className)} {...props} />;
}

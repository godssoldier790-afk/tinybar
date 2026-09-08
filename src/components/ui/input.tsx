import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]",
        "placeholder:text-subtle",
        "transition-[box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)]",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

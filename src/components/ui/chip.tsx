import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  removable?: boolean;
}

export function Chip({ className, children, selected = false, removable = false, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:border-transparent disabled:bg-muted disabled:text-disabled",
        selected
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
          : "bg-card text-foreground hover:border-border-strong hover:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
      {selected && <Check aria-hidden="true" className="size-3 text-primary" />}
      {removable && <X aria-hidden="true" className="size-3" />}
    </button>
  );
}

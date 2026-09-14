import * as React from "react";

import { cn } from "@/lib/utils";

export type TagProps = React.HTMLAttributes<HTMLSpanElement>;

export function Tag({ className, children, ...props }: TagProps) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-sm bg-border px-2 text-xs text-foreground", className)} {...props}>
      {children}
    </span>
  );
}

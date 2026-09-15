import Image from "next/image";

import { cn } from "@/lib/utils";

/** Unmodified icon from NAVER's official CHZZK brand asset download. */
export function ChzzkIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <Image
      src="/brands/chzzk/icon.png"
      alt=""
      aria-hidden="true"
      width={24}
      height={24}
      unoptimized
      draggable={false}
      className={cn("pointer-events-none size-6 shrink-0 select-none object-contain", className)}
    />
  );
}

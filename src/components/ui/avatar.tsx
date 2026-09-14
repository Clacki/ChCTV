"use client";

import Image from "next/image";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = { sm: "size-8 text-xs", md: "size-10 text-sm" };

export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const initials = (fallback ?? alt).slice(0, 1);
  const showFallback = !src || status === "error";

  return (
    <span className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted", sizeClasses[size], className)}>
      {src && status === "loading" && <Skeleton className="absolute inset-0 size-full rounded-none" />}
      {showFallback && (
        <span className="absolute inset-0 flex items-center justify-center font-semibold text-muted-foreground" aria-hidden="true">
          {initials}
        </span>
      )}
      {src && (
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          unoptimized
          className={cn("size-full object-cover", status === "loaded" ? "opacity-100" : "opacity-0")}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </span>
  );
}

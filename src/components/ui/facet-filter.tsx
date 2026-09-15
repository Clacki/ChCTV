"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type FacetFilterProps = {
  label: string;
  options: readonly string[];
  selectedValues: readonly string[];
  onChange: (values: string[]) => void;
  labelForOption?: (value: string) => string;
  sections?: readonly { label: string; values: readonly string[] }[];
  emptyStateMessage?: string;
};

export function FacetFilter({
  label,
  options,
  selectedValues,
  onChange,
  labelForOption = (value) => value,
  sections,
  emptyStateMessage = "등록된 옵션이 없습니다.",
}: FacetFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedValues.length > 0;
  const sectionValues = new Set(sections?.flatMap((section) => section.values));
  const unsectionedOptions = options.filter((option) => !sectionValues.has(option));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleOption = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selectedValue) => selectedValue !== value)
        : [...selectedValues, value],
    );
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          hasSelection
            ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
            : "text-foreground hover:border-border-strong hover:bg-muted",
        )}
      >
        <span>{label}{hasSelection ? ` ${selectedValues.length}` : ""}</span>
        <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-150", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="listbox"
          aria-label={`${label} 필터`}
          aria-multiselectable="true"
          className="absolute left-0 z-20 mt-2 min-w-44 rounded-md border bg-card p-1 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-150"
        >
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{label}</p>
          {options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyStateMessage}</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {sections?.map((section) => (
                <div key={section.label} className="py-1 first:pt-0">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{section.label}</p>
                  {section.values.map(renderOption)}
                </div>
              ))}
              {unsectionedOptions.map(renderOption)}
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderOption(option: string) {
    const selected = selectedValues.includes(option);

    return (
      <button
        key={option}
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => toggleOption(option)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
          selected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
        )}
      >
        <span className={cn("flex size-4 items-center justify-center rounded-sm border", selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong")}>
          {selected && <Check aria-hidden="true" className="size-3" />}
        </span>
        {labelForOption(option)}
      </button>
    );
  }
}

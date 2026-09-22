"use client";

import { Check, ChevronDown, Search } from "lucide-react";
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
  collapsibleSections?: boolean;
  searchPlaceholder?: string;
  onClear?: () => void;
};

export function FacetFilter({
  label,
  options,
  selectedValues,
  onChange,
  labelForOption = (value) => value,
  sections,
  emptyStateMessage = "등록된 옵션이 없습니다.",
  collapsibleSections = false,
  searchPlaceholder,
  onClear,
}: FacetFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedValues.length > 0;
  const sectionValues = new Set(sections?.flatMap((section) => section.values));
  const unsectionedOptions = options.filter((option) => !sectionValues.has(option));
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const matchesSearch = (option: string) => option.toLocaleLowerCase("ko-KR").includes(normalizedSearchQuery);
  const visibleSections = sections?.map((section) => ({
    ...section,
    values: section.values.filter(matchesSearch),
    selectedCount: section.values.filter((value) => selectedValues.includes(value)).length,
  })).filter((section) => section.values.length > 0);
  const visibleUnsectionedOptions = unsectionedOptions.filter(matchesSearch);
  const hasVisibleOptions = (visibleSections?.length ?? 0) > 0 || visibleUnsectionedOptions.length > 0;

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

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((sectionLabels) => sectionLabels.includes(sectionLabel)
      ? sectionLabels.filter((label) => label !== sectionLabel)
      : [...sectionLabels, sectionLabel]);
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
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-card px-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
          className={cn(
            "absolute left-0 z-20 mt-2 min-w-44 rounded-md border bg-card p-1 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-150",
            collapsibleSections && "w-[280px]",
          )}
        >
          <div className={cn(collapsibleSections && "sticky top-0 z-10 bg-card pb-1")}>
            {searchPlaceholder ? (
              <div className="flex items-center gap-1 px-1 py-1">
                <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm border bg-background px-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                  <Search aria-hidden="true" className="size-3.5 shrink-0 text-tertiary" />
                  <span className="sr-only">{searchPlaceholder}</span>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-tertiary"
                  />
                </label>
                {onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    disabled={!hasSelection}
                    className="h-8 cursor-pointer rounded-sm px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-50"
                  >
                    초기화
                  </button>
                )}
              </div>
            ) : (
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{label}</p>
            )}
          </div>
          {options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyStateMessage}</p>
          ) : !hasVisibleOptions ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">일치하는 조직이 없습니다.</p>
          ) : (
            <div className={cn("overflow-y-auto", collapsibleSections ? "max-h-[340px]" : "max-h-72")}>
              {visibleSections?.map((section) => {
                const sectionId = `${menuId}-${section.label}`;
                const isExpanded = normalizedSearchQuery.length > 0 || expandedSections.includes(section.label);

                if (!collapsibleSections) {
                  return (
                    <div key={section.label} className="py-1 first:pt-0">
                      <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{section.label}</p>
                      {section.values.map(renderOption)}
                    </div>
                  );
                }

                return (
                  <div key={section.label} className="border-b last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={sectionId}
                      onClick={() => toggleSection(section.label)}
                      className="flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                    >
                      <span className="flex-1">{section.label}{section.selectedCount > 0 ? ` · ${section.selectedCount}` : ""}</span>
                      <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                    {isExpanded && <div id={sectionId} className="pb-1">{section.values.map(renderOption)}</div>}
                  </div>
                );
              })}
              {visibleUnsectionedOptions.map(renderOption)}
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

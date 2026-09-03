import { cn } from "@/lib/utils";

export type SegmentedTabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/** Segmented tab control — pill style matching the design-system portal cards. */
export function SegmentedTabs<T extends string>({
  itens,
  valor,
  onChange,
  straddle: _straddle,
  className,
}: {
  itens: SegmentedTabItem<T>[];
  valor: T;
  onChange: (v: T) => void;
  /** @deprecated Dark banner overlap — no longer shifts layout. */
  straddle?: boolean;
  className?: string;
}) {
  void _straddle;
  return (
    <div
      className={cn(
        "relative z-10 mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1.5 shadow-card",
        className,
      )}
      role="tablist"
    >
      {itens.map((item) => {
        const ativo = item.value === valor;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              ativo
                ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-3px_rgba(255,119,74,0.55)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                  ativo ? "bg-white/20 text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

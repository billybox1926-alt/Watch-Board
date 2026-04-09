import { useState, useEffect } from "react";
import { Search, Radio, Zap, Filter } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { StatusLevel } from "@/data/types";

interface CommandBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAnalyze: () => void;
  liveSync: boolean;
  onToggleSync: () => void;
  statusFilter: StatusLevel | null;
  onStatusFilter: (s: StatusLevel | null) => void;
}

const filterStatuses: StatusLevel[] = ["Red", "Amber", "Watching", "Tripwire", "Mixed"];

export function CommandBar({ searchQuery, onSearchChange, onAnalyze, liveSync, onToggleSync, statusFilter, onStatusFilter }: CommandBarProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!liveSync) return;
    const interval = setInterval(() => setLastRefresh(new Date()), 1000);
    return () => clearInterval(interval);
  }, [liveSync]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground leading-none">Fracture Board v1 LIVE</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-wide uppercase mt-0.5">Strategic Intelligence</p>
          </div>
          <StatusBadge status="Red" size="md" pulse />
        </div>

        <div className="relative flex-1 max-w-sm min-w-[180px] order-3 md:order-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search board..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-8 rounded-md bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
              statusFilter || showFilters ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 order-2 md:order-3">
          <button
  onClick={onToggleSync}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all border ${
    liveSync
      ? "border-primary bg-primary/10 text-primary"
      : "border-status-amber bg-status-amber/10 text-status-amber"
  }`}
>
            <Radio className={`h-2.5 w-2.5 ${liveSync ? "animate-pulse-slow" : ""}`} />
            {liveSync ? "LIVE" : "PAUSED"}
          </button>
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
  {liveSync
    ? lastRefresh.toLocaleTimeString("en-US", { hour12: false })
    : "PAUSED"}
</span>
          <button
            onClick={onAnalyze}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/15 transition-colors border border-primary/20"
          >
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Global Pulse</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mr-1">Filter:</span>
          <button
            onClick={() => onStatusFilter(null)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
              !statusFilter ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {filterStatuses.map(s => (
            <button
              key={s}
              onClick={() => onStatusFilter(statusFilter === s ? null : s)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                statusFilter === s ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

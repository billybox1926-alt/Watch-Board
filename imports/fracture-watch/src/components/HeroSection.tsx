import { metrics, recentDeltas, boardRating, tripwires } from "@/data/seedData";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Shield } from "lucide-react";

interface HeroSectionProps {
  onJumpToSection: (tab: string) => void;
}

export function HeroSection({ onJumpToSection }: HeroSectionProps) {
  const nextTripwire = tripwires.find(t => t.status === "Watching" || t.status === "Amber") || tripwires[0];

  return (
    <section className="px-4 md:px-6 py-4 space-y-3">
      {/* Posture Block */}
      <div className="glass-panel p-4 md:p-5 border-status-red/15">
        <div className="flex flex-col md:flex-row md:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="Red" size="md" pulse />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{boardRating.posture}</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground mb-1.5">
              {boardRating.headline}
            </h2>
            <p className="text-xs text-secondary-foreground leading-relaxed max-w-2xl">
              {boardRating.rationale}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:w-56 shrink-0">
            <div className="p-2.5 rounded bg-muted/40 border border-border">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Lead Lane</p>
              <p className="text-[11px] text-foreground leading-snug">{boardRating.leadLane.split("—")[0].trim()}</p>
            </div>
            <div className="p-2.5 rounded bg-muted/40 border border-border">
              <p className="text-[9px] font-mono text-status-amber uppercase tracking-wider mb-0.5">Next Tripwire</p>
              <p className="text-[11px] text-foreground leading-snug">{nextTripwire.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div key={m.id} className="glass-panel p-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">{m.title}</p>
            <p className="text-sm font-semibold text-foreground">{m.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusBadge status={m.status} size="sm" />
              {m.delta && <span className="text-[9px] font-mono text-muted-foreground">{m.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* What Changed + Rerating Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="glass-panel p-3">
          <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">What Changed</h3>
          <div className="space-y-1">
            {recentDeltas.map(d => (
              <div key={d.id} className="flex items-start gap-2 py-1">
                {d.direction === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-status-red shrink-0 mt-0.5" />
                ) : d.direction === "down" ? (
                  <ArrowDownRight className="h-3 w-3 text-status-amber shrink-0 mt-0.5" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground leading-snug">{d.text}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{d.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">What Would Force Rerating</h3>
          </div>
          <p className="text-[11px] text-secondary-foreground leading-snug mb-2">{boardRating.holdCondition}</p>
          <div className="space-y-1">
            {tripwires.filter(t => t.direction === "escalation").slice(0, 3).map(tw => (
              <button
                key={tw.id}
                onClick={() => onJumpToSection("tripwires")}
                className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-[11px] text-foreground flex-1">{tw.title}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

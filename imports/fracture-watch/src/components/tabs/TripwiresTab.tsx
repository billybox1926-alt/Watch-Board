import { tripwires } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowUpRight, ArrowDownRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TripwiresTabProps {
  searchQuery: string;
}

export function TripwiresTab({ searchQuery }: TripwiresTabProps) {
  const q = searchQuery.toLowerCase();
  const filtered = tripwires.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.whyItMatters.toLowerCase().includes(q));

  const breachedCount = filtered.filter(t => t.status === "Red").length;
  const watchingCount = filtered.filter(t => t.status === "Watching").length;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No results for "{searchQuery}"</p>
        <p className="text-[11px] mt-1">Try: casualty, sinking, safe-passage, infrastructure</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-medium text-foreground">Threshold Console</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Events that would force board reassessment</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-status-red">{breachedCount} active</span>
          <span className="text-status-blue">{watchingCount} watching</span>
          <span className="text-muted-foreground">None breached</span>
        </div>
      </div>

      {/* Tripwire Cards */}
      <div className="space-y-2">
        {filtered.map((tw, i) => {
          const isEscalation = tw.direction === "escalation";
          const isDowngrade = tw.direction === "downgrade";
          const accentColor = tw.status === "Red" ? "border-l-status-red" : tw.status === "Amber" ? "border-l-status-amber" : "border-l-status-blue";

          return (
            <motion.div
              key={tw.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className={`glass-panel p-0 overflow-hidden border-l-2 ${accentColor}`}
            >
              <div className="p-3.5 md:p-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-medium text-foreground">{tw.title}</h3>
                    <StatusBadge status={tw.status} size="sm" />
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${
                    isEscalation ? "text-status-red" : isDowngrade ? "text-status-green" : "text-status-mixed"
                  }`}>
                    {tw.direction}
                  </span>
                </div>

                <p className="text-[11px] text-secondary-foreground leading-snug mb-3">{tw.description}</p>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded bg-muted/30 border border-border">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Why It Matters</p>
                    <p className="text-[10px] text-foreground leading-snug">{tw.whyItMatters}</p>
                  </div>
                  <div className="p-2.5 rounded bg-muted/30 border border-border">
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Implication</p>
                    <div className="flex items-start gap-1">
                      {isEscalation ? (
                        <ArrowUpRight className="h-3 w-3 text-status-red shrink-0 mt-0.5" />
                      ) : isDowngrade ? (
                        <ArrowDownRight className="h-3 w-3 text-status-green shrink-0 mt-0.5" />
                      ) : (
                        <HelpCircle className="h-3 w-3 text-status-mixed shrink-0 mt-0.5" />
                      )}
                      <p className="text-[10px] text-foreground leading-snug">{tw.implication}</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-muted/30 border border-primary/10">
                    <p className="text-[9px] font-mono text-primary uppercase tracking-wider mb-1">Board Change</p>
                    <p className="text-[10px] text-foreground leading-snug">{tw.boardChange}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

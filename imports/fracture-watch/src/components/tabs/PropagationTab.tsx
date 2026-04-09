import { propagationStages } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface PropagationTabProps {
  searchQuery: string;
}

export function PropagationTab({ searchQuery }: PropagationTabProps) {
  const q = searchQuery.toLowerCase();
  const filtered = propagationStages.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No results for "{searchQuery}"</p>
      </div>
    );
  }

  const currentStageIndex = propagationStages.findIndex(s => !s.active);
  const lastActiveIndex = currentStageIndex > 0 ? currentStageIndex - 1 : propagationStages.length - 1;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-1">
        <div>
          <h3 className="text-xs font-medium text-foreground">Propagation Chain</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Currently at <span className="text-foreground">Stage {lastActiveIndex + 1}</span> — {propagationStages[lastActiveIndex]?.title}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {propagationStages.map((s, i) => (
            <div key={s.id} className="flex items-center gap-0.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-medium border ${
                s.active
                  ? s.status === "Red" ? "text-status-red border-status-red/30" :
                    s.status === "Amber" ? "text-status-amber border-status-amber/30" :
                    "text-status-blue border-status-blue/30"
                  : "text-muted-foreground border-border"
              }`}>
                {s.stage}
              </div>
              {i < propagationStages.length - 1 && (
                <div className={`w-3 h-px ${
                  s.active && propagationStages[i + 1]?.active ? "bg-muted-foreground/30" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chain */}
      <div className="flex flex-col items-center">
        {filtered.map((stage, i) => {
          const isCurrent = stage.id === propagationStages[lastActiveIndex]?.id;
          const isActive = stage.active;

          return (
            <div key={stage.id} className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={`glass-panel p-0 overflow-hidden ${
                  isCurrent ? "border-primary/20" :
                  !isActive ? "opacity-50" : ""
                }`}
              >
                {isCurrent && (
                  <div className="h-px bg-primary/40" />
                )}

                <div className="p-3.5 md:p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-medium border ${
                        isCurrent ? "text-primary border-primary/30" :
                        stage.status === "Red" ? "text-status-red border-status-red/25" :
                        stage.status === "Amber" ? "text-status-amber border-status-amber/25" :
                        isActive ? "text-status-blue border-status-blue/25" :
                        "text-muted-foreground border-border"
                      }`}>
                        {stage.stage}
                      </div>
                      {isCurrent && (
                        <span className="text-[8px] font-mono text-primary uppercase tracking-wider mt-0.5">NOW</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-medium text-foreground">{stage.title}</h3>
                        <StatusBadge status={stage.status} size="sm" />
                        {!isActive && <span className="text-[9px] font-mono text-muted-foreground">Not reached</span>}
                      </div>
                      <p className="text-[11px] text-secondary-foreground leading-snug">{stage.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-muted/30">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Latency</p>
                          <p className="text-[10px] text-foreground font-medium">{stage.latency}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/30">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Coupling</p>
                          <p className="text-[10px] text-foreground leading-snug">{stage.coupling}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {i < filtered.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ChevronDown className={`h-3.5 w-3.5 ${
                    isActive && filtered[i + 1]?.active ? "text-muted-foreground/40" : "text-border/50"
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

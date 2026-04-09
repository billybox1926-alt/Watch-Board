import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { IntelCard as IntelCardType } from "@/data/types";
import { StatusBadge } from "./StatusBadge";

interface DetailPanelProps {
  card: IntelCardType | null;
  onClose: () => void;
}

export function DetailPanel({ card, onClose }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-border overflow-y-auto scrollbar-thin"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <StatusBadge status={card.status} size="md" />
                  <h2 className="text-base font-semibold text-foreground">{card.title}</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Summary</h3>
                  <p className="text-xs text-foreground leading-relaxed">{card.summary}</p>
                </div>

                {card.interpretation && (
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Interpretation</h3>
                    <p className="text-xs text-secondary-foreground leading-relaxed">{card.interpretation}</p>
                  </div>
                )}

                {card.evidence && card.evidence.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Evidence</h3>
                    <ul className="space-y-1">
                      {card.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-secondary-foreground">
                          <span className="text-primary mt-px">·</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {card.signalMatters && (
                  <div className="p-2.5 rounded bg-primary/5 border border-primary/10">
                    <h3 className="text-[9px] font-mono text-primary uppercase tracking-wider mb-0.5">Signal</h3>
                    <p className="text-xs text-foreground">{card.signalMatters}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

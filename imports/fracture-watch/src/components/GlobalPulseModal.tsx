import { X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { globalPulseSummary } from "@/data/seedData";

interface GlobalPulseModalProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalPulseModal({ open, onClose }: GlobalPulseModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:max-h-[75vh] z-50 bg-card border border-border rounded-md overflow-y-auto scrollbar-thin"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Global Pulse</h2>
                </div>
                <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-2.5 rounded bg-status-red/5 border border-status-red/15">
                <p className="text-xs font-medium text-foreground">{globalPulseSummary.headline}</p>
              </div>

              <p className="text-xs text-secondary-foreground leading-relaxed">{globalPulseSummary.summary}</p>

              <div>
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Watch Items</h3>
                <ul className="space-y-1.5">
                  {globalPulseSummary.watchItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-secondary-foreground p-2 rounded bg-muted/30">
                      <span className="text-primary font-mono text-[10px] mt-px">{String(i + 1).padStart(2, "0")}</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded bg-primary/5 border border-primary/10">
                <h3 className="text-[9px] font-mono text-primary uppercase tracking-wider mb-0.5">Recommendation</h3>
                <p className="text-xs text-foreground">{globalPulseSummary.recommendation}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

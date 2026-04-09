import { useState } from "react";
import { scenarios } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { IntelCardShell } from "@/components/IntelCardShell";

interface ScenariosTabProps {
  searchQuery: string;
}

const consequenceLabels: Record<string, string> = {
  shipping: "Shipping",
  oil: "Oil & Energy",
  diplomacy: "Diplomacy",
  industrial: "Industrial",
  escort: "Escort Pressure",
};

const severityColor = (score: number) => {
  if (score >= 8) return "text-status-red";
  if (score >= 5) return "text-status-amber";
  if (score >= 3) return "text-status-blue";
  return "text-muted-foreground";
};

const barColor = (score: number) => {
  if (score >= 8) return "bg-status-red/60";
  if (score >= 5) return "bg-status-amber/50";
  if (score >= 3) return "bg-status-blue/50";
  return "bg-muted";
};

export function ScenariosTab({ searchQuery }: ScenariosTabProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([scenarios[0].id]);
  const q = searchQuery.toLowerCase();
  const filtered = scenarios.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No results for "{searchQuery}"</p>
      </div>
    );
  }

  const toggleScenario = (id: string) => {
    if (compareMode) {
      setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    } else {
      setSelected([id]);
    }
  };

  const activeScenarios = filtered.filter(s => selected.includes(s.id));
  if (activeScenarios.length === 0 && filtered.length > 0) {
    activeScenarios.push(filtered[0]);
  }

  const dimensions = ["shipping", "oil", "diplomacy", "industrial", "escort"] as const;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => toggleScenario(s.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              selected.includes(s.id)
                ? "border-primary/25 text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <StatusBadge status={s.likelihood} size="sm" />
              {s.name}
            </div>
          </button>
        ))}
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            if (!compareMode) setSelected(filtered.map(s => s.id));
            else setSelected([filtered[0].id]);
          }}
          className={`ml-auto px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
            compareMode ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {compareMode ? "Exit Compare" : "Compare All"}
        </button>
      </div>

      {/* Compare View */}
      {compareMode && activeScenarios.length > 1 ? (
        <div className="space-y-3">
          {/* Severity Matrix */}
          <IntelCardShell hoverable={false} className="p-4">
            <h3 className="text-xs font-medium text-foreground mb-3">Severity Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[9px] font-mono text-muted-foreground uppercase tracking-wider py-2 pr-4">Dimension</th>
                    {activeScenarios.map(s => (
                      <th key={s.id} className="text-left text-[9px] font-mono text-muted-foreground uppercase tracking-wider py-2 px-3 min-w-[120px]">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map(dim => (
                    <tr key={dim} className="border-b border-border/50 last:border-0">
                      <td className="text-[11px] text-foreground py-2.5 pr-4">{consequenceLabels[dim]}</td>
                      {activeScenarios.map(s => {
                        const score = s.severityScores?.[dim] ?? 0;
                        return (
                          <td key={s.id} className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-mono font-semibold ${severityColor(score)}`}>{score}</span>
                              <div className="flex-1 h-1 rounded-full bg-muted/50 max-w-[60px]">
                                <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score * 10}%` }} />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </IntelCardShell>

          {/* Consequence Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeScenarios.map(s => (
              <IntelCardShell key={s.id} hoverable={false} className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <StatusBadge status={s.likelihood} size="sm" />
                  <h3 className="text-xs font-medium text-foreground">{s.name}</h3>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug mb-2.5">{s.description}</p>
                <div className="space-y-1.5">
                  {dimensions.map(dim => (
                    <div key={dim} className="p-2 rounded bg-muted/30">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{consequenceLabels[dim]}</p>
                      <p className="text-[10px] text-foreground leading-snug mt-0.5">{s.consequences[dim]}</p>
                    </div>
                  ))}
                </div>
              </IntelCardShell>
            ))}
          </div>
        </div>
      ) : (
        /* Single Scenario View */
        activeScenarios.slice(0, 1).map(active => (
          <IntelCardShell key={active.id} hoverable={false} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={active.likelihood} size="md" />
              <h3 className="text-base font-semibold text-foreground">{active.name}</h3>
            </div>
            <p className="text-xs text-secondary-foreground leading-relaxed mb-4">{active.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(active.consequences).map(([key, value]) => {
                const score = active.severityScores?.[key as keyof typeof active.severityScores] ?? 0;
                return (
                  <div key={key} className="p-3 rounded bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{consequenceLabels[key] || key}</p>
                      <span className={`text-[10px] font-mono font-semibold ${severityColor(score)}`}>{score}/10</span>
                    </div>
                    <p className="text-[11px] text-foreground leading-snug">{value}</p>
                    <div className="h-1 rounded-full bg-muted/50 mt-2">
                      <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score * 10}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </IntelCardShell>
        ))
      )}
    </div>
  );
}

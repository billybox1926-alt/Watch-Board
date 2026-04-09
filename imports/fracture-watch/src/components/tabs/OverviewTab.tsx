import { overviewConditions, decisiveQuestions, stressorCards, operatorNotes, boardRating, falsificationTests } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { IntelCardShell } from "@/components/IntelCardShell";
import type { IntelCard } from "@/data/types";
import { MessageSquare, HelpCircle, Target, XCircle } from "lucide-react";

interface OverviewTabProps {
  searchQuery: string;
  onSelectCard: (card: IntelCard) => void;
}

export function OverviewTab({ searchQuery, onSelectCard }: OverviewTabProps) {
  const q = searchQuery.toLowerCase();
  const filteredConditions = overviewConditions.filter(c => c.text.toLowerCase().includes(q));
  const filteredQuestions = decisiveQuestions.filter(d => d.question.toLowerCase().includes(q) || (d.answer?.toLowerCase().includes(q)));
  const filteredStressors = stressorCards.filter(s => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
  const filteredNotes = operatorNotes.filter(n => n.text.toLowerCase().includes(q));
  const filteredFalsification = falsificationTests.filter(f => f.test.toLowerCase().includes(q) || f.result.toLowerCase().includes(q));

  const noResults = filteredConditions.length === 0 && filteredQuestions.length === 0 && filteredStressors.length === 0 && filteredNotes.length === 0 && filteredFalsification.length === 0;

  if (noResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No results for "{searchQuery}"</p>
        <p className="text-[11px] mt-1">Try: Red, Amber, Watching, casualty, insurance</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Why Rated This Way */}
      <div className="glass-panel p-4 border-status-red/10">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-3.5 w-3.5 text-status-red" />
          <h3 className="text-xs font-medium text-foreground">Why the Board is Rated Red</h3>
          <StatusBadge status="Red" size="sm" />
        </div>
        <p className="text-xs text-secondary-foreground leading-relaxed mb-3">{boardRating.rationale}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-2.5 rounded bg-muted/40 border border-border">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Lead Lane</p>
            <p className="text-[11px] text-foreground leading-snug">{boardRating.leadLane}</p>
          </div>
          <div className="p-2.5 rounded bg-muted/40 border border-border">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Hold Condition</p>
            <p className="text-[11px] text-foreground leading-snug">{boardRating.holdCondition}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live Conditions */}
          {filteredConditions.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">Live Conditions</h3>
              {filteredConditions.map(c => (
                <div key={c.id} className="flex items-start gap-2.5 p-2.5 glass-panel">
                  <StatusBadge status={c.status} size="sm" />
                  <div className="flex-1">
                    <p className="text-[11px] text-foreground leading-snug">{c.text}</p>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{c.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Decisive Questions */}
          {filteredQuestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1">
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Decisive Questions</h3>
              </div>
              {filteredQuestions.map(dq => (
                <div key={dq.id} className="glass-panel p-3">
                  <div className="flex items-start gap-2">
                    <StatusBadge status={dq.status} size="sm" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{dq.question}</p>
                      {dq.answer && <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{dq.answer}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Falsification Tests */}
          {filteredFalsification.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1">
                <XCircle className="h-3 w-3 text-muted-foreground" />
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">What Would Prove This Wrong</h3>
              </div>
              <div className="glass-panel p-3 space-y-2">
                {filteredFalsification.map(f => (
                  <div key={f.id} className="flex items-start gap-2.5 pb-2 border-b border-border last:border-0 last:pb-0">
                    <StatusBadge status={f.status} size="sm" />
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-foreground">{f.test}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{f.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {filteredStressors.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1">Stressor Intel</h3>
              {filteredStressors.map(s => (
                <IntelCardShell key={s.id} onClick={() => onSelectCard(s)} className={`p-3 ${s.status === "Red" ? "border-status-red/8" : ""}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <StatusBadge status={s.status} size="sm" />
                    <h4 className="text-xs font-medium text-foreground">{s.title}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mb-1.5">{s.summary}</p>
                  {s.signalMatters && (
                    <div className="p-2 rounded bg-primary/5 border border-primary/10">
                      <p className="text-[9px] font-mono text-primary uppercase tracking-wider mb-0.5">Signal</p>
                      <p className="text-[10px] text-foreground leading-snug">{s.signalMatters}</p>
                    </div>
                  )}
                </IntelCardShell>
              ))}
            </div>
          )}

          {filteredNotes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1">
                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Operator Notes</h3>
              </div>
              {filteredNotes.map(n => (
                <div key={n.id} className="p-2.5 glass-panel">
                  <p className="text-[11px] text-foreground leading-snug">{n.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono text-primary">{n.author}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">{n.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

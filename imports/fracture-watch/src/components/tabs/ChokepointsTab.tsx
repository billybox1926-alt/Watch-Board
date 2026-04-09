import { chokepointCards } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { IntelCardShell } from "@/components/IntelCardShell";
import type { IntelCard } from "@/data/types";

interface ChokepointsTabProps {
  searchQuery: string;
  onSelectCard: (card: IntelCard) => void;
}

export function ChokepointsTab({ searchQuery, onSelectCard }: ChokepointsTabProps) {
  const q = searchQuery.toLowerCase();
  const filtered = chokepointCards.filter(c => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q));

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">No results for "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {filtered.map(card => (
        <IntelCardShell key={card.id} onClick={() => onSelectCard(card)} className="p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <StatusBadge status={card.status} size="sm" />
            <h3 className="text-xs font-medium text-foreground">{card.title}</h3>
          </div>
          <p className="text-[11px] text-secondary-foreground leading-snug mb-2">{card.summary}</p>
          {card.interpretation && (
            <p className="text-[10px] text-muted-foreground leading-snug mb-2">{card.interpretation}</p>
          )}
          {card.evidence && (
            <ul className="space-y-0.5">
              {card.evidence.map((e, i) => (
                <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-px">·</span>{e}
                </li>
              ))}
            </ul>
          )}
        </IntelCardShell>
      ))}
    </div>
  );
}

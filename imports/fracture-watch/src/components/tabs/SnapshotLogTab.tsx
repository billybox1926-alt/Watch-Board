import { useState } from "react";
import { snapshots as seedSnapshots, operatorNotes } from "@/data/seedData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Clock, MessageSquare } from "lucide-react";
import type { Snapshot } from "@/data/types";

interface SnapshotLogTabProps {
  searchQuery: string;
}

export function SnapshotLogTab({ searchQuery }: SnapshotLogTabProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(seedSnapshots);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newChanged, setNewChanged] = useState("");

  const q = searchQuery.toLowerCase();
  const filtered = snapshots.filter(s => s.title.toLowerCase().includes(q) || s.note.toLowerCase().includes(q) || (s.whatChanged?.toLowerCase().includes(q) ?? false));
  const filteredNotes = operatorNotes.filter(n => n.text.toLowerCase().includes(q));

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const snap: Snapshot = {
      id: `sn-${Date.now()}`,
      title: newTitle,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
      note: newNote,
      posture: "Red",
      whatChanged: newChanged || undefined,
    };
    setSnapshots([snap, ...snapshots]);
    setNewTitle("");
    setNewNote("");
    setNewChanged("");
    setShowForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Snapshot Timeline */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-foreground">Snapshot Log</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        </div>

        {showForm && (
          <div className="glass-panel p-3 space-y-2">
            <input
              type="text"
              placeholder="Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full h-8 px-2.5 rounded bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <textarea
              placeholder="Note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-2 rounded bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
            <input
              type="text"
              placeholder="What changed?"
              value={newChanged}
              onChange={(e) => setNewChanged(e.target.value)}
              className="w-full h-8 px-2.5 rounded bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleCreate} className="px-2.5 py-1 rounded bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/15 transition-colors">Save</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No snapshots matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((snap) => (
              <div key={snap.id} className="glass-panel p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <StatusBadge status={snap.posture} size="sm" />
                      <h4 className="text-xs font-medium text-foreground truncate">{snap.title}</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{snap.note}</p>
                    {snap.whatChanged && (
                      <p className="text-[10px] text-foreground leading-snug mt-1.5 pl-2 border-l-2 border-primary/20">{snap.whatChanged}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {snap.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operator Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <h3 className="text-xs font-medium text-foreground">Operator Notes</h3>
        </div>
        {filteredNotes.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">No notes matching filter.</p>
        ) : (
          <div className="space-y-1.5">
            {filteredNotes.map(n => (
              <div key={n.id} className="p-2.5 glass-panel">
                <p className="text-[10px] text-foreground leading-snug">{n.text}</p>
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
  );
}

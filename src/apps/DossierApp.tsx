import { Users, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const TARGETS = [
  { id: 'HVT-001', name: 'Ahmad Rezaei', title: 'IRGC-N Fleet Commander', threat: 'critical', location: 'Bandar Abbas', status: 'Active', clearance: 'Tier-1 Target', bio: 'Commands IRGC Navy assets in the Strait of Hormuz region. Implicated in coordination of fast-attack craft swarm tactics. Believed to operate from hardened C2 bunker near IRGC compound.', associates: ['HVT-002', 'HVT-004'] },
  { id: 'HVT-002', name: 'Mohammad Karimi', title: 'Natanz Site Director', threat: 'critical', location: 'Natanz', status: 'Active', clearance: 'Tier-1 Target', bio: 'Oversees enrichment operations at the IR-6 centrifuge cascade arrays. PhD in Nuclear Engineering from Sharif University. Attended IAEA negotiations in Geneva (2022, 2024).', associates: ['HVT-001'] },
  { id: 'HVT-003', name: 'Leila Hosseini', title: 'Cyber Command Coordinator', threat: 'high', location: 'Tehran', status: 'Active', clearance: 'Tier-2 Target', bio: 'Believed responsible for orchestrating cyber-intrusion campaigns against Gulf States infrastructure. Linked to APT-34 proxy operations.', associates: [] },
  { id: 'HVT-004', name: 'Gen. Farhad Naseri', title: 'Ballistic Missile Program Chief', threat: 'critical', location: 'Parchin', status: 'Active', clearance: 'Tier-1 Target', bio: 'Commands development and deployment of Shahab-3 and Emad ballistic systems. Believed to have direct access to launch authorization codes.', associates: ['HVT-001'] },
];

export const DossierApp = () => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(TARGETS[0]);

  const filtered = TARGETS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full bg-primary overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-72 border-r border-color flex flex-col" style={{ borderColor: 'var(--border-color)' }}>
        <div className="p-4 border-b border-color" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary mb-3">
            <Users size={18} style={{ color: 'var(--accent-secondary)' }} /> HVT DATABASE
          </h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-color bg-tertiary" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}>
            <Search size={14} className="text-muted" />
            <input className="bg-transparent text-sm text-primary outline-none flex-1 placeholder-muted" placeholder="Search targets..." value={query} onChange={e => setQuery(e.target.value)} style={{ color: 'var(--text-primary)' }} />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.map(t => (
            <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left px-4 py-3 border-b border-color flex items-center justify-between hover:bg-tertiary transition-colors" style={{ borderColor: 'var(--border-color)', background: selected.id === t.id ? 'var(--bg-tertiary)' : 'transparent' }}>
              <div>
                <div className="text-sm font-bold text-primary">{t.name}</div>
                <div className="text-xs text-muted">{t.title}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge badge-${t.threat} text-[9px]`}>{t.threat}</span>
                <ChevronRight size={12} className="text-muted" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile view */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold border-2" style={{ background: 'var(--bg-tertiary)', borderColor: `var(--signal-${selected.threat})`, color: `var(--signal-${selected.threat})` }}>
            {selected.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold text-primary">{selected.name}</h3>
              <span className={`badge badge-${selected.threat}`}>{selected.clearance}</span>
            </div>
            <div className="text-secondary text-sm">{selected.title}</div>
            <div className="text-muted text-xs mt-1 font-mono">{selected.id} · Location: {selected.location} · Status: <span style={{ color: 'var(--signal-critical)' }}>{selected.status}</span></div>
          </div>
        </div>

        <div className="glass-panel p-5 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Intelligence Profile</h4>
          <p className="text-sm text-secondary leading-relaxed">{selected.bio}</p>
        </div>

        {selected.associates.length > 0 && (
          <div className="glass-panel p-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Known Associates</h4>
            <div className="flex gap-3">
              {selected.associates.map(assocId => {
                const assoc = TARGETS.find(t => t.id === assocId);
                return assoc ? (
                  <button key={assocId} onClick={() => setSelected(assoc)} className="px-3 py-2 rounded border border-color text-xs hover:bg-tertiary transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="font-bold text-primary">{assoc.name}</span>
                    <span className="text-muted ml-2">{assoc.id}</span>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

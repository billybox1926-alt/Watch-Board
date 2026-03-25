import React from 'react';
import type { KeywordGroup } from '../types/article';
import { Filter } from 'lucide-react';

export interface FilterState {
  minScore: number;
  source: string;
  keywordGroup: KeywordGroup | 'All';
  timeWindowH: number;
}

interface FiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sources: string[];
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters, sources }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Filter size={18} className="text-muted" />
        <h3 className="font-semibold">Filter Feed</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Min Score */}
        <div>
          <label className="text-xs font-medium text-secondary mb-1 block">Min Score: {filters.minScore}</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={filters.minScore} 
            onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
          />
        </div>

        {/* Source */}
        <div>
          <label className="text-xs font-medium text-secondary mb-1 block">Source</label>
          <select 
            value={filters.source} 
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <option value="All">All Sources</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Keyword Group */}
        <div>
          <label className="text-[10px] font-black text-muted mb-2 block uppercase tracking-widest">Category</label>
          <select 
            value={filters.keywordGroup} 
            onChange={(e) => setFilters({ ...filters, keywordGroup: e.target.value as KeywordGroup | 'All' })}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.4)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            <option value="All">All Categories</option>
            <option value="Conflict">Conflict</option>
            <option value="Nuclear">Nuclear</option>
            <option value="Maritime/Energy">Maritime/Energy</option>
            <option value="Intelligence">Intelligence</option>
            <option value="Economy">Economy</option>
            <option value="Cyber">Cyber</option>
            <option value="Diplomacy">Diplomacy</option>
            <option value="Internal Security">Internal Security</option>
          </select>
        </div>

        {/* Time Window */}
        <div>
          <label className="text-xs font-medium text-secondary mb-1 block">Time Window</label>
          <select 
            value={filters.timeWindowH} 
            onChange={(e) => setFilters({ ...filters, timeWindowH: Number(e.target.value) })}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <option value={1}>Last 1 Hour</option>
            <option value={4}>Last 4 Hours</option>
            <option value={12}>Last 12 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={72}>Last 3 Days</option>
            <option value={168}>Last 7 Days</option>
            <option value={999999}>All Time</option>
          </select>
        </div>
        
        <button 
          onClick={() => setFilters({ minScore: 0, source: 'All', keywordGroup: 'All', timeWindowH: 72 })}
          style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

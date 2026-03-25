import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import type { KeywordGroup } from '../types/article';
import { Plus, X, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { trustedSources, watchlists, scoringWeights, addTrustedSource, removeTrustedSource, updateWatchlist, updateWeights } = useSettings();
  
  const [newSource, setNewSource] = useState('');
  const [newKeywords, setNewKeywords] = useState<Record<KeywordGroup, string>>({
    'Conflict': '',
    'Nuclear': '',
    'Maritime/Energy': ''
  });
  
  const [localWeights, setLocalWeights] = useState(scoringWeights);

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSource.trim() && !trustedSources.includes(newSource.trim())) {
      addTrustedSource(newSource.trim());
      setNewSource('');
    }
  };

  const handleAddKeyword = (group: KeywordGroup, e: React.FormEvent) => {
    e.preventDefault();
    const word = newKeywords[group].trim();
    if (word && !watchlists[group].includes(word)) {
      updateWatchlist(group, [...watchlists[group], word]);
      setNewKeywords({ ...newKeywords, [group]: '' });
    }
  };

  const handleRemoveKeyword = (group: KeywordGroup, word: string) => {
    updateWatchlist(group, watchlists[group].filter(w => w !== word));
  };

  const handleSaveWeights = () => {
    updateWeights(localWeights);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-xl font-bold mb-2">System Configuration</h2>

      {/* Scoring Weights */}
      <div className="glass-panel">
        <h3 className="font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>Scoring Weights Configuration</h3>
        <p className="text-sm text-secondary mb-4">Adjust how different factors influence the intelligence priority score (0-100).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Keyword Match Weight</label>
            <input type="number" min="0" max="100" value={localWeights.keywordMatch} onChange={(e) => setLocalWeights({ ...localWeights, keywordMatch: Number(e.target.value) })} className="w-full bg-primary border border-color rounded p-2 text-primary" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '4px', width: '100%' }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Recency Weight</label>
            <input type="number" min="0" max="100" value={localWeights.recency} onChange={(e) => setLocalWeights({ ...localWeights, recency: Number(e.target.value) })} className="w-full bg-primary border border-color rounded p-2 text-primary" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '4px', width: '100%' }} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Trusted Source Additive</label>
            <input type="number" min="0" max="100" value={localWeights.trustedSource} onChange={(e) => setLocalWeights({ ...localWeights, trustedSource: Number(e.target.value) })} className="w-full bg-primary border border-color rounded p-2 text-primary" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '4px', width: '100%' }} />
          </div>
        </div>
        
        <button onClick={handleSaveWeights} className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded font-medium transition-colors" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>
          <Save size={16} /> Save Weights
        </button>
      </div>

      {/* Trusted Sources */}
      <div className="glass-panel">
        <h3 className="font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>Trusted Intelligence Sources</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {trustedSources.map(source => (
            <span key={source} className="flex items-center gap-1 bg-tertiary px-3 py-1 rounded text-sm text-secondary" style={{ background: 'var(--bg-tertiary)', borderRadius: '16px', padding: '0.25rem 0.75rem' }}>
              {source}
              <button onClick={() => removeTrustedSource(source)} className="hover:text-critical transition-colors" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddSource} className="flex gap-2 max-w-sm">
          <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="Add new source..." className="flex-1 bg-primary border border-color rounded p-2 text-sm text-primary" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '4px' }} />
          <button type="submit" className="bg-tertiary hover:bg-secondary px-3 py-2 rounded transition-colors text-primary flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
            <Plus size={16} />
          </button>
        </form>
      </div>

      {/* Keyword Watchlists */}
      <div className="glass-panel">
        <h3 className="font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>Keyword Watchlists</h3>
        <p className="text-sm text-secondary mb-6">Keywords trigger scoring multipliers depending on match density.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(watchlists) as KeywordGroup[]).map(group => (
            <div key={group} className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-accent" style={{ color: 'var(--accent-secondary)' }}>{group} Lexicon</h4>
              <div className="flex flex-wrap gap-1.5" style={{ minHeight: '80px', alignContent: 'flex-start' }}>
                {watchlists[group].map(word => (
                  <span key={word} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary border border-color" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', border: '1px solid', borderRadius: '4px' }}>
                    {word}
                    <button onClick={() => handleRemoveKeyword(group, word)} className="hover:text-critical opacity-60 hover:opacity-100 transition-opacity" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={(e) => handleAddKeyword(group, e)} className="flex gap-1 mt-auto">
                <input type="text" value={newKeywords[group]} onChange={(e) => setNewKeywords({ ...newKeywords, [group]: e.target.value })} placeholder="Add term..." className="flex-1 bg-primary border border-color rounded p-1.5 text-xs" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.375rem', borderRadius: '4px' }} />
                <button type="submit" className="bg-tertiary px-2 rounded flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;

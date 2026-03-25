import React from 'react';
import type { Article } from '../types/article';
import { ArrowUpRight, Flame } from 'lucide-react';
import { differenceInMinutes, parseISO } from 'date-fns';

interface PinnedPanelProps {
  articles: Article[];
}

export const PinnedPanel: React.FC<PinnedPanelProps> = ({ articles }) => {
  return (
    <div className="glass-panel sticky" style={{ top: '2rem' }}>
      <div className="flex items-center gap-2 mb-6">
        <Flame size={20} style={{ color: 'var(--signal-critical)' }} />
        <h2 className="text-lg font-bold">Top Developments</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {articles.map((article, idx) => (
          <div key={article.id} className="group" style={{ paddingBottom: idx === articles.length - 1 ? 0 : '1rem', borderBottom: idx === articles.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-bold uppercase ${article.signalLevel === 'critical' ? 'text-critical' : 'text-high'}`} style={{ color: `var(--signal-${article.signalLevel})` }}>
                {article.signalLevel} SIGNAL
              </span>
              <span className="text-xs text-muted">
                {Math.floor(differenceInMinutes(new Date(), parseISO(article.publishedAt)) / 60)}h ago
              </span>
            </div>
            
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold group-hover:text-accent transition-colors flex items-start gap-1">
              {article.title}
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </a>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-sm text-secondary">No key developments to pin currently.</p>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import type { Article, SignalLevel } from '../types/article';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Clock, ExternalLink, Flag, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

const getRecencyString = (isoString: string) => {
  const mins = differenceInMinutes(new Date(), parseISO(isoString));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const SignalBadge: React.FC<{ level: SignalLevel }> = ({ level }) => {
  return (
    <span className={`badge badge-${level}`}>
      {level}
    </span>
  );
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const TrajectoryIcon = article.trajectory === 'rising' ? TrendingUp : (article.trajectory === 'falling' ? TrendingDown : Minus);
  const trajectoryColor = article.trajectory === 'rising' ? 'var(--signal-critical)' : (article.trajectory === 'falling' ? 'var(--signal-low)' : 'var(--text-muted)');

  return (
    <div className="glass-panel group max-w-full transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] hover:border-accent/40" 
         style={{ 
           cursor: 'pointer',
           position: 'relative',
           padding: '2rem 2.5rem',
           marginBottom: '1rem'
         }} 
         onClick={() => onClick(article)}>
      
      {/* Selection Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-accent via-transparent to-transparent pointer-events-none" style={{ background: 'var(--accent-primary)' }}></div>
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--accent-secondary)' }}>
            {article.source}
          </span>
          <div className="w-1 h-1 rounded-full bg-white/10"></div>
          <span className="text-[11px] font-mono text-muted flex items-center gap-1.5 uppercase tracking-widest">
            <Clock size={12} />
            {getRecencyString(article.publishedAt)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
            <TrajectoryIcon size={12} style={{ color: trajectoryColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: trajectoryColor }}>{article.trajectory}</span>
          </div>
          <SignalBadge level={article.signalLevel} />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-black mb-4 tracking-tight leading-tight group-hover:text-accent transition-colors" style={{ color: 'var(--text-primary)' }}>
        {article.title}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-3 inline-flex items-center text-muted/40 hover:text-accent transition-all hover:scale-110" onClick={(e) => e.stopPropagation()}>
          <ExternalLink size={18} />
        </a>
      </h3>
      
      <p className="text-base text-secondary/80 mb-8 line-clamp-2 leading-relaxed tracking-wide">
        {article.aiSummary}
      </p>

      {article.whyFlagged.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="text-[10px] font-black text-muted flex items-center gap-2 mb-4 uppercase tracking-[0.3em]">
            <Flag size={12} /> Analysis Indicators
          </div>
          <div className="flex flex-wrap gap-3">
            {article.whyFlagged.map((reason: string, i: number) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

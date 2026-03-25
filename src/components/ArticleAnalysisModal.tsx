import React from 'react';
import type { Article } from '../types/article';
import { X, Shield, TrendingUp, TrendingDown, Minus, Info, ExternalLink, Cpu, MessageSquare } from 'lucide-react';
import { AnalysisChat } from './AnalysisChat';

interface ArticleAnalysisModalProps {
  article: Article;
  onClose: () => void;
}

export const ArticleAnalysisModal: React.FC<ArticleAnalysisModalProps> = ({ article, onClose }) => {
  const refId = React.useMemo(() => `${article.id.toUpperCase()}-${article.publishedAt.slice(-4)}`, [article.id, article.publishedAt]);
  
  const getTrajectoryIcon = () => {
    switch (article.trajectory) {
      case 'rising': return <TrendingUp className="text-critical" size={18} />;
      case 'falling': return <TrendingDown className="text-secondary" size={18} />;
      default: return <Minus className="text-muted" size={18} />;
    }
  };

  const getSentimentColor = () => {
    switch (article.sentiment) {
      case 'negative': return 'var(--signal-critical)';
      case 'positive': return 'var(--signal-low)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-primary border border-color shadow-2xl relative overflow-hidden flex flex-col"
        style={{ 
          maxHeight: '85vh', 
          borderRadius: '16px',
          borderColor: 'var(--border-color)',
          background: 'var(--bg-primary)'
        }}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" style={{ background: `linear-gradient(90deg, transparent, var(--accent-primary), transparent)` }}></div>
        
        {/* Modal Header */}
        <div className="p-6 border-b border-color flex justify-between items-start" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-accent" style={{ color: 'var(--accent-secondary)' }} />
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted">A.I. INTELLIGENCE ANALYSIS</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{article.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-tertiary rounded-full transition-colors text-muted hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          
          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 flex flex-col gap-2 bg-tertiary/20" style={{ background: 'var(--bg-tertiary)' }}>
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Source Reliability</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono">{(article.reliability * 100).toFixed(0)}%</span>
                <Shield size={16} className="text-accent" style={{ color: 'var(--accent-secondary)' }} />
              </div>
            </div>

            <div className="glass-panel p-4 flex flex-col gap-2 bg-tertiary/20" style={{ background: 'var(--bg-tertiary)' }}>
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Threat Trajectory</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono capitalize">{article.trajectory}</span>
                {getTrajectoryIcon()}
              </div>
            </div>

            <div className="glass-panel p-4 flex flex-col gap-2 bg-tertiary/20" style={{ background: 'var(--bg-tertiary)' }}>
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Sentiment Bias</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono capitalize" style={{ color: getSentimentColor() }}>{article.sentiment}</span>
                <Info size={16} style={{ color: getSentimentColor() }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
            <div className="space-y-6">
              {/* Detailed Summary */}
              <div>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Info size={14} className="text-accent" />
                  Strategic Assessment
                </h3>
                <p className="text-sm text-secondary leading-relaxed bg-tertiary/10 p-4 rounded-lg border border-color/30 italic" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {article.aiSummary}
                </p>
              </div>

              {/* Flagged Reasons */}
              <div>
                <h3 className="text-sm font-bold mb-3">Intelligence Markers</h3>
                <div className="flex flex-wrap gap-2">
                  {article.whyFlagged.map((flag: string, i: number) => (
                    <div key={i} className="px-3 py-1.5 rounded bg-tertiary border border-color flex items-center gap-2 text-xs" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--signal-critical)' }}></div>
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MessageSquare size={14} className="text-accent" /> Assistant
              </h3>
              <AnalysisChat article={article} />
            </div>
          </div>

          {/* Raw Content Snippet */}
          <div>
            <h3 className="text-sm font-bold mb-3">Content Snippet</h3>
            <div className="p-4 bg-black/40 rounded-lg border border-color/40 text-[13px] text-muted font-mono leading-tight max-h-32 overflow-auto" style={{ borderColor: 'var(--border-color)' }}>
              {article.description}...
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-color bg-tertiary/30 flex justify-between items-center" style={{ borderColor: 'var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[10px] text-muted font-mono">
            REF_ID: {refId}
          </div>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-accent text-black rounded hover:bg-opacity-80 transition-all"
            style={{ background: 'var(--accent-secondary)' }}
          >
            Access Full Report <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ArticleCard } from './ArticleCard';
import { PinnedPanel } from './PinnedPanel';
import { Filters } from './Filters';
import type { FilterState } from './Filters';
import { mockArticles } from '../services/mockData';
import type { RawArticle } from '../services/mockData';
import { processArticle, getTopDevelopments } from '../services/articleService';
import { useSettings } from '../context/SettingsContext';
import { differenceInHours, parseISO } from 'date-fns';
import { ArticleAnalysisModal } from './ArticleAnalysisModal';
import { Radar, Activity, Shield, Search, TrendingUp } from 'lucide-react';
import type { Article } from '../types/article';
import { SignalHeatmap } from './SignalHeatmap';

export const Dashboard: React.FC = () => {
  const { trustedSources, scoringWeights } = useSettings();
  
  const [filters, setFilters] = useState<FilterState>({
    minScore: 0,
    source: 'All',
    keywordGroup: 'All',
    timeWindowH: 72
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Simulation effect for "Scanning"
  React.useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Process and rank articles based on current settings
  const processedArticles = useMemo(() => {
    return mockArticles.map((article: RawArticle) => 
      processArticle(article, trustedSources, scoringWeights)
    ).sort((a: Article, b: Article) => b.score - a.score);
  }, [trustedSources, scoringWeights]);

  // Apply dashboard filters
  const filteredFeed = useMemo(() => {
    return processedArticles.filter((a: Article) => {
      if (a.score < filters.minScore) return false;
      if (filters.source !== 'All' && a.source !== filters.source) return false;
      if (filters.keywordGroup !== 'All' && a.category !== filters.keywordGroup) return false;
      
      const hoursOld = differenceInHours(new Date(), parseISO(a.publishedAt));
      if (hoursOld > filters.timeWindowH) return false;
      
      return true;
    });
  }, [processedArticles, filters]);

  const topDevelopments = useMemo(() => getTopDevelopments(processedArticles), [processedArticles]);
  const uniqueSources = useMemo(() => Array.from(new Set(mockArticles.map((a: RawArticle) => a.source))), []);

  const stats = useMemo(() => {
    return {
      critical: filteredFeed.filter((a: Article) => a.signalLevel === 'critical').length,
      high: filteredFeed.filter((a: Article) => a.signalLevel === 'high').length,
      total: filteredFeed.length
    };
  }, [filteredFeed]);

  return (
    <div className="flex flex-col h-full w-full bg-primary text-primary overflow-hidden p-8 md:p-12 lg:p-16 gap-10 md:gap-14" style={{ background: 'var(--bg-primary)' }}>
      
      {/* 1. Global Command Header */}
      <header className="glass-panel p-6 md:p-10 relative overflow-hidden active-scan-ring shrink-0 bg-[#0a0f1d]/90" style={{ borderLeft: '4px solid var(--accent-primary)', minHeight: '140px' }}>
        {/* Background Radar Ornament */}
        <div className="absolute top-4 right-8 opacity-20 pointer-events-none z-0">
          <Radar size={120} className="animate-spin-slow text-accent" style={{ color: 'var(--accent-primary)' }} />
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          {/* Status Bar */}
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-accent animate-pulse' : 'bg-success'}`} style={{ background: isScanning ? 'var(--accent-primary)' : 'var(--signal-low)' }}></div>
            <span className="text-[11px] font-mono font-bold tracking-[0.3em] text-accent/80 uppercase">
              {isScanning ? 'SCANNING SECURE NODES...' : 'ENCRYPTED FEED ACTIVE'}
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-none">
            COMMAND <span className="text-accent" style={{ color: 'var(--accent-primary)' }}>CENTER</span>
          </h1>
          
          {/* Metadata & Stats Row */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mt-4 text-[11px] font-mono text-muted uppercase tracking-widest border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> REGION: PERSIA/GULF</div>
            <div className="flex items-center gap-2 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-white/20"></div> ASSETS: 24 LIVE</div>
            
            <div className="flex items-center gap-6 sm:ml-auto bg-black/40 px-5 py-2 rounded border border-white/5 shrink-0">
              <span className="flex items-center gap-2">
                <span className="text-muted">CRITICAL:</span>
                <span className="text-critical font-bold text-sm" style={{ color: 'var(--signal-critical)' }}>{stats.critical.toString().padStart(2, '0')}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-muted">HIGH:</span>
                <span className="text-accent font-bold text-sm" style={{ color: 'var(--accent-secondary)' }}>{stats.high.toString().padStart(2, '0')}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Primary Workspace (Feed + Analysis) */}
      <div className="feed-wrapper overflow-hidden">
        
        {/* LEFT: Live Surveillance Feed (Scrollable) */}
        <main className="feed-left overflow-auto pr-4 md:pr-6 custom-scrollbar">
          <div className="flex flex-col gap-10 pb-12">
            
            {/* Headline Marquee */}
            <div className="glass-panel p-4 bg-black/40 overflow-hidden whitespace-nowrap border-color/10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="inline-block animate-marquee uppercase text-[11px] font-bold tracking-[0.2em] text-muted/80">
                {mockArticles.map((a, i) => (
                  <span key={i} className="mx-16">
                    <span className="text-accent" style={{ color: 'var(--accent-secondary)' }}>[SIGNAL]</span> {a.title} &bull; {a.source}
                  </span>
                ))}
              </div>
            </div>

            {/* Articles List */}
            {filteredFeed.map((article: Article) => (
              <div key={article.id} className="card-container">
                <ArticleCard 
                  article={article} 
                  onClick={(a: Article) => setSelectedArticle(a)} 
                />
              </div>
            ))}

            {/* Empty State */}
            {filteredFeed.length === 0 && (
              <div className="glass-panel text-center py-40 flex flex-col items-center gap-6 border-dashed">
                <Search size={80} className="text-muted opacity-10" />
                <p className="text-secondary text-lg font-medium tracking-tight">NO SIGNAL DETECTED WITHIN PARAMETERS</p>
                <button 
                  onClick={() => setFilters({ minScore: 0, source: 'All', keywordGroup: 'All', timeWindowH: 72 })}
                  className="text-accent text-xs uppercase tracking-widest font-bold border border-accent/20 px-6 py-3 hover:bg-accent/10 transition-colors"
                >
                  RESET SURVEILLANCE FILTERS
                </button>
              </div>
            )}
          </div>
        </main>
        
        {/* RIGHT: Analysis & Instrumentation Sidebar */}
        <aside className="hidden md:flex feed-right overflow-auto pr-2 custom-scrollbar">
          
          {/* Geo-Spatial Hotspots */}
          <div className="min-h-[300px] shrink-0 card-container">
            <SignalHeatmap articles={filteredFeed} />
          </div>
          
          {/* Volatility Monitor */}
          <div className="glass-panel p-6 bg-tertiary/20 card-container" style={{ background: 'var(--bg-tertiary)' }}>
            <h4 className="text-[11px] font-bold text-muted uppercase mb-6 flex items-center gap-3 tracking-widest">
              <TrendingUp size={14} className="text-accent" /> Signal Volatility
            </h4>
            <div className="flex items-end gap-1.5 h-16">
              {[40, 60, 45, 90, 65, 30, 80, 50, 70, 40].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-accent/20 rounded-t-sm transition-all hover:bg-accent/40" 
                  style={{ 
                    height: `${h}%`, 
                    background: h > 75 ? 'var(--signal-critical)' : 'var(--accent-secondary)',
                    opacity: 0.3 + (i * 0.07)
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* System Telemetry */}
          <div className="glass-panel p-6 bg-tertiary/20 flex items-center justify-between border-accent/10 card-container" style={{ background: 'var(--bg_tertiary)' }}>
            <div className="flex items-center gap-4">
              <Activity size={24} className="text-accent animate-pulse" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <span className="block text-sm font-black uppercase tracking-widest">Signal Latency</span>
                <span className="text-[11px] font-mono text-muted">STABLE: 12ms / 4.2 items-hr</span>
              </div>
            </div>
          </div>
          
          {/* Core Controls */}
          <div className="card-container">
            <Filters filters={filters} setFilters={setFilters} sources={uniqueSources} />
          </div>
          <div className="card-container">
            <PinnedPanel articles={topDevelopments} />
          </div>

          {/* Security Status */}
          <div className="glass-panel p-6 border-dashed border-color/40 card-container" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h4 className="text-[11px] font-bold text-muted uppercase mb-5 flex items-center gap-2">
              <Shield size={14} className="text-success" style={{ color: 'var(--signal-low)' }} /> System Integrity
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-muted">LINK SECURE</span>
                <span className="text-success font-bold" style={{ color: 'var(--signal-low)' }}>AES-256</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-muted">ANALYZER V2.4</span>
                <span className="text-accent" style={{ color: 'var(--accent-secondary)' }}>ONLINE</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. Global Overlays */}
      {selectedArticle && (
        <ArticleAnalysisModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;

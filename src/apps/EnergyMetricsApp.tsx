import React from 'react';
import { Zap, TrendingUp, TrendingDown, Anchor, AlertOctagon, Activity } from 'lucide-react';

const COMMODITIES = [
  { name: 'Brent Crude', price: '$89.45', change: '+4.2%', trend: 'up', critical: true },
  { name: 'WTI Crude', price: '$85.10', change: '+3.8%', trend: 'up', critical: true },
  { name: 'Nat Gas (EU)', price: '€42.20', change: '+1.5%', trend: 'up', critical: false },
  { name: 'Gold', price: '$1,945.80', change: '-0.4%', trend: 'down', critical: false },
];

const INFRASTRUCTURE = [
  { name: 'Strait of Hormuz', status: 'High Risk', desc: 'IRGC naval drills disrupting commercial shipping lanes.', icon: Anchor, color: 'critical', flow: '68%' },
  { name: 'Kharg Island Terminal', status: 'Operational', desc: 'Exports continuing normally, severe air-defense coverage.', icon: Activity, color: 'medium', flow: '100%' },
  { name: 'Abadan Refinery', status: 'Alert Level 4', desc: 'Non-essential personnel evacuated following cyber threat.', icon: AlertOctagon, color: 'high', flow: '85%' }
];

export const EnergyMetricsApp: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-primary p-6 overflow-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8 border-b border-color pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold flex items-center gap-3 text-primary mb-2">
          <Zap size={24} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
          Energy & Infrastructure
        </h2>
        <p className="text-sm text-secondary">Global market reactions and regional infrastructure statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Commodities Column */}
        <div>
          <h3 className="text-sm font-bold text-muted mb-4 uppercase tracking-widest">Global Commodities</h3>
          <div className="grid grid-cols-2 gap-4">
            {COMMODITIES.map((c) => (
              <div 
                key={c.name} 
                className="glass-panel p-4 flex flex-col justify-between group"
                style={{ 
                  borderTop: c.critical ? `2px solid var(--signal-critical)` : `2px solid var(--border-color)`
                }}
              >
                <div className="text-xs text-secondary mb-2">{c.name}</div>
                <div className="text-2xl font-mono text-primary mb-1">{c.price}</div>
                <div className={`text-xs font-bold flex items-center gap-1 ${c.trend === 'up' ? 'text-critical animate-pulse' : 'text-accent'}`} 
                     style={{ color: c.trend === 'up' ? 'var(--signal-critical)' : 'var(--accent-secondary)' }}>
                  {c.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {c.change}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 glass-panel p-4 pb-0 h-40 relative flex items-end justify-between" style={{ borderBottom: 'none' }}>
            {/* Fake SVG Chart representing crude spike */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px)', backgroundSize: '100% 20%' }}></div>
            <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal-critical)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--signal-critical)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,45 L20,40 L40,42 L60,30 L80,10 L100,2" fill="url(#chartGrad)" />
              <polyline points="0,45 20,40 40,42 60,30 80,10 100,2" fill="none" stroke="var(--signal-critical)" strokeWidth="2" />
              {/* Pulsing dot at peak */}
              <circle cx="100" cy="2" r="3" fill="var(--signal-critical)" className="animate-pulse" />
            </svg>
            <span className="absolute top-4 left-4 text-xs font-bold text-muted">Brent 7-Day Trend</span>
          </div>
        </div>

        {/* Infrastructure Column */}
        <div>
          <h3 className="text-sm font-bold text-muted mb-4 uppercase tracking-widest">Key Infrastructure Watch</h3>
          <div className="flex flex-col gap-4">
            {INFRASTRUCTURE.map((inf) => {
              const Icon = inf.icon;
              return (
                <div key={inf.name} className="flex p-4 rounded-lg border border-color bg-tertiary transition-transform hover:scale-[1.02] cursor-default" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="mr-4 mt-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-80" style={{ backgroundColor: `rgba(var(--bg-primary-rgb), 0.5)`, border: `1px solid var(--signal-${inf.color})` }}>
                      <Icon size={18} style={{ color: `var(--signal-${inf.color})` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-primary">{inf.name}</h4>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold`} style={{ borderColor: `var(--signal-${inf.color})`, color: `var(--signal-${inf.color})` }}>
                        {inf.status}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mb-3">{inf.desc}</p>
                    <div className="w-full bg-primary h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <div className="h-full transition-all" style={{ width: inf.flow, backgroundColor: `var(--signal-${inf.color})` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-muted font-mono">
                      <span>Flow Status</span>
                      <span>{inf.flow} Nominal</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

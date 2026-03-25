import React from 'react';
import { Target, MapPin } from 'lucide-react';
import type { Article } from '../types/article';

interface SignalHeatmapProps {
  articles: Article[];
}

export const SignalHeatmap: React.FC<SignalHeatmapProps> = ({ articles }) => {
  // Region bounds for normalization (roughly Iran + neighbors)
  const bounds = {
    latMin: 24, latMax: 40,
    lngMin: 44, lngMax: 64
  };

  const getPos = (lat: number, lng: number) => {
    const x = ((lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100;
    const y = 100 - ((lat - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="glass-panel p-0 overflow-hidden h-[300px] relative bg-[#05070a]">
      {/* Visual background grid */}
      <div className="absolute inset-0 opacity-20 cyber-grid"></div>
      
      {/* Styled Map Background (Simplified SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path 
          d="M100,50 L300,50 L350,150 L300,250 L100,250 L50,150 Z" 
          fill="none" 
          stroke="var(--accent-primary)" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
        />
        <circle cx="200" cy="150" r="120" fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.1" />
        <circle cx="200" cy="150" r="80" fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.1" />
      </svg>

      {/* Structural Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 py-2.5 px-4 flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
          <Target size={12} className="text-secondary" /> REGIONAL SIGNAL HOTSPOTS
        </h4>
        <div className="flex gap-1.5 opacity-40">
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
          <div className="w-1 h-1 rounded-full bg-accent"></div>
          <div className="w-1 h-1 rounded-full bg-accent"></div>
        </div>
      </div>

      {/* Signal Markers */}
      <div className="absolute inset-0 p-8">
        {articles.map((a) => {
          if (!a.location) return null;
          const { x, y } = getPos(a.location.lat, a.location.lng);
          return (
            <div 
              key={a.id}
              className="absolute group cursor-pointer"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            >
              {/* Pulse effect */}
              <div 
                className={`absolute inset-0 w-8 h-8 -m-3 rounded-full opacity-40 animate-ping`}
                style={{ background: `var(--signal-${a.signalLevel})` }}
              ></div>
              
              <MapPin 
                size={16} 
                className="relative z-10 transition-transform group-hover:scale-125" 
                style={{ color: `var(--signal-${a.signalLevel})` }} 
              />

              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tertiary px-2 py-1 rounded text-[9px] font-bold whitespace-nowrap z-20 border border-color" style={{ borderColor: 'var(--border-color)' }}>
                {a.location.label} <span className="text-muted">[{a.signalLevel}]</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-4 flex gap-4 text-[8px] font-mono text-muted">
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-critical" style={{ background: 'var(--signal-critical)' }}></div> CRITICAL</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent" style={{ background: 'var(--accent-secondary)' }}></div> ACTIVE</div>
      </div>
    </div>
  );
};

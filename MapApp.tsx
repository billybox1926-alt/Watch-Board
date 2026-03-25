import React, { useState } from 'react';
import { Target, MapPin, Navigation, Radio } from 'lucide-react';

const MAP_SIGNALS = [
  { id: 1, title: 'Natanz Centrifuge Activity', type: 'critical', x: 65, y: 35, lat: '33.7225° N', lng: '51.7266° E' },
  { id: 2, title: 'Strait of Hormuz Blockade Drill', type: 'high', x: 75, y: 70, lat: '26.5667° N', lng: '56.2500° E' },
  { id: 3, title: 'Fordow Underground Transport', type: 'medium', x: 55, y: 40, lat: '34.8842° N', lng: '50.9958° E' },
  { id: 4, title: 'Air Defense Battery Deployment', type: 'critical', x: 45, y: 55, lat: '35.6892° N', lng: '51.3890° E' },
  { id: 5, title: 'Cyber Command Mobilization', type: 'low', x: 50, y: 45, lat: 'Classified', lng: 'Classified' }
];

export const MapApp: React.FC = () => {
  const [activeSignal, setActiveSignal] = useState<number | null>(null);

  return (
    <div className="flex h-full bg-primary overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Radar Scope Area */}
      <div className="flex-1 relative flex items-center justify-center border-r border-color overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        
        {/* Decorative Radar Grid */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(var(--accent-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-secondary) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* The Radar Circle */}
        <div className="relative rounded-full border border-color flex items-center justify-center" 
             style={{ width: '80%', paddingBottom: '80%', maxHeight: '600px', maxWidth: '600px', borderColor: 'var(--accent-glow)' }}>
          
          <div className="absolute inset-0 rounded-full border border-color opacity-50" style={{ transform: 'scale(0.75)', borderColor: 'var(--accent-glow)' }} />
          <div className="absolute inset-0 rounded-full border border-color opacity-25" style={{ transform: 'scale(0.5)', borderColor: 'var(--accent-glow)' }} />
          <div className="absolute inset-0 rounded-full border border-color opacity-10" style={{ transform: 'scale(0.25)', borderColor: 'var(--accent-glow)' }} />

          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent opacity-30" style={{ transform: 'translateX(-50%)', background: 'var(--accent-secondary)' }} />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-accent opacity-30" style={{ transform: 'translateY(-50%)', background: 'var(--accent-secondary)' }} />

          {/* Render Signals as glowing dots */}
          {MAP_SIGNALS.map((sig) => {
            const isHovered = activeSignal === sig.id;
            const signalColor = `var(--signal-${sig.type})`;

            return (
              <div 
                key={sig.id}
                className="absolute transition-transform cursor-pointer group"
                style={{
                  top: `${sig.y}%`,
                  left: `${sig.x}%`,
                  transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
                  zIndex: isHovered ? 20 : 10
                }}
                onMouseEnter={() => setActiveSignal(sig.id)}
                onMouseLeave={() => setActiveSignal(null)}
              >
                {/* Ping animation effect */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: signalColor, animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) infinite` }} />
                
                {/* Core blip */}
                <div className="relative w-3 h-3 rounded-full" style={{ background: signalColor, boxShadow: `0 0 10px ${signalColor}` }} />

                {/* Tooltip visible only on hover inside the radar scope */}
                <div className={`absolute top-4 left-4 bg-tertiary border border-color rounded px-3 py-2 whitespace-nowrap shadow-lg transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                     style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', zIndex: 30 }}>
                  <p className="text-xs font-bold text-primary mb-1">{sig.title}</p>
                  <p className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {sig.lat}, {sig.lng}</p>
                </div>
              </div>
            );
          })}

          {/* The radar sweep line (reuse index.css keyframe) */}
          <div className="absolute inset-0 rounded-full" 
               style={{ 
                 background: 'conic-gradient(from 0deg, transparent 70%, rgba(14, 165, 233, 0.1) 95%, rgba(14, 165, 233, 0.4) 100%)',
                 animation: 'radar-sweep 4s linear infinite',
               }} 
          />
        </div>
      </div>

      {/* Geospatial Alerts Sidebar */}
      <div className="w-80 flex flex-col bg-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="p-4 border-b border-color" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
            <Target size={20} className="text-accent" style={{ color: 'var(--accent-secondary)' }} />
            Geospatial Log
          </h2>
          <p className="text-xs text-muted mt-1">Live tracking of physical events.</p>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          {MAP_SIGNALS.map((sig) => (
            <div 
              key={sig.id} 
              className="p-3 rounded border border-color cursor-pointer transition-all"
              style={{ 
                background: activeSignal === sig.id ? 'var(--bg-tertiary)' : 'transparent',
                borderColor: activeSignal === sig.id ? `var(--signal-${sig.type})` : 'var(--border-color)',
                transform: activeSignal === sig.id ? 'scale(1.02)' : 'none'
              }}
              onMouseEnter={() => setActiveSignal(sig.id)}
              onMouseLeave={() => setActiveSignal(null)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`badge badge-${sig.type}`}>{sig.type}</span>
                <Radio size={14} className="text-muted animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-primary mb-1">{sig.title}</h4>
              <div className="flex flex-col gap-1 text-xs text-secondary mt-2">
                <span className="flex items-center gap-1"><Navigation size={12} /> LAT: {sig.lat}</span>
                <span className="flex items-center gap-1"><Navigation size={12} className="rotate-90" /> LNG: {sig.lng}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

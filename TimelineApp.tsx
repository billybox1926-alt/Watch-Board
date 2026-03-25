import React from 'react';
import { Clock, ShieldAlert, Crosshair, Flag, AlertTriangle } from 'lucide-react';

const TIMELINE_EVENTS = [
  { id: 1, date: 'Today, 14:30 IRST', title: 'Naval Assets Repositioned', desc: 'Satellite imagery confirms 4 IRGC fast attack craft leaving Bandar Abbas naval base.', icon: Crosshair, type: 'high' },
  { id: 2, date: 'Today, 09:15 IRST', title: 'Uranium Enrichment Spikes', desc: 'IAEA monitors report localized spikes in centrifuge activity at Natanz.', icon: AlertTriangle, type: 'critical' },
  { id: 3, date: 'Yesterday, 22:00 IRST', title: 'Cyber Command Mobilized', desc: 'Anomalous network traffic detected originating from state-sponsored infrastructure.', icon: ShieldAlert, type: 'medium' },
  { id: 4, date: 'Oct 12, 18:45 IRST', title: 'Diplomatic Cables Intercepted', desc: 'Encrypted communication surged between Tehran and allied proxy groups in the Levant.', icon: Flag, type: 'low' },
  { id: 5, date: 'Oct 10, 04:00 IRST', title: 'Air Defense Systems Active', desc: 'S-300 batteries powered on and radar sweeping over sensitive central facilities.', icon: Crosshair, type: 'high' },
];

export const TimelineApp: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-primary relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <div className="mb-8 border-b border-color pb-4 sticky top-0 z-10 bg-primary/90 backdrop-blur" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold flex items-center gap-3 text-primary mb-2">
          <Clock size={24} className="text-accent" style={{ color: 'var(--accent-secondary)' }} />
          Escalation Timeline
        </h2>
        <p className="text-sm text-secondary">Chronological tracker of geopolitical events, military movements, and strategic signals.</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-4 md:pl-8 max-w-3xl mx-auto w-full">
        {/* The central line */}
        <div className="absolute top-0 bottom-0 left-[27px] md:left-[43px] w-0.5 bg-accent opacity-20" style={{ background: 'var(--accent-secondary)' }} />

        <div className="flex flex-col gap-8">
          {TIMELINE_EVENTS.map((event, index) => {
            const Icon = event.icon;
            const isLatest = index === 0;

            return (
              <div key={event.id} className="relative flex gap-6 items-start group">
                
                {/* Node */}
                <div className="relative z-10 flex-shrink-0">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform ${isLatest ? 'animate-pulse scale-110' : 'group-hover:scale-110'}`}
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: `var(--signal-${event.type})`,
                      boxShadow: isLatest ? `0 0 20px rgba(0,0,0,0.5), inset 0 0 10px var(--signal-${event.type})` : '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Icon size={16} style={{ color: `var(--signal-${event.type})` }} />
                  </div>
                </div>

                {/* Content Card */}
                <div 
                  className="flex-1 glass-panel p-5 relative mt-1"
                  style={{ 
                    borderLeft: `3px solid var(--signal-${event.type})`,
                    transition: 'transform 0.2s',
                  }}
                >
                  {/* Small triangular pointer piece */}
                  <div className="absolute w-3 h-3 bg-tertiary rotate-45 -left-1.5 top-4 border-l border-b border-color" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} />
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-muted tracking-wide flex items-center gap-1">
                      <Clock size={10} /> {event.date}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border opacity-80`} style={{ borderColor: `var(--signal-${event.type})`, color: `var(--signal-${event.type})` }}>
                      {event.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-primary mb-2 shadow-sm">{event.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{event.desc}</p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

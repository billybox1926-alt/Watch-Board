import React, { useState, useEffect } from 'react';
import { Globe, Terminal, ShieldAlert, Radio, Hash, Activity } from 'lucide-react';

const INTERCEPTS = [
  { id: 1, source: 'Telegram / Regional Channel', time: 'Just now', text: 'Unverified reports of heavy transport movement near northern facilities.', threat: 'high' },
  { id: 2, source: 'Dark Web Monitor', time: '2m ago', text: 'Chatter intercepted regarding zero-day exploit targeting regional desalination plants.', threat: 'critical' },
  { id: 3, source: 'Automated Sat-Bot', time: '5m ago', text: 'Commercial satellite imagery confirms potential structural changes at Site 4.', threat: 'medium' },
  { id: 4, source: 'X / Defense Analyst', time: '12m ago', text: 'Naval assets spotted repositioning in the Gulf. Standard drill or escalation?', threat: 'low' },
  { id: 5, source: 'SIGINT Decrypt', time: '15m ago', text: 'Encrypted VHF bursts detected from mobile launch units across the border.', threat: 'critical' },
  { id: 6, source: 'Public Flight Tracker', time: '22m ago', text: 'Sudden rerouting of 4 commercial flights away from the central airspace corridor.', threat: 'high' },
];

const INTERCEPTS_DATA = Array.from({ length: 20 }).map((_, i) => ({
  id: (1710921600000 - i * 1420).toString(16).toUpperCase(),
  code: Math.random().toString(36).substring(2, 15).toUpperCase(),
  match: Math.random() > 0.5 ? 'MATCH' : 'NULL'
}));

export const OsintApp: React.FC = () => {
  const [glitchText, setGlitchText] = useState('FETCHING_SECURE_NODE...');
  const intercepts = INTERCEPTS_DATA;

  // Matrix-like decorative effect
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        let result = '';
        for (let i = 0; i < 28; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGlitchText(result);
      } else {
        setGlitchText('MONITORING_GLOBAL_CHANNELS...');
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full bg-primary overflow-hidden flex-col md:flex-row" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Raw Intercept Terminal */}
      <div className="w-full md:w-1/3 border-r border-color flex flex-col relative" style={{ borderColor: 'var(--border-color)', background: '#020202' }}>
        <div className="p-4 border-b border-color flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-accent" style={{ color: 'var(--accent-secondary)' }}>
            <Terminal size={16} /> RAW INTERCEPTS
          </h3>
          <Radio size={14} className="text-critical animate-pulse" style={{ color: 'var(--signal-critical)' }} />
        </div>
        
        <div className="flex-1 p-4 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--accent-secondary) 2px, var(--accent-secondary) 4px)' }}></div>
          
          <div className="text-xs font-mono break-all flex flex-col gap-1 opacity-70" style={{ color: 'var(--accent-secondary)', textShadow: '0 0 5px var(--accent-secondary)' }}>
            <p className="mb-4 text-white">&gt; SYSTEM INIT: OSINT_ENGINE v2.4</p>
            <p className="mb-2 text-white">&gt; {glitchText}</p>
            
            {intercepts.map((intercept, i) => (
              <p key={i} className="whitespace-nowrap overflow-hidden" style={{ opacity: 1 - (i * 0.05) }}>
                [{intercept.id}] DECRYPT: {intercept.code} ... {intercept.match}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Social/Web Feed */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <Globe size={24} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
              OSINT Signal Stream
            </h2>
            <p className="text-sm text-secondary">Aggregated open-source and dark web intelligence.</p>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-critical animate-pulse">2 Critical Threads</span>
            <span className="badge badge-low">Live</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {INTERCEPTS.map((intercept) => (
            <div 
              key={intercept.id} 
              className="glass-panel group"
              style={{
                transition: 'transform 0.2s',
                borderLeft: `4px solid var(--signal-${intercept.threat})`
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-tertiary flex items-center justify-center border border-color text-muted" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                    {intercept.source.includes('Dark Web') ? <ShieldAlert size={14} /> : intercept.source.includes('Sat') ? <Globe size={14} /> : <Hash size={14} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">{intercept.source}</h4>
                    <span className="text-xs text-muted block">{intercept.time}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase`} style={{ color: `var(--signal-${intercept.threat})` }}>
                  {intercept.threat} ALERT
                </span>
              </div>
              
              <p className="text-sm text-secondary leading-relaxed">
                {intercept.text}
              </p>

              <div className="mt-4 pt-3 flex gap-4 text-xs font-semibold text-muted border-t border-color" style={{ borderColor: 'var(--border-color)' }}>
                <span className="flex items-center gap-1 hover:text-accent cursor-pointer transition-colors"><Activity size={12} /> Analyze Source</span>
                <span className="flex items-center gap-1 hover:text-accent cursor-pointer transition-colors"><ShieldAlert size={12} /> Cross-Reference</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

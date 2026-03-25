import { ShieldAlert, Server, ShieldX, TerminalSquare, Activity, Globe, Zap, Cpu, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES & MOCKS
// ─────────────────────────────────────────────────────────────────────────────

interface CyberEvent {
  id: number;
  target: string;
  type: string;
  origin: string;
  ip: string;
  port: number;
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED' | 'COMPROMISED';
  severity: 'critical' | 'high' | 'medium' | 'low';
  x: number; // For the map (0-100)
  y: number; // For the map (0-100)
}

const INITIAL_EVENTS: CyberEvent[] = [
  { id: 1, target: 'Natanz ICS Pipeline', type: 'Stuxnet-3 Variant', origin: 'Unknown Proxy', ip: '185.22.10.4', port: 502, status: 'ACTIVE', severity: 'critical', x: 55, y: 38 },
  { id: 2, target: 'Tehran Municipal Grid', type: 'Volumetric DDoS', origin: 'Botnet-Sigma', ip: '45.122.90.11', port: 80, status: 'MITIGATING', severity: 'high', x: 52, y: 32 },
  { id: 3, target: 'IRGC SCADA System', type: 'Zero-Day Exploit', origin: 'Black Team', ip: '201.44.11.233', port: 4444, status: 'ACTIVE', severity: 'critical', x: 48, y: 42 },
  { id: 4, target: 'Bandar Abbas Port Auth', type: 'LockBit Ransomware', origin: 'Darkside Proxy', ip: '91.103.4.19', port: 3389, status: 'COMPROMISED', severity: 'critical', x: 58, y: 55 },
  { id: 5, target: 'Central Bank Gateway', type: 'BGP Hijacking', origin: 'AS12345 (RU)', ip: '5.8.12.101', port: 179, status: 'RESOLVED', severity: 'low', x: 50, y: 30 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const StatusGauge: React.FC<{ label: string; value: number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="cyber-panel p-3 rounded-lg flex flex-col gap-2">
    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted">
      <span className="flex items-center gap-1.5">{icon} {label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
      <div 
        className="h-full transition-all duration-1000" 
        style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} 
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const CyberApp = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [threats, setThreats] = useState<CyberEvent[]>(INITIAL_EVENTS);
  const [systemHealth, setSystemHealth] = useState(64);
  const [selectedThreat, setSelectedThreat] = useState<CyberEvent | null>(INITIAL_EVENTS[0]);
  const [pulse, setPulse] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling terminal logs
  useEffect(() => {
    const actions = ['PACKET_DROP', 'IP_TRACE', 'FW_REJECT', 'HANDSHAKE_ERR', 'NULL_ROUTE', 'SYSLOG_ALERT', 'DPI_MATCH'];
    const interval = setInterval(() => {
      setLogs(prev => {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const action = actions[Math.floor(Math.random() * actions.length)];
        const ip = `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        const newLog = `[${time}] ${action} SRC_IP:${ip} TGT_PORT:${Math.floor(Math.random()*1024 + 1)}`;
        return [newLog, ...prev].slice(0, 30);
      });
      // Slight fluctuation in health
      setSystemHealth(h => Math.max(10, Math.min(100, h + (Math.random() - 0.52) * 2)));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulseInt = setInterval(() => setPulse(p => p + 1), 2000);
    return () => clearInterval(pulseInt);
  }, []);

  const handleMitigate = (id: number) => {
    setThreats(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'RESOLVED' ? 'ACTIVE' : 'MITIGATING' } : t
    ));
    
    // Simulate resolution after delay
    setTimeout(() => {
      setThreats(prev => prev.map(t => 
        t.id === id && t.status === 'MITIGATING' ? { ...t, status: 'RESOLVED', severity: 'low' } : t
      ));
      setSystemHealth(h => Math.min(100, h + 10));
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#020408] text-[#00ffcc] relative overflow-hidden cyber-grid">
      {/* Scanline Overlay */}
      <div className="cyber-scanline" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b bg-black/40 backdrop-blur-md z-20" style={{ borderColor: 'rgba(0, 255, 204, 0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShieldAlert size={28} className="neon-text-cyan animate-pulse" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase neon-text-cyan glitch-text" data-text="CYBER COMMAND">CYBER COMMAND</h2>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400/60 flex items-center gap-2">
              <span className="flex items-center gap-1"><Lock size={10} /> ENCRYPTION: AES-XTS-256</span>
              <span className="text-white/20">|</span>
              <span>UPLINK: ACTIVE DISCAR</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted mb-0.5 tracking-widest">Threat Index</div>
            <div className="text-lg font-mono font-bold leading-none text-red-500">ALPHA-9</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="badge badge-critical animate-flicker">NET_WAR_ALERT</span>
            <span className="text-[9px] font-mono mt-1 text-red-400/70">SIGINT OVERFLOW DETECTED</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden z-10">
        
        {/* ━━ LEFT: THREAT MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-[35%] border-r relative overflow-hidden bg-black/20" style={{ borderColor: 'rgba(0, 255, 204, 0.1)' }}>
          <div className="absolute inset-0 opacity-30 flex items-center justify-center p-8">
            {/* Mock Global/Regional Network SVG */}
            <svg viewBox="0 0 100 60" className="w-full h-full text-cyan-500/20 stroke-current fill-none">
              <path d="M10,30 Q30,10 50,30 T90,30" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M20,10 Q50,40 80,10" strokeWidth="0.3" strokeDasharray="1 3" />
              <path d="M10,50 Q40,20 90,50" strokeWidth="0.3" strokeDasharray="4 1" />
              <circle cx="50" cy="35" r="15" strokeWidth="0.2" fill="none" opacity="0.3" />
              <circle cx="50" cy="35" r="25" strokeWidth="0.1" fill="none" opacity="0.2" />
            </svg>
          </div>

          <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/60 mb-4 flex items-center gap-2">
              <Globe size={12} /> Global Intrusion Vector Map
            </h3>
            
            <div className="flex-1 relative">
              {threats.map(t => (
                <div 
                  key={t.id}
                  className="absolute cursor-pointer pointer-events-auto transition-transform hover:scale-125"
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                  onClick={() => setSelectedThreat(t)}
                >
                  <div className={`relative flex items-center justify-center`}>
                    <div 
                      className={`absolute rounded-full animate-ping`}
                      style={{ 
                        width: 20, height: 20, 
                        backgroundColor: t.severity === 'critical' ? 'var(--signal-critical)' : '#00ffcc',
                        opacity: 0.4 
                      }} 
                    />
                    <div 
                      className="w-2.5 h-2.5 rounded-full z-10 ring-2 ring-black"
                      style={{ 
                        backgroundColor: t.severity === 'critical' ? 'var(--signal-critical)' : '#00ffcc',
                        boxShadow: `0 0 10px ${t.severity === 'critical' ? 'var(--signal-critical)' : '#00ffcc'}` 
                      }} 
                    />
                  </div>
                  {selectedThreat?.id === t.id && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 cyber-panel px-2 py-1 rounded text-[8px] whitespace-nowrap z-30 neon-border-cyan">
                      {t.target}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-auto p-4 cyber-panel rounded-lg border-l-2 border-l-cyan-400">
               <div className="text-[10px] uppercase font-bold mb-1 opacity-70">Node Integrity</div>
               <div className="flex justify-between font-mono text-xs">
                 <span>TEH_01: NOMINAL</span>
                 <span>MSH_04: BYPASS</span>
                 <span>ABD_02: FAULT</span>
               </div>
            </div>
          </div>
        </div>

        {/* ━━ CENTER: ADVANCED TERMINAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/40">
          <div className="px-4 py-2 border-b flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-400/60 bg-black/40" style={{ borderColor: 'rgba(0, 255, 204, 0.1)' }}>
            <span className="flex items-center gap-2"><TerminalSquare size={12} /> Live Traffic Stream</span>
            <span className="flex items-center gap-1.5"><Activity size={10} className="animate-pulse" /> 14.8 GB/s</span>
          </div>
          
          <div 
            ref={terminalRef}
            className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-auto scroll-smooth"
            style={{ color: '#00ff00', textShadow: '0 0 5px rgba(0,255,0,0.3)' }}
          >
            {logs.map((log, i) => (
              <div key={i} className="mb-0.5 flex gap-3">
                <span className="opacity-30 flex-shrink-0">{(logs.length - i).toString().padStart(4, '0')}</span>
                <span className={log.includes('CRITICAL') || log.includes('match') ? 'text-red-400' : ''}>{log}</span>
              </div>
            ))}
            <div className="h-4 animate-pulse">█_</div>
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(0, 255, 204, 0.1)' }}>
            <div className="cyber-panel p-3 rounded flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="h-8 w-8 rounded bg-cyan-400/10 flex items-center justify-center">
                    <Zap size={16} />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold uppercase text-muted">Auto-Defense Script</div>
                    <div className="text-xs font-mono">B-GRID_V5.EXE - RUNNING</div>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button className="px-3 py-1 text-[10px] font-bold border border-cyan-400/30 rounded bg-cyan-400/5 hover:bg-cyan-400/20 uppercase">Purge</button>
                 <button className="px-3 py-1 text-[10px] font-bold border border-red-400/30 rounded bg-red-400/5 hover:bg-red-400/20 uppercase text-red-400">Kill All</button>
               </div>
            </div>
          </div>
        </div>

        {/* ━━ RIGHT: SYSTEM HEALTH & CONTROLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-[30%] border-l flex flex-col overflow-hidden bg-black/30" style={{ borderColor: 'rgba(0, 255, 204, 0.1)' }}>
          <div className="p-5 flex flex-col gap-6 overflow-auto">
            
            {/* System Gauges */}
            <div className="flex flex-col gap-3">
              <StatusGauge label="System Integrity" value={systemHealth} color={systemHealth > 70 ? '#00ffcc' : systemHealth > 40 ? '#facc15' : '#ff3366'} icon={<Cpu size={12} />} />
              <StatusGauge label="Neural Proxy Shield" value={88} color="#00ffcc" icon={<ShieldAlert size={12} />} />
              <StatusGauge label="Traffic Load" value={Math.floor(pulse % 100)} color="#3b82f6" icon={<Activity size={12} />} />
            </div>

            {/* Selected Threat Detail */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted border-b border-white/5 pb-1 flex items-center gap-2">
                <AlertTriangle size={12} /> Target Intelligence
              </h4>
              
              {selectedThreat ? (
                <div className="cyber-panel p-4 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldX size={48} />
                  </div>
                  <div className="relative z-10">
                    <div className="text-lg font-bold text-white mb-1 leading-tight">{selectedThreat.target}</div>
                    <div className="text-[10px] font-mono text-cyan-400/70 mb-4">{selectedThreat.ip}:{selectedThreat.port}</div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-muted mb-1">Vector Type</div>
                        <div className="text-[11px] font-bold">{selectedThreat.type}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-muted mb-1">Status</div>
                        <div className={`text-[11px] font-bold ${selectedThreat.status === 'RESOLVED' ? 'text-green-400' : 'text-red-400'}`}>{selectedThreat.status}</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleMitigate(selectedThreat.id)}
                      disabled={selectedThreat.status === 'RESOLVED' || selectedThreat.status === 'MITIGATING'}
                      className={`w-full py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all ${
                        selectedThreat.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        selectedThreat.status === 'MITIGATING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 cursor-wait' :
                        'bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/40 neon-border-cyan'
                      }`}
                    >
                      {selectedThreat.status === 'RESOLVED' ? <span className="flex items-center justify-center gap-2"><Lock size={12} /> Threat Neutralized</span> : 
                       selectedThreat.status === 'MITIGATING' ? 'Sequencing Mitigation...' : 
                       'Execute Counter-Strike'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[10px] text-muted italic border-2 border-dashed border-white/5 rounded-xl">
                  Select a threat node to begin analysis
                </div>
              )}
            </div>

            {/* Vector List (Scrollable) */}
             <div className="flex flex-col gap-2">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted border-b border-white/5 pb-1">Active Threat list</h4>
              {threats.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedThreat(t)}
                  className={`p-2 rounded border transition-colors cursor-pointer flex items-center justify-between ${selectedThreat?.id === t.id ? 'bg-cyan-400/10 border-cyan-400/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'RESOLVED' ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
                    <span className="text-[10px] font-bold truncate max-w-[120px]">{t.target}</span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${t.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {t.severity}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* ── FOOTER STATUS BAR ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 h-8 border-t bg-black/60 backdrop-blur flex items-center justify-between px-6 text-[9px] font-mono font-bold tracking-wider" style={{ borderColor: 'rgba(0, 255, 204, 0.2)' }}>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-cyan-400"><Activity size={10} /> LATENCY: 24ms</span>
          <span className="flex items-center gap-1.5 text-cyan-400"><Zap size={10} /> BPS: 124.9 MB</span>
          <span className="text-white/20">|</span>
          <span className="text-muted">USER: COMMAND_ADMIN_01</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted italic">AWAITING INPUT...</span>
          <div className="flex items-center gap-1 uppercase">
            <Unlock size={10} className="text-red-500" /> System Unlocked
          </div>
        </div>
      </div>
    </div>
  );
};

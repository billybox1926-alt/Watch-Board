import { Plane, Radio, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const FLIGHTS = [
  { id: 'IR655', x: 45, y: 30, heading: 45, status: 'civilian', color: '#0ea5e9' },
  { id: 'EK940', x: 60, y: 55, heading: 120, status: 'civilian', color: '#0ea5e9' },
  { id: 'QR322', x: 50, y: 80, heading: 90, status: 'civilian', color: '#0ea5e9' },
  { id: 'UFO-1', x: 30, y: 40, heading: 210, status: 'unknown', color: '#eab308' },
];

export const FlightApp = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setRotation(r => (r + 5) % 360), 50);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex bg-primary h-full overflow-hidden" style={{ backgroundColor: '#020617' }}>
      
      {/* Radar Console */}
      <div className="flex-1 relative border-r border-color flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* Radar Ring */}
        <div className="relative w-full max-w-md aspect-square rounded-full border-2 overflow-hidden flex items-center justify-center" style={{ borderColor: 'var(--accent-glow)', boxShadow: '0 0 40px rgba(14,165,233,0.1) inset' }}>
          
          {/* Sweep */}
          <div className="absolute inset-0 origin-center" style={{ transform: `rotate(${rotation}deg)` }}>
             <div className="absolute top-0 right-1/2 bottom-1/2 left-0" style={{ background: 'conic-gradient(from 180deg at 100% 100%, transparent 0deg, rgba(14,165,233,0.5) 90deg)', borderRight: '2px solid rgba(14,165,233,0.8)' }} />
          </div>

          <div className="absolute w-full h-px bg-accent opacity-30" />
          <div className="absolute h-full w-px bg-accent opacity-30" />
          <div className="absolute inset-4 rounded-full border border-color opacity-30" />
          <div className="absolute inset-16 rounded-full border border-color opacity-30" />
          <div className="absolute inset-32 rounded-full border border-color opacity-30" />

          {/* Flights */}
          {FLIGHTS.map(f => (
            <div key={f.id} className="absolute flex flex-col items-center justify-center transition-all duration-1000" style={{ left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%, -50%)' }}>
              <Plane size={16} fill={f.color} color={f.color} style={{ transform: `rotate(${f.heading - 45}deg)`, filter: `drop-shadow(0 0 5px ${f.color})` }} />
              <span className="text-[9px] font-mono mt-1 px-1 bg-black/50 rounded" style={{ color: f.color }}>{f.id}</span>
            </div>
          ))}

          {/* Declared No-Fly Zone */}
          <div className="absolute border border-critical bg-critical/10 animate-pulse rounded-full" style={{ left: '20%', top: '25%', width: '120px', height: '120px', borderColor: 'var(--signal-critical)' }} />
        </div>
      </div>

      {/* Flight Logs Sidebar */}
      <div className="w-80 bg-secondary flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="p-4 border-b border-color">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Radio size={20} className="text-accent" /> AIRSPACE RADAR
          </h2>
          <div className="text-xs text-muted mt-1 font-mono">ADS-B TRANSPONDER FEED</div>
        </div>
        <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
          <div className="p-3 bg-critical/10 border border-critical rounded flex items-center gap-3">
            <AlertTriangle size={20} className="text-critical" />
            <div className="text-xs text-primary">
              <strong className="block text-critical">NO-FLY ZONE ACTIVE</strong>
              Classified airspace declared restricted above coordinates 35.68N, 51.38E.
            </div>
          </div>
          
          <h3 className="text-xs font-bold text-muted uppercase mt-4 mb-1">Active Squawks</h3>
          {FLIGHTS.map(f => (
            <div key={f.id} className="flex justify-between items-center py-2 border-b border-color font-mono text-xs">
              <span className="text-primary font-bold" style={{ color: f.color }}>{f.id}</span>
              <span className="text-muted">{f.status.toUpperCase()}</span>
              <span className="text-secondary">HDG: {f.heading}°</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

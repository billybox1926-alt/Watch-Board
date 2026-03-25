import { Eye, Navigation, Radio, Crosshair } from 'lucide-react';
import { useState, useEffect } from 'react';

const DRONES = [
  { id: 'UAV-ALPHA-7', model: 'MQ-9 Reaper', alt: 12500, speed: 230, fuel: 72, loiter: '4h 12m', lat: 26.1, lng: 56.8, status: 'LOITERING', target: 'Vessel Cluster Delta-3' },
  { id: 'UAV-BRAVO-2', model: 'RQ-4 Global Hawk', alt: 55000, speed: 575, fuel: 61, loiter: '11h 40m', lat: 30.5, lng: 49.2, status: 'TRANSIT', target: 'Wide-Area Surveillance' },
  { id: 'UAV-CHARLIE-4', model: 'Bayraktar TB2', alt: 7500, speed: 130, fuel: 34, loiter: '0h 50m', lat: 34.9, lng: 51.0, status: 'RTB', target: 'None' },
];

export const DroneApp = () => {
  const [activeDrone, setActiveDrone] = useState(DRONES[0]);
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setScanAngle(a => (a + 4) % 360), 40);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex h-full bg-[#020b10] text-cyan-100 overflow-hidden">
      {/* Drone Roster */}
      <div className="w-64 border-r border-cyan-900/30 flex flex-col p-4 gap-3">
        <div className="text-xs font-mono font-bold pb-2 border-b border-cyan-900/30 text-cyan-400/70 uppercase tracking-widest">Active UAVs</div>
        {DRONES.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDrone(d)}
            className="text-left p-3 rounded border transition-all hover:scale-105"
            style={{
              borderColor: activeDrone.id === d.id ? 'rgba(34,211,238,0.6)' : 'rgba(34,211,238,0.1)',
              background: activeDrone.id === d.id ? 'rgba(34,211,238,0.08)' : 'transparent'
            }}
          >
            <div className="text-xs font-mono font-bold text-cyan-300 mb-1 flex items-center gap-1">
              <Radio size={10} className={d.status === 'LOITERING' ? 'animate-pulse' : ''} /> {d.id}
            </div>
            <div className="text-[10px] text-cyan-400/60">{d.model}</div>
            <div className="text-[10px] mt-1" style={{ color: d.status === 'RTB' ? 'var(--signal-medium)' : d.status === 'LOITERING' ? 'var(--signal-critical)' : 'var(--signal-low)' }}>● {d.status}</div>
          </button>
        ))}
      </div>

      {/* Telemetry Panel */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-300">
            <Eye size={22} /> UAV SURVEILLANCE — {activeDrone.id}
          </h2>
          <span className="badge badge-critical text-xs animate-pulse">LIVE FEED</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Altitude', value: `${activeDrone.alt.toLocaleString()} ft` },
            { label: 'Speed', value: `${activeDrone.speed} kts` },
            { label: 'Fuel', value: `${activeDrone.fuel}%` },
            { label: 'Loiter Remaining', value: activeDrone.loiter }
          ].map(metric => (
            <div key={metric.label} className="glass-panel p-4 text-center">
              <div className="text-xl font-mono font-bold text-white">{metric.value}</div>
              <div className="text-[10px] text-muted mt-1 uppercase tracking-widest">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Thermal View Mockup */}
        <div className="glass-panel p-4 relative overflow-hidden" style={{ height: '200px' }}>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 60%, rgba(255,80,0,0.4) 0%, rgba(200,40,0,0.1) 30%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(255,120,0,0.2) 0%, transparent 40%), #050505'
          }} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,255,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {/* Crosshair on hotspot */}
          <div className="absolute" style={{ top: '55%', left: '28%' }}>
            <Crosshair size={28} style={{ color: '#ff4500', filter: 'drop-shadow(0 0 8px #ff4500)' }} />
          </div>
          <div className="absolute inset-0 border border-cyan-400/10 flex items-start justify-between p-3">
            <span className="text-[10px] font-mono text-cyan-400/70">THERMAL · IR MODE</span>
            <span className="text-[10px] font-mono text-orange-400">TARGET: {activeDrone.target}</span>
          </div>
          {/* Pan/Gimbal sweep */}
          <div className="absolute bottom-3 left-3 text-[9px] font-mono text-cyan-400/50">{activeDrone.lat.toFixed(4)}°N {activeDrone.lng.toFixed(4)}°E · GIMBAL: {scanAngle}°</div>
        </div>
      </div>
    </div>
  );
};

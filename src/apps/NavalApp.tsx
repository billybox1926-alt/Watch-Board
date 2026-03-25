import { Anchor, AlertTriangle, Radio, Navigation } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const NAVAL_ASSETS = [
  {
    id: 'csg-12',
    name: 'USS Gerald R. Ford (CVN-78)',
    shortId: 'CVN-78',
    type: 'US Navy',
    class: 'Ford-class Carrier',
    status: 'Loitering',
    heading: 47,
    speedKts: 12,
    threat: 'medium',
    // normalized 0–100 within patrol zone (Arabian Sea / Strait of Hormuz region)
    x: 68,
    y: 42,
    weapons: 'F/A-18, Tomahawk, CIWS',
    note: 'CSG-12 holding station 220nm SE of Hormuz. CAP sorties elevated.',
  },
  {
    id: 'sub-flotilla',
    name: 'Kilo-class Submarine Flotilla',
    shortId: 'IRIN-SUB',
    type: 'IRIN',
    class: 'Kilo-class (×3)',
    status: 'Submerged',
    heading: 290,
    speedKts: 8,
    threat: 'critical',
    x: 34,
    y: 55,
    weapons: 'Torpedo, Mines, Kalibr (est.)',
    note: 'Lost acoustic contact 6h ago. Last known depth 280ft. Hazard to shipping.',
  },
  {
    id: 'fac-swarm',
    name: 'Fast Attack Craft Swarm',
    shortId: 'IRGC-FAC',
    type: 'IRGC Navy',
    class: 'Boghammar / Thondor (×8)',
    status: 'Intercept Course',
    heading: 135,
    speedKts: 34,
    threat: 'high',
    x: 44,
    y: 48,
    weapons: 'RPG, Anti-ship missiles, Mines',
    note: 'Swarm executing harassment pattern near TSS separation scheme.',
  },
  {
    id: 'amphibious',
    name: 'USS Bataan Amphibious Group',
    shortId: 'ARG-5',
    type: 'US Navy',
    class: 'Wasp-class LHD + escorts',
    status: 'Transit',
    heading: 340,
    speedKts: 18,
    threat: 'low',
    x: 76,
    y: 68,
    weapons: 'AV-8B Harrier, MV-22, ESSM',
    note: 'ARG-5 transiting Gulf of Oman, ETA Strait 28h.',
  },
  {
    id: 'tanker-convoy',
    name: 'Commercial Tanker Convoy',
    shortId: 'TCN-07',
    type: 'Civilian',
    class: 'VLCC / LNG Tankers (×5)',
    status: 'Escorted',
    heading: 270,
    speedKts: 10,
    threat: 'medium',
    x: 55,
    y: 62,
    weapons: '—',
    note: 'UK frigate escort. Transit under heightened threat. UKMTO advisory issued.',
  },
  {
    id: 'ssn-block',
    name: 'USS Springfield (SSN-761)',
    shortId: 'SSN-761',
    type: 'US Navy',
    class: 'Los Angeles-class SSN',
    status: 'Patrol',
    heading: 180,
    speedKts: 6,
    threat: 'low',
    x: 60,
    y: 35,
    weapons: 'Mk-48 Torpedo, Tomahawk TLAM',
    note: 'SSN-761 conducting barrier patrol north of shipping lane. Silent running.',
  },
];

const THREAT_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const EVENTS = [
  { id: 1, time: '15:51 UTC', msg: 'IRGC-FAC swarm vectored onto TSS separation scheme — FLASH traffic', severity: 'critical' },
  { id: 2, time: '15:44 UTC', msg: 'Acoustic contact on IRIN Kilo-class lost — submerged sprint suspected', severity: 'high' },
  { id: 3, time: '15:30 UTC', msg: 'CVN-78 increases CAP sortie rate to 6/hr — readiness BRAVO', severity: 'medium' },
  { id: 4, time: '15:11 UTC', msg: 'UKMTO advisory: Vessels avoid areas 24°N–26°N, 56°E–57°E', severity: 'high' },
  { id: 5, time: '14:58 UTC', msg: 'ARG-5 received alert order — amphibious landing rehearsal suspended', severity: 'medium' },
  { id: 6, time: '14:22 UTC', msg: 'Commercial tanker TCN-07 requested armed escort at Gulf of Oman entry', severity: 'low' },
];

const SEV_COLOR: Record<string, string> = {
  critical: 'var(--signal-critical)',
  high: 'var(--signal-high)',
  medium: 'var(--signal-medium)',
  low: 'var(--signal-low)',
};

export const NavalApp = () => {
  const [sonarSweep, setSonarSweep] = useState(0);
  const [selected, setSelected] = useState<string | null>('csg-12');
  const [ping, setPing] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const int = setInterval(() => setSonarSweep(s => (s + 1.5) % 360), 30);
    return () => clearInterval(int);
  }, []);

  // Occasional sonar ping highlight
  useEffect(() => {
    const int = setInterval(() => {
      const asset = NAVAL_ASSETS[Math.floor(Math.random() * NAVAL_ASSETS.length)];
      setPing({ x: asset.x, y: asset.y });
      setTimeout(() => setPing(null), 1200);
    }, 3000);
    return () => clearInterval(int);
  }, []);

  const selectedAsset = NAVAL_ASSETS.find(a => a.id === selected);

  return (
    <div className="h-full flex flex-col bg-[#000d18] overflow-hidden text-blue-100" style={{ fontFamily: 'monospace' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-blue-900/50 bg-black/40 flex-shrink-0">
        <h2 className="text-sm font-bold flex items-center gap-2 tracking-widest text-blue-300">
          <Anchor size={15} /> NAVAL FLEET TRACKER — STRAIT OF HORMUZ AOR
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-red-400 animate-pulse">
            <AlertTriangle size={11} /> 1 CONTACT LOST
          </span>
          <span className="text-[10px] text-blue-400/60 border border-blue-900 px-2 py-0.5 rounded">{NAVAL_ASSETS.length} ASSETS TRACKED</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT: Sonar Map ── */}
        <div className="flex-1 relative flex items-center justify-center bg-[#000d18] overflow-hidden" ref={mapRef}>
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="naval-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#naval-grid)" />
          </svg>

          {/* Sonar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[80, 60, 40, 20].map(r => (
              <div key={r} className="absolute rounded-full border border-blue-500/15"
                style={{ width: `${r}%`, height: `${r}%` }} />
            ))}
            {/* Cross hairs */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-blue-500/15" />
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-blue-500/15" />
          </div>

          {/* Sonar sweep */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full relative" style={{ transform: `rotate(${sonarSweep}deg)` }}>
              <div className="absolute inset-0"
                style={{ background: 'conic-gradient(from -90deg, transparent 0deg, rgba(59,130,246,0.18) 60deg, transparent 61deg)' }} />
              <div className="absolute top-1/2 left-1/2 w-px bg-blue-400/60" style={{ height: '50%', transformOrigin: 'top', transform: 'translateX(-50%)' }} />
            </div>
          </div>

          {/* Region labels */}
          <span className="absolute top-3 left-3 text-[9px] text-blue-400/30 tracking-widest">PERSIAN GULF</span>
          <span className="absolute bottom-3 right-3 text-[9px] text-blue-400/30 tracking-widest">ARABIAN SEA</span>
          <span className="absolute top-3 right-3 text-[9px] text-blue-400/30 tracking-widest">GULF OF OMAN</span>

          {/* Asset blips */}
          {NAVAL_ASSETS.map(asset => {
            const color = THREAT_COLOR[asset.threat];
            const isSelected = selected === asset.id;
            const isPinging = ping && ping.x === asset.x && ping.y === asset.y;

            return (
              <button
                key={asset.id}
                onClick={() => setSelected(asset.id)}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{ left: `${asset.x}%`, top: `${asset.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Ping ring */}
                {isPinging && (
                  <div className="absolute rounded-full border-2 animate-ping"
                    style={{ width: 28, height: 28, borderColor: color, opacity: 0.6 }} />
                )}
                {/* Selection ring */}
                {isSelected && (
                  <div className="absolute rounded-full border"
                    style={{ width: 24, height: 24, borderColor: color, opacity: 1 }} />
                )}
                {/* Blip */}
                <div className="rounded-full transition-all duration-200"
                  style={{
                    width: isSelected ? 12 : 9,
                    height: isSelected ? 12 : 9,
                    backgroundColor: color,
                    boxShadow: `0 0 ${isSelected ? 14 : 8}px ${color}`,
                  }} />
                {/* Label */}
                <span className="text-[8px] mt-1 px-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,13,24,0.85)', color, border: `1px solid ${color}44` }}>
                  {asset.shortId}
                </span>
                {/* Always-on label for selected */}
                {isSelected && (
                  <span className="text-[8px] mt-1 px-1 rounded whitespace-nowrap"
                    style={{ background: 'rgba(0,13,24,0.85)', color, border: `1px solid ${color}66` }}>
                    {asset.shortId}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-72 flex flex-col border-l border-blue-900/40 bg-[#000a14] overflow-hidden flex-shrink-0">

          {/* Selected vessel detail */}
          {selectedAsset ? (
            <div className="p-3 border-b border-blue-900/40 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-blue-400/50 tracking-widest uppercase">Selected Asset</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{ backgroundColor: THREAT_COLOR[selectedAsset.threat] + '22', color: THREAT_COLOR[selectedAsset.threat], border: `1px solid ${THREAT_COLOR[selectedAsset.threat]}44` }}>
                  {selectedAsset.threat.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-3 leading-tight">{selectedAsset.name}</h3>

              {[
                ['Type', selectedAsset.type],
                ['Class', selectedAsset.class],
                ['Status', selectedAsset.status],
                ['Heading', `${String(selectedAsset.heading).padStart(3, '0')}°`],
                ['Speed', `${selectedAsset.speedKts} kts`],
                ['Weapons', selectedAsset.weapons],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-[10px] py-0.5 border-b border-blue-900/20">
                  <span className="text-blue-400/50">{label}</span>
                  <span className="text-blue-200 text-right max-w-[60%] leading-tight">{val}</span>
                </div>
              ))}

              <div className="mt-2 p-2 rounded text-[9px] leading-relaxed" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', color: '#93c5fd' }}>
                {selectedAsset.note}
              </div>
            </div>
          ) : (
            <div className="p-4 text-[10px] text-blue-400/40 italic text-center border-b border-blue-900/40">
              Click a blip to inspect asset
            </div>
          )}

          {/* Fleet roster */}
          <div className="flex-1 overflow-auto">
            <div className="px-3 pt-3 pb-1">
              <h4 className="text-[9px] text-blue-400/40 tracking-widest uppercase mb-2 flex items-center gap-1">
                <Navigation size={9} /> Fleet Roster
              </h4>
            </div>
            {NAVAL_ASSETS.map(asset => (
              <button
                key={asset.id}
                onClick={() => setSelected(asset.id)}
                className="w-full text-left px-3 py-2 border-b border-blue-900/20 flex items-center gap-3 transition-colors hover:bg-blue-900/10"
                style={{ backgroundColor: selected === asset.id ? 'rgba(59,130,246,0.08)' : undefined }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: THREAT_COLOR[asset.threat], boxShadow: `0 0 6px ${THREAT_COLOR[asset.threat]}` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-blue-100 truncate">{asset.shortId}</div>
                  <div className="text-[9px] text-blue-400/50 truncate">{asset.status}</div>
                </div>
                <div className="text-[9px] text-blue-400/40">{asset.type}</div>
              </button>
            ))}
          </div>

          {/* Event log */}
          <div className="border-t border-blue-900/40 flex-shrink-0" style={{ maxHeight: '35%' }}>
            <div className="px-3 pt-2 pb-1 flex items-center gap-1">
              <Radio size={9} className="text-blue-400/40" />
              <span className="text-[9px] text-blue-400/40 tracking-widest uppercase">Tactical Log</span>
              <span className="ml-auto text-[9px] text-red-400 animate-pulse">● LIVE</span>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(35vh - 32px)' }}>
              {EVENTS.map(ev => (
                <div key={ev.id} className="px-3 py-1.5 border-b border-blue-900/20 flex gap-2">
                  <span className="text-[8px] text-blue-400/40 flex-shrink-0 pt-0.5">{ev.time}</span>
                  <div className="flex-1">
                    <div className="w-1 h-1 rounded-full inline-block mr-1 align-middle"
                      style={{ backgroundColor: SEV_COLOR[ev.severity] }} />
                    <span className="text-[9px] leading-relaxed" style={{ color: SEV_COLOR[ev.severity] === 'var(--signal-low)' ? '#93c5fd' : SEV_COLOR[ev.severity] }}>
                      {ev.msg}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Factory, Radiation, Zap, Activity, Thermometer, Wind, Shield, Radio, Clock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Site {
  id: string;
  name: string;
  coord: string;
  type: string;
  status: 'ACTIVE' | 'SUSPECT' | 'OFFLINE';
  enrichmentPct: number;
  cascades: number;
  activeCascades: number;
  iaeaAccess: boolean;
  alert: string;
}

interface TelemetryEvent {
  id: number;
  time: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
}

const SITES: Site[] = [
  {
    id: 'NATANZ', name: 'Natanz FEP', coord: '33.7252° N, 51.7272° E',
    type: 'Fuel Enrichment Plant', status: 'ACTIVE',
    enrichmentPct: 60.2, cascades: 164, activeCascades: 131,
    iaeaAccess: false, alert: 'IR-6 centrifuges exceeding rated RPM',
  },
  {
    id: 'FORDOW', name: 'Fordow FFEP', coord: '34.8842° N, 50.9958° E',
    type: 'Fordow Fuel Enrichment Plant (Underground)', status: 'ACTIVE',
    enrichmentPct: 83.7, cascades: 48, activeCascades: 48,
    iaeaAccess: false, alert: 'Near-weapons-grade production confirmed',
  },
  {
    id: 'ISFAHAN', name: 'Isfahan UCF', coord: '32.5269° N, 51.4239° E',
    type: 'Uranium Conversion Facility', status: 'SUSPECT',
    enrichmentPct: 5.0, cascades: 0, activeCascades: 0,
    iaeaAccess: true, alert: 'Unaccounted UF6 inventory detected',
  },
  {
    id: 'ARAK', name: 'Arak IR-40', coord: '34.4039° N, 49.2370° E',
    type: 'Heavy Water Reactor', status: 'OFFLINE',
    enrichmentPct: 0, cascades: 0, activeCascades: 0,
    iaeaAccess: true, alert: 'Redesign stalled — core installation frozen',
  },
];

const INITIAL_EVENTS: TelemetryEvent[] = [
  { id: 1, time: '17:18:02', level: 'CRITICAL', message: 'Fordow FFEP: Enrichment reading crossed 83% threshold. Automated alert dispatched to IAEA Operations Center.' },
  { id: 2, time: '17:15:44', level: 'CRITICAL', message: 'Natanz FEP: IR-6 cascade rotor RPM deviation ±800 from nominal. Possible mechanical stress or intentional overdrive.' },
  { id: 3, time: '17:11:30', level: 'WARNING', message: 'Natanz FEP: UF6 feed rate increased +18% vs baseline. No corresponding IAEA declaration filed.' },
  { id: 4, time: '17:05:19', level: 'WARNING', message: 'Isfahan UCF: 74 kg UF6 inventory unaccounted in latest material balance report.' },
  { id: 5, time: '16:52:07', level: 'INFO', message: 'Fordow FFEP: Seismic sensor array shows no structural anomalies. Facility appears operationally stable.' },
  { id: 6, time: '16:48:33', level: 'INFO', message: 'Arak IR-40: No change in operational status. Core installation suspended pending P5+1 negotiation outcome.' },
];

const CASCADE_HEIGHTS = Array.from({ length: 24 }).map(() => 20 + Math.random() * 30);

// Weapons-grade threshold
const WEAPONS_GRADE = 90;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const glow = (color: string) => `0 0 12px ${color}, 0 0 24px ${color}44`;

const enrichColor = (pct: number) => {
  if (pct >= 80) return '#ef4444';
  if (pct >= 60) return '#f97316';
  if (pct >= 20) return '#eab308';
  return '#22d3ee';
};

const statusColor = (s: Site['status']) => {
  if (s === 'ACTIVE') return '#f97316';
  if (s === 'SUSPECT') return '#eab308';
  return '#6b7280';
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB: Radial Gauge
// ─────────────────────────────────────────────────────────────────────────────
const RadialGauge: React.FC<{
  value: number; max: number; label: string; unit: string; color: string; size?: number;
}> = ({ value, max, label, unit, color, size = 120 }) => {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(value / max, 1);
  const strokeDash = progress * circ * 0.75; // 270° arc

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-135deg)' }}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}
            strokeDasharray={`${circ * 0.75} ${circ}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${strokeDash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: glow(color), transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-white" style={{ fontSize: size * 0.18 }}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
          </span>
          <span className="font-mono text-white/40" style={{ fontSize: size * 0.09 }}>{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-center mt-1" style={{ color, opacity: 0.8 }}>{label}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB: Sparkline
// ─────────────────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 40 }) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 200;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / range) * height * 0.9;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"
        style={{ filter: glow(color), opacity: 0.8 }} />
      {/* Glow fill */}
      <polygon points={`0,${height} ${pts} ${w},${height}`} fill={color} style={{ opacity: 0.08 }} />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export const NuclearApp: React.FC = () => {
  const [site, setSite] = useState<Site>(SITES[0]);

  // Live telemetry state — keyed by site ID
  const [rpm, setRpm] = useState(60500);
  const [flow, setFlow] = useState(12.4);
  const [temp, setTemp] = useState(342.1);
  const [pressure, setPressure] = useState(2.87);
  const [enrichment, setEnrichment] = useState(site.enrichmentPct);
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);

  // History buffers for sparklines
  const rpmHistory = useRef<number[]>(Array.from({ length: 30 }, () => 60500 + Math.random() * 400 - 200));
  const flowHistory = useRef<number[]>(Array.from({ length: 30 }, () => 12 + Math.random() * 1));
  const tempHistory = useRef<number[]>(Array.from({ length: 30 }, () => 340 + Math.random() * 6));
  const enrichHistory = useRef<number[]>(Array.from({ length: 30 }, () => site.enrichmentPct + Math.random() * 0.4 - 0.2));

  const [tick, setTick] = useState(0);
  const [scanAngle, setScanAngle] = useState(0);

  const cascadeHeights = CASCADE_HEIGHTS;

  // Reset telemetry when site changes
  useEffect(() => {
    setRpm(site.status === 'OFFLINE' ? 0 : 58000 + Math.random() * 4000);
    setFlow(site.status === 'OFFLINE' ? 0 : 10 + Math.random() * 5);
    setTemp(site.status === 'OFFLINE' ? 0 : 300 + Math.random() * 80);
    setPressure(site.status === 'OFFLINE' ? 0 : 2.5 + Math.random() * 0.8);
    setEnrichment(site.enrichmentPct);
    rpmHistory.current = Array.from({ length: 30 }, () => (site.status === 'OFFLINE' ? 0 : 58000 + Math.random() * 4000));
    flowHistory.current = Array.from({ length: 30 }, () => (site.status === 'OFFLINE' ? 0 : 10 + Math.random() * 5));
    tempHistory.current = Array.from({ length: 30 }, () => (site.status === 'OFFLINE' ? 0 : 300 + Math.random() * 80));
    enrichHistory.current = Array.from({ length: 30 }, () => site.enrichmentPct + Math.random() * 0.3);
  }, [site.id]);

  // Telemetry jitter
  useEffect(() => {
    if (site.status === 'OFFLINE') return;
    const int = setInterval(() => {
      setRpm(p => { const v = p + (Math.random() > 0.5 ? 30 : -30); rpmHistory.current = [...rpmHistory.current.slice(1), v]; return v; });
      setFlow(p => { const v = parseFloat((p + (Math.random() > 0.5 ? 0.08 : -0.08)).toFixed(2)); flowHistory.current = [...flowHistory.current.slice(1), v]; return v; });
      setTemp(p => { const v = parseFloat((p + (Math.random() > 0.5 ? 0.4 : -0.4)).toFixed(1)); tempHistory.current = [...tempHistory.current.slice(1), v]; return v; });
      setPressure(p => parseFloat((p + (Math.random() > 0.5 ? 0.01 : -0.01)).toFixed(2)));
      setEnrichment(p => { const v = parseFloat((p + (Math.random() > 0.7 ? 0.02 : 0)).toFixed(2)); enrichHistory.current = [...enrichHistory.current.slice(1), v]; return v; });
      setTick(t => t + 1);
    }, 800);
    return () => clearInterval(int);
  }, [site.id, site.status]);

  // Scanner rotation
  useEffect(() => {
    const int = setInterval(() => setScanAngle(a => (a + 2) % 360), 30);
    return () => clearInterval(int);
  }, []);

  // Inject new events occasionally
  useEffect(() => {
    if (site.status === 'OFFLINE') return;
    const int = setInterval(() => {
      if (Math.random() > 0.6) {
        const msgs = [
          { level: 'WARNING' as const, message: `${site.name}: UF6 feed valve gamma detected above nominal baseline.` },
          { level: 'INFO' as const, message: `${site.name}: Coolant loop pressure within acceptable range. No action required.` },
          { level: 'CRITICAL' as const, message: `${site.name}: IAEA inspection request formally denied by site authority.` },
          { level: 'WARNING' as const, message: `${site.name}: Secondary cascade IR-6 unit showing vibration anomaly.` },
          { level: 'INFO' as const, message: `${site.name}: Remote seismic monitoring shows stable subsurface baseline.` },
        ];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setEvents(prev => [{ id: Date.now(), time: timeStr, ...msg }, ...prev.slice(0, 14)]);
      }
    }, 6000);
    return () => clearInterval(int);
  }, [site.id, site.status]);

  const isOffline = site.status === 'OFFLINE';
  const ec = enrichColor(enrichment);
  const threatPct = Math.min((enrichment / WEAPONS_GRADE) * 100, 100);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#0b0402', color: '#fde8d0' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: 'rgba(249,115,22,0.2)', background: 'rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center gap-3">
          <Radiation size={20} style={{ color: '#f97316', filter: glow('#f97316') }} className="animate-pulse" />
          <div>
            <h2 className="text-base font-bold" style={{ color: '#fb923c', textShadow: glow('#f97316') }}>
              NUCLEAR TELEMETRY COMMAND
            </h2>
            <p className="text-[11px] font-mono" style={{ color: 'rgba(251,146,60,0.5)' }}>
              IAEA Safeguards Feed · Real-Time Enrichment Monitoring · Site Status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {SITES.filter(s => s.status === 'ACTIVE').length > 0 && (
            <div
              className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded animate-pulse"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444' }}
            >
              <AlertTriangle size={12} /> ENRICHMENT SPIKE DETECTED
            </div>
          )}
          <div
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-1 rounded"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: 'rgba(251,146,60,0.8)' }}
          >
            <Radio size={9} className="animate-pulse" /> LIVE
          </div>
        </div>
      </div>

      {/* ── SITE SELECTOR STRIP ───────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex border-b overflow-x-auto"
        style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(0,0,0,0.4)' }}
      >
        {SITES.map(s => (
          <button
            key={s.id}
            onClick={() => setSite(s)}
            className="flex-shrink-0 flex flex-col items-start px-4 py-2.5 border-r transition-all"
            style={{
              border: 'none',
              borderRight: '1px solid rgba(249,115,22,0.1)',
              borderBottom: site.id === s.id ? `2px solid ${statusColor(s.status)}` : '2px solid transparent',
              background: site.id === s.id ? 'rgba(249,115,22,0.07)' : 'transparent',
              cursor: 'pointer',
              minWidth: 130,
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor(s.status), boxShadow: glow(statusColor(s.status)) }} />
              <span className="text-xs font-bold font-mono" style={{ color: site.id === s.id ? '#fb923c' : 'rgba(251,146,60,0.6)' }}>{s.name}</span>
            </div>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.4)' }}>{s.type.split(' ')[0]}</div>
            <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: statusColor(s.status) }}>{s.status}</div>
          </button>
        ))}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* ─ LEFT: GAUGES + THREAT ─────────────────────────────────────── */}
        <div className="flex flex-col gap-0 border-r overflow-auto" style={{ borderColor: 'rgba(249,115,22,0.15)', width: 300, minWidth: 260 }}>

          {/* Site Info Header */}
          <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(249,115,22,0.1)' }}>
            <div className="text-xs font-bold font-mono mb-0.5" style={{ color: '#fb923c' }}>{site.name.toUpperCase()}</div>
            <div className="text-[10px] font-mono mb-1" style={{ color: 'rgba(251,146,60,0.5)' }}>{site.coord}</div>
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded"
                style={{ background: statusColor(site.status) + '22', color: statusColor(site.status), border: `1px solid ${statusColor(site.status)}55` }}
              >
                {site.status}
              </span>
              <span className="text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.4)' }}>
                IAEA: <span style={{ color: site.iaeaAccess ? '#22d3ee' : '#ef4444' }}>{site.iaeaAccess ? 'ACCESS' : 'DENIED'}</span>
              </span>
            </div>
          </div>

          {/* Enrichment Threat Meter */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(249,115,22,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'rgba(251,146,60,0.6)' }}>
                U-235 Enrichment
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: ec, textShadow: glow(ec) }}>
                {isOffline ? '--' : `${enrichment.toFixed(1)}%`}
              </span>
            </div>
            {/* Bar */}
            <div className="relative h-3 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: isOffline ? '0%' : `${Math.min((enrichment / 100) * 100, 100)}%`, background: `linear-gradient(90deg, #f97316, ${ec})`, boxShadow: glow(ec) }}
              />
              {/* Weapons-grade marker */}
              <div className="absolute inset-y-0 w-0.5 bg-white/30" style={{ left: `${WEAPONS_GRADE}%` }} />
            </div>
            <div className="flex justify-between text-[8px] font-mono" style={{ color: 'rgba(251,146,60,0.4)' }}>
              <span>0%</span>
              <span style={{ color: '#ef444488' }}>↑ WEAPONS GRADE ({WEAPONS_GRADE}%)</span>
              <span>100%</span>
            </div>

            {/* Threat proximity bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.5)' }}>Weapons-Grade Proximity</span>
                <span className="text-[9px] font-mono font-bold" style={{ color: threatPct >= 90 ? '#ef4444' : '#f97316' }}>
                  {isOffline ? '--' : `${threatPct.toFixed(0)}%`}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: isOffline ? '0%' : `${threatPct}%`,
                    background: threatPct >= 90 ? '#ef4444' : `linear-gradient(90deg, #f97316, #ef4444)`,
                    boxShadow: threatPct >= 90 ? glow('#ef4444') : 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Gauges */}
          <div className="px-4 py-4 border-b flex flex-col gap-4" style={{ borderColor: 'rgba(249,115,22,0.1)' }}>
            <div className="flex justify-around">
              <RadialGauge
                value={isOffline ? 0 : rpm} max={75000}
                label="Rotor RPM" unit="rpm"
                color={rpm > 65000 ? '#ef4444' : '#f97316'}
                size={110}
              />
              <RadialGauge
                value={isOffline ? 0 : flow} max={25}
                label="UF6 Flow" unit="mg/s"
                color="#fb923c"
                size={110}
              />
            </div>
            <div className="flex justify-around">
              <RadialGauge
                value={isOffline ? 0 : temp} max={500}
                label="Temp" unit="°C"
                color={temp > 400 ? '#ef4444' : '#eab308'}
                size={100}
              />
              <RadialGauge
                value={isOffline ? 0 : pressure} max={5}
                label="Pressure" unit="atm"
                color="#a78bfa"
                size={100}
              />
            </div>
          </div>

          {/* Cascade Status */}
          <div className="px-4 py-4">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(251,146,60,0.6)' }}>
              Cascade Arrays
            </div>
            <div className="flex items-end gap-1 mb-2">
              {Array.from({ length: Math.min(site.cascades || 0, 24) }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all"
                  style={{
                    height: `${cascadeHeights[i] || 20}px`,
                    background: i < (site.activeCascades || 0) * (24 / (site.cascades || 1))
                      ? i > 20 ? '#ef4444' : '#f97316'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: i < (site.activeCascades || 0) * (24 / (site.cascades || 1)) ? glow('#f97316') : 'none',
                    minWidth: 4,
                    opacity: isOffline ? 0.2 : 1,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono" style={{ color: 'rgba(251,146,60,0.5)' }}>
              <span>Active: <span style={{ color: '#fb923c' }}>{isOffline ? 0 : site.activeCascades}</span></span>
              <span>Total: <span style={{ color: 'rgba(251,146,60,0.8)' }}>{site.cascades}</span></span>
            </div>
            <p className="text-[10px] font-mono mt-2 leading-relaxed" style={{ color: 'rgba(251,146,60,0.4)' }}>
              ⚠ {site.alert}
            </p>
          </div>
        </div>

        {/* ─ CENTER: SPARKLINES + SCANNER ─────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden border-r" style={{ borderColor: 'rgba(249,115,22,0.15)' }}>

          {/* Sparkline grid */}
          <div className="grid grid-cols-2 border-b" style={{ borderColor: 'rgba(249,115,22,0.15)' }}>
            {[
              { label: 'ROTOR RPM', key: 'rpm', history: rpmHistory.current, value: isOffline ? '--' : rpm.toLocaleString(), unit: 'rpm', color: '#f97316' },
              { label: 'UF6 FLOW', key: 'flow', history: flowHistory.current, value: isOffline ? '--' : `${flow} mg/s`, unit: '', color: '#fb923c' },
              { label: 'CASCADE TEMP', key: 'temp', history: tempHistory.current, value: isOffline ? '--' : `${temp.toFixed(1)}°C`, unit: '', color: '#eab308' },
              { label: 'U-235 ENRICHMENT', key: 'enrich', history: enrichHistory.current, value: isOffline ? '--' : `${enrichment.toFixed(2)}%`, unit: '', color: ec },
            ].map(item => (
              <div key={item.key} className="p-3 border-r border-b" style={{ borderColor: 'rgba(249,115,22,0.1)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: 'rgba(251,146,60,0.5)' }}>{item.label}</span>
                  <span className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <Sparkline values={item.history} color={item.color} height={36} />
              </div>
            ))}
          </div>

          {/* Facility Scanner */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#050202' }}>
            <div className="px-4 pt-3 pb-2 border-b flex items-center justify-between" style={{ borderColor: 'rgba(249,115,22,0.1)' }}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'rgba(251,146,60,0.6)' }}>
                <Activity size={11} style={{ display: 'inline', marginRight: 4 }} />
                Facility Perimeter Scan · {site.coord}
              </span>
              <span className="text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.4)' }}>
                SWEEP {scanAngle}° · SAT-KHAYYAM-5
              </span>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              {/* Radar background */}
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, rgba(0,0,0,0) 70%), #050202',
              }} />
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />

              {/* Radar circle */}
              <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {[1, 0.66, 0.33].map((scale, i) => (
                  <div key={i} className="absolute rounded-full border" style={{
                    width: 200 * scale, height: 200 * scale,
                    borderColor: 'rgba(249,115,22,0.15)',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }} />
                ))}
                {/* Cross-hairs */}
                <div className="absolute w-full h-px" style={{ background: 'rgba(249,115,22,0.1)' }} />
                <div className="absolute h-full w-px" style={{ background: 'rgba(249,115,22,0.1)' }} />
                {/* Sweep line */}
                <div className="absolute" style={{
                  width: 100, height: 2, top: '50%', left: '50%',
                  transformOrigin: '0 50%',
                  transform: `rotate(${scanAngle}deg)`,
                  background: 'linear-gradient(90deg, rgba(249,115,22,0.8), transparent)',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(249,115,22,0.6)',
                }} />
                {/* Blips */}
                {[
                  { angle: 45, dist: 0.6, label: 'ENTRY', crit: false },
                  { angle: 130, dist: 0.35, label: 'CASCADE', crit: true },
                  { angle: 220, dist: 0.55, label: 'COOLING', crit: false },
                  { angle: 310, dist: 0.4, label: 'POWER', crit: false },
                ].map(blip => {
                  const rad = (blip.angle * Math.PI) / 180;
                  const bx = 50 + Math.cos(rad) * 50 * blip.dist;
                  const by = 50 + Math.sin(rad) * 50 * blip.dist;
                  return (
                    <div key={blip.label} style={{ position: 'absolute', left: `${bx}%`, top: `${by}%`, transform: 'translate(-50%, -50%)' }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: blip.crit ? '#ef4444' : '#f97316',
                        boxShadow: glow(blip.crit ? '#ef4444' : '#f97316'),
                        animation: blip.crit ? 'pulse 1s infinite' : undefined,
                      }} />
                      <div style={{
                        position: 'absolute', top: -14, left: 8,
                        fontSize: 7, fontFamily: 'monospace', fontWeight: 'bold',
                        color: blip.crit ? '#ef4444' : 'rgba(251,146,60,0.6)',
                        whiteSpace: 'nowrap',
                      }}>{blip.label}</div>
                    </div>
                  );
                })}
                {/* Center dot */}
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', boxShadow: glow('#f97316'), position: 'relative', zIndex: 1 }} />
              </div>

              {/* Overlay stats */}
              <div className="absolute bottom-3 left-3 text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.5)' }}>
                {isOffline ? 'SIGNAL LOST — FACILITY OFFLINE' : `THREAT LEVEL: ${threatPct >= 90 ? 'CRITICAL' : threatPct >= 70 ? 'HIGH' : 'ELEVATED'}`}
              </div>
              <div className="absolute bottom-3 right-3 text-[9px] font-mono" style={{ color: 'rgba(251,146,60,0.4)' }}>
                TICK #{tick}
              </div>
            </div>
          </div>
        </div>

        {/* ─ RIGHT: EVENT LOG ──────────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden" style={{ width: 280, minWidth: 220 }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(0,0,0,0.4)' }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: 'rgba(251,146,60,0.7)' }}>
              <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
              Event Log
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {events.filter(e => e.level === 'CRITICAL').length} CRITICAL
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {events.map(ev => (
              <div
                key={ev.id}
                className="px-3 py-2.5 border-b"
                style={{
                  borderColor: 'rgba(249,115,22,0.08)',
                  borderLeft: `3px solid ${ev.level === 'CRITICAL' ? '#ef4444' : ev.level === 'WARNING' ? '#f97316' : 'rgba(251,146,60,0.2)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: ev.level === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : ev.level === 'WARNING' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                      color: ev.level === 'CRITICAL' ? '#ef4444' : ev.level === 'WARNING' ? '#f97316' : 'rgba(251,146,60,0.4)',
                    }}
                  >
                    {ev.level}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: 'rgba(251,146,60,0.3)' }}>{ev.time}</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,146,60,0.7)' }}>{ev.message}</p>
              </div>
            ))}
          </div>

          {/* Bottom: Quick Stats */}
          <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(0,0,0,0.4)' }}>
            <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(251,146,60,0.5)' }}>
              <Shield size={9} style={{ display: 'inline', marginRight: 4 }} /> Site Summary
            </div>
            {[
              { label: 'Enrichment', val: isOffline ? 'OFFLINE' : `${enrichment.toFixed(1)}%` },
              { label: 'IAEA Access', val: site.iaeaAccess ? 'GRANTED' : 'DENIED', crit: !site.iaeaAccess },
              { label: 'Active Cascades', val: isOffline ? '0' : `${site.activeCascades} / ${site.cascades}` },
              { label: 'Facility Type', val: site.type.split(' ').slice(0, 2).join(' ') },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-[9px] font-mono mb-1">
                <span style={{ color: 'rgba(251,146,60,0.4)' }}>{item.label}</span>
                <span style={{ color: 'crit' in item && item.crit ? '#ef4444' : '#fb923c', fontWeight: 'bold' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

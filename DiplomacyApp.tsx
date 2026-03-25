import React, { useState, useEffect } from 'react';
import { Globe, Flag, AlertTriangle, Radio, Users, TrendingDown, TrendingUp, Minus, MessageSquare, Shield, FileText, Activity, Phone } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';
type TrendDir = 'up' | 'down' | 'flat';

interface DiplomaticUpdate {
  id: number;
  type: string;
  title: string;
  body: string;
  time: string;
  severity: Severity;
  actors: string[];
}

interface CountryStatus {
  country: string;
  code: string;
  status: string;
  color: Severity;
  trend: TrendDir;
  alert: string;
}

interface Channel {
  id: number;
  label: string;
  status: 'OPEN' | 'SUSPENDED' | 'BACK-CHANNEL' | 'SEVERED';
  parties: string[];
  lastContact: string;
  detail: string;
}

const UPDATES: DiplomaticUpdate[] = [
  {
    id: 1, type: 'UNSC', title: 'Security Council Emergency Session Called',
    body: 'UK, France, Germany jointly request emergency UNSC session following enrichment spike. Russia and China expected to veto resolution.',
    time: 'Now', severity: 'critical', actors: ['UK', 'France', 'Germany', 'Russia', 'China'],
  },
  {
    id: 2, type: 'Embassy', title: 'Germany Evacuates Tehran Embassy',
    body: 'Non-essential staff evacuation ordered following threat assessment upgrade. 34 personnel departing via KLM charter. Ambassador remains on site.',
    time: '12m ago', severity: 'high', actors: ['Germany', 'Iran'],
  },
  {
    id: 3, type: 'Statement', title: 'White House NSA Issues Warning',
    body: '"All options remain on the table." — NSA statement following classified IAEA briefing to P5+1 nations. Interpreted as implicit military threat.',
    time: '31m ago', severity: 'high', actors: ['USA'],
  },
  {
    id: 4, type: 'IAEA', title: 'IAEA Loses Site Access at Fordow',
    body: 'Iranian authorities denied access to IAEA inspectors at Fordow enrichment facility for the 3rd consecutive week. Formal protest filed with Security Council.',
    time: '1h ago', severity: 'critical', actors: ['Iran', 'IAEA'],
  },
  {
    id: 5, type: 'Bilateral', title: 'Russia–Iran Arms Meeting in Moscow',
    body: 'Senior defense officials concluded a 2-day closed-door summit in Moscow. No communiqué released. Analysts expect an accelerated drone-tech transfer agreement.',
    time: '3h ago', severity: 'medium', actors: ['Russia', 'Iran'],
  },
  {
    id: 6, type: 'Statement', title: 'Israel: "Clock Is Running Out"',
    body: 'Defense Minister statement at Knesset Foreign Affairs Committee suggests unilateral action is being quietly considered if diplomatic avenues fail in coming weeks.',
    time: '5h ago', severity: 'high', actors: ['Israel'],
  },
  {
    id: 7, type: 'Sanctions', title: 'EU Approves 14th Sanctions Package',
    body: 'European Union adds 47 new entities linked to Iranian ballistic missile program to the SDN equivalent list. Iranian assets in EU frozen.',
    time: '7h ago', severity: 'medium', actors: ['EU', 'Iran'],
  },
  {
    id: 8, type: 'Bilateral', title: 'Oman Offers Mediation Framework',
    body: 'Muscat quietly offers back-channel mediation between Washington and Tehran. Sources indicate limited interest from both sides at this stage.',
    time: '10h ago', severity: 'low', actors: ['Oman', 'USA', 'Iran'],
  },
];

const COUNTRIES: CountryStatus[] = [
  { country: 'Iran',     code: 'IR', status: 'HOSTILE',    color: 'critical', trend: 'up',   alert: 'Enrichment at 84%+' },
  { country: 'USA',      code: 'US', status: 'HIGH ALERT', color: 'high',     trend: 'up',   alert: 'NSC convened' },
  { country: 'Israel',   code: 'IL', status: 'EXTREME',    color: 'critical', trend: 'up',   alert: 'Strike plans active' },
  { country: 'Russia',   code: 'RU', status: 'NEUTRAL',    color: 'low',      trend: 'flat', alert: 'Supplying drones' },
  { country: 'UK',       code: 'GB', status: 'ELEVATED',   color: 'medium',   trend: 'up',   alert: 'UNSC push' },
  { country: 'China',    code: 'CN', status: 'MONITORING', color: 'low',      trend: 'flat', alert: 'Abstaining from votes' },
  { country: 'Germany',  code: 'DE', status: 'EVACUATING', color: 'high',     trend: 'up',   alert: 'Embassy drawdown' },
  { country: 'France',   code: 'FR', status: 'ELEVATED',   color: 'medium',   trend: 'flat', alert: 'JCPOA discussions' },
  { country: 'Oman',     code: 'OM', status: 'MEDIATOR',   color: 'low',      trend: 'down', alert: 'Back-channel open' },
  { country: 'UAE',      code: 'AE', status: 'CAUTIOUS',   color: 'medium',   trend: 'up',   alert: 'Air defense raised' },
];

const CHANNELS: Channel[] = [
  { id: 1, label: 'P5+1 Nuclear Track', status: 'SUSPENDED', parties: ['USA', 'UK', 'France', 'Germany', 'Russia', 'China', 'Iran'], lastContact: '3 days ago', detail: 'Vienna talks suspended after IAEA access denial. No next session scheduled.' },
  { id: 2, label: 'US–Iran Back-Channel (Oman)', status: 'BACK-CHANNEL', parties: ['USA', 'Iran', 'Oman'], lastContact: '6h ago', detail: 'Low-level technical contact maintained through Oman intermediaries. Prisoner exchange also on table.' },
  { id: 3, label: 'IAEA Safeguards Dialogue', status: 'SEVERED', parties: ['Iran', 'IAEA'], lastContact: '21 days ago', detail: 'Iran revoked IAEA inspector credentials. Communications at an institutional standstill.' },
  { id: 4, label: 'EU Troika Consultation', status: 'OPEN', parties: ['UK', 'France', 'Germany'], lastContact: 'Live', detail: 'E3 holding emergency consultations ahead of UNSC session. Joint statement expected within hours.' },
  { id: 5, label: 'Israel–US Defense Hotline', status: 'OPEN', parties: ['Israel', 'USA'], lastContact: '1h ago', detail: 'IDF briefed Pentagon on contingency timelines. SecDef urged restraint. No commitment given.' },
];

const TYPE_COLORS: Record<string, string> = {
  UNSC: 'var(--accent-secondary)',
  Embassy: 'var(--signal-high)',
  Statement: 'var(--signal-medium)',
  IAEA: 'var(--signal-critical)',
  Bilateral: 'var(--accent-primary)',
  Sanctions: '#a78bfa',
};

const CHANNEL_STATUS_COLORS: Record<string, string> = {
  OPEN: 'var(--signal-low)',
  SUSPENDED: 'var(--signal-medium)',
  'BACK-CHANNEL': 'var(--accent-secondary)',
  SEVERED: 'var(--signal-critical)',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const TrendIcon: React.FC<{ dir: TrendDir; color: Severity }> = ({ dir, color }) => {
  const style = { color: `var(--signal-${color})`, width: 12, height: 12 };
  if (dir === 'up') return <TrendingUp style={style} />;
  if (dir === 'down') return <TrendingDown style={style} />;
  return <Minus style={{ ...style, opacity: 0.5 }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'channels' | 'actors';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const DiplomacyApp: React.FC = () => {
  const [tab, setTab] = useState<Tab>('feed');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [selectedCountry, setSelectedCountry] = useState<CountryStatus>(COUNTRIES[0]);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]);
  const [pulseCount, setPulseCount] = useState(0);

  // Simulate incoming alert heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(p => p + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredUpdates = UPDATES.filter(u =>
    filterSeverity === 'all' ? true : u.severity === filterSeverity
  );

  const criticalCount = UPDATES.filter(u => u.severity === 'critical').length;
  const highCount = UPDATES.filter(u => u.severity === 'high').length;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'feed',     label: 'Diplomatic Feed',    icon: <MessageSquare size={13} /> },
    { key: 'channels', label: 'Comm Channels',      icon: <Phone size={13} /> },
    { key: 'actors',   label: 'Actor Matrix',       icon: <Users size={13} /> },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Globe size={20} style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <h2 className="text-base font-bold text-primary leading-none">Global Diplomatic Matrix</h2>
            <p className="text-[11px] text-muted mt-0.5">International relations · UNSC tracking · Comms status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-critical" style={{ animation: pulseCount % 2 === 0 ? 'pulse 1s infinite' : 'none' }}>
            {criticalCount} CRITICAL
          </span>
          <span className="badge badge-high">{highCount} HIGH</span>
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ color: 'var(--signal-low)', border: '1px solid var(--signal-low)', background: 'rgba(74,222,128,0.08)' }}>
            <Radio size={9} className="animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* ── COUNTRY STATUS STRIP ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex border-b overflow-x-auto" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        {COUNTRIES.map(c => (
          <button
            key={c.country}
            onClick={() => { setSelectedCountry(c); setTab('actors'); }}
            title={c.alert}
            className="flex-shrink-0 flex flex-col items-center px-3 py-2 border-r cursor-pointer transition-all"
            style={{
              borderColor: 'var(--border-color)',
              minWidth: 80,
              background: selectedCountry.country === c.country && tab === 'actors' ? 'var(--bg-tertiary)' : 'transparent',
              borderBottom: selectedCountry.country === c.country && tab === 'actors' ? `2px solid var(--signal-${c.color})` : '2px solid transparent',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Flag size={10} style={{ color: `var(--signal-${c.color})` }} />
              <span className="text-[11px] font-bold text-primary">{c.country}</span>
              <TrendIcon dir={c.trend} color={c.color} />
            </div>
            <div className="text-[9px] font-mono font-bold" style={{ color: `var(--signal-${c.color})` }}>{c.status}</div>
          </button>
        ))}
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex gap-0 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2"
            style={{
              borderBottomColor: tab === t.key ? 'var(--accent-secondary)' : 'transparent',
              color: tab === t.key ? 'var(--accent-secondary)' : 'var(--text-muted)',
              background: 'transparent',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ━━ TAB: DIPLOMATIC FEED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {tab === 'feed' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter bar */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[11px] text-muted font-semibold uppercase tracking-wider mr-1">Filter:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className="text-[10px] font-bold uppercase px-2.5 py-1 rounded transition-all"
                  style={{
                    background: filterSeverity === s
                      ? (s === 'all' ? 'var(--accent-secondary)' : `var(--signal-${s})`)
                      : 'var(--bg-tertiary)',
                    color: filterSeverity === s ? '#000' : 'var(--text-muted)',
                    opacity: filterSeverity === s ? 1 : 0.7,
                  }}
                >
                  {s} {s !== 'all' && `(${UPDATES.filter(u => u.severity === s).length})`}
                </button>
              ))}
            </div>

            {/* Feed list */}
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
              {filteredUpdates.map(update => (
                <div
                  key={update.id}
                  className="glass-panel p-4 group transition-all"
                  style={{ borderLeft: `3px solid ${TYPE_COLORS[update.type] || 'var(--border-color)'}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                        style={{ background: TYPE_COLORS[update.type], color: '#000' }}
                      >
                        {update.type}
                      </span>
                      {update.actors.map(a => (
                        <span key={a} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {update.severity === 'critical' && (
                        <AlertTriangle size={13} className="animate-pulse flex-shrink-0" style={{ color: 'var(--signal-critical)' }} />
                      )}
                      <span className="text-[10px] text-muted font-mono">{update.time}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-primary mb-1.5">{update.title}</h4>
                  <p className="text-xs text-secondary leading-relaxed">{update.body}</p>
                  <div className="mt-3 pt-2.5 flex gap-4 text-[10px] font-semibold text-muted border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button className="flex items-center gap-1 hover:text-accent transition-colors" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <FileText size={11} /> Full Brief
                    </button>
                    <button className="flex items-center gap-1 hover:text-accent transition-colors" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <Shield size={11} /> Source Analysis
                    </button>
                    <span className={`ml-auto badge badge-${update.severity} text-[8px]`}>{update.severity.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ━━ TAB: COMM CHANNELS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {tab === 'channels' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Channel list */}
            <div className="w-72 flex-shrink-0 border-r overflow-auto" style={{ borderColor: 'var(--border-color)' }}>
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className="w-full text-left px-4 py-3 border-b transition-colors"
                  style={{
                    border: 'none',
                    borderBottom: `1px solid var(--border-color)`,
                    borderLeft: `3px solid ${CHANNEL_STATUS_COLORS[ch.status]}`,
                    background: selectedChannel?.id === ch.id ? 'var(--bg-tertiary)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-primary leading-tight">{ch.label}</span>
                    <span
                      className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded flex-shrink-0 ml-2"
                      style={{ background: CHANNEL_STATUS_COLORS[ch.status] + '22', color: CHANNEL_STATUS_COLORS[ch.status], border: `1px solid ${CHANNEL_STATUS_COLORS[ch.status]}` }}
                    >
                      {ch.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {ch.parties.map(p => (
                      <span key={p} className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{p}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted font-mono">Last contact: {ch.lastContact}</div>
                </button>
              ))}
            </div>

            {/* Channel detail */}
            <div className="flex-1 overflow-auto p-6">
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">{selectedChannel.label}</h3>
                    <div className="text-xs text-muted font-mono">Channel ID: DIPLO-{String(selectedChannel.id).padStart(3, '0')}</div>
                  </div>
                  <span
                    className="text-xs font-bold font-mono px-3 py-1.5 rounded"
                    style={{ background: CHANNEL_STATUS_COLORS[selectedChannel.status] + '22', color: CHANNEL_STATUS_COLORS[selectedChannel.status], border: `1px solid ${CHANNEL_STATUS_COLORS[selectedChannel.status]}` }}
                  >
                    {selectedChannel.status}
                  </span>
                </div>

                <div className="glass-panel p-5 mb-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">Participating Parties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChannel.parties.map(p => {
                      const country = COUNTRIES.find(c => c.country === p || c.code === p);
                      return (
                        <div key={p} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                          {country && <Flag size={12} style={{ color: `var(--signal-${country.color})` }} />}
                          <span className="text-sm font-bold text-primary">{p}</span>
                          {country && <span className="text-[9px] font-mono" style={{ color: `var(--signal-${country.color})` }}>{country.status}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-panel p-5 mb-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">Intelligence Assessment</h4>
                  <p className="text-sm text-secondary leading-relaxed">{selectedChannel.detail}</p>
                </div>

                <div className="glass-panel p-5">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3 flex items-center gap-2">
                    <Activity size={12} /> Signal Integrity
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Trust Level', val: selectedChannel.status === 'OPEN' ? '87%' : selectedChannel.status === 'BACK-CHANNEL' ? '43%' : selectedChannel.status === 'SUSPENDED' ? '21%' : '0%', crit: selectedChannel.status === 'SEVERED' },
                      { label: 'Last Contact', val: selectedChannel.lastContact, crit: false },
                      { label: 'Encryption', val: selectedChannel.status === 'SEVERED' ? 'N/A' : 'AES-256', crit: false },
                    ].map(item => (
                      <div key={item.label} className="rounded p-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                        <div className="text-[9px] uppercase tracking-widest text-muted mb-1">{item.label}</div>
                        <div className="text-sm font-bold font-mono" style={{ color: item.crit ? 'var(--signal-critical)' : 'var(--text-primary)' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ━━ TAB: ACTOR MATRIX ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {tab === 'actors' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Country list */}
            <div className="w-64 flex-shrink-0 border-r overflow-auto" style={{ borderColor: 'var(--border-color)' }}>
              {COUNTRIES.map(c => (
                <button
                  key={c.country}
                  onClick={() => setSelectedCountry(c)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                  style={{
                    border: 'none',
                    borderBottom: `1px solid var(--border-color)`,
                    borderLeft: `3px solid var(--signal-${c.color})`,
                    background: selectedCountry.country === c.country ? 'var(--bg-tertiary)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Flag size={11} style={{ color: `var(--signal-${c.color})` }} />
                      <span className="text-sm font-bold text-primary">{c.country}</span>
                    </div>
                    <div className="text-[9px] font-mono" style={{ color: `var(--signal-${c.color})` }}>{c.status}</div>
                  </div>
                  <TrendIcon dir={c.trend} color={c.color} />
                </button>
              ))}
            </div>

            {/* Country detail */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--bg-tertiary)', border: `2px solid var(--signal-${selectedCountry.color})`, color: `var(--signal-${selectedCountry.color})` }}
                >
                  {selectedCountry.code}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold text-primary">{selectedCountry.country}</h3>
                    <span className={`badge badge-${selectedCountry.color}`}>{selectedCountry.status}</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: `var(--signal-${selectedCountry.color})` }}>
                      <TrendIcon dir={selectedCountry.trend} color={selectedCountry.color} />
                      {selectedCountry.trend === 'up' ? 'Escalating' : selectedCountry.trend === 'down' ? 'De-escalating' : 'Stable'}
                    </span>
                  </div>
                  <div className="text-xs text-muted font-mono">⚠ {selectedCountry.alert}</div>
                </div>
              </div>

              {/* Active events for this country */}
              <div className="glass-panel p-5 mb-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">Active Events Involving {selectedCountry.country}</h4>
                {(() => {
                  const countryEvents = UPDATES.filter(u => u.actors.includes(selectedCountry.country));
                  if (countryEvents.length === 0) {
                    return <p className="text-xs text-muted italic">No active diplomatic events on record.</p>;
                  }
                  return (
                    <div className="flex flex-col gap-3">
                      {countryEvents.map(u => (
                        <div key={u.id} className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-tertiary)', borderLeft: `3px solid ${TYPE_COLORS[u.type] || 'var(--border-color)'}` }}>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: TYPE_COLORS[u.type], color: '#000' }}>{u.type}</span>
                          <div>
                            <div className="text-xs font-bold text-primary mb-0.5">{u.title}</div>
                            <div className="text-[10px] text-muted font-mono">{u.time}</div>
                          </div>
                          <span className={`badge badge-${u.severity} text-[8px] ml-auto flex-shrink-0`}>{u.severity}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Active channels for this country */}
              <div className="glass-panel p-5">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted mb-3">Communication Channels</h4>
                {(() => {
                  const countryChannels = CHANNELS.filter(ch => ch.parties.some(p => p === selectedCountry.country || p === selectedCountry.code));
                  if (countryChannels.length === 0) {
                    return <p className="text-xs text-muted italic">No active communication channels.</p>;
                  }
                  return (
                    <div className="flex flex-col gap-2">
                      {countryChannels.map(ch => (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between px-3 py-2 rounded cursor-pointer"
                          style={{ background: 'var(--bg-tertiary)', border: `1px solid var(--border-color)` }}
                          onClick={() => { setSelectedChannel(ch); setTab('channels'); }}
                        >
                          <span className="text-xs font-bold text-primary">{ch.label}</span>
                          <span className="text-[9px] font-mono font-bold" style={{ color: CHANNEL_STATUS_COLORS[ch.status] }}>{ch.status}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

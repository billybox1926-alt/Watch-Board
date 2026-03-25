import { DollarSign, TrendingDown, AlertOctagon } from 'lucide-react';
import { useState, useEffect } from 'react';

const SANCTIONS = [
  { entity: 'Bank Mellat', type: 'Financial', authority: 'OFAC', date: 'Mar 12, 2026', status: 'Active' },
  { entity: 'IRGC Aerospace', type: 'Military', authority: 'EU + US', date: 'Feb 3, 2026', status: 'Active' },
  { entity: 'Natanz Complex', type: 'Nuclear', authority: 'UNSC', date: 'Jan 9, 2026', status: 'Active' },
  { entity: 'Kaveh Steel', type: 'Industrial', authority: 'US Treasury', date: 'Dec 20, 2025', status: 'Active' },
];

export const EconApp = () => {
  const [rate, setRate] = useState(583400);
  useEffect(() => {
    const int = setInterval(() => setRate(r => r + Math.floor(Math.random() * 200 - 50)), 1500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="h-full flex flex-col bg-primary overflow-auto p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mb-6 border-b border-color pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold flex items-center gap-3 text-primary mb-1">
          <DollarSign size={24} style={{ color: 'var(--accent-secondary)' }} /> Sanctions & Economic Warfare
        </h2>
        <p className="text-sm text-secondary">SWIFT blockades, monetary collapse indicators, and trade sanctions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exchange Rate */}
        <div className="glass-panel p-5 col-span-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted">IRR / USD Exchange Rate</h3>
            <span className="badge badge-critical animate-pulse">HYPERINFLATION ALERT</span>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-5xl font-mono font-bold text-white">{rate.toLocaleString()}</div>
              <div className="text-sm text-muted mt-1">Rial per 1 USD (Black Market)</div>
            </div>
            <TrendingDown size={48} style={{ color: 'var(--signal-critical)' }} className="mb-1" />
          </div>
          <div className="mt-4 h-16 flex items-end gap-0.5">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = 30 + i * 1.7 + (Math.sin(i + rate / 1000) * 5 + 5);
              return (
                <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${height}%`, background: `var(--signal-critical)`, opacity: 0.5 + i * 0.01 }} />
              );
            })}
          </div>
        </div>

        {/* Sanctions List */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Active Sanctions Register</h3>
          <div className="flex flex-col gap-3">
            {SANCTIONS.map(s => (
              <div key={s.entity} className="flex justify-between items-center border-b border-color pb-3" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="text-sm font-bold text-primary">{s.entity}</div>
                  <div className="text-xs text-muted">{s.type} · {s.authority} · {s.date}</div>
                </div>
                <span className="text-xs font-bold text-critical" style={{ color: 'var(--signal-critical)' }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Shortage Meter */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2"><AlertOctagon size={14} /> Critical Supply Levels</h3>
          {[{ label: 'Medical Imports', val: 18 }, { label: 'Wheat Reserves', val: 34 }, { label: 'Diesel Fuel', val: 12 }, { label: 'Foreign Currency Reserves', val: 5 }].map(item => (
            <div key={item.label} className="mb-4">
              <div className="flex justify-between text-xs text-secondary mb-1">
                <span>{item.label}</span>
                <span className="font-bold" style={{ color: item.val < 20 ? 'var(--signal-critical)' : 'var(--signal-medium)' }}>{item.val}%</span>
              </div>
              <div className="h-2 rounded-full bg-tertiary overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.val}%`, background: item.val < 20 ? 'var(--signal-critical)' : 'var(--signal-medium)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

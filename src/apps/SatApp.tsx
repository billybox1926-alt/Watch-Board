import { Camera, Scan, Crosshair } from 'lucide-react';

export const SatApp = () => {
  return (
    <div className="h-full flex flex-col bg-primary overflow-hidden relative">
      <div className="absolute inset-0">
        {/* Mock Satellite Imagery Background via heavy CSS gradients to look like a topographic/thermal scan */}
        <div className="w-full h-full" style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(200,200,200,0.1) 0%, transparent 20%), radial-gradient(circle at 70% 60%, rgba(100,100,100,0.2) 0%, transparent 40%), linear-gradient(180deg, #111 0%, #050505 100%)',
          filter: 'contrast(1.5) grayscale(0.5) sepia(0.2)'
        }}>
          {/* Topographic Lines Mock */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 40px, var(--accent-secondary) 40px, var(--accent-secondary) 42px)' }} />
          
          {/* AI Bounding Boxes */}
          <div className="absolute border-2 border-critical animate-pulse" style={{ top: '35%', left: '25%', width: '120px', height: '80px', borderColor: 'var(--signal-critical)', boxShadow: '0 0 10px var(--signal-critical)' }}>
             <div className="absolute -top-6 left-0 bg-critical text-white text-[10px] font-mono px-1">NEW FACILITY (88% CONF)</div>
             <Crosshair size={24} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-critical" />
          </div>

          <div className="absolute border-2" style={{ top: '65%', left: '60%', width: '90px', height: '140px', borderColor: 'var(--accent-glow)' }}>
             <div className="absolute -top-6 left-0 text-white text-[10px] font-mono px-1" style={{ background: 'var(--accent-glow)' }}>EXCAVATION DIRT</div>
          </div>
        </div>
      </div>

      {/* Interface Overlay */}
      <div className="z-10 absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="glass-panel p-3 pointer-events-auto">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
            <Camera size={18} className="text-accent" /> SATINT ANALYSIS
          </h2>
          <div className="text-xs font-mono text-muted mt-1">COORD: 34.8842° N, 50.9958° E</div>
        </div>
        <div className="glass-panel p-3 pointer-events-auto flex gap-4 text-xs font-mono items-center">
          <span className="flex items-center gap-1 text-accent"><Scan size={14} className="animate-pulse" /> SCANNING...</span>
          <span className="text-muted">SAT: KHAYYAM-3</span>
          <span className="text-muted">RES: 0.5m</span>
        </div>
      </div>

      <div className="z-10 absolute bottom-4 left-4 glass-panel p-4 max-w-sm">
        <h3 className="text-sm font-bold text-primary mb-2 border-b border-color pb-1">Automated AI Detection Log</h3>
        <div className="flex flex-col gap-2 text-xs text-secondary font-mono">
          <p className="text-critical">&gt; [CRITICAL] Ground displacement detected near Entry Shaft 2.</p>
          <p>&gt; [NEUTRAL] Thermal signatures nominal at barracks.</p>
          <p>&gt; [WARNING] Unidentified heavy vehicles (x4) parked outside perimeter fence.</p>
        </div>
      </div>
    </div>
  );
};

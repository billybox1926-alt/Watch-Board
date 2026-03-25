import { useWorkspace } from '../../context/WorkspaceContext';
import type { AppId } from '../../context/WorkspaceContext';
import { Activity, Settings as SettingsIcon, Map, Globe, Clock, Zap, ShieldAlert, Camera, Plane, Anchor, Factory, DollarSign, Lock, Eye, Users, Flag } from 'lucide-react';

const APPS: { id: AppId; title: string; icon: React.ReactNode; width: number; height: number }[] = [
  { id: 'dashboard', title: 'Live Intelligence Feed', icon: <Activity size={24} />, width: 960, height: 700 },
  { id: 'map', title: 'Geospatial Radar', icon: <Map size={24} />, width: 800, height: 600 },
  { id: 'osint', title: 'OSINT Signal Stream', icon: <Globe size={24} />, width: 700, height: 750 },
  { id: 'timeline', title: 'Geopolitical Timeline', icon: <Clock size={24} />, width: 600, height: 800 },
  { id: 'energy', title: 'Energy & Infrastructure', icon: <Zap size={24} />, width: 850, height: 550 },
  { id: 'cyber', title: 'Cyber Warfare Command', icon: <ShieldAlert size={24} color="#2dd4bf" />, width: 900, height: 600 },
  { id: 'sat', title: 'SATINT Viewer', icon: <Camera size={24} color="#d1d5db" />, width: 800, height: 700 },
  { id: 'flight', title: 'Airspace Radar', icon: <Plane size={24} color="#38bdf8" />, width: 900, height: 600 },
  { id: 'naval', title: 'Naval Fleet Tracker', icon: <Anchor size={24} color="#818cf8" />, width: 1000, height: 650 },
  { id: 'nuclear', title: 'Nuclear Telemetry', icon: <Factory size={24} color="#f43f5e" />, width: 850, height: 750 },
  { id: 'econ', title: 'Sanctions & Economy', icon: <DollarSign size={24} color="#facc15" />, width: 900, height: 650 },
  { id: 'decrypt', title: 'Signal Decryptor', icon: <Lock size={24} color="#10b981" />, width: 850, height: 600 },
  { id: 'drone', title: 'UAV Surveillance', icon: <Eye size={24} color="#22d3ee" />, width: 900, height: 600 },
  { id: 'dossier', title: 'HVT Dossier Database', icon: <Users size={24} color="#e879f9" />, width: 950, height: 650 },
  { id: 'diplomacy', title: 'Diplomatic Matrix', icon: <Flag size={24} color="#a3e635" />, width: 850, height: 700 },
  { id: 'settings', title: 'System Configuration', icon: <SettingsIcon size={24} />, width: 800, height: 700 },
];

export const Taskbar: React.FC = () => {
  const { windows, openApp, minimizeWindow, activeWindowId, focusWindow } = useWorkspace();

  const handleAppClick = (appId: AppId, title: string, width: number, height: number) => {
    const existing = windows.find(w => w.appId === appId);
    if (!existing) {
      openApp(appId, title, width, height);
    } else {
      if (existing.isMinimized || activeWindowId !== existing.id) {
        focusWindow(existing.id);
      } else {
        minimizeWindow(existing.id);
      }
    }
  };

  return (
    <div 
      className="absolute bottom-6 left-1/2 flex items-center gap-4 px-4 py-3"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(5, 5, 8, 0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        zIndex: 9999
      }}
    >
      {APPS.map(app => {
        const isOpen = windows.some(w => w.appId === app.id);
        const isActive = windows.some(w => w.appId === app.id && w.id === activeWindowId && !w.isMinimized);

        return (
          <div key={app.id} className="relative group">
            <button
              onClick={() => handleAppClick(app.id, app.title, app.width, app.height)}
              className={`dock-icon p-3 rounded-xl flex items-center justify-center ${isActive ? 'text-primary' : 'text-muted'}`}
              style={{
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
              title={app.title}
            >
              {app.icon}
            </button>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tertiary px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none" style={{ transform: 'translateX(-50%)', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {app.title}
            </div>
            {/* Open Indicator */}
            {isOpen && (
              <div 
                className="absolute -bottom-1 left-1/2 rounded-full transition-all"
                style={{
                  transform: 'translateX(-50%)',
                  width: isActive ? '6px' : '4px',
                  height: isActive ? '6px' : '4px',
                  background: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 0 8px var(--accent-glow)' : 'none'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

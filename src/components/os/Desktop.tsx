import { useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Window } from './Window';
import { Taskbar } from './Taskbar';

import Dashboard from '../Dashboard';
import Settings from '../Settings';
import { MapApp } from '../../apps/MapApp';
import { OsintApp } from '../../apps/OsintApp';
import { TimelineApp } from '../../apps/TimelineApp';
import { EnergyMetricsApp } from '../../apps/EnergyMetricsApp';
import { CyberApp } from '../../apps/CyberApp';
import { SatApp } from '../../apps/SatApp';
import { FlightApp } from '../../apps/FlightApp';
import { NavalApp } from '../../apps/NavalApp';
import { NuclearApp } from '../../apps/NuclearApp';
import { EconApp } from '../../apps/EconApp';
import { DecryptorApp } from '../../apps/DecryptorApp';
import { DroneApp } from '../../apps/DroneApp';
import { DossierApp } from '../../apps/DossierApp';
import { DiplomacyApp } from '../../apps/DiplomacyApp';

// Stub Components for unbuilt applications
const AppStub: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 flex flex-col items-center justify-center h-full text-center" style={{ padding: '3rem' }}>
    <div className="glass-panel" style={{ maxWidth: '400px' }}>
      <h3 className="text-xl font-bold mb-3">{title} Module</h3>
      <p className="text-secondary text-sm">
        This intelligence module is currently offline or pending integration. 
        It will be securely provisioned in the next system deployment.
      </p>
    </div>
  </div>
);

export const Desktop: React.FC = () => {
  const { windows, openApp } = useWorkspace();

  // Auto-launch dashboard on startup
  useEffect(() => {
    if (windows.length === 0) {
      openApp('dashboard', 'Live Intelligence Feed', 960, 700);
    }
  }, [windows.length, openApp]);

  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      case 'map':
        return <MapApp />;
      case 'osint':
        return <OsintApp />;
      case 'timeline':
        return <TimelineApp />;
      case 'energy':
        return <EnergyMetricsApp />;
      case 'cyber':
        return <CyberApp />;
      case 'sat':
        return <SatApp />;
      case 'flight':
        return <FlightApp />;
      case 'naval':
        return <NavalApp />;
      case 'nuclear':
        return <NuclearApp />;
      case 'econ':
        return <EconApp />;
      case 'decrypt':
        return <DecryptorApp />;
      case 'drone':
        return <DroneApp />;
      case 'dossier':
        return <DossierApp />;
      case 'diplomacy':
        return <DiplomacyApp />;
      default:
        return <AppStub title="Unknown Component" />;
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" 
         style={{ 
           background: 'radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.08), transparent 50%), radial-gradient(circle at bottom left, rgba(255, 51, 102, 0.05), transparent 50%)',
           backgroundColor: 'var(--bg-primary)'
         }}>
      
      {/* Background Watermark/Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} />

      {/* Radar Sweep Effect */}
      <div className="relative w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="radar-overlay" />
      </div>

      {/* Render all open windows */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {windows.map(w => (
          <Window key={w.id} window={w}>
            {renderAppContent(w.appId)}
          </Window>
        ))}
      </div>

      <Taskbar />
    </div>
  );
};

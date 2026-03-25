import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type AppId = 'dashboard' | 'settings' | 'map' | 'osint' | 'timeline' | 'energy' | 'cyber' | 'sat' | 'flight' | 'naval' | 'nuclear' | 'econ' | 'decrypt' | 'drone' | 'dossier' | 'diplomacy';

export interface AppWindow {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface WorkspaceContextType {
  windows: AppWindow[];
  activeWindowId: string | null;
  focusedZIndex: number;
  openApp: (appId: AppId, title: string, defaultWidth?: number, defaultHeight?: number) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [focusedZIndex, setFocusedZIndex] = useState(10);

  const focusWindow = (id: string) => {
    setFocusedZIndex(prev => prev + 1);
    setWindows(prev => 
      prev.map(w => w.id === id ? { ...w, zIndex: focusedZIndex + 1, isMinimized: false } : w)
    );
    setActiveWindowId(id);
  };

  const openApp = (appId: AppId, title: string, defaultWidth = 900, defaultHeight = 600) => {
    // If exact app is already open, focus it
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    const newId = `${appId}-${Date.now()}`;
    // Stagger new windows slightly
    const offset = (windows.length % 5) * 30;
    
    // Safe dimensions to ensure it fits on small viewports (like laptops)
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    const safeWidth = Math.min(defaultWidth, vw - 40);
    const safeHeight = Math.min(defaultHeight, vh - 100);

    // Center on screen
    const x = Math.max(20, (vw - safeWidth) / 2 + offset);
    const y = Math.max(20, (vh - safeHeight) / 2 - 30 + offset);

    const newWindow: AppWindow = {
      id: newId,
      appId,
      title,
      x,
      y,
      width: safeWidth,
      height: safeHeight,
      zIndex: focusedZIndex + 1,
      isMinimized: false,
      isMaximized: false
    };

    setWindows(prev => [...prev, newWindow]);
    setFocusedZIndex(prev => prev + 1);
    setActiveWindowId(newId);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  return (
    <WorkspaceContext.Provider value={{
      windows,
      activeWindowId,
      focusedZIndex,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      toggleMaximizeWindow,
      updateWindowPosition,
      updateWindowSize
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

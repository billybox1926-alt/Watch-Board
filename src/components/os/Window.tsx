import { useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { AppWindow } from '../../context/WorkspaceContext';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  window: AppWindow;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window: appWindow, children }) => {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximizeWindow, updateWindowPosition, activeWindowId } = useWorkspace();
  const windowRef = useRef<HTMLDivElement>(null);
  const isFocused = activeWindowId === appWindow.id;

  // Simple drag implementation
  useEffect(() => {
    const handle = windowRef.current?.querySelector('.window-titlebar') as HTMLElement;
    const windowEl = windowRef.current;
    if (!handle || !windowEl || appWindow.isMaximized) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return; // Ignore buttons
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = appWindow.x;
      initialY = appWindow.y;
      handle.setPointerCapture(e.pointerId);
      focusWindow(appWindow.id);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      updateWindowPosition(appWindow.id, initialX + dx, initialY + dy);
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      handle.releasePointerCapture(e.pointerId);
    };

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);

    return () => {
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
    };
  }, [appWindow.id, appWindow.isMaximized, appWindow.x, appWindow.y, focusWindow, updateWindowPosition]);

  if (appWindow.isMinimized) return null;

  const style: React.CSSProperties = appWindow.isMaximized 
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 70px)', zIndex: appWindow.zIndex }
    : {
        top: `${appWindow.y}px`,
        left: `${appWindow.x}px`,
        width: `${appWindow.width}px`,
        height: `${appWindow.height}px`,
        maxWidth: 'calc(100vw - 20px)',
        maxHeight: 'calc(100vh - 100px)',
        zIndex: appWindow.zIndex,
      };

  return (
    <div 
      ref={windowRef}
      className={`absolute flex flex-col glass-window pointer-events-auto ${isFocused ? 'window-focused' : ''}`}
      style={{
        ...style,
        position: 'absolute',
        background: 'rgba(12, 12, 18, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: appWindow.isMaximized ? '0' : '12px',
        boxShadow: isFocused ? '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--accent-glow)' : '0 10px 30px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        transition: 'width 0.2s, height 0.2s, top 0.2s, left 0.2s', // animate maximize
      }}
      onPointerDown={() => !isFocused && focusWindow(appWindow.id)}
    >
      <div 
        className="window-titlebar flex justify-between items-center px-4 py-2 select-none"
        style={{
          background: isFocused ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)' : 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          cursor: appWindow.isMaximized ? 'default' : 'grab'
        }}
      >
        <span className="text-sm font-semibold text-primary font-heading tracking-wide">
          {appWindow.title}
        </span>
        
        <div className="flex items-center gap-2">
          <button onClick={() => minimizeWindow(appWindow.id)} className="window-btn hover:text-white text-muted transition-colors">
            <Minus size={14} />
          </button>
          <button onClick={() => toggleMaximizeWindow(appWindow.id)} className="window-btn hover:text-white text-muted transition-colors">
            <Square size={12} />
          </button>
          <button onClick={() => closeWindow(appWindow.id)} className="window-btn hover:text-critical text-muted transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative p-6">
        {children}
      </div>
    </div>
  );
};

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
          <div className="glass-panel text-center flex flex-col items-center" style={{ maxWidth: '400px' }}>
            <AlertOctagon size={48} className="text-critical mb-4" />
            <h2 className="text-xl font-bold mb-2">System Interruption</h2>
            <p className="text-sm text-secondary mb-6">
              A critical error occurred while rendering the intelligence dashboard. 
              {this.state.error?.message ? ` (${this.state.error.message})` : ''}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded font-medium transition-colors"
            >
              <RefreshCw size={16} /> Reload System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

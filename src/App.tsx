import { SettingsProvider } from './context/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { Desktop } from './components/os/Desktop';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <WorkspaceProvider>
          <Desktop />
        </WorkspaceProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;

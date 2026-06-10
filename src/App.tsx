import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import NavBar from './components/layout/NavBar';
import ViewContainer from './components/layout/ViewContainer';
import TodayView from './components/views/TodayView';
import UpcomingView from './components/views/UpcomingView';
import TemplateManager from './components/views/TemplateManager';
import SettingsView from './components/views/SettingsView';
import ToastContainer from './components/common/ToastContainer';

type ActiveView = 'today' | 'upcoming' | 'templates' | 'settings';

function AppContent() {
  const [activeView, setActiveView] = useState<ActiveView>('today');

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return <TodayView />;
      case 'upcoming':
        return <UpcomingView />;
      case 'templates':
        return <TemplateManager />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <>
      <ErrorBoundary>
        <NavBar activeView={activeView} onNavigate={setActiveView} />
        <ViewContainer>
          {renderView()}
        </ViewContainer>
      </ErrorBoundary>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;

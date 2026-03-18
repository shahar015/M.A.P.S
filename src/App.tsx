import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ScenariosView from './components/ScenariosView';
import UnitConfigView from './components/UnitConfigView';
import TacticalMapView from './components/TacticalMapView';
import NewScenarioModal from './components/NewScenarioModal';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ProfileView from './components/ProfileView';
import { UnitConfigProvider } from './context/UnitConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PolygonData } from './types';

export type ViewState = 'login' | 'signup' | 'scenarios' | 'unit-config' | 'tactical-map' | 'profile';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(isAuthenticated ? 'scenarios' : 'login');
  const [isNewScenarioModalOpen, setIsNewScenarioModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenarioPolygons, setScenarioPolygons] = useState<Record<string, PolygonData[]>>({});

  // Redirect to login on logout
  useEffect(() => {
    if (!isAuthenticated) setCurrentView('login');
  }, [isAuthenticated]);

  // Redirect to scenarios on login (when transitioning from not-auth to auth)
  const prevAuth = React.useRef(isAuthenticated);
  useEffect(() => {
    if (isAuthenticated && !prevAuth.current) setCurrentView('scenarios');
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  const handleOpenScenario = (id: string) => {
    setSelectedScenario(id);
    setCurrentView('tactical-map');
  };

  const handleSetPolygons = useCallback((scenarioId: string, polygons: PolygonData[]) => {
    setScenarioPolygons(prev => ({ ...prev, [scenarioId]: polygons }));
  }, []);

  // Not authenticated — show login or signup only
  if (!isAuthenticated) {
    if (currentView === 'signup') {
      return <SignUpView onSwitchToLogin={() => setCurrentView('login')} />;
    }
    return <LoginView onSwitchToSignup={() => setCurrentView('signup')} />;
  }

  // Authenticated
  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-slate-100 font-display selection:bg-primary selection:text-black overflow-hidden relative">
      <Header currentView={currentView} setCurrentView={setCurrentView} selectedScenario={selectedScenario} />

      {currentView === 'scenarios' && (
        <ScenariosView
          onOpenScenario={handleOpenScenario}
          onNewScenario={() => setIsNewScenarioModalOpen(true)}
        />
      )}

      {currentView === 'unit-config' && <UnitConfigView />}

      {currentView === 'tactical-map' && selectedScenario && (
        <TacticalMapView
          scenarioId={selectedScenario}
          polygons={scenarioPolygons[selectedScenario] || []}
          onPolygonsChange={handleSetPolygons}
        />
      )}

      {currentView === 'profile' && (
        <ProfileView onBack={() => setCurrentView('scenarios')} />
      )}

      {isNewScenarioModalOpen && (
        <NewScenarioModal onClose={() => setIsNewScenarioModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UnitConfigProvider>
        <AppContent />
      </UnitConfigProvider>
    </AuthProvider>
  );
}

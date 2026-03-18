import React from 'react';
import { Radar, Globe, ChevronDown, Map, Settings, User } from 'lucide-react';
import { ViewState } from '../App';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  selectedScenario: string | null;
}

export default function Header({ currentView, setCurrentView, selectedScenario }: HeaderProps) {
  const { currentUser } = useAuth();

  const initials = currentUser
    ? ((currentUser.firstName[0] || '') + (currentUser.lastName[0] || '')).toUpperCase() || '?'
    : '?';

  return (
    <>
      {/* Top Header Bar */}
      <header className="relative z-50 flex items-center justify-between px-4 md:px-6 py-4 bg-surface-glass backdrop-blur-md border-b border-primary/20 h-14 md:h-16 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => setCurrentView('scenarios')}>
          <div className="size-7 sm:size-8 text-primary flex items-center justify-center border border-primary/50 rounded bg-primary/10 shadow-[0_0_10px_rgba(13,242,13,0.2)]">
            <Radar size={18} />
          </div>
          <div>
            <h1 className="text-white text-sm sm:text-lg font-bold tracking-widest leading-none uppercase drop-shadow-[0_0_5px_rgba(13,242,13,0.5)]">
              M.A.P.S. <span className="text-primary">Command</span>
            </h1>
            <p className="hidden sm:block text-xs text-primary/60 font-mono tracking-widest">SYS.ONLINE // V.2.4.1</p>
          </div>
        </div>

        {/* Desktop center nav */}
        {currentView !== 'tactical-map' && currentView !== 'profile' && (
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
            <button
              onClick={() => setCurrentView('scenarios')}
              className={`relative py-2 font-bold tracking-widest text-sm uppercase transition-all group ${currentView === 'scenarios' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
            >
              SCENARIOS
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${currentView === 'scenarios' ? 'w-full shadow-[0_0_8px_rgba(13,242,13,0.8)]' : 'w-0 group-hover:w-full'}`}></span>
            </button>
            <button
              onClick={() => setCurrentView('unit-config')}
              className={`relative py-2 font-bold tracking-widest text-sm uppercase transition-all group ${currentView === 'unit-config' ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}
            >
              UNIT CONFIG
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${currentView === 'unit-config' ? 'w-full shadow-[0_0_8px_rgba(13,242,13,0.8)]' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          </nav>
        )}

        <div className="flex items-center gap-3 md:gap-4">
          {currentView === 'tactical-map' && (
            <div className="hidden md:flex items-center bg-surface-dark/80 rounded-lg border border-primary/20 px-3 py-1.5 gap-2">
              <Globe size={16} className="text-primary" />
              <span className="text-xs text-slate-300 font-mono uppercase">Scenario: {selectedScenario || 'Operation Deep Watch'}</span>
              <ChevronDown size={16} className="text-slate-500 cursor-pointer hover:text-white" />
            </div>
          )}
          {currentView !== 'tactical-map' && currentView !== 'profile' && (
            <div className="hidden md:flex items-center gap-3">
              <div className="px-3 py-1 bg-black border border-primary/40 rounded-sm text-xs text-primary font-mono shadow-[0_0_5px_rgba(13,242,13,0.2)]">
                  SYS: ONLINE
              </div>
            </div>
          )}
          <button
            onClick={() => setCurrentView('profile')}
            className="size-8 rounded-full bg-primary/20 border border-primary text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:shadow-[0_0_12px_rgba(13,242,13,0.5)] transition-shadow"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar — hidden on tactical map and on desktop */}
      {currentView !== 'tactical-map' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-surface-glass backdrop-blur-md border-t border-primary/20 h-14 px-2">
          <button
            onClick={() => setCurrentView('scenarios')}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${currentView === 'scenarios' ? 'text-primary' : 'text-slate-500'}`}
          >
            <Map size={20} />
            <span className="text-[10px] font-bold tracking-wider uppercase">Scenarios</span>
          </button>
          <button
            onClick={() => setCurrentView('unit-config')}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${currentView === 'unit-config' ? 'text-primary' : 'text-slate-500'}`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-bold tracking-wider uppercase">Config</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${currentView === 'profile' ? 'text-primary' : 'text-slate-500'}`}
          >
            <User size={20} />
            <span className="text-[10px] font-bold tracking-wider uppercase">Profile</span>
          </button>
        </nav>
      )}
    </>
  );
}

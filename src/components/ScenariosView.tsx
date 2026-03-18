import React, { useState } from 'react';
import { Plus, Search, MoreVertical, MapPin, Edit, Trash2 } from 'lucide-react';
import EditScenarioModal from './EditScenarioModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ScenariosViewProps {
  onOpenScenario: (id: string) => void;
  onNewScenario: () => void;
}

const INITIAL_SCENARIOS = [
  {
    id: 'Operation Northern Shield',
    title: 'Operation Northern Shield',
    desc: 'Deployment of specialized units along the northern border for reconnaissance and subterranean threat detection.',
    code: 'NBD-2024-ALPHA',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'Negev Training Sim 04',
    title: 'Negev Training Sim 04',
    desc: 'High-intensity armored division maneuvers in arid environment simulating multi-front engagement scenarios.',
    code: 'NGV-TR-004',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'Coastal Plain Logistics',
    title: 'Coastal Plain Logistics',
    desc: 'Supply chain resilience testing focusing on urban centers and coastal infrastructure defense mechanisms.',
    code: 'CPL-LOG-23',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'Jerusalem Corridor',
    title: 'Jerusalem Corridor',
    desc: 'Complex urban warfare simulation in mountainous terrain emphasizing verticality and historical site preservation.',
    code: 'JCP-PAT-09',
    image: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'Golan Rapid Response',
    title: 'Golan Rapid Response',
    desc: 'Strategic training exercise focused on rapid response deployment and electronic warfare countermeasures on the plateau.',
    code: 'GRR-SEC-88',
    image: 'https://images.unsplash.com/photo-1508349937151-22b68b72d5b1?auto=format&fit=crop&q=80&w=800',
  }
];

export default function ScenariosView({ onOpenScenario, onNewScenario }: ScenariosViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
  const [scenarioToEdit, setScenarioToEdit] = useState<any | null>(null);

  const filteredScenarios = scenarios.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScenarioToDelete(id);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (scenarioToDelete) {
      setScenarios(scenarios.filter(s => s.id !== scenarioToDelete));
      setScenarioToDelete(null);
    }
  };

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      setScenarioToEdit(scenario);
    }
    setOpenMenuId(null);
  };

  const saveEdit = (updatedScenario: any) => {
    setScenarios(scenarios.map(s => s.id === updatedScenario.id ? updatedScenario : s));
    setScenarioToEdit(null);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <main className="flex-1 px-4 md:px-6 py-6 md:py-8 w-full mx-auto flex flex-col gap-5 md:gap-8 pb-20 md:pb-12 overflow-y-auto bg-grid-pattern" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-surface-highlight">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary uppercase">Scenarios</h1>
        <button
          onClick={onNewScenario}
          className="group flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary font-bold py-2 px-3 md:py-3 md:px-6 rounded-sm transition-all shadow-[0_0_15px_rgba(13,242,13,0.15)] hover:shadow-[0_0_25px_rgba(13,242,13,0.4)] transform active:scale-95 uppercase tracking-wide text-xs md:text-sm shrink-0"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span className="hidden sm:inline">New Scenario</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-end">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-surface-highlight rounded-sm leading-5 bg-surface-dark text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all shadow-sm font-mono uppercase tracking-wide"
            placeholder="Search scenario..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile list layout */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => onOpenScenario(scenario.id)}
            className="group relative flex items-center gap-3 p-3 bg-surface-dark border border-surface-highlight rounded-lg cursor-pointer hover:border-primary transition-all active:scale-[0.98]"
          >
            <div className="h-14 w-20 shrink-0 rounded overflow-hidden bg-black border border-surface-highlight">
              <div
                className="w-full h-full bg-cover bg-center map-preview-filter"
                style={{ backgroundImage: `url("${scenario.image}")` }}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide leading-tight truncate group-hover:text-primary transition-colors">{scenario.title}</h3>
              <span className="text-[11px] font-mono text-primary tracking-widest">{scenario.code}</span>
            </div>
            <div className="relative shrink-0">
              <button
                className="text-slate-500 hover:text-primary transition-colors p-1 rounded hover:bg-surface-highlight"
                onClick={(e) => toggleMenu(scenario.id, e)}
              >
                <MoreVertical size={18} />
              </button>
              {openMenuId === scenario.id && (
                <div className="absolute right-0 mt-1 w-36 bg-surface-dark border border-surface-highlight rounded-md shadow-lg overflow-hidden z-40">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-highlight hover:text-white flex items-center gap-2"
                    onClick={(e) => handleEditClick(scenario.id, e)}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                    onClick={(e) => handleDeleteClick(scenario.id, e)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredScenarios.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No scenarios found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Desktop card grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScenarios.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => onOpenScenario(scenario.id)}
            className="group relative flex flex-col bg-surface-dark border border-surface-highlight rounded-sm overflow-hidden hover:border-primary transition-all duration-300 shadow-sm hover:shadow-neon h-full cursor-pointer"
          >
            <div className="relative h-48 w-full overflow-hidden bg-black border-b border-surface-highlight group-hover:border-primary/50 transition-colors shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,#000_2px),linear-gradient(90deg,transparent_2px,#000_2px)] bg-[size:20px_20px] opacity-20 z-20 pointer-events-none"></div>
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 map-preview-filter"
                style={{ backgroundImage: `url("${scenario.image}")` }}
              ></div>
              <div className="absolute bottom-3 right-3 z-20 flex gap-1">
                <MapPin className="text-primary drop-shadow-[0_0_2px_#000]" size={20} />
              </div>
            </div>
            <div className="flex flex-col p-4 gap-3 flex-1 relative bg-surface-dark">
              <div className="absolute top-4 right-4 z-30">
                <button
                  className="text-slate-500 hover:text-primary transition-colors p-1 rounded hover:bg-surface-highlight"
                  onClick={(e) => toggleMenu(scenario.id, e)}
                >
                  <MoreVertical size={20} />
                </button>

                {openMenuId === scenario.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-surface-dark border border-surface-highlight rounded-md shadow-lg overflow-hidden z-40">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-highlight hover:text-white flex items-center gap-2"
                      onClick={(e) => handleEditClick(scenario.id, e)}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                      onClick={(e) => handleDeleteClick(scenario.id, e)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-start pr-8 gap-1 mb-auto">
                <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide leading-tight group-hover:text-primary transition-colors">{scenario.title}</h3>
                <p className="text-sm text-slate-400 font-light line-clamp-2">{scenario.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-highlight flex justify-between items-center group-hover:border-primary/20 transition-colors">
                <span className="text-xs font-mono font-medium text-primary tracking-widest">{scenario.code}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredScenarios.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No scenarios found matching "{searchQuery}"
          </div>
        )}
      </div>

      {scenarioToDelete && (
        <DeleteConfirmationModal
          scenarioName={scenarios.find(s => s.id === scenarioToDelete)?.title || ''}
          onClose={() => setScenarioToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {scenarioToEdit && (
        <EditScenarioModal
          scenario={scenarioToEdit}
          onClose={() => setScenarioToEdit(null)}
          onSave={saveEdit}
        />
      )}
    </main>
  );
}

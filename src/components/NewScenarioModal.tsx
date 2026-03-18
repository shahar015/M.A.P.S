import React from 'react';
import { PlusCircle, Fingerprint, X, Rocket } from 'lucide-react';

interface NewScenarioModalProps {
  onClose: () => void;
}

export default function NewScenarioModal({ onClose }: NewScenarioModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
      <div className="bg-surface-glass backdrop-blur-xl w-full max-w-lg border border-primary/40 shadow-[0_0_30px_rgba(13,242,13,0.15)] rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-primary/20 flex items-center justify-between bg-surface-dark/40">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-primary" size={24} />
            <h2 className="text-white text-lg font-bold tracking-wide uppercase">New Scenario Protocol</h2>
          </div>
          <div className="text-[10px] text-primary/60 font-mono border border-primary/20 px-2 py-0.5 rounded">ID_GEN_AUTO</div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="relative group">
            <input 
              id="scenario-name" 
              className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200" 
              placeholder="Scenario Name" 
              type="text" 
              defaultValue="Northern Perimeter"
            />
            <label 
              htmlFor="scenario-name"
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
            >
              Scenario Name
            </label>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
          </div>
          
          <div className="relative group">
            <input 
              id="scenario-id" 
              className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white font-mono uppercase tracking-wider placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200" 
              placeholder="Scenario Code" 
              type="text" 
              defaultValue="NP-2024-X"
            />
            <label 
              htmlFor="scenario-id"
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
            >
              Scenario Code (ID)
            </label>
            <Fingerprint className="absolute right-4 top-4 text-primary/40 pointer-events-none" size={20} />
          </div>
          
          <div className="relative group">
            <textarea 
              id="scenario-desc" 
              className="peer block w-full rounded border border-slate-600 bg-background-dark/50 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 resize-none" 
              placeholder="Scenario Description" 
              rows={4}
            ></textarea>
            <label 
              htmlFor="scenario-desc"
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-sm text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary"
            >
              Scenario Description
            </label>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/0 group-hover:border-primary/50 transition-all duration-300"></div>
          </div>
        </div>
        
        <div className="px-4 md:px-6 py-4 bg-surface-dark/60 border-t border-primary/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium tracking-wide"
          >
            <X className="group-hover:rotate-90 transition-transform duration-300" size={20} />
            CANCEL
          </button>
          <button 
            onClick={onClose}
            className="relative overflow-hidden bg-primary hover:bg-primary-dark text-background-dark font-bold text-sm px-8 py-2.5 rounded shadow-[0_0_15px_rgba(13,242,13,0.4)] hover:shadow-[0_0_25px_rgba(13,242,13,0.6)] transition-all duration-200 flex items-center gap-2 group"
          >
            <Rocket size={20} />
            CREATE SCENARIO
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
          </button>
        </div>
        
        <div className="h-1 w-full flex">
          <div className="h-full bg-primary/20 w-1/4"></div>
          <div className="h-full bg-primary/40 w-1/4"></div>
          <div className="h-full bg-primary/60 w-1/4"></div>
          <div className="h-full bg-primary w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

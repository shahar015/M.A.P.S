import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  scenarioName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({ scenarioName, onClose, onConfirm }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
      <div className="bg-surface-glass backdrop-blur-xl w-full max-w-md border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)] rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-3 bg-red-500/10">
          <AlertTriangle className="text-red-500" size={24} />
          <h2 className="text-white text-lg font-bold tracking-wide uppercase">Confirm Deletion</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to delete the scenario <span className="text-white font-bold">"{scenarioName}"</span>? 
            This action cannot be undone and all associated tactical data will be permanently erased.
          </p>
        </div>
        
        <div className="px-6 py-4 bg-surface-dark/60 border-t border-red-500/20 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="group flex items-center gap-2 px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium tracking-wide"
          >
            <X className="group-hover:rotate-90 transition-transform duration-300" size={20} />
            CANCEL
          </button>
          <button 
            onClick={onConfirm}
            className="relative overflow-hidden bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-6 py-2.5 rounded shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-200 flex items-center gap-2 group"
          >
            <Trash2 size={18} />
            DELETE SCENARIO
          </button>
        </div>
        
        <div className="h-1 w-full flex">
          <div className="h-full bg-red-500/20 w-1/4"></div>
          <div className="h-full bg-red-500/40 w-1/4"></div>
          <div className="h-full bg-red-500/60 w-1/4"></div>
          <div className="h-full bg-red-500 w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

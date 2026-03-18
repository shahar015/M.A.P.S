import React, { useState, useEffect } from 'react';
import { Crosshair, Shield, Edit2, CheckCircle2 } from 'lucide-react';
import { RifleIcon } from './icons/RifleIcon';
import { useUnitConfigs, UnitType } from '../context/UnitConfigContext';

export default function UnitConfigView() {
  const { configs, updateConfig } = useUnitConfigs();
  const [localConfigs, setLocalConfigs] = useState(configs);
  const [savedStatus, setSavedStatus] = useState<Record<UnitType, boolean>>({
    sniper: false,
    rifle: false,
    shotgun: false
  });

  const handleSave = (type: UnitType) => {
    updateConfig(type, localConfigs[type]);
    setSavedStatus(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleChange = (type: UnitType, field: 'radius' | 'opening', value: number) => {
    setLocalConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern"></div>
      
      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 z-10 flex items-start md:items-center justify-center overflow-y-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Sniper Config */}
          <div className="bg-surface-dark/80 backdrop-blur border border-primary/20 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-primary/50 transition-colors group flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-primary/10 bg-surface-highlight/30">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center text-primary border border-primary/20 group-hover:shadow-[0_0_15px_rgba(13,242,13,0.2)] transition-all">
                  <Crosshair size={28} />
                </div>
                <span className="px-2 py-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded uppercase tracking-wider">Long Range</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">SNIPER</h3>
              <p className="text-slate-400 text-xs mt-1">High precision, narrow field of view.</p>
            </div>
            <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 md:gap-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Radius</span>
                  <span className="font-mono text-primary">{localConfigs.sniper.radius}m</span>
                </div>
                <input 
                  type="range" min="0" max="1000" step="10"
                  value={localConfigs.sniper.radius} 
                  onChange={(e) => handleChange('sniper', 'radius', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Opening</span>
                  <span className="font-mono text-primary">{localConfigs.sniper.opening}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" step="5"
                  value={localConfigs.sniper.opening} 
                  onChange={(e) => handleChange('sniper', 'opening', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
            <div className="p-4 md:p-6 pt-0 mt-auto">
              <button 
                onClick={() => handleSave('sniper')}
                className={`w-full py-2.5 rounded border font-bold text-sm tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                  savedStatus.sniper 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-highlight border-primary/30 text-primary hover:bg-primary hover:text-surface-dark hover:shadow-primary/20'
                }`}
              >
                {savedStatus.sniper ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
                {savedStatus.sniper ? 'SAVED' : 'SAVE CONFIG EDIT'}
              </button>
            </div>
          </div>

          {/* Rifle Config */}
          <div className="bg-surface-dark/80 backdrop-blur border border-primary/20 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-primary/50 transition-colors group flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-primary/10 bg-surface-highlight/30">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center text-primary border border-primary/20 group-hover:shadow-[0_0_15px_rgba(13,242,13,0.2)] transition-all">
                  <RifleIcon size={28} />
                </div>
                <span className="px-2 py-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded uppercase tracking-wider">Mid Range</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">RIFLE</h3>
              <p className="text-slate-400 text-xs mt-1">Balanced range and field of view.</p>
            </div>
            <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 md:gap-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Radius</span>
                  <span className="font-mono text-primary">{localConfigs.rifle.radius}m</span>
                </div>
                <input 
                  type="range" min="0" max="500" step="10"
                  value={localConfigs.rifle.radius} 
                  onChange={(e) => handleChange('rifle', 'radius', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Opening</span>
                  <span className="font-mono text-primary">{localConfigs.rifle.opening}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" step="5"
                  value={localConfigs.rifle.opening} 
                  onChange={(e) => handleChange('rifle', 'opening', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
            <div className="p-4 md:p-6 pt-0 mt-auto">
              <button 
                onClick={() => handleSave('rifle')}
                className={`w-full py-2.5 rounded border font-bold text-sm tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                  savedStatus.rifle 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-highlight border-primary/30 text-primary hover:bg-primary hover:text-surface-dark hover:shadow-primary/20'
                }`}
              >
                {savedStatus.rifle ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
                {savedStatus.rifle ? 'SAVED' : 'SAVE CONFIG EDIT'}
              </button>
            </div>
          </div>

          {/* Shotgun Config */}
          <div className="bg-surface-dark/80 backdrop-blur border border-primary/20 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-primary/50 transition-colors group flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-primary/10 bg-surface-highlight/30">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center text-primary border border-primary/20 group-hover:shadow-[0_0_15px_rgba(13,242,13,0.2)] transition-all">
                  <Shield size={28} />
                </div>
                <span className="px-2 py-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded uppercase tracking-wider">Close Range</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">SHOTGUN</h3>
              <p className="text-slate-400 text-xs mt-1">Short range, wide area denial.</p>
            </div>
            <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 md:gap-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Radius</span>
                  <span className="font-mono text-primary">{localConfigs.shotgun.radius}m</span>
                </div>
                <input 
                  type="range" min="0" max="250" step="5"
                  value={localConfigs.shotgun.radius} 
                  onChange={(e) => handleChange('shotgun', 'radius', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  <span>Coverage Opening</span>
                  <span className="font-mono text-primary">{localConfigs.shotgun.opening}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" step="5"
                  value={localConfigs.shotgun.opening} 
                  onChange={(e) => handleChange('shotgun', 'opening', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
            <div className="p-4 md:p-6 pt-0 mt-auto">
              <button 
                onClick={() => handleSave('shotgun')}
                className={`w-full py-2.5 rounded border font-bold text-sm tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                  savedStatus.shotgun 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-highlight border-primary/30 text-primary hover:bg-primary hover:text-surface-dark hover:shadow-primary/20'
                }`}
              >
                {savedStatus.shotgun ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
                {savedStatus.shotgun ? 'SAVED' : 'SAVE CONFIG EDIT'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

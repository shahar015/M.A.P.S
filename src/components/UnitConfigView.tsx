import React, { useState } from 'react';
import { Crosshair, Shield, Edit2, CheckCircle2 } from 'lucide-react';
import { RifleIcon } from './icons/RifleIcon';
import { useUnitConfigs, UnitType } from '../context/UnitConfigContext';

// Editable number field — click the value to type, or use the slider
function EditableValue({ value, onChange, unit, min, max, step }: {
  value: number;
  onChange: (v: number) => void;
  unit: string;
  min: number;
  max: number;
  step: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); }}
          className="w-20 bg-background-dark/80 border border-primary/60 rounded px-2 py-0.5 text-xs text-primary font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary/60"
        />
        <span className="text-primary font-mono text-xs">{unit}</span>
      </div>
    );
  }

  return (
    <span
      onClick={startEdit}
      className="font-mono text-primary cursor-pointer hover:underline hover:decoration-primary/50 decoration-dashed underline-offset-2"
      title="Click to edit"
    >
      {value}{unit}
    </span>
  );
}

// Config for each unit type
const UNIT_DEFS: { type: UnitType; label: string; desc: string; badge: string; icon: 'sniper' | 'rifle' | 'shotgun'; maxRadiusKm: number }[] = [
  { type: 'sniper', label: 'SNIPER', desc: 'High precision, narrow field of view.', badge: 'Long Range', icon: 'sniper', maxRadiusKm: 10 },
  { type: 'rifle', label: 'RIFLE', desc: 'Balanced range and field of view.', badge: 'Mid Range', icon: 'rifle', maxRadiusKm: 5 },
  { type: 'shotgun', label: 'SHOTGUN', desc: 'Short range, wide area denial.', badge: 'Close Range', icon: 'shotgun', maxRadiusKm: 2.5 },
];

function UnitIcon({ type, size }: { type: 'sniper' | 'rifle' | 'shotgun'; size: number }) {
  if (type === 'sniper') return <Crosshair size={size} />;
  if (type === 'rifle') return <RifleIcon size={size} />;
  return <Shield size={size} />;
}

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
      [type]: { ...prev[type], [field]: value }
    }));
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-dark relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern"></div>

      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 z-10 flex items-start md:items-center justify-center overflow-y-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {UNIT_DEFS.map((def) => {
            const cfg = localConfigs[def.type];
            const radiusKm = cfg.radius / 1000;

            return (
              <div key={def.type} className="bg-surface-dark/80 backdrop-blur border border-primary/20 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-primary/50 transition-colors group flex flex-col h-full">
                <div className="p-4 md:p-6 border-b border-primary/10 bg-surface-highlight/30">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded bg-slate-800/50 flex items-center justify-center text-primary border border-primary/20 group-hover:shadow-[0_0_15px_rgba(13,242,13,0.2)] transition-all">
                      <UnitIcon type={def.icon} size={28} />
                    </div>
                    <span className="px-2 py-1 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 rounded uppercase tracking-wider">{def.badge}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{def.label}</h3>
                  <p className="text-slate-400 text-xs mt-1">{def.desc}</p>
                </div>

                <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 md:gap-6">
                  {/* Radius — displayed in km, stored in meters */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                      <span>Coverage Radius</span>
                      <EditableValue
                        value={parseFloat(radiusKm.toFixed(1))}
                        onChange={(km) => handleChange(def.type, 'radius', Math.round(km * 1000))}
                        unit="km"
                        min={0}
                        max={def.maxRadiusKm}
                        step={0.1}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={def.maxRadiusKm * 1000}
                      step="500"
                      value={cfg.radius}
                      onChange={(e) => handleChange(def.type, 'radius', parseInt(e.target.value))}
                      className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                      <span>0km</span>
                      <span>{def.maxRadiusKm}km</span>
                    </div>
                  </div>

                  {/* Opening — degrees */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                      <span>Coverage Opening</span>
                      <EditableValue
                        value={cfg.opening}
                        onChange={(deg) => handleChange(def.type, 'opening', Math.round(deg))}
                        unit="°"
                        min={0}
                        max={360}
                        step={1}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={cfg.opening}
                      onChange={(e) => handleChange(def.type, 'opening', parseInt(e.target.value))}
                      className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                      <span>0°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 pt-0 mt-auto">
                  <button
                    onClick={() => handleSave(def.type)}
                    className={`w-full py-2.5 rounded border font-bold text-sm tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                      savedStatus[def.type]
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-highlight border-primary/30 text-primary hover:bg-primary hover:text-surface-dark hover:shadow-primary/20'
                    }`}
                  >
                    {savedStatus[def.type] ? <CheckCircle2 size={18} /> : <Edit2 size={18} />}
                    {savedStatus[def.type] ? 'SAVED' : 'SAVE CONFIG EDIT'}
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}

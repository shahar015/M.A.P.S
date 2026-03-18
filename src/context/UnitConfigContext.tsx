import React, { createContext, useContext, useState } from 'react';

export type UnitType = 'sniper' | 'rifle' | 'shotgun';

export interface UnitConfig {
  radius: number; // in meters
  opening: number; // in degrees
}

export type UnitConfigs = Record<UnitType, UnitConfig>;

interface UnitConfigContextType {
  configs: UnitConfigs;
  updateConfig: (type: UnitType, config: Partial<UnitConfig>) => void;
}

const defaultConfigs: UnitConfigs = {
  sniper: { radius: 1000, opening: 45 },
  rifle: { radius: 500, opening: 90 },
  shotgun: { radius: 250, opening: 160 },
};

const UnitConfigContext = createContext<UnitConfigContextType | undefined>(undefined);

export const UnitConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<UnitConfigs>(defaultConfigs);

  const updateConfig = (type: UnitType, newConfig: Partial<UnitConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [type]: { ...prev[type], ...newConfig }
    }));
  };

  return (
    <UnitConfigContext.Provider value={{ configs, updateConfig }}>
      {children}
    </UnitConfigContext.Provider>
  );
};

export const useUnitConfigs = () => {
  const context = useContext(UnitConfigContext);
  if (!context) throw new Error('useUnitConfigs must be used within UnitConfigProvider');
  return context;
};

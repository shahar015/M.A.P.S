import { UnitType } from './context/UnitConfigContext';

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
}

export type Point = { lat: number; lng: number };

export interface DeployedUnit {
  lat: number;
  lng: number;
  type: UnitType;
  azimuth: number;
  name: string;
}

export interface PolygonData {
  id: string;
  points: Point[];
  name: string;
  snipers: number;
  rifles: number;
  shotguns: number;
  deployedUnits: DeployedUnit[];
  coveragePercent: number;
  optimizationComplete: boolean;
  lastOptimizedParams: { snipers: number; rifles: number; shotguns: number } | null;
}

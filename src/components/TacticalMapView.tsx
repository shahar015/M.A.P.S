import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayCircle, Crosshair, Shield, Plus, Minus, MapPin, X, Loader2, CheckCircle2 } from 'lucide-react';
import { RifleIcon } from './icons/RifleIcon';
import { useUnitConfigs, UnitType } from '../context/UnitConfigContext';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Tooltip, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Point, DeployedUnit, PolygonData } from '../types';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TacticalMapViewProps {
  scenarioId: string;
  polygons: PolygonData[];
  onPolygonsChange: (scenarioId: string, polygons: PolygonData[]) => void;
}

const createCustomIcon = (svgString: string, color: string, rotation: number = 0) => {
  const isRifle = svgString.includes('M22 10v2h-8');
  const finalRotation = isRifle ? rotation - 90 : rotation;

  return L.divIcon({
    html: `<div style="color: ${color}; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; filter: drop-shadow(0 0 4px ${color}); transform: rotate(${finalRotation}deg); transition: transform 0.3s ease;">${svgString}</div>`,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const sniperIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>`;
const rifleIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v2h-8L11 14H6l-2 4H2l2-4H2V10h4l2-2h6l2 2h6z" /><path d="M10 14v4h3v-4" /><path d="M14 10V8h2v2" /></svg>`;
const shotgunIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;

function getIconSvg(type: UnitType) {
  return type === 'sniper' ? sniperIconSvg : type === 'rifle' ? rifleIconSvg : shotgunIconSvg;
}

function getUnitColor(type: UnitType) {
  return type === 'sniper' ? '#ef4444' : type === 'rifle' ? '#0df20d' : '#3b82f6';
}

// --- Tooltip content for deployed unit markers ---
function UnitTooltipContent({ unit, polygonId, unitIndex, onNameChange }: {
  unit: DeployedUnit;
  polygonId: string;
  unitIndex: number;
  onNameChange: (polygonId: string, unitIndex: number, name: string) => void;
}) {
  const [localName, setLocalName] = useState(unit.name);

  const commit = () => {
    if (localName !== unit.name) onNameChange(polygonId, unitIndex, localName);
  };

  return (
    <div style={{ minWidth: '190px' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', fontFamily: 'monospace' }}>
        {unit.lat.toFixed(6)}°, {unit.lng.toFixed(6)}°
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
        Azimuth: {unit.azimuth}°
      </div>
      <input
        type="text"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); } }}
        placeholder="Name this unit..."
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          padding: '3px 6px',
          fontSize: '11px',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '4px',
          color: 'white',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

// --- Map click / draw handler ---
function MapInteraction({
  isDrawing,
  drawingPointsRef,
  onAddDrawingPoint,
  setTempPoint,
  onCompleteDrawing,
  polygons,
  onSelectPolygon,
}: {
  isDrawing: boolean;
  drawingPointsRef: React.MutableRefObject<Point[]>;
  onAddDrawingPoint: (pt: Point) => void;
  setTempPoint: (pt: Point | null) => void;
  onCompleteDrawing: () => void;
  polygons: PolygonData[];
  onSelectPolygon: (id: string | null) => void;
}) {
  const map = useMapEvents({
    click(e) {
      if (isDrawing) {
        const { lat, lng } = e.latlng;
        const pts = drawingPointsRef.current;

        // Snap-close if clicking near first point
        if (pts.length > 2) {
          const firstPoint = pts[0];
          const p1 = map.latLngToContainerPoint(e.latlng);
          const p2 = map.latLngToContainerPoint([firstPoint.lat, firstPoint.lng]);
          const pixelDistance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

          if (pixelDistance < 30) {
            setTempPoint(null);
            onCompleteDrawing();
            return;
          }
        }

        onAddDrawingPoint({ lat, lng });
      } else {
        const pt: Point = { lat: e.latlng.lat, lng: e.latlng.lng };
        for (let i = polygons.length - 1; i >= 0; i--) {
          if (polygons[i].points.length > 2 && isPointInPolygon(pt, polygons[i].points)) {
            onSelectPolygon(polygons[i].id);
            return;
          }
        }
        onSelectPolygon(null);
      }
    },
    dblclick(e) {
      if (isDrawing && drawingPointsRef.current.length >= 2) {
        // Double-click completes the polygon (don't add the point, just close)
        setTempPoint(null);
        onCompleteDrawing();
      }
    },
    mousemove(e) {
      if (!isDrawing || drawingPointsRef.current.length === 0) return;
      setTempPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <>
      <button onClick={() => map.zoomIn()} className="w-10 h-10 bg-surface-dark/80 backdrop-blur border border-surface-highlight rounded flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-colors shadow-lg">
        <Plus size={20} />
      </button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 bg-surface-dark/80 backdrop-blur border border-surface-highlight rounded flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary transition-colors shadow-lg">
        <Minus size={20} />
      </button>
    </>
  );
}

// --- Draggable bottom sheet for mobile ---
function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; currentY: number } | null>(null);
  const [snapState, setSnapState] = useState<'open' | 'closed'>('open');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (open) setSnapState('open');
  }, [open]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const y = e.touches[0].clientY;
    dragState.current = { startY: y, currentY: 0 };
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.current) return;
    e.preventDefault(); // Prevent pull-to-refresh
    const delta = e.touches[0].clientY - dragState.current.startY;
    const clamped = Math.max(0, delta);
    dragState.current.currentY = clamped;
    // Direct DOM manipulation for smooth 60fps drag (no React re-render)
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${clamped}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!dragState.current) return;
    const finalY = dragState.current.currentY;
    setIsDragging(false);
    dragState.current = null;
    if (finalY > 100) {
      // Dismiss
      if (sheetRef.current) sheetRef.current.style.transform = '';
      setSnapState('closed');
      onClose();
    } else {
      // Snap back
      if (sheetRef.current) sheetRef.current.style.transform = '';
    }
  }, [onClose]);

  return (
    <div
      ref={sheetRef}
      className={`md:hidden pointer-events-auto fixed bottom-0 left-0 right-0 z-[400] ${!isDragging ? 'transition-transform duration-300' : ''} ${open && snapState === 'open' ? '' : 'translate-y-full'}`}
    >
      {/* Drag handle — touch-action:none prevents browser from intercepting */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-10 h-1 rounded-full bg-slate-500"></div>
      </div>
      {children}
    </div>
  );
}

// --- Geo helpers ---

function getDestinationPoint(lat: number, lng: number, distance: number, bearing: number): [number, number] {
  const R = 6378137;
  const brng = bearing * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lon1 = lng * Math.PI / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  return [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI];
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const l1 = lon1 * Math.PI / 180;
  const l2 = lon2 * Math.PI / 180;
  const y = Math.sin(l2 - l1) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function isPointInPolygon(pt: Point, vs: Point[]) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].lat, yi = vs[i].lng;
    const xj = vs[j].lat, yj = vs[j].lng;
    const intersect = ((yi > pt.lng) !== (yj > pt.lng))
      && (pt.lat < (xj - xi) * (pt.lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInSector(pt: Point, center: Point, radius: number, azimuth: number, opening: number): boolean {
  const dist = getDistance(center.lat, center.lng, pt.lat, pt.lng);
  if (dist > radius) return false;
  const bearing = getBearing(center.lat, center.lng, pt.lat, pt.lng);
  let diff = Math.abs(bearing - azimuth);
  if (diff > 180) diff = 360 - diff;
  return diff <= opening / 2;
}

function getSectorPolygon(centerLat: number, centerLng: number, radius: number, azimuth: number, opening: number): [number, number][] {
  const points: [number, number][] = [];
  points.push([centerLat, centerLng]);
  const steps = Math.max(10, Math.floor(opening / 5));
  for (let i = 0; i <= steps; i++) {
    const angle = (azimuth - opening / 2) + (opening * i) / steps;
    points.push(getDestinationPoint(centerLat, centerLng, radius, angle));
  }
  return points;
}

// --- Polygon status helpers ---

function getPolygonStatus(poly: PolygonData): 'no-result' | 'result-match' | 'result-mismatch' {
  if (!poly.optimizationComplete) return 'no-result';
  if (poly.lastOptimizedParams &&
    (poly.snipers !== poly.lastOptimizedParams.snipers ||
      poly.rifles !== poly.lastOptimizedParams.rifles ||
      poly.shotguns !== poly.lastOptimizedParams.shotguns)) {
    return 'result-mismatch';
  }
  return 'result-match';
}

function getPolygonColor(poly: PolygonData): string {
  const status = getPolygonStatus(poly);
  if (status === 'no-result') return '#e2e8f0';
  if (status === 'result-mismatch') return '#f59e0b';
  return '#0df20d';
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TacticalMapView({ scenarioId, polygons: propPolygons, onPolygonsChange }: TacticalMapViewProps) {
  const { configs } = useUnitConfigs();

  // Local polygon state initialized from props
  const [polygons, _setPolygons] = useState<PolygonData[]>(propPolygons);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);
  const nextPolyId = useRef(propPolygons.length + 1);

  // Sync from props when scenarioId changes (e.g. navigating back)
  useEffect(() => {
    _setPolygons(propPolygons);
    nextPolyId.current = propPolygons.length + 1;
  }, [scenarioId]);

  // Sync local changes back to parent
  const setPolygons: typeof _setPolygons = useCallback((action) => {
    _setPolygons(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      onPolygonsChange(scenarioId, next);
      return next;
    });
  }, [scenarioId, onPolygonsChange]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, _setDrawingPoints] = useState<Point[]>([]);
  const drawingPointsRef = useRef<Point[]>([]);
  const [tempPoint, setTempPoint] = useState<Point | null>(null);

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);

  const setDrawingPoints = (pts: Point[]) => {
    drawingPointsRef.current = pts;
    _setDrawingPoints(pts);
  };

  const selectedPolygon = polygons.find(p => p.id === selectedPolygonId) || null;
  const showAnalytics = selectedPolygon?.optimizationComplete === true;
  const namedUnits = selectedPolygon?.deployedUnits.filter(u => u.name.trim() !== '') || [];

  // --- Callbacks ---

  const updatePolygon = useCallback((id: string, updates: Partial<PolygonData>) => {
    setPolygons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const updateUnitName = useCallback((polygonId: string, unitIndex: number, name: string) => {
    setPolygons(prev => prev.map(p => {
      if (p.id !== polygonId) return p;
      const newUnits = [...p.deployedUnits];
      newUnits[unitIndex] = { ...newUnits[unitIndex], name };
      return { ...p, deployedUnits: newUnits };
    }));
  }, []);

  const startDrawing = () => {
    setSelectedPolygonId(null);
    setIsDrawing(true);
    setDrawingPoints([]);
    setTempPoint(null);
  };

  const onAddDrawingPoint = useCallback((pt: Point) => {
    const newPts = [...drawingPointsRef.current, pt];
    setDrawingPoints(newPts);
  }, []);

  const onCompleteDrawing = useCallback(() => {
    const pts = drawingPointsRef.current;
    if (pts.length < 3) return;
    const id = `poly-${nextPolyId.current++}`;
    const newPoly: PolygonData = {
      id,
      points: [...pts],
      name: `Sector ${String.fromCharCode(64 + nextPolyId.current - 1)}-1`,
      snipers: 4,
      rifles: 2,
      shotguns: 2,
      deployedUnits: [],
      coveragePercent: 0,
      optimizationComplete: false,
      lastOptimizedParams: null,
    };
    setPolygons(prev => [...prev, newPoly]);
    setIsDrawing(false);
    setDrawingPoints([]);
    setTempPoint(null);
    setSelectedPolygonId(id);
  }, []);

  const onSelectPolygon = useCallback((id: string | null) => {
    setSelectedPolygonId(id);
  }, []);

  const closeSidebar = () => {
    setSelectedPolygonId(null);
  };

  const runOptimization = () => {
    if (!selectedPolygon) return;
    setIsOptimizing(true);

    const poly = selectedPolygon;
    setTimeout(() => {
      let finalPositions: DeployedUnit[] = [];
      let finalCoverage = 0;

      if (poly.points.length > 2) {
        const minLat = Math.min(...poly.points.map(p => p.lat));
        const maxLat = Math.max(...poly.points.map(p => p.lat));
        const minLng = Math.min(...poly.points.map(p => p.lng));
        const maxLng = Math.max(...poly.points.map(p => p.lng));

        let gridRes = 10;
        let latStep = gridRes / 111320;
        let lngStep = gridRes / (111320 * Math.cos(minLat * Math.PI / 180));
        let estimatedPoints = ((maxLat - minLat) / latStep) * ((maxLng - minLng) / lngStep);

        while (estimatedPoints > 2500) {
          gridRes *= 1.5;
          latStep = gridRes / 111320;
          lngStep = gridRes / (111320 * Math.cos(minLat * Math.PI / 180));
          estimatedPoints = ((maxLat - minLat) / latStep) * ((maxLng - minLng) / lngStep);
        }

        const targetPoints: Point[] = [];
        for (let lat = minLat; lat <= maxLat; lat += latStep) {
          for (let lng = minLng; lng <= maxLng; lng += lngStep) {
            const pt = { lat, lng };
            if (isPointInPolygon(pt, poly.points)) {
              targetPoints.push(pt);
            }
          }
        }

        const candidatePositions = targetPoints.length > 100
          ? targetPoints.filter((_, i) => i % Math.ceil(targetPoints.length / 100) === 0)
          : targetPoints;

        const candidateAzimuths = [0, 45, 90, 135, 180, 225, 270, 315];

        const availableUnits: UnitType[] = [];
        for (let i = 0; i < poly.snipers; i++) availableUnits.push('sniper');
        for (let i = 0; i < poly.rifles; i++) availableUnits.push('rifle');
        for (let i = 0; i < poly.shotguns; i++) availableUnits.push('shotgun');

        availableUnits.sort((a, b) => {
          const areaA = configs[a].radius * configs[a].radius * configs[a].opening;
          const areaB = configs[b].radius * configs[b].radius * configs[b].opening;
          return areaB - areaA;
        });

        const uncoveredPoints = new Set(targetPoints.map((_, i) => i));

        for (const unitType of availableUnits) {
          if (uncoveredPoints.size === 0) break;
          const config = configs[unitType];
          let bestPos: Point | null = null;
          let bestAzimuth = 0;
          let maxCovered = 0;
          let bestCoveredIndices: number[] = [];

          for (const pos of candidatePositions) {
            for (const az of candidateAzimuths) {
              let coveredCount = 0;
              const coveredIndices: number[] = [];
              for (const idx of uncoveredPoints) {
                if (isPointInSector(targetPoints[idx], pos, config.radius, az, config.opening)) {
                  coveredCount++;
                  coveredIndices.push(idx);
                }
              }
              if (coveredCount > maxCovered) {
                maxCovered = coveredCount;
                bestPos = pos;
                bestAzimuth = az;
                bestCoveredIndices = coveredIndices;
              }
            }
          }

          if (maxCovered > 0 && bestPos) {
            finalPositions.push({ lat: bestPos.lat, lng: bestPos.lng, type: unitType, azimuth: bestAzimuth, name: '' });
            for (const idx of bestCoveredIndices) uncoveredPoints.delete(idx);
          }
        }

        finalCoverage = targetPoints.length > 0
          ? Math.round(((targetPoints.length - uncoveredPoints.size) / targetPoints.length) * 100)
          : 0;
      }

      updatePolygon(poly.id, {
        deployedUnits: finalPositions,
        coveragePercent: finalCoverage,
        optimizationComplete: true,
        lastOptimizedParams: { snipers: poly.snipers, rifles: poly.rifles, shotguns: poly.shotguns },
      });
      setIsOptimizing(false);
    }, 100);
  };

  // Drawing polyline
  const drawingPolyline = drawingPoints.map(p => [p.lat, p.lng] as [number, number]);
  if (tempPoint && isDrawing) {
    drawingPolyline.push([tempPoint.lat, tempPoint.lng]);
  }

  return (
    <main className="relative z-40 flex-1 flex flex-col md:flex-row overflow-hidden bg-[#050805]">
      {/* Map */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapContainer
          center={[31.4, 35.0]}
          zoom={8}
          style={{ width: '100%', height: '100%', background: '#050805' }}
          zoomControl={false}
          doubleClickZoom={false}
          dragging={!isDrawing}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            maxZoom={19}
            className="map-tiles-filter"
          />

          <MapInteraction
            isDrawing={isDrawing}
            drawingPointsRef={drawingPointsRef}
            onAddDrawingPoint={onAddDrawingPoint}
            setTempPoint={setTempPoint}
            onCompleteDrawing={onCompleteDrawing}
            polygons={polygons}
            onSelectPolygon={onSelectPolygon}
          />

          {/* Drawing polyline */}
          {isDrawing && drawingPoints.length > 0 && (
            <>
              <Polyline
                positions={drawingPolyline}
                pathOptions={{ color: '#0df20d', weight: 2, dashArray: '5, 5' }}
              />
              {drawingPoints.map((p, i) => (
                <Marker key={`draw-${i}`} position={[p.lat, p.lng]} icon={L.divIcon({
                  html: `<div style="width: 8px; height: 8px; background: #0df20d; border-radius: 50%;"></div>`,
                  className: 'bg-transparent border-none',
                  iconSize: [8, 8],
                  iconAnchor: [4, 4],
                })} />
              ))}
            </>
          )}

          {/* Completed polygons */}
          {polygons.map((poly) => {
            const color = getPolygonColor(poly);
            const status = getPolygonStatus(poly);
            const isSelected = poly.id === selectedPolygonId;

            return (
              <React.Fragment key={poly.id}>
                <Polygon
                  positions={poly.points.map(p => [p.lat, p.lng] as [number, number])}
                  pathOptions={{
                    color,
                    weight: isSelected ? 3 : 2,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.2 : 0.1,
                  }}
                >
                  {status === 'result-mismatch' && (
                    <Tooltip sticky className="mismatch-tooltip">
                      <span style={{ fontSize: '12px' }}>Result does not match current deployment parameters</span>
                    </Tooltip>
                  )}
                </Polygon>
                {poly.points.map((p, i) => (
                  <Marker key={`${poly.id}-v-${i}`} position={[p.lat, p.lng]} icon={L.divIcon({
                    html: `<div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>`,
                    className: 'bg-transparent border-none',
                    iconSize: [8, 8],
                    iconAnchor: [4, 4],
                  })} />
                ))}

                {/* Deployed units for this polygon */}
                {poly.optimizationComplete && poly.deployedUnits.map((unit, i) => {
                  const config = configs[unit.type];
                  const sectorPoints = getSectorPolygon(unit.lat, unit.lng, config.radius, unit.azimuth, config.opening);
                  const unitColor = getUnitColor(unit.type);

                  return (
                    <React.Fragment key={`${poly.id}-u-${i}`}>
                      <Polygon
                        positions={sectorPoints}
                        pathOptions={{
                          color: unitColor,
                          weight: 1,
                          fillColor: unitColor,
                          fillOpacity: 0.15,
                          dashArray: '4, 4',
                        }}
                      />
                      <Marker
                        position={[unit.lat, unit.lng]}
                        icon={createCustomIcon(getIconSvg(unit.type), unitColor, unit.azimuth)}
                      >
                        <Popup className="unit-popup" offset={[0, -10]} closeButton={false}>
                          <UnitTooltipContent
                            unit={unit}
                            polygonId={poly.id}
                            unitIndex={i}
                            onNameChange={updateUnitName}
                          />
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Map Controls — positioned above mobile bottom sheets */}
          <div className="absolute bottom-20 right-3 md:bottom-6 md:right-6 z-[400] flex flex-col gap-2">
            <ZoomControls />
            <button
              onClick={startDrawing}
              className={`w-10 h-10 md:w-12 md:h-12 mt-3 md:mt-4 backdrop-blur border-2 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg ${
                isDrawing
                  ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(13,242,13,0.6)] scale-110'
                  : 'bg-transparent border-primary text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(13,242,13,0.3)]'
              }`}
              title={isDrawing ? "Drawing Mode Active" : "Draw Tactical Area"}
            >
              <MapPin size={22} className={isDrawing ? "animate-pulse" : ""} />
            </button>
          </div>
        </MapContainer>
      </div>

      {/* Mobile Bottom Sheet - Deployment Parameters */}
      {selectedPolygon && (
        <BottomSheet open={!!selectedPolygon} onClose={closeSidebar}>
          <div className="bg-surface-glass backdrop-blur-xl border-t border-primary/20 rounded-t-2xl p-4 shadow-2xl flex flex-col max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-primary/10 pb-2 mb-3 shrink-0">
              <h2 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Deployment Parameters</h2>
              <button onClick={closeSidebar} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="shrink-0 mb-4">
              <input
                type="text"
                value={selectedPolygon.name}
                onChange={(e) => updatePolygon(selectedPolygon.id, { name: e.target.value })}
                className="w-full bg-primary/10 border border-primary/40 rounded-lg px-3 py-2 text-xs text-white placeholder-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
            </div>

            {/* Scrollable unit allocation */}
            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-3">Unit Allocation</label>

              <div className="flex flex-col gap-3">
                {/* Snipers */}
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary">
                      <Crosshair size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Snipers</span>
                      <span className="text-[10px] text-slate-500">Long Range</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { snipers: Math.max(0, selectedPolygon.snipers - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.snipers}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { snipers: selectedPolygon.snipers + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Rifles */}
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary">
                      <RifleIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Rifles</span>
                      <span className="text-[10px] text-slate-500">Mid Range</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { rifles: Math.max(0, selectedPolygon.rifles - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.rifles}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { rifles: selectedPolygon.rifles + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Shotguns */}
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary">
                      <Shield size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Shotguns</span>
                      <span className="text-[10px] text-slate-500">Close Range</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { shotguns: Math.max(0, selectedPolygon.shotguns - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.shotguns}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { shotguns: selectedPolygon.shotguns + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="shrink-0 w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(13,242,13,0.3)] hover:shadow-[0_0_25px_rgba(13,242,13,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  CALCULATING...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  RUN OPTIMIZATION
                </>
              )}
            </button>

            {/* Mobile inline coverage result + named units — shown inside the bottom sheet */}
            {showAnalytics && selectedPolygon && (
              <div className="md:hidden mt-4 border-t border-primary/10 pt-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0">
                    <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <path className="text-surface-dark" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                      <path className="text-primary drop-shadow-[0_0_5px_rgba(13,242,13,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${selectedPolygon.coveragePercent}, 100`} strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm leading-none">{selectedPolygon.coveragePercent}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-slate-300 text-xs font-medium">Coverage</span>
                    <span className="text-slate-500 text-[10px] font-mono uppercase truncate">AOI: {selectedPolygon.name}</span>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>DEPLOYED</span>
                      <span className="text-white">{selectedPolygon.deployedUnits.length}/{(selectedPolygon.lastOptimizedParams?.snipers || 0) + (selectedPolygon.lastOptimizedParams?.rifles || 0) + (selectedPolygon.lastOptimizedParams?.shotguns || 0)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-primary shadow-[0_0_10px_rgba(13,242,13,0.5)]" style={{ width: `${(() => { const t = (selectedPolygon.lastOptimizedParams?.snipers || 0) + (selectedPolygon.lastOptimizedParams?.rifles || 0) + (selectedPolygon.lastOptimizedParams?.shotguns || 0); return t > 0 ? (selectedPolygon.deployedUnits.length / t) * 100 : 0; })()}%` }}></div>
                    </div>
                  </div>
                </div>
                {/* Mobile named units list */}
                {namedUnits.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    <h4 className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Named Units</h4>
                    <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto">
                      {namedUnits.map((unit, i) => {
                        const unitColor = getUnitColor(unit.type);
                        return (
                          <div key={i} className="flex items-center gap-2 bg-surface-dark/50 rounded p-1.5 text-[10px] border border-slate-700/30">
                            <div style={{ color: unitColor }} className="shrink-0">
                              {unit.type === 'sniper' ? <Crosshair size={12} /> : unit.type === 'rifle' ? <RifleIcon size={12} /> : <Shield size={12} />}
                            </div>
                            <span className="text-white font-medium truncate flex-1 min-w-0">{unit.name}</span>
                            <span className="text-slate-500 capitalize shrink-0">{unit.type}</span>
                            <span className="text-slate-400 font-mono shrink-0">{unit.azimuth}°</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </BottomSheet>
      )}

      {/* Desktop Side Panel - Deployment Parameters */}
      {selectedPolygon && (
        <aside className={`pointer-events-auto hidden md:block absolute left-0 top-0 bottom-0 w-80 m-4 z-[400] transform transition-transform duration-300 ${selectedPolygon ? 'translate-x-0' : '-translate-x-[120%]'}`}>
          <div className="bg-surface-glass backdrop-blur-xl border border-primary/20 rounded-xl p-5 shadow-2xl flex flex-col max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-primary/10 pb-2 mb-4 shrink-0">
              <h2 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Deployment Parameters</h2>
              <button onClick={closeSidebar} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="shrink-0 mb-4">
              <input
                type="text"
                value={selectedPolygon.name}
                onChange={(e) => updatePolygon(selectedPolygon.id, { name: e.target.value })}
                className="w-full bg-primary/10 border border-primary/40 rounded-lg px-3 py-2 text-xs text-white placeholder-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-3">Unit Allocation</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary"><Crosshair size={20} /></div>
                    <div className="flex flex-col"><span className="text-sm font-bold text-white">Snipers</span><span className="text-[10px] text-slate-500">Long Range</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { snipers: Math.max(0, selectedPolygon.snipers - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Minus size={14} /></button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.snipers}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { snipers: selectedPolygon.snipers + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary"><RifleIcon size={20} /></div>
                    <div className="flex flex-col"><span className="text-sm font-bold text-white">Rifles</span><span className="text-[10px] text-slate-500">Mid Range</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { rifles: Math.max(0, selectedPolygon.rifles - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Minus size={14} /></button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.rifles}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { rifles: selectedPolygon.rifles + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-surface-dark/50 rounded-lg p-2 pr-3 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded text-primary"><Shield size={20} /></div>
                    <div className="flex flex-col"><span className="text-sm font-bold text-white">Shotguns</span><span className="text-[10px] text-slate-500">Close Range</span></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updatePolygon(selectedPolygon.id, { shotguns: Math.max(0, selectedPolygon.shotguns - 1) })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Minus size={14} /></button>
                    <span className="text-base font-mono font-bold w-4 text-center">{selectedPolygon.shotguns}</span>
                    <button onClick={() => updatePolygon(selectedPolygon.id, { shotguns: selectedPolygon.shotguns + 1 })} className="size-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="shrink-0 w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(13,242,13,0.3)] hover:shadow-[0_0_25px_rgba(13,242,13,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (<><Loader2 size={20} className="animate-spin" />CALCULATING...</>) : (<><PlayCircle size={20} />RUN OPTIMIZATION</>)}
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1"></div>

      {/* Right Sidebar - Named Units Grid + Coverage Analytics (desktop only, mobile uses inline in bottom sheet) */}
      <aside className={`pointer-events-auto hidden md:flex absolute right-0 top-0 bottom-0 w-72 m-4 flex-col justify-end gap-3 z-[400] transform transition-all duration-500 ${showAnalytics ? 'translate-x-0' : 'translate-x-[120%]'}`}>
        {/* Named Units Grid */}
        {namedUnits.length > 0 && (
          <div className="bg-surface-glass backdrop-blur-xl border border-primary/20 rounded-xl p-4 shadow-2xl">
            <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-3 border-b border-primary/10 pb-2">
              Named Units
            </h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {namedUnits.map((unit, i) => {
                const unitColor = getUnitColor(unit.type);
                return (
                  <div key={i} className="flex items-center gap-2 bg-surface-dark/50 rounded-lg p-2 text-xs border border-slate-700/30">
                    <div style={{ color: unitColor }} className="shrink-0">
                      {unit.type === 'sniper' ? <Crosshair size={14} /> : unit.type === 'rifle' ? <RifleIcon size={14} /> : <Shield size={14} />}
                    </div>
                    <span className="text-white font-medium truncate flex-1 min-w-0" title={unit.name}>{unit.name}</span>
                    <span className="text-slate-500 capitalize text-[10px] shrink-0 w-12 text-center">{unit.type}</span>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-slate-400 font-mono text-[10px]">{unit.lat.toFixed(4)}°, {unit.lng.toFixed(4)}°</span>
                      <span className="text-slate-500 font-mono text-[10px]">{unit.azimuth}° az</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coverage Analytics */}
        {selectedPolygon && showAnalytics && (
          <div className="bg-surface-glass backdrop-blur-xl border border-primary/20 rounded-xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
            <h3 className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4 border-b border-primary/10 pb-2 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Coverage Analytics
            </h3>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative size-20 shrink-0">
                  <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <path className="text-surface-dark" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <path className="text-primary drop-shadow-[0_0_5px_rgba(13,242,13,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${selectedPolygon.coveragePercent}, 100`} strokeWidth="3"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-primary font-bold text-lg leading-none">{selectedPolygon.coveragePercent}%</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-300 text-sm font-medium">Optimal Coverage</span>
                  <span className="text-slate-500 text-[10px] mt-1 font-mono uppercase">AOI: {selectedPolygon.name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {(() => {
                  const totalReq = (selectedPolygon.lastOptimizedParams?.snipers || 0) + (selectedPolygon.lastOptimizedParams?.rifles || 0) + (selectedPolygon.lastOptimizedParams?.shotguns || 0);
                  const deployed = selectedPolygon.deployedUnits.length;
                  return (
                    <>
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>RESOURCES DEPLOYED</span>
                        <span className="text-white">{deployed}/{totalReq} UNITS</span>
                      </div>
                      <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden flex">
                        <div className="h-full bg-primary shadow-[0_0_10px_rgba(13,242,13,0.5)]" style={{ width: `${totalReq > 0 ? (deployed / totalReq) * 100 : 0}%` }}></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </aside>
    </main>
  );
}

# Project Context: Tactical Map Planning Tool

## Overview
This project is a React-based web application designed for tactical map planning and unit deployment optimization. It allows users to create scenarios, configure different types of tactical units (Snipers, Rifles, Shotguns), draw areas of interest (polygons) on a map, and run an optimization algorithm to automatically deploy units within those areas to maximize coverage.

## Tech Stack
- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **Map Library:** Leaflet (`react-leaflet`)
- **Icons:** `lucide-react`
- **Animations:** `motion` (Framer Motion)
- **Language:** TypeScript

## Project Structure
The source code is primarily located in the `/src` directory:

- `/src/App.tsx`: The main application component that manages the current view state (`scenarios`, `unit-config`, `tactical-map`) and provides the `UnitConfigProvider`.
- `/src/main.tsx`: The entry point that renders the React application.
- `/src/index.css`: Global CSS file, including Tailwind imports and custom map tile filters.

### Components (`/src/components/`)
- **`Header.tsx`**: Top navigation bar for switching between views.
- **`ScenariosView.tsx`**: Displays a list of saved scenarios and allows creating, editing, and deleting them.
- **`NewScenarioModal.tsx` & `EditScenarioModal.tsx`**: Modals for scenario management.
- **`DeleteConfirmationModal.tsx`**: Reusable modal for confirming deletion actions.
- **`UnitConfigView.tsx`**: Interface for configuring the parameters (radius in meters, opening angle in degrees) for different unit types.
- **`TacticalMapView.tsx`**: The core component of the application. It renders the Leaflet map, handles polygon drawing, displays the deployment parameters sidebar, runs the coverage optimization algorithm, and shows the coverage analytics.
- **`icons/RifleIcon.tsx`**: Custom SVG icon component for the Rifle unit.

### Context (`/src/context/`)
- **`UnitConfigContext.tsx`**: React Context that manages the global state for unit configurations (radius and opening angle for `sniper`, `rifle`, and `shotgun`).

## Core Features & Logic

### 1. Scenario Management
Users can create multiple scenarios. Currently, the scenario data might be mocked or stored locally, but the UI supports listing, creating, editing, and deleting them.

### 2. Unit Configuration
The application defines three unit types:
- **Sniper:** Long range, narrow field of view (Default: 1000m radius, 45° opening).
- **Rifle:** Mid range, medium field of view (Default: 500m radius, 90° opening).
- **Shotgun:** Close range, wide field of view (Default: 250m radius, 160° opening).
Users can adjust these parameters in the Unit Configuration view, and the changes will affect the optimization algorithm.

### 3. Tactical Map & Polygon Drawing
- Uses `react-leaflet` with an Esri World Imagery satellite tile layer.
- Users can click on the map to draw a polygon representing an Area of Interest (AOI).
- Double-clicking or clicking near the first point completes the polygon.
- Clicking inside a completed polygon selects it, opening the "Deployment Parameters" sidebar.

### 4. Deployment Optimization Algorithm
Located in `TacticalMapView.tsx` (`runOptimization` function).
- **Goal:** Place a specified number of units within the drawn polygon to maximize the covered area.
- **Approach:** A greedy algorithm.
  1. Generates a grid of candidate points within the polygon based on the selected "Grid Resolution".
  2. Sorts available units by their potential coverage area (descending).
  3. For each unit, it evaluates candidate positions and 8 possible azimuths (0°, 45°, 90°, etc.).
  4. It selects the position and azimuth that covers the most previously uncovered grid points.
  5. It places the unit and marks those points as covered, then proceeds to the next unit.
- **Output:** Renders the deployed units on the map with their respective coverage sectors (using `Polygon` for the sector arc) and displays coverage analytics (percentage of AOI covered).

## Recent Changes (implemented)
- **Multiple polygons per scenario:** Each polygon has its own `PolygonData` with independent deployment parameters, deployed units, and coverage results. Data model uses `PolygonData[]` state array.
- **Responsive sidebar:** Unit allocation section scrolls vertically on small screens. Sidebar uses `max-h-[calc(100vh-6rem)]` with `overflow-y-auto` on the unit section.
- **Polygon status colors:** White (`#e2e8f0`) = no result, Green (`#0df20d`) = has result matching params, Orange (`#f59e0b`) = result exists but params changed since last optimization. Orange polygons show "Result does not match current deployment parameters" tooltip on hover.
- **Immediate param saves:** Unit quantity changes (+/-) update polygon data immediately via `updatePolygon()`.
- **Closing sidebar closes analytics:** `closeSidebar()` sets `selectedPolygonId` to `null`, hiding both sidebars.
- **Grid resolution slider removed:** Fixed 10m grid resolution (auto-scales up to prevent browser freeze).
- **Unit icon hover tooltips:** Interactive Leaflet `Tooltip` on each deployed unit marker showing coordinates, azimuth, and a name input field.
- **Named units grid:** Right sidebar shows a grid of named (non-empty name) units above coverage analytics, displaying icon, name, type, coordinates, and azimuth.

## Development Guidelines
- Use Tailwind CSS for all styling.
- Ensure responsive design, especially for sidebars and modals.
- When modifying the map logic, be mindful of Leaflet's coordinate system (Lat/Lng) and the custom geometry functions (e.g., `getDestinationPoint`, `getSectorPolygon`).
- The optimization algorithm can be computationally expensive. Be careful with grid resolution to prevent browser freezing.

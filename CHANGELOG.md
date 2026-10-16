# Changelog

All notable changes to the **Maps** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-17

### Added
- **3D Interactive Map Engine (Three.js & SVG Canvas)**:
  - Atmospheric depth with realistic sky fog and dynamic lighting.
  - Screen-space constant-width pedestrian paths using `Line2` and `LineMaterial`.
  - 3D pulsing destination beacon with animated concentric ripples.
  - High-visibility markers with 2px contrast halos and collision culling.
- **Turn-by-Turn Pedestrian Navigation**:
  - Live GPS-style camera tracking that follows the user's step position in real-time.
  - Step-by-step guidance banner with natural turn directions, distances, and icon previews.
  - Auto-walking simulation with multi-speed controls (1x, 2x, 4x) and pause/resume.
  - Audio chimes (Web Audio API synthesizers) for step arrival and destination completion.
- **Admin Mode & Dynamic Node Management**:
  - Complete campus node and walkway edge editor directly inside the application.
  - Real-time map coordinate picker with click-to-place functionality.
  - Quick inline renaming with keyboard shortcuts (`Enter` to save, `Escape` to cancel).
  - Multi-database export system generating SQLite, PostgreSQL, and MySQL DDL schema and seed migrations.
- **Invisible Waypoints & Path Correction**:
  - Checkbox toggle for dropping invisible corner-bending waypoints on walkways.
  - Waypoints remain hidden from regular visitors (excluded from POIs, search, and directory).
  - Waypoints render in Admin Mode as distinctive amber junction dots with inline editing.
  - Natural turn-by-turn guidance lookahead that routes smoothly around building geometries.
- **Universal Accessibility (WCAG 2.2 AA)**:
  - 44px minimum touch targets on all interactive elements.
  - High-contrast text tokens adhering to 4.5:1 / 3:1 contrast ratios.
  - Screen reader live announcements (`aria-live="polite"`) for navigation updates.
  - Full keyboard shortcuts (`Escape`, `?`, arrow navigation).
- **Mobile First App Shell**:
  - Interactive multi-snap mobile bottom sheet (`peek`, `half`, `full`).
  - Offline status toast alert for network disconnection.
  - Smooth native dark mode toggle with persistent token themes.

### Changed
- Refactored brand identity from "CampusMap" to "Maps".
- Removed horizontal category chips bar in favor of an ultra-clean floating search pill.
- Removed native browser scrollbars globally (`scrollbar-width: none`) for an app-native desktop and mobile experience.
- Migrated codebase to full React 19 compliance (eliminated ref accesses during render, keyed form modals).

---

## [0.1.0] - 2026-10-15

### Added
- Initial 3D campus viewer baseline using Vite, React, and Three.js.
- Basic Dijkstra pathfinding between static campus landmarks.

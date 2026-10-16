import { 
  Plus, 
  Minus, 
  Compass, 
  Layers, 
  Crosshair,
  Maximize2
} from 'lucide-react';
import './MapControls.css';

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  cameraRotation = 0, // Azimuth angle in radians
  is3D = true,
  onToggle3D,
  onLocateMe,
  onFitOverview,
  showPOIs = true,
  onTogglePOIs,
}) {
  const compassDegrees = (-cameraRotation * 180) / Math.PI;

  return (
    <div className="map-controls-stack" role="toolbar" aria-label="Map navigation controls">
      {/* Zoom In & Out Group */}
      <div className="control-group zoom-group">
        <button
          type="button"
          className="map-control-btn zoom-btn"
          onClick={onZoomIn}
          aria-label="Zoom in"
          title="Zoom in (+)"
        >
          <Plus size={20} aria-hidden="true" />
        </button>
        <div className="control-divider" aria-hidden="true" />
        <button
          type="button"
          className="map-control-btn zoom-btn"
          onClick={onZoomOut}
          aria-label="Zoom out"
          title="Zoom out (-)"
        >
          <Minus size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Compass / Reset North */}
      <button
        type="button"
        className="map-control-btn compass-btn"
        onClick={onResetNorth}
        aria-label="Reset orientation north"
        title="Reset north (R)"
      >
        <div 
          className="compass-needle-wrap" 
          style={{ transform: `rotate(${compassDegrees}deg)` }}
          aria-hidden="true"
        >
          <Compass size={22} className="compass-icon" />
        </div>
      </button>

      {/* 2D / 3D Tilt Toggle */}
      <button
        type="button"
        className={`map-control-btn view-mode-btn ${is3D ? 'active' : ''}`}
        onClick={onToggle3D}
        aria-label={is3D ? 'Switch to 2D overhead view' : 'Switch to 3D perspective view'}
        title={is3D ? '2D View' : '3D View'}
      >
        <span className="dimension-badge">{is3D ? '3D' : '2D'}</span>
      </button>

      {/* Locate Me */}
      <button
        type="button"
        className="map-control-btn locate-btn"
        onClick={onLocateMe}
        aria-label="Find my location on campus"
        title="My location"
      >
        <Crosshair size={20} aria-hidden="true" />
      </button>

      {/* Overview / Fit Entire Route or Campus */}
      {onFitOverview && (
        <button
          type="button"
          className="map-control-btn overview-btn"
          onClick={onFitOverview}
          aria-label="Fit route overview or whole campus"
          title="Overview / Fit route"
        >
          <Maximize2 size={19} aria-hidden="true" />
        </button>
      )}

      {/* Layers / POI Visibility */}
      <button
        type="button"
        className={`map-control-btn layers-btn ${showPOIs ? 'active' : ''}`}
        onClick={onTogglePOIs}
        aria-label={showPOIs ? 'Hide points of interest' : 'Show points of interest'}
        title="Toggle POIs"
      >
        <Layers size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

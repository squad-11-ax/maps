import { 
  ShieldCheck, 
  Plus, 
  Waypoints,
  FileCode, 
  RotateCcw, 
  X, 
  ListOrdered, 
  Crosshair 
} from 'lucide-react';
import './AdminToolbar.css';

export default function AdminToolbar({
  nodesCount = 0,
  placesCount,
  waypointsCount,
  edgesCount = 0,
  onOpenAddModal,
  onOpenAddWaypoint,
  onOpenManageModal,
  onOpenExportModal,
  onResetDefaults,
  onExitAdmin,
  isPickingLocation = false,
  onCancelPickLocation,
}) {
  if (isPickingLocation) {
    return (
      <aside className="admin-toolbar-dock" role="region" aria-label="Coordinate Picker Bar">
        <div className="admin-picking-banner">
          <Crosshair size={18} className="spin-slow" aria-hidden="true" />
          <span>Click anywhere on the campus map plane to set node coordinates</span>
          <button
            type="button"
            className="admin-picking-cancel-btn"
            onClick={onCancelPickLocation}
            title="Cancel coordinate picking"
          >
            Cancel
          </button>
        </div>
      </aside>
    );
  }

  const pCount = placesCount != null ? placesCount : nodesCount;
  const wCount = waypointsCount != null ? waypointsCount : 0;

  return (
    <aside className="admin-toolbar-dock" role="region" aria-label="Campus Map Administrator Toolbar">
      <div className="admin-toolbar-inner">
        <div className="admin-badge">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Admin Mode</span>
        </div>

        <span className="admin-stats">
          {pCount} places{wCount > 0 ? ` • ${wCount} waypoints` : ''} • {edgesCount} walkways
        </span>

        <div className="admin-actions-group">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={onOpenAddModal}
            title="Create and place a new destination place on campus"
          >
            <Plus size={15} aria-hidden="true" />
            <span>Add Place</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-waypoint"
            onClick={onOpenAddWaypoint}
            title="Drop an invisible corner-bending waypoint on walkway paths"
          >
            <Waypoints size={15} aria-hidden="true" />
            <span>Add Waypoint</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={onOpenManageModal}
            title="Rename, edit, or remove existing nodes & waypoints"
          >
            <ListOrdered size={15} aria-hidden="true" />
            <span>Manage</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={onOpenExportModal}
            title="Export JSON and SQL database for backend developers"
          >
            <FileCode size={15} aria-hidden="true" />
            <span>Export DB</span>
          </button>

          <button
            type="button"
            className="admin-btn"
            onClick={onResetDefaults}
            title="Restore original initial campus nodes and edges"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-exit"
            onClick={onExitAdmin}
            title="Exit Admin Mode and return to standard exploration"
            aria-label="Exit Admin Mode"
          >
            <X size={15} aria-hidden="true" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

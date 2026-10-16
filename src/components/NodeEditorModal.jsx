import { useState, useId } from 'react';
import { 
  X, 
  MapPin, 
  Crosshair, 
  Trash2, 
  Check 
} from 'lucide-react';
import { CATEGORIES } from '../data/nodesData';
import { getConnectedNodeIds } from '../data/campusDatabase';
import './NodeEditorModal.css';

const AVAILABLE_CATEGORIES = [
  ...CATEGORIES.filter((c) => c.id !== 'all'),
  { id: 'Waypoint', label: 'Walkways & Waypoints' },
  { id: 'Services', label: 'Services & Operations' },
  { id: 'Public Area', label: 'Public Area & Grounds' },
];

export default function NodeEditorModal({
  isOpen,
  onClose,
  nodeToEdit = null,
  allNodes = [],
  allEdges = [],
  onSaveNode,
  onDeleteNode,
  onStartPickLocation,
  initialCoordinates = null,
  initialIsWaypoint = false,
}) {
  const isEditing = Boolean(nodeToEdit && nodeToEdit.id && allNodes.some((n) => n.id === nodeToEdit.id));

  // Form Fields initialized directly from props
  const [nodeId, setNodeId] = useState(() => (nodeToEdit ? nodeToEdit.id : ''));
  const [name, setName] = useState(() => (nodeToEdit ? nodeToEdit.name || '' : (initialIsWaypoint ? 'Walkway Waypoint' : '')));
  const [shortName, setShortName] = useState(() => (nodeToEdit ? nodeToEdit.shortName || nodeToEdit.name || '' : (initialIsWaypoint ? 'Waypoint' : '')));
  const [category, setCategory] = useState(() => (nodeToEdit ? nodeToEdit.category || 'Gates' : (initialIsWaypoint ? 'Waypoint' : 'Gates')));
  const [blockCode, setBlockCode] = useState(() => (nodeToEdit ? nodeToEdit.blockCode || '' : ''));
  const [subtitle, setSubtitle] = useState(() => (nodeToEdit ? nodeToEdit.subtitle || '' : ''));
  const [departments, setDepartments] = useState(() => (nodeToEdit ? nodeToEdit.departments || '' : ''));
  const [hours, setHours] = useState(() => (nodeToEdit ? nodeToEdit.hours || '24/7 Open' : '8:00 AM - 8:00 PM'));
  const [stepFree, setStepFree] = useState(() => (nodeToEdit ? nodeToEdit.stepFree !== false : true));
  const [isWaypoint, setIsWaypoint] = useState(() => (
    nodeToEdit ? Boolean(nodeToEdit.isWaypoint) : Boolean(initialIsWaypoint)
  ));
  const [aliases, setAliases] = useState(() => (nodeToEdit && Array.isArray(nodeToEdit.aliases) ? nodeToEdit.aliases.join(', ') : ''));
  const [xCoord, setXCoord] = useState(() => {
    if (nodeToEdit && nodeToEdit.x != null) return Number(nodeToEdit.x).toFixed(3);
    if (initialCoordinates && initialCoordinates.x != null) return Number(initialCoordinates.x).toFixed(3);
    return '0.500';
  });
  const [yCoord, setYCoord] = useState(() => {
    if (nodeToEdit && nodeToEdit.y != null) return Number(nodeToEdit.y).toFixed(3);
    if (initialCoordinates && initialCoordinates.y != null) return Number(initialCoordinates.y).toFixed(3);
    return '0.500';
  });
  const [connectedEdges, setConnectedEdges] = useState(() => {
    if (nodeToEdit && Array.isArray(nodeToEdit.connectedEdges)) return nodeToEdit.connectedEdges;
    if (nodeToEdit && nodeToEdit.id && allNodes.some((n) => n.id === nodeToEdit.id)) {
      return getConnectedNodeIds(nodeToEdit.id, allEdges);
    }
    return allNodes[0] ? [allNodes[0].id] : ['PointA'];
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Form field unique IDs for accessibility
  const idFieldId = useId();
  const isWaypointFieldId = useId();
  const nameFieldId = useId();
  const shortNameFieldId = useId();
  const categoryFieldId = useId();
  const blockCodeFieldId = useId();
  const subtitleFieldId = useId();
  const departmentsFieldId = useId();
  const hoursFieldId = useId();
  const xCoordFieldId = useId();
  const yCoordFieldId = useId();
  const aliasesFieldId = useId();
  const stepFreeFieldId = useId();

  // Handle Pick Coordinates click
  const handlePickClick = () => {
    if (onStartPickLocation) {
      onStartPickLocation({
        currentData: {
          id: nodeId,
          name,
          shortName,
          category,
          blockCode,
          subtitle,
          departments,
          hours,
          stepFree,
          isWaypoint,
          aliases,
          x: parseFloat(xCoord) || 0.5,
          y: parseFloat(yCoord) || 0.5,
        },
        connectedEdges,
        isEditing,
      });
    }
  };

  const handleToggleEdge = (targetId) => {
    setConnectedEdges((prev) => {
      if (prev.includes(targetId)) {
        return prev.filter((id) => id !== targetId);
      }
      return [...prev, targetId];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    const parsedX = parseFloat(xCoord);
    const parsedY = parseFloat(yCoord);
    if (Number.isNaN(parsedX) || Number.isNaN(parsedY)) {
      setErrorMsg('Valid coordinates (X and Y) are required.');
      return;
    }

    const payload = {
      id: isEditing ? nodeToEdit.id : nodeId.trim() || undefined,
      name: name.trim(),
      shortName: (shortName.trim() || name.trim()),
      category: isWaypoint ? (category === 'Gates' ? 'Waypoint' : category) : category,
      blockCode: blockCode.trim(),
      subtitle: subtitle.trim(),
      departments: departments.trim(),
      hours: hours.trim(),
      stepFree,
      isWaypoint,
      aliases: aliases.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
      x: parsedX,
      y: parsedY,
    };

    onSaveNode(payload, connectedEdges, isEditing);
    onClose();
  };

  const handleDelete = () => {
    if (!nodeToEdit) return;
    if (window.confirm(`Are you sure you want to delete "${nodeToEdit.name}"? All connected walkways will also be removed.`)) {
      onDeleteNode(nodeToEdit.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="node-modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="node-modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-labelledby="node-modal-heading"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="node-modal-header">
          <div className="node-modal-title-group">
            <div className="node-modal-icon-badge" style={isWaypoint ? { background: 'rgba(242, 153, 74, 0.15)', color: '#D97706' } : undefined}>
              <MapPin size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="node-modal-heading" className="node-modal-title">
                {isEditing 
                  ? (nodeToEdit.isWaypoint ? `Edit Waypoint: ${nodeToEdit.shortName || nodeToEdit.name}` : `Edit Place: ${nodeToEdit.shortName || nodeToEdit.name}`)
                  : (isWaypoint ? 'Add Path Correction Waypoint' : 'Add New Campus Place')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="node-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="node-modal-body">
          {errorMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(217, 48, 37, 0.1)', color: '#D93025', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {/* Waypoint / Path Correction Checkbox */}
          <div className="waypoint-highlight-box">
            <label htmlFor={isWaypointFieldId} className="waypoint-toggle-label">
              <input
                id={isWaypointFieldId}
                type="checkbox"
                checked={isWaypoint}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsWaypoint(checked);
                  if (checked) {
                    if (!name.trim()) setName('Walkway Waypoint');
                    if (!shortName.trim()) setShortName('Waypoint');
                    if (category === 'Gates') setCategory('Waypoint');
                  }
                }}
                className="checkbox-input"
              />
              <div className="waypoint-label-text">
                <span className="waypoint-title">
                  Waypoint / Path Correction
                </span>
                <span className="waypoint-desc">
                  Drop corner-bending points anywhere on the map plane to route paths around obstacles without cluttering the map, search, or directory for visitors.
                </span>
              </div>
            </label>
          </div>

          {/* Identification Row */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor={idFieldId} className="form-label">
                <span>Unique ID</span>
                <span className="form-label-hint">{isEditing ? 'Read-only' : 'Auto if empty'}</span>
              </label>
              <input
                id={idFieldId}
                type="text"
                className="form-input"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                disabled={isEditing}
                placeholder="e.g. BlockH, Gate5, Waypoint_1"
              />
            </div>

            <div className="form-group">
              <label htmlFor={categoryFieldId} className="form-label">Category</label>
              <select
                id={categoryFieldId}
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Names Row */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor={nameFieldId} className="form-label">
                <span>Full Display Name *</span>
              </label>
              <input
                id={nameFieldId}
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Robotics & Automation Lab"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor={shortNameFieldId} className="form-label">
                <span>Map Marker Label</span>
                <span className="form-label-hint">For badges</span>
              </label>
              <input
                id={shortNameFieldId}
                type="text"
                className="form-input"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Robotics Lab"
              />
            </div>
          </div>

          {/* Block Code & Subtitle */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor={blockCodeFieldId} className="form-label">Block / Building Code</label>
              <input
                id={blockCodeFieldId}
                type="text"
                className="form-input"
                value={blockCode}
                onChange={(e) => setBlockCode(e.target.value)}
                placeholder="e.g. Block R-102"
              />
            </div>

            <div className="form-group">
              <label htmlFor={subtitleFieldId} className="form-label">Subtitle / Wing</label>
              <input
                id={subtitleFieldId}
                type="text"
                className="form-input"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. North Quad • Level 2"
              />
            </div>
          </div>

          {/* Departments & Hours */}
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor={departmentsFieldId} className="form-label">Departments / Description</label>
              <input
                id={departmentsFieldId}
                type="text"
                className="form-input"
                value={departments}
                onChange={(e) => setDepartments(e.target.value)}
                placeholder="e.g. AI Research & Prototyping"
              />
            </div>

            <div className="form-group">
              <label htmlFor={hoursFieldId} className="form-label">Operating Hours</label>
              <input
                id={hoursFieldId}
                type="text"
                className="form-input"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 8:00 AM - 8:00 PM"
              />
            </div>
          </div>

          {/* Coordinates & Map Picker */}
          <div className="form-group">
            <label className="form-label">
              <span>Campus Map Coordinates (Normalized U, V)</span>
              <span className="form-label-hint">Range: 0.000 to 1.000</span>
            </label>
            <div className="coord-picker-box">
              <input
                id={xCoordFieldId}
                type="number"
                step="0.001"
                className="form-input"
                value={xCoord}
                onChange={(e) => setXCoord(e.target.value)}
                placeholder="X (0 to 1)"
                style={{ maxWidth: '120px' }}
                aria-label="X Coordinate"
              />
              <input
                id={yCoordFieldId}
                type="number"
                step="0.001"
                className="form-input"
                value={yCoord}
                onChange={(e) => setYCoord(e.target.value)}
                placeholder="Y (0 to 1)"
                style={{ maxWidth: '120px' }}
                aria-label="Y Coordinate"
              />
              <button
                type="button"
                className="coord-pick-btn"
                onClick={handlePickClick}
                title="Click on the 3D map canvas to pick exact coordinates"
              >
                <Crosshair size={15} aria-hidden="true" />
                <span>Pick on Map</span>
              </button>
            </div>
          </div>

          {/* Walkway Network Connections */}
          <div className="form-group">
            <label className="form-label">
              <span>Connected Walkways (Turn-by-turn Routing Network)</span>
              <span className="form-label-hint">{connectedEdges.length} connected</span>
            </label>
            <div className="edges-picker-container">
              {allNodes
                .filter((n) => !isEditing || n.id !== nodeToEdit.id)
                .map((n) => {
                  const isChecked = connectedEdges.includes(n.id);
                  return (
                    <label key={n.id} className="edge-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEdge(n.id)}
                        className="checkbox-input"
                      />
                      <span><strong>{n.shortName || n.name}</strong> ({n.blockCode || n.id})</span>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Search Aliases */}
          <div className="form-group">
            <label htmlFor={aliasesFieldId} className="form-label">
              <span>Search Aliases</span>
              <span className="form-label-hint">Comma separated</span>
            </label>
            <input
              id={aliasesFieldId}
              type="text"
              className="form-input"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="e.g. robotics, mechatronics, lab r"
            />
          </div>

          {/* Step-Free Accessibility */}
          <div className="form-group">
            <label htmlFor={stepFreeFieldId} className="checkbox-label">
              <input
                id={stepFreeFieldId}
                type="checkbox"
                checked={stepFree}
                onChange={(e) => setStepFree(e.target.checked)}
                className="checkbox-input"
              />
              <span>Step-free accessible (wheelchair ramp / elevator access available)</span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="node-modal-footer">
          {isEditing && (
            <button
              type="button"
              className="modal-btn modal-btn-delete"
              onClick={handleDelete}
              title="Delete this place from database"
            >
              <Trash2 size={15} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Delete Place</span>
            </button>
          )}

          <div className="node-modal-footer-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-btn modal-btn-save"
              onClick={handleSubmit}
            >
              <Check size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>{isEditing ? 'Save Changes' : 'Create Place'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

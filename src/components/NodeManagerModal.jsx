import { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  Navigation, 
  ListOrdered 
} from 'lucide-react';
import './NodeManagerModal.css';

export default function NodeManagerModal({
  isOpen,
  onClose,
  nodes = [],
  onEditNode,
  onQuickRename,
  onDeleteNode,
  onLocateNode,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'places' | 'waypoints'
  const [editingRowId, setEditingRowId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [shortRenameValue, setShortRenameValue] = useState('');

  const placesCount = useMemo(() => nodes.filter((n) => !n.isWaypoint).length, [nodes]);
  const waypointsCount = useMemo(() => nodes.filter((n) => Boolean(n.isWaypoint)).length, [nodes]);

  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (filterType === 'places') {
      result = result.filter((n) => !n.isWaypoint);
    } else if (filterType === 'waypoints') {
      result = result.filter((n) => Boolean(n.isWaypoint));
    }

    if (!searchTerm.trim()) return result;
    const q = searchTerm.trim().toLowerCase();
    return result.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.shortName && n.shortName.toLowerCase().includes(q)) ||
        (n.blockCode && n.blockCode.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        n.id.toLowerCase().includes(q)
    );
  }, [nodes, filterType, searchTerm]);

  const handleStartRename = (node) => {
    setEditingRowId(node.id);
    setRenameValue(node.name);
    setShortRenameValue(node.shortName || node.name);
  };

  const handleSaveRename = (nodeId) => {
    if (renameValue.trim()) {
      onQuickRename(nodeId, renameValue.trim(), shortRenameValue.trim());
    }
    setEditingRowId(null);
  };

  const handleKeyDown = (e, nodeId) => {
    if (e.key === 'Enter') {
      handleSaveRename(nodeId);
    } else if (e.key === 'Escape') {
      setEditingRowId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="node-modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="node-modal-dialog nodemanager-dialog" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-labelledby="manager-modal-heading"
        aria-modal="true"
      >
        <div className="node-modal-header">
          <div className="node-modal-title-group">
            <div className="node-modal-icon-badge">
              <ListOrdered size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="manager-modal-heading" className="node-modal-title">
                Manage Campus Nodes & Waypoints
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

        <div className="node-modal-body">
          {/* Filter Tabs */}
          <div className="nodemanager-filter-tabs" role="tablist" aria-label="Node type filters">
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'all'}
              className={`nodemanager-filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Nodes ({nodes.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'places'}
              className={`nodemanager-filter-tab ${filterType === 'places' ? 'active' : ''}`}
              onClick={() => setFilterType('places')}
            >
              Campus Places ({placesCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterType === 'waypoints'}
              className={`nodemanager-filter-tab ${filterType === 'waypoints' ? 'active' : ''}`}
              onClick={() => setFilterType('waypoints')}
            >
              Waypoints ({waypointsCount})
            </button>
          </div>

          {/* Search filter input */}
          <div className="nodemanager-search-bar">
            <Search size={16} className="text-secondary" aria-hidden="true" />
            <input
              type="text"
              className="nodemanager-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                filterType === 'waypoints'
                  ? 'Filter waypoints by name, ID, or walkway code...'
                  : filterType === 'places'
                  ? 'Filter campus places by name, category, or code...'
                  : 'Filter nodes & waypoints by name, category, or code...'
              }
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className="node-modal-close-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear filter"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Places Table */}
          <div className="nodemanager-table-wrap">
            <table className="nodemanager-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Code / ID</th>
                  <th style={{ width: '45%' }}>Node Name & Label</th>
                  <th style={{ width: '15%' }}>Category</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)' }}>
                      {filterType === 'waypoints' 
                        ? 'No routing waypoints found.' 
                        : filterType === 'places' 
                        ? 'No campus places found.' 
                        : 'No matching campus nodes found.'}
                    </td>
                  </tr>
                ) : (
                  filteredNodes.map((node) => {
                    const isInlineEditing = editingRowId === node.id;

                    return (
                      <tr key={node.id}>
                        <td>
                          <strong>{node.blockCode || node.id}</strong>
                        </td>
                        <td>
                          {isInlineEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                className="inline-rename-input"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, node.id)}
                                placeholder="Full name"
                                autoFocus
                              />
                              <input
                                type="text"
                                className="inline-rename-input"
                                value={shortRenameValue}
                                onChange={(e) => setShortRenameValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, node.id)}
                                placeholder="Short label"
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 600 }}>{node.name}</span>
                                {node.isWaypoint && (
                                  <span className="badge-tag badge-waypoint" title="Invisible routing waypoint (hidden from visitors)">
                                    Waypoint
                                  </span>
                                )}
                              </div>
                              {node.shortName && node.shortName !== node.name && (
                                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                                  Marker: {node.shortName}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge-tag ${node.isWaypoint ? 'badge-waypoint' : ''}`}>
                            {node.category || (node.isWaypoint ? 'Waypoint' : 'Uncategorized')}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {isInlineEditing ? (
                              <button
                                type="button"
                                className="table-btn table-btn-primary"
                                onClick={() => handleSaveRename(node.id)}
                                title="Save name change"
                              >
                                <Check size={13} />
                                <span>Save</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="table-btn"
                                onClick={() => handleStartRename(node)}
                                title="Quick rename inline"
                              >
                                <Edit3 size={12} />
                                <span>Rename</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="table-btn"
                              onClick={() => {
                                onEditNode(node);
                                onClose();
                              }}
                              title="Full edit details"
                            >
                              Edit
                            </button>

                            {onLocateNode && (
                              <button
                                type="button"
                                className="table-btn"
                                onClick={() => {
                                  onLocateNode(node);
                                  onClose();
                                }}
                                title="Fly camera to this node"
                              >
                                <Navigation size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="table-btn table-btn-danger"
                              onClick={() => {
                                if (window.confirm(`Delete ${node.isWaypoint ? 'waypoint' : 'place'} "${node.name}"?`)) {
                                  onDeleteNode(node.id);
                                }
                              }}
                              title={node.isWaypoint ? "Delete waypoint" : "Delete place"}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="node-modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
            Showing {filteredNodes.length} of {nodes.length} nodes ({placesCount} places, {waypointsCount} waypoints)
          </span>
          <button
            type="button"
            className="modal-btn modal-btn-cancel"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

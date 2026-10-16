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
  const [editingRowId, setEditingRowId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [shortRenameValue, setShortRenameValue] = useState('');

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const q = searchTerm.trim().toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        (n.shortName && n.shortName.toLowerCase().includes(q)) ||
        (n.blockCode && n.blockCode.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        n.id.toLowerCase().includes(q)
    );
  }, [nodes, searchTerm]);

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
                Manage Campus Places & Quick Rename
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
          {/* Search filter input */}
          <div className="nodemanager-search-bar">
            <Search size={16} className="text-secondary" aria-hidden="true" />
            <input
              type="text"
              className="nodemanager-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter places by name, category, or block code..."
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
                  <th style={{ width: '45%' }}>Place Name & Label</th>
                  <th style={{ width: '15%' }}>Category</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-2)' }}>
                      No matching campus places found.
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
                              <div style={{ fontWeight: 600 }}>{node.name}</div>
                              {node.shortName && node.shortName !== node.name && (
                                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                                  Marker: {node.shortName}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge-tag">{node.category}</span>
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
                                title="Fly camera to this place"
                              >
                                <Navigation size={12} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="table-btn table-btn-danger"
                              onClick={() => {
                                if (window.confirm(`Delete "${node.name}"?`)) {
                                  onDeleteNode(node.id);
                                }
                              }}
                              title="Delete place"
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
            Showing {filteredNodes.length} of {nodes.length} places
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

import { useState, useMemo } from 'react';
import { 
  X, 
  FileCode, 
  Database, 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  CheckCircle2 
} from 'lucide-react';
import { 
  exportDatabaseSQL, 
  exportDatabaseJSON, 
  exportDocumentation 
} from '../data/campusDatabase';
import './DbExportModal.css';

export default function DbExportModal({
  isOpen,
  onClose,
  nodes = [],
  edges = [],
}) {
  const [activeTab, setActiveTab] = useState('sql'); // 'sql' | 'json' | 'docs'
  const [copiedTab, setCopiedTab] = useState(null);

  const sqlContent = useMemo(() => exportDatabaseSQL(nodes, edges), [nodes, edges]);
  const jsonContent = useMemo(() => exportDatabaseJSON(nodes, edges), [nodes, edges]);
  const docsContent = useMemo(() => exportDocumentation(nodes, edges), [nodes, edges]);

  const handleCopy = (tabKey, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tabKey);
      setTimeout(() => setCopiedTab(null), 2200);
    }).catch((err) => {
      console.warn('Clipboard write failed, using fallback:', err);
    });
  };

  const handleDownload = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="node-modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="node-modal-dialog dbexport-dialog" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-labelledby="export-modal-heading"
        aria-modal="true"
      >
        {/* Header */}
        <div className="node-modal-header">
          <div className="node-modal-title-group">
            <div className="node-modal-icon-badge">
              <Database size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="export-modal-heading" className="node-modal-title">
                Export Database for Permanent Backend Storage
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

        {/* Tab Navigation */}
        <nav className="dbexport-tabs-nav" aria-label="Export Format Tabs">
          <button
            type="button"
            className={`dbexport-tab-btn ${activeTab === 'sql' ? 'active' : ''}`}
            onClick={() => setActiveTab('sql')}
          >
            <Database size={15} aria-hidden="true" />
            <span>SQL Migration (.sql)</span>
          </button>

          <button
            type="button"
            className={`dbexport-tab-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <FileCode size={15} aria-hidden="true" />
            <span>JSON Dataset (.json)</span>
          </button>

          <button
            type="button"
            className={`dbexport-tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            <BookOpen size={15} aria-hidden="true" />
            <span>Developer README (.md)</span>
          </button>
        </nav>

        {/* Body */}
        <div className="node-modal-body">
          <div className="dbexport-stats-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>
                <strong>{nodes.length} Places</strong> and <strong>{edges.length} Network Walkways</strong> serialized and ready for your database engineer.
              </span>
            </div>
          </div>

          {/* SQL TAB */}
          {activeTab === 'sql' && (
            <div className="dbexport-code-container">
              <div className="dbexport-code-topbar">
                <span>schema_and_seed.sql (PostgreSQL / MySQL / SQLite)</span>
                <div className="dbexport-code-actions">
                  <button
                    type="button"
                    className="code-action-btn"
                    onClick={() => handleCopy('sql', sqlContent)}
                    title="Copy full SQL to clipboard"
                  >
                    {copiedTab === 'sql' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedTab === 'sql' ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                  <button
                    type="button"
                    className="code-action-btn btn-accent"
                    onClick={() => handleDownload('aimaps_campus_db.sql', sqlContent, 'application/sql')}
                    title="Download .sql migration script"
                  >
                    <Download size={12} />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>
              <pre className="dbexport-code-pre">
                <code>{sqlContent}</code>
              </pre>
            </div>
          )}

          {/* JSON TAB */}
          {activeTab === 'json' && (
            <div className="dbexport-code-container">
              <div className="dbexport-code-topbar">
                <span>campus_nodes_edges.json</span>
                <div className="dbexport-code-actions">
                  <button
                    type="button"
                    className="code-action-btn"
                    onClick={() => handleCopy('json', jsonContent)}
                    title="Copy JSON to clipboard"
                  >
                    {copiedTab === 'json' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedTab === 'json' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    type="button"
                    className="code-action-btn btn-accent"
                    onClick={() => handleDownload('campus_nodes_edges.json', jsonContent, 'application/json')}
                    title="Download .json file"
                  >
                    <Download size={12} />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>
              <pre className="dbexport-code-pre">
                <code>{jsonContent}</code>
              </pre>
            </div>
          )}

          {/* DOCS TAB */}
          {activeTab === 'docs' && (
            <div className="dbexport-code-container">
              <div className="dbexport-code-topbar">
                <span>README_DB_INTEGRATION.md</span>
                <div className="dbexport-code-actions">
                  <button
                    type="button"
                    className="code-action-btn"
                    onClick={() => handleCopy('docs', docsContent)}
                    title="Copy documentation to clipboard"
                  >
                    {copiedTab === 'docs' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedTab === 'docs' ? 'Copied!' : 'Copy MD'}</span>
                  </button>
                  <button
                    type="button"
                    className="code-action-btn btn-accent"
                    onClick={() => handleDownload('README_DB_INTEGRATION.md', docsContent, 'text/markdown')}
                    title="Download README guide for developer"
                  >
                    <Download size={12} />
                    <span>Download README.md</span>
                  </button>
                </div>
              </div>
              <pre className="dbexport-code-pre">
                <code>{docsContent}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="node-modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
            Provide these files to your backend developer to deploy permanently into your production database.
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

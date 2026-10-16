import { useEffect, useRef } from 'react';
import { X, Navigation, Keyboard, ShieldCheck } from 'lucide-react';
import './AboutModal.css';

export default function AboutModal({ isOpen, onClose }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="about-modal-title"
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Navigation className="modal-icon" size={24} aria-hidden="true" />
            <h2 id="about-modal-title" className="modal-title">Maps</h2>
          </div>
          <button 
            ref={closeBtnRef}
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            An interactive high-fidelity 3D campus navigation system engineered for accessible pedestrian wayfinding, step-free accessibility, and real-time step guidance.
          </p>

          <section className="modal-section" aria-labelledby="shortcuts-title">
            <h3 id="shortcuts-title" className="modal-section-title">
              <Keyboard size={18} aria-hidden="true" />
              Keyboard Shortcuts
            </h3>
            <div className="shortcuts-grid">
              <div className="shortcut-row">
                <kbd>Arrow Keys</kbd>
                <span>Pan map canvas</span>
              </div>
              <div className="shortcut-row">
                <kbd>+</kbd> / <kbd>-</kbd>
                <span>Zoom in / out</span>
              </div>
              <div className="shortcut-row">
                <kbd>R</kbd>
                <span>Reset camera north (0°)</span>
              </div>
              <div className="shortcut-row">
                <kbd>Escape</kbd>
                <span>Close dialogs / deselect place</span>
              </div>
            </div>
          </section>

          <section className="modal-section" aria-labelledby="a11y-title">
            <h3 id="a11y-title" className="modal-section-title">
              <ShieldCheck size={18} aria-hidden="true" />
              Accessibility (WCAG 2.2 AA)
            </h3>
            <ul className="a11y-list">
              <li>High-contrast text tokens (≥ 4.5:1 ratio)</li>
              <li>Step-free wheelchair and elevator accessible routing option</li>
              <li>Color-blind safe icon & shape differentiation</li>
              <li>Full keyboard navigation and aria-live announcements</li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="modal-action-btn"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

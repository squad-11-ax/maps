import { useEffect, useRef, useState, useMemo } from 'react';
import { 
  X, 
  Navigation, 
  Clock, 
  Building2, 
  Layers, 
  Accessibility, 
  CornerUpRight,
  Footprints,
  Share2,
  Check
} from 'lucide-react';
import { findShortestPath } from '../data/nodesData';
import './PlaceCard.css';

export default function PlaceCard({ 
  place, 
  userLocationId = 'PointA',
  onClose, 
  onGetDirections, 
  onStartHere 
}) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (place) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [place, onClose]);

  // Estimated walking distance and time from user location
  const walkInfo = useMemo(() => {
    if (!place || !userLocationId || place.id === userLocationId) return null;
    const path = findShortestPath(userLocationId, place.id);
    if (!path || path.length < 2) return null;
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      dist += Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
    }
    const meters = Math.max(25, Math.round(dist * 1100));
    const mins = Math.max(1, Math.round(meters / 75));
    return { meters, mins };
  }, [place, userLocationId]);

  const handleCopy = () => {
    if (!place) return;
    navigator.clipboard?.writeText(`${place.name} (${place.blockCode || ''}) - Campus Map`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!place) return null;

  return (
    <div 
      className="place-card-overlay" 
      ref={cardRef}
      role="dialog"
      aria-labelledby="place-card-title"
      aria-modal="false"
    >
      <div className="place-card">
        {/* Card Header */}
        <div className="place-card-header">
          <div className="place-card-badges">
            {place.blockCode && (
              <span className="place-badge block-badge">
                <Building2 size={12} aria-hidden="true" />
                {place.blockCode}
              </span>
            )}
            {place.category && (
              <span className="place-badge category-badge">
                {place.category}
              </span>
            )}
            {place.stepFree && (
              <span className="place-badge a11y-badge" title="Wheelchair and step-free accessible building">
                <Accessibility size={12} aria-hidden="true" />
                Step-free
              </span>
            )}
            <span className="place-badge open-badge">
              <span className="open-dot" aria-hidden="true" />
              Open
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="place-card-icon-btn"
              onClick={handleCopy}
              aria-label="Share location"
              title="Copy location info"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
            </button>
            <button 
              type="button" 
              className="place-card-close-btn" 
              onClick={onClose}
              aria-label="Close place details"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Place Title & Walk Info */}
        <div className="place-card-body">
          <h2 id="place-card-title" className="place-card-name">
            {place.name}
          </h2>
          {place.subtitle && (
            <p className="place-card-subtitle">{place.subtitle}</p>
          )}

          {walkInfo && (
            <div className="place-walk-estimate">
              <Footprints size={15} className="walk-icon" aria-hidden="true" />
              <span>
                <strong>~{walkInfo.mins} min walk</strong> ({walkInfo.meters} m) from current position
              </span>
            </div>
          )}

          {/* Details Metadata List */}
          <div className="place-details-grid">
            {place.departments && (
              <div className="detail-item">
                <Layers size={16} className="detail-icon" aria-hidden="true" />
                <div className="detail-content">
                  <span className="detail-label">Departments & Units</span>
                  <span className="detail-value">{place.departments}</span>
                </div>
              </div>
            )}

            {place.hours && (
              <div className="detail-item">
                <Clock size={16} className="detail-icon" aria-hidden="true" />
                <div className="detail-content">
                  <span className="detail-label">Visiting Hours</span>
                  <span className="detail-value">{place.hours}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="place-card-actions">
          <button
            type="button"
            className="place-btn-primary"
            onClick={() => onGetDirections(place)}
            aria-label={`Directions to ${place.name}`}
          >
            <Navigation size={18} aria-hidden="true" />
            <span>Directions</span>
          </button>

          <button
            type="button"
            className="place-btn-secondary"
            onClick={() => onStartHere(place)}
            aria-label={`Start route from ${place.name}`}
          >
            <CornerUpRight size={18} aria-hidden="true" />
            <span>Start here</span>
          </button>
        </div>
      </div>
    </div>
  );
}

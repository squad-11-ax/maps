import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Navigation, 
  MapPin, 
  Clock, 
  Building2, 
  Layers, 
  Accessibility, 
  CornerUpRight,
  Share2
} from 'lucide-react';
import './PlaceCard.css';

export default function PlaceCard({ 
  place, 
  onClose, 
  onGetDirections, 
  onStartHere 
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (place) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [place, onClose]);

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
          </div>

          <button 
            type="button" 
            className="place-card-close-btn" 
            onClick={onClose}
            aria-label="Close place details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Place Title */}
        <div className="place-card-body">
          <h2 id="place-card-title" className="place-card-name">
            {place.name}
          </h2>
          {place.subtitle && (
            <p className="place-card-subtitle">{place.subtitle}</p>
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

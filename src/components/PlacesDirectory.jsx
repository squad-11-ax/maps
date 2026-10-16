import { useState, useMemo } from 'react';
import { NODES, CATEGORIES } from '../data/nodesData';
import { 
  Building2, 
  Navigation, 
  Clock, 
  Accessibility, 
  Search,
  X 
} from 'lucide-react';
import './PlacesDirectory.css';

export default function PlacesDirectory({
  onSelectPlace,
  onGetDirections,
  onClose
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterText, setFilterText] = useState('');

  const filteredPlaces = useMemo(() => {
    return NODES.filter((place) => {
      if (selectedCategory !== 'all' && place.category !== selectedCategory) {
        return false;
      }
      if (!filterText.trim()) return true;

      const q = filterText.trim().toLowerCase();
      return (
        place.name.toLowerCase().includes(q) ||
        (place.shortName && place.shortName.toLowerCase().includes(q)) ||
        (place.blockCode && place.blockCode.toLowerCase().includes(q)) ||
        (place.departments && place.departments.toLowerCase().includes(q)) ||
        (place.subtitle && place.subtitle.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, filterText]);

  return (
    <div className="places-directory-panel" role="region" aria-label="Campus Directory and Places">
      {/* Directory Header */}
      <div className="directory-header">
        <div className="directory-title-wrap">
          <Building2 size={20} className="directory-icon" aria-hidden="true" />
          <h2 className="directory-title">Campus Directory</h2>
        </div>
        {onClose && (
          <button 
            type="button" 
            className="directory-close-btn" 
            onClick={onClose}
            aria-label="Close directory"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="directory-search-box">
        <Search size={16} className="directory-search-icon" aria-hidden="true" />
        <input
          type="text"
          className="directory-search-input"
          placeholder="Filter directory by name, block, or lab..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          aria-label="Filter campus directory"
        />
        {filterText && (
          <button 
            type="button" 
            className="directory-clear-btn" 
            onClick={() => setFilterText('')}
            aria-label="Clear filter text"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="directory-categories-scroll" role="tablist" aria-label="Filter categories">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`directory-cat-chip ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              role="tab"
              aria-selected={isActive}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Places List */}
      <div className="directory-list-container">
        {filteredPlaces.length > 0 ? (
          <ul className="directory-items-list" role="list">
            {filteredPlaces.map((place) => (
              <li 
                key={place.id} 
                className="directory-item-card"
                onClick={() => onSelectPlace(place)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectPlace(place);
                  }
                }}
                aria-label={`${place.name}, ${place.blockCode || ''}`}
              >
                <div className="item-main-content">
                  <div className="item-title-row">
                    <span className="item-name">{place.name}</span>
                    {place.blockCode && (
                      <span className="item-block-badge">{place.blockCode}</span>
                    )}
                  </div>

                  <span className="item-subtitle">{place.subtitle || place.departments}</span>

                  <div className="item-meta-row">
                    {place.hours && (
                      <span className="item-meta-tag">
                        <Clock size={12} aria-hidden="true" />
                        {place.hours}
                      </span>
                    )}
                    {place.stepFree && (
                      <span className="item-a11y-tag" title="Step-free accessible">
                        <Accessibility size={12} aria-hidden="true" />
                        Step-free
                      </span>
                    )}
                  </div>
                </div>

                <div className="item-actions">
                  <button
                    type="button"
                    className="item-direct-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGetDirections(place);
                    }}
                    title={`Get directions to ${place.name}`}
                    aria-label={`Get directions to ${place.name}`}
                  >
                    <Navigation size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="directory-empty-state">
            <Building2 size={32} className="empty-icon" aria-hidden="true" />
            <p className="empty-title">No campus locations match your filter</p>
            <p className="empty-desc">Try clearing your search or selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Clock, 
  MapPin, 
  Utensils, 
  Bed, 
  FlaskConical, 
  CreditCard, 
  Car, 
  DoorOpen, 
  Bath, 
  BookOpen,
  Building,
  Navigation
} from 'lucide-react';
import { NODES } from '../data/nodesData';
import './GlobalSearchPill.css';

const CATEGORY_CHIPS = [
  { id: 'Food', label: 'Food', icon: Utensils },
  { id: 'Hostels', label: 'Hostels', icon: Bed },
  { id: 'Labs', label: 'Labs', icon: FlaskConical },
  { id: 'ATM', label: 'ATM', icon: CreditCard },
  { id: 'Parking', label: 'Parking', icon: Car },
  { id: 'Gates', label: 'Gates', icon: DoorOpen },
  { id: 'Washrooms', label: 'Washrooms', icon: Bath },
];

export default function GlobalSearchPill({ 
  onSelectPlace, 
  onOpenDirections,
  selectedPlace = null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [recents, setRecents] = useState(() => {
    try {
      const saved = localStorage.getItem('aimaps_recent_searches');
      return saved ? JSON.parse(saved) : ['Saraswati Library', 'Main Campus Center', 'MediSquare-1'];
    } catch {
      return ['Saraswati Library', 'Main Campus Center', 'MediSquare-1'];
    }
  });

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Save recents to localStorage
  const addRecent = (name) => {
    setRecents(prev => {
      const updated = [name, ...prev.filter(item => item !== name)].slice(0, 5);
      try {
        localStorage.setItem('aimaps_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  // Fuzzy match algorithm matching name, blockCode, subtitle, and aliases
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    return NODES.filter((place) => {
      // Category filter
      if (activeCategory && place.category !== activeCategory) {
        return false;
      }

      if (!q) {
        return true; // show category results or all
      }

      // Match name or shortName
      if (place.name.toLowerCase().includes(q)) return true;
      if (place.shortName && place.shortName.toLowerCase().includes(q)) return true;
      
      // Match blockCode (e.g. "Block G")
      if (place.blockCode && place.blockCode.toLowerCase().includes(q)) return true;
      
      // Match subtitle
      if (place.subtitle && place.subtitle.toLowerCase().includes(q)) return true;
      
      // Match aliases
      if (place.aliases && place.aliases.some(alias => alias.toLowerCase().includes(q))) {
        return true;
      }

      return false;
    }).slice(0, 8);
  }, [query, activeCategory]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    addRecent(place.name);
    setIsOpen(false);
    setQuery('');
    setActiveCategory(null);
    onSelectPlace(place);
  };

  const handleRecentClick = (recentName) => {
    const found = NODES.find(n => n.name.toLowerCase() === recentName.toLowerCase() || n.shortName?.toLowerCase() === recentName.toLowerCase());
    if (found) {
      handleSelect(found);
    } else {
      setQuery(recentName);
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && searchResults[highlightedIndex]) {
      e.preventDefault();
      handleSelect(searchResults[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="global-search-container" ref={containerRef}>
      {/* Search Bar Pill */}
      <div 
        className={`search-pill-card ${isOpen ? 'active' : ''}`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="search-icon-wrapper" aria-hidden="true">
          <Search size={18} className="search-icon" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="search-pill-input"
          placeholder="Search campus buildings, labs, ATMs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search campus buildings and locations"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              setActiveCategory(null);
              inputRef.current?.focus();
            }}
            aria-label="Clear search input"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Category Chips Bar */}
      <div 
        className="category-chips-scroll" 
        role="region" 
        aria-label="Filter locations by category"
      >
        {CATEGORY_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeCategory === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              className={`category-chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isActive) {
                  setActiveCategory(null);
                } else {
                  setActiveCategory(chip.id);
                  setIsOpen(true);
                }
              }}
              aria-pressed={isActive}
            >
              <Icon size={14} aria-hidden="true" className="chip-icon" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="search-dropdown-panel" role="listbox" id="search-results-list">
          {/* Recent Searches Header */}
          {!query && !activeCategory && recents.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <Clock size={14} aria-hidden="true" />
                <span>Recent Searches</span>
              </div>
              <div className="recents-list">
                {recents.map((recentItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="recent-item-btn"
                    onClick={() => handleRecentClick(recentItem)}
                  >
                    <Clock size={14} className="recent-icon" aria-hidden="true" />
                    <span>{recentItem}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search / Category Results */}
          <div className="results-group">
            <div className="search-section-header">
              <MapPin size={14} aria-hidden="true" />
              <span>
                {activeCategory ? `${activeCategory} on Campus` : query ? 'Matching Places' : 'Suggested Places'}
              </span>
            </div>

            {searchResults.length > 0 ? (
              <ul className="results-list" role="presentation">
                {searchResults.map((place, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <li
                      key={place.id}
                      role="option"
                      aria-selected={isHighlighted}
                      className={`result-item ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => handleSelect(place)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <div className="result-icon-box">
                        <MapPin size={18} aria-hidden="true" />
                      </div>
                      <div className="result-info">
                        <div className="result-title-row">
                          <span className="result-name">{place.name}</span>
                          {place.blockCode && (
                            <span className="result-block-badge">{place.blockCode}</span>
                          )}
                        </div>
                        <span className="result-subtitle">
                          {place.subtitle || place.departments}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="quick-direct-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDirections(place);
                          setIsOpen(false);
                        }}
                        title={`Get directions to ${place.name}`}
                        aria-label={`Get directions to ${place.name}`}
                      >
                        <Navigation size={14} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-results-state">
                <Search size={24} className="empty-search-icon" aria-hidden="true" />
                <p className="empty-text">No places matching "{query}"</p>
                <p className="empty-subtext">Try searching for a block name, department, or keyword like "library" or "canteen"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

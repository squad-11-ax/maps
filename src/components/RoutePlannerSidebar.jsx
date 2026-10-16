import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowUpDown, 
  X, 
  Navigation, 
  MapPin, 
  Accessibility, 
  Footprints, 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Check 
} from 'lucide-react';
import { NODES } from '../data/nodesData';
import './RoutePlannerSidebar.css';

export default function RoutePlannerSidebar({
  nodes = [],
  startNodeId,
  endNodeId,
  onChangeStart,
  onChangeEnd,
  onSwap,
  routeSteps = [],
  currentStepIndex = 0,
  onSelectStep,
  onNextStep,
  onPrevStep,
  isNavigating = false,
  onStartNavigation,
  onStopNavigation,
  stepFreeOnly = false,
  onToggleStepFree,
  onCloseDirections
}) {
  const [activeInput, setActiveInput] = useState(null); // 'start' | 'dest' | null
  const sidebarRef = useRef(null);

  const allPlaces = useMemo(() => (nodes && nodes.length > 0 ? nodes : NODES), [nodes]);

  // Derived selected nodes
  const startNode = useMemo(() => allPlaces.find(n => n.id === startNodeId), [allPlaces, startNodeId]);
  const endNode = useMemo(() => allPlaces.find(n => n.id === endNodeId), [allPlaces, endNodeId]);

  // Adjust query strings during render when props change (React 19 pattern)
  const [prevStartNodeId, setPrevStartNodeId] = useState(startNodeId);
  const [prevEndNodeId, setPrevEndNodeId] = useState(endNodeId);
  const [startQuery, setStartQuery] = useState(
    startNodeId === 'user_location' ? 'Your location' : startNode ? startNode.name : ''
  );
  const [destQuery, setDestQuery] = useState(endNode ? endNode.name : '');

  if (startNodeId !== prevStartNodeId) {
    setPrevStartNodeId(startNodeId);
    setStartQuery(startNodeId === 'user_location' ? 'Your location' : startNode ? startNode.name : '');
  }

  if (endNodeId !== prevEndNodeId) {
    setPrevEndNodeId(endNodeId);
    setDestQuery(endNode ? endNode.name : '');
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setActiveInput(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete options
  const filterNodes = useCallback((queryText) => {
    const q = (queryText || '').trim().toLowerCase();
    const destinationPlaces = allPlaces.filter((n) => !n.isWaypoint);
    if (!q) return destinationPlaces.slice(0, 6);

    return destinationPlaces.filter((n) => {
      if (n.name.toLowerCase().includes(q)) return true;
      if (n.shortName && n.shortName.toLowerCase().includes(q)) return true;
      if (n.blockCode && n.blockCode.toLowerCase().includes(q)) return true;
      if (n.aliases && n.aliases.some(a => a.toLowerCase().includes(q))) return true;
      return false;
    }).slice(0, 6);
  }, [allPlaces]);

  const startSuggestions = useMemo(() => filterNodes(startQuery), [filterNodes, startQuery]);
  const destSuggestions = useMemo(() => filterNodes(destQuery), [filterNodes, destQuery]);

  // Total summary calculations
  const totalMeters = useMemo(() => {
    return routeSteps.reduce((acc, step) => acc + (step.distanceMeters || 0), 0);
  }, [routeSteps]);

  const totalMinutes = useMemo(() => {
    return Math.max(1, Math.round(totalMeters / 75)); // ~75 meters/minute walking
  }, [totalMeters]);

  const getStepIcon = (direction) => {
    switch (direction) {
      case 'left':
        return <ArrowLeft size={18} aria-hidden="true" />;
      case 'right':
        return <ArrowRight size={18} aria-hidden="true" />;
      case 'arrive':
        return <MapPin size={18} className="arrive-icon" aria-hidden="true" />;
      case 'start':
        return <Footprints size={18} className="start-icon" aria-hidden="true" />;
      default:
        return <ArrowUp size={18} aria-hidden="true" />;
    }
  };

  return (
    <div className="unified-directions-panel" ref={sidebarRef} role="region" aria-label="Route Planner and Directions">
      {/* Panel Header */}
      <div className="directions-panel-header">
        <div className="header-title-wrap">
          <Navigation size={20} className="header-icon" aria-hidden="true" />
          <h2 className="header-title">Directions</h2>
        </div>
        {onCloseDirections && (
          <button
            type="button"
            className="directions-close-btn"
            onClick={onCloseDirections}
            aria-label="Close directions panel"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* From / To Search Inputs and Swap Button */}
      <div className="directions-inputs-section">
        <div className="inputs-column">
          {/* Start Input */}
          <div className="input-field-wrapper">
            <div className="input-icon-indicator start-indicator" aria-hidden="true">
              <div className="origin-dot" />
            </div>
            <input
              type="text"
              className="direction-text-input"
              placeholder="Choose starting point"
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                setActiveInput('start');
              }}
              onFocus={() => setActiveInput('start')}
              aria-label="Starting location"
              aria-autocomplete="list"
            />
            {startQuery && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => {
                  setStartQuery('');
                  onChangeStart('');
                  setActiveInput('start');
                }}
                aria-label="Clear starting point"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}

            {/* Start Autocomplete Suggestions */}
            {activeInput === 'start' && (
              <div className="autocomplete-flyout" role="listbox">
                <button
                  type="button"
                  className="flyout-item special-location-item"
                  onClick={() => {
                    onChangeStart('PointA');
                    setStartQuery('Your location');
                    setActiveInput(null);
                  }}
                >
                  <div className="flyout-icon-wrap user-loc-icon">
                    <Footprints size={16} />
                  </div>
                  <div className="flyout-text">
                    <span className="flyout-title">Your location</span>
                    <span className="flyout-subtitle">Current campus location (Main Center)</span>
                  </div>
                </button>
                {startSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flyout-item"
                    onClick={() => {
                      onChangeStart(item.id);
                      setStartQuery(item.name);
                      setActiveInput(null);
                    }}
                  >
                    <div className="flyout-icon-wrap">
                      <MapPin size={16} />
                    </div>
                    <div className="flyout-text">
                      <span className="flyout-title">{item.name}</span>
                      <span className="flyout-subtitle">{item.subtitle || item.blockCode}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div className="input-field-wrapper">
            <div className="input-icon-indicator dest-indicator" aria-hidden="true">
              <MapPin size={16} className="dest-pin-icon" />
            </div>
            <input
              type="text"
              className="direction-text-input"
              placeholder="Choose destination"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setActiveInput('dest');
              }}
              onFocus={() => setActiveInput('dest')}
              aria-label="Destination location"
              aria-autocomplete="list"
            />
            {destQuery && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => {
                  setDestQuery('');
                  onChangeEnd('');
                  setActiveInput('dest');
                }}
                aria-label="Clear destination"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}

            {/* Destination Autocomplete Suggestions */}
            {activeInput === 'dest' && (
              <div className="autocomplete-flyout" role="listbox">
                {destSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flyout-item"
                    onClick={() => {
                      onChangeEnd(item.id);
                      setDestQuery(item.name);
                      setActiveInput(null);
                    }}
                  >
                    <div className="flyout-icon-wrap">
                      <MapPin size={16} />
                    </div>
                    <div className="flyout-text">
                      <span className="flyout-title">{item.name}</span>
                      <span className="flyout-subtitle">{item.subtitle || item.blockCode}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reverse / Swap Button (>= 44x44px target) */}
        <button
          type="button"
          className="route-swap-btn"
          onClick={onSwap}
          aria-label="Reverse starting point and destination"
          title="Reverse starting point and destination"
        >
          <ArrowUpDown size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Route Options & Accessibility Filter */}
      <div className="route-options-row">
        <label className="step-free-toggle" htmlFor="step-free-checkbox">
          <input
            id="step-free-checkbox"
            type="checkbox"
            checked={stepFreeOnly}
            onChange={(e) => onToggleStepFree(e.target.checked)}
            className="step-free-input"
          />
          <span className="toggle-switch-ui" aria-hidden="true" />
          <div className="toggle-label-content">
            <Accessibility size={16} className="a11y-icon" aria-hidden="true" />
            <span className="toggle-text">Step-free route</span>
          </div>
        </label>
        {stepFreeOnly && (
          <span className="step-free-active-tag">Accessible</span>
        )}
      </div>

      {/* Route Summary Header */}
      {routeSteps.length > 0 ? (
        <div className="route-summary-bar">
          <div className="summary-main">
            <Footprints size={20} className="walking-icon" aria-hidden="true" />
            <div className="summary-metrics">
              <span className="summary-duration">{totalMinutes} min</span>
              <span className="summary-divider">•</span>
              <span className="summary-distance">{totalMeters} m</span>
            </div>
          </div>
          <button
            type="button"
            className={`navigation-start-btn ${isNavigating ? 'active' : ''}`}
            onClick={isNavigating ? onStopNavigation : onStartNavigation}
            aria-label={isNavigating ? 'Exit live navigation' : 'Start live turn-by-turn navigation'}
          >
            {isNavigating ? (
              <>
                <RotateCcw size={16} aria-hidden="true" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Play size={16} aria-hidden="true" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="no-route-alert">
          <p className="no-route-text">No route found between selected points.</p>
          <p className="no-route-hint">Try selecting a different entrance or accessible node.</p>
        </div>
      )}

      {/* Navigation Steps List */}
      <div className="steps-scroll-container">
        <h3 className="steps-section-heading">Step-by-Step Guidance</h3>
        <ol className="steps-timeline-list">
          {routeSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <li
                key={index}
                className={`step-timeline-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isUpcoming ? 'upcoming' : ''}`}
                onClick={() => onSelectStep(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStep(index);
                  }
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.instruction}, ${step.distanceMeters} meters`}
              >
                <div className="step-icon-column">
                  <div className="step-icon-bubble">
                    {isCompleted ? (
                      <Check size={16} className="check-icon" aria-hidden="true" />
                    ) : (
                      getStepIcon(step.direction)
                    )}
                  </div>
                  {index < routeSteps.length - 1 && (
                    <div className="step-timeline-connector" aria-hidden="true" />
                  )}
                </div>

                <div className="step-content">
                  <span className="step-instruction">{step.instruction}</span>
                  {step.distanceMeters > 0 && (
                    <span className="step-meta">
                      {step.distanceMeters} m • ~{Math.max(1, Math.round(step.distanceMeters / 75))} min
                    </span>
                  )}
                </div>

                {isCurrent && (
                  <span className="current-step-badge" aria-hidden="true">
                    Next
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Manual Step Advancement Controls */}
      <div className="directions-footer-controls">
        <button
          type="button"
          className="step-nav-btn prev-btn"
          onClick={onPrevStep}
          disabled={currentStepIndex === 0}
          aria-label="Go to previous route step"
        >
          Previous
        </button>
        <button
          type="button"
          className="step-nav-btn next-btn"
          onClick={onNextStep}
          disabled={currentStepIndex >= routeSteps.length - 1}
          aria-label={currentStepIndex >= routeSteps.length - 1 ? 'Reached destination' : 'Go to next route step'}
        >
          {currentStepIndex >= routeSteps.length - 1 ? 'Arrived' : 'Next Step'}
        </button>
      </div>
    </div>
  );
}
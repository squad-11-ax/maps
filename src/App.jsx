import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import MapContainer from './components/MapContainer';
import RoutePlannerSidebar from './components/RoutePlannerSidebar';
import GlobalSearchPill from './components/GlobalSearchPill';
import PlacesDirectory from './components/PlacesDirectory';
import AboutModal from './components/AboutModal';
import MobileBottomSheet from './components/MobileBottomSheet';
import StatusToast from './components/StatusToast';
import { NODES, findShortestPath, generateTurnByTurnSteps } from './data/nodesData';
import './asset.css';

export default function App() {
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'directions' | 'places' | 'about'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [cameraHeading, setCameraHeading] = useState(0);

  // Routing State
  const [startNodeId, setStartNodeId] = useState('PointA'); // Main Campus Center
  const [endNodeId, setEndNodeId] = useState('PointE');     // Saraswati Library
  const [stepFreeOnly, setStepFreeOnly] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Selected Place for PlaceCard
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Mobile Bottom Sheet Snap State
  const [mobileSheetSnap, setMobileSheetSnap] = useState('peek'); // 'peek' | 'half' | 'full'

  // Canvas Imperative Control Ref
  const canvasControlRef = useRef(null);

  // Synchronize Dark Theme with DOM Root
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Compute Shortest Path and Turn-by-Turn Guidance
  const pathNodes = useMemo(() => {
    if (!startNodeId || !endNodeId) return [];
    return findShortestPath(startNodeId, endNodeId, { stepFreeOnly });
  }, [startNodeId, endNodeId, stepFreeOnly]);

  const routeSteps = useMemo(() => {
    return generateTurnByTurnSteps(pathNodes);
  }, [pathNodes]);

  const routePlannerPoints = useMemo(() => {
    return routeSteps.map((step) => ({
      lat: step.lat,
      lng: step.lng,
      instruction: step.instruction,
    }));
  }, [routeSteps]);

  // Reset current step when route changes
  const routeKey = `${startNodeId}-${endNodeId}-${stepFreeOnly}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setCurrentStepIndex(0);
  }

  // Current and Next Step for Live Navigation
  const currentStep = routeSteps[currentStepIndex] || null;
  const nextStep = routeSteps[currentStepIndex + 1] || null;

  // Handlers
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < routeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, routeSteps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSelectStep = (index) => {
    setCurrentStepIndex(index);
  };

  const handleSwapPoints = () => {
    const prevStart = startNodeId;
    const prevEnd = endNodeId;
    setStartNodeId(prevEnd);
    setEndNodeId(prevStart);
  };

  const handleSelectPlaceFromMapOrSearch = (place) => {
    setSelectedPlace(place);
    if (canvasControlRef.current?.flyToPlace) {
      canvasControlRef.current.flyToPlace(place);
    }
  };

  const handleGetDirectionsToPlace = (place) => {
    setEndNodeId(place.id);
    setSelectedPlace(null);
    setActiveTab('directions');
    setMobileSheetSnap('half');
  };

  const handleStartHereFromPlace = (place) => {
    setStartNodeId(place.id);
    setSelectedPlace(null);
    setActiveTab('directions');
    setMobileSheetSnap('half');
  };

  // Keyboard Navigation listener (WCAG AA)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'Escape') {
        if (selectedPlace) {
          setSelectedPlace(null);
        } else if (isAboutOpen) {
          setIsAboutOpen(false);
        } else if (isNavigating) {
          setIsNavigating(false);
        } else if (activeTab !== 'map') {
          setActiveTab('map');
        }
      } else if (e.key === '?') {
        setIsAboutOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedPlace, isAboutOpen, isNavigating, activeTab]);

  return (
    <div id="body">
      {/* Skip to Main Content Link (WCAG 2.2 AA) */}
      <a href="#main-content" className="skip-link">
        Skip to campus map
      </a>

      {/* Screen Reader Live Region for Announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isNavigating && currentStep
          ? `Current instruction: ${currentStep.instruction}, ${currentStep.distanceMeters} meters remaining.`
          : selectedPlace
          ? `Selected location: ${selectedPlace.name}.`
          : ''}
      </div>

      {/* Slim Desktop Top App Bar & Mobile Bottom Tab Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          if (tabId === 'directions') {
            setMobileSheetSnap('half');
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Map Application Canvas */}
      <main id="main-content" className="main-layout">
        {/* Full-bleed 3D Map Container */}
        <div className="map-viewport">
          <MapContainer
            routePlanner={routePlannerPoints}
            currentStepIndex={currentStepIndex}
            startNodeId={startNodeId}
            endNodeId={endNodeId}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlaceFromMapOrSearch}
            onClosePlace={() => setSelectedPlace(null)}
            onGetDirections={handleGetDirectionsToPlace}
            onStartHere={handleStartHereFromPlace}
            is3D={is3D}
            onToggle3D={() => setIs3D(prev => !prev)}
            showPOIs={showPOIs}
            onTogglePOIs={() => setShowPOIs(prev => !prev)}
            cameraHeading={cameraHeading}
            onCameraHeadingChange={setCameraHeading}
            isDarkMode={isDarkMode}
            onRegisterControls={(api) => { canvasControlRef.current = api; }}
            isNavigating={isNavigating}
            currentStep={currentStep}
            nextStep={nextStep}
            totalSteps={routeSteps.length}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onExitNav={() => setIsNavigating(false)}
          />
        </div>

        {/* Global Search Pill & Category Chips (Shown when not in directions panel) */}
        {activeTab !== 'directions' && activeTab !== 'places' && !isNavigating && (
          <GlobalSearchPill
            onSelectPlace={handleSelectPlaceFromMapOrSearch}
            onOpenDirections={handleGetDirectionsToPlace}
            selectedPlace={selectedPlace}
          />
        )}

        {/* Desktop Directions Sidebar (Desktop only) */}
        {activeTab === 'directions' && (
          <RoutePlannerSidebar
            startNodeId={startNodeId}
            endNodeId={endNodeId}
            onChangeStart={setStartNodeId}
            onChangeEnd={setEndNodeId}
            onSwap={handleSwapPoints}
            routeSteps={routeSteps}
            currentStepIndex={currentStepIndex}
            onSelectStep={handleSelectStep}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            isNavigating={isNavigating}
            onStartNavigation={() => {
              setIsNavigating(true);
              setMobileSheetSnap('peek');
            }}
            onStopNavigation={() => setIsNavigating(false)}
            stepFreeOnly={stepFreeOnly}
            onToggleStepFree={setStepFreeOnly}
            onCloseDirections={() => setActiveTab('map')}
          />
        )}

        {/* Campus Places Directory Panel (When in Places tab) */}
        {activeTab === 'places' && (
          <PlacesDirectory
            onSelectPlace={(place) => {
              handleSelectPlaceFromMapOrSearch(place);
              setActiveTab('map');
            }}
            onGetDirections={handleGetDirectionsToPlace}
            onClose={() => setActiveTab('map')}
          />
        )}

        {/* Mobile Interactive Bottom Sheet (Mobile <= 768px) */}
        <MobileBottomSheet
          isOpen={true}
          initialSnap={mobileSheetSnap}
          onSnapChange={setMobileSheetSnap}
        >
          {activeTab === 'directions' ? (
            <RoutePlannerSidebar
              startNodeId={startNodeId}
              endNodeId={endNodeId}
              onChangeStart={setStartNodeId}
              onChangeEnd={setEndNodeId}
              onSwap={handleSwapPoints}
              routeSteps={routeSteps}
              currentStepIndex={currentStepIndex}
              onSelectStep={handleSelectStep}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              isNavigating={isNavigating}
              onStartNavigation={() => {
                setIsNavigating(true);
                setMobileSheetSnap('peek');
              }}
              onStopNavigation={() => setIsNavigating(false)}
              stepFreeOnly={stepFreeOnly}
              onToggleStepFree={setStepFreeOnly}
              onCloseDirections={() => setActiveTab('map')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text)' }}>
                  {routeSteps.length > 0 ? `${routeSteps.length} Steps Route Planned` : 'Explore Campus'}
                </span>
                <button
                  type="button"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--route)',
                    color: 'var(--text-inverse)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-semibold)',
                  }}
                  onClick={() => {
                    setActiveTab('directions');
                    setMobileSheetSnap('half');
                  }}
                >
                  Directions
                </button>
              </div>
              {routeSteps.length > 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-2)' }}>
                  To {NODES.find(n => n.id === endNodeId)?.name || 'Destination'}
                </span>
              )}
            </div>
          )}
        </MobileBottomSheet>

        {/* Offline & System Alerts */}
        <StatusToast />

        {/* About & Keyboard Shortcuts Modal Dialog */}
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </main>
    </div>
  );
}
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import MapContainer from './components/MapContainer';
import RoutePlannerSidebar from './components/RoutePlannerSidebar';
import GlobalSearchPill from './components/GlobalSearchPill';
import PlacesDirectory from './components/PlacesDirectory';
import AboutModal from './components/AboutModal';
import MobileBottomSheet from './components/MobileBottomSheet';
import StatusToast from './components/StatusToast';
import AdminToolbar from './components/AdminToolbar';
import NodeEditorModal from './components/NodeEditorModal';
import NodeManagerModal from './components/NodeManagerModal';
import DbExportModal from './components/DbExportModal';
import { findShortestPath, generateTurnByTurnSteps } from './data/nodesData';
import { 
  getDatabase, 
  addNode, 
  updateNode, 
  renameNode, 
  deleteNode, 
  resetDatabase 
} from './data/campusDatabase';
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

  // Dynamic Campus Database State (Persisted in localStorage)
  const [campusDb, setCampusDb] = useState(() => getDatabase());
  const nodes = campusDb.nodes;
  const edges = campusDb.edges;

  // Admin Mode & Modals State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const [pendingNodeFormData, setPendingNodeFormData] = useState(null);
  const [isEditorWaypoint, setIsEditorWaypoint] = useState(false);

  // Synchronize database updates across tabs and events
  useEffect(() => {
    const handleDbUpdate = (e) => {
      if (e.detail?.nodes && e.detail?.edges) {
        setCampusDb(e.detail);
      }
    };
    window.addEventListener('campusDbUpdated', handleDbUpdate);
    return () => window.removeEventListener('campusDbUpdated', handleDbUpdate);
  }, []);

  // Routing State
  const [startNodeId, setStartNodeId] = useState('PointA'); // Main Campus Center
  const [endNodeId, setEndNodeId] = useState('PointE');     // Saraswati Library
  const [stepFreeOnly, setStepFreeOnly] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeCategory] = useState(null);

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

  // Compute Shortest Path with Dynamic Database Graph
  const pathNodes = useMemo(() => {
    if (!startNodeId || !endNodeId) return [];
    return findShortestPath(startNodeId, endNodeId, { 
      stepFreeOnly, 
      dynamicNodes: nodes, 
      dynamicEdges: edges 
    });
  }, [startNodeId, endNodeId, stepFreeOnly, nodes, edges]);

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

  const placesCount = useMemo(() => nodes.filter((n) => !n.isWaypoint).length, [nodes]);
  const waypointsCount = useMemo(() => nodes.filter((n) => Boolean(n.isWaypoint)).length, [nodes]);

  // Reset current step when route changes
  const routeKey = `${startNodeId}-${endNodeId}-${stepFreeOnly}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setCurrentStepIndex(0);
  }

  // Auto-advance walking simulation
  useEffect(() => {
    if (!isNavigating || !isSimulating) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= routeSteps.length - 1) {
          setIsSimulating(false);
          return prev;
        }
        const next = prev + 1;
        if (next >= routeSteps.length - 1) {
          setIsSimulating(false);
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isNavigating, isSimulating, routeSteps.length]);

  // Current and Next Step for Live Navigation
  const currentStep = routeSteps[currentStepIndex] || null;
  const nextStep = routeSteps[currentStepIndex + 1] || null;

  // Handlers for Navigation Steps
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

  // Admin CRUD Handlers
  const handleSaveNode = useCallback((nodeData, connectedNodeIds, isEditing) => {
    if (isEditing) {
      const res = updateNode(nodeData.id, nodeData, connectedNodeIds);
      setCampusDb({ nodes: res.nodes, edges: res.edges });
    } else {
      const res = addNode(nodeData, connectedNodeIds);
      setCampusDb({ nodes: res.nodes, edges: res.edges });
    }
    setPendingNodeFormData(null);
    setInitialCoordinates(null);
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    const res = deleteNode(nodeId);
    setCampusDb({ nodes: res.nodes, edges: res.edges });
    if (selectedPlace?.id === nodeId) {
      setSelectedPlace(null);
    }
    if (startNodeId === nodeId) {
      const fallback = res.nodes.find(n => n.id !== endNodeId);
      if (fallback) setStartNodeId(fallback.id);
    }
    if (endNodeId === nodeId) {
      const fallback = res.nodes.find(n => n.id !== startNodeId);
      if (fallback) setEndNodeId(fallback.id);
    }
  }, [selectedPlace, startNodeId, endNodeId]);

  const handleQuickRename = useCallback((nodeId, newName, newShortName) => {
    const res = renameNode(nodeId, newName, newShortName);
    setCampusDb({ nodes: res.nodes, edges: res.edges });
  }, []);

  const handleResetDatabase = useCallback(() => {
    const res = resetDatabase();
    setCampusDb({ nodes: res.nodes, edges: res.edges });
    setSelectedPlace(null);
  }, []);

  const handleStartPickLocation = useCallback(({ currentData, connectedEdges, isEditing }) => {
    setPendingNodeFormData({ currentData, connectedEdges, isEditing });
    setIsNodeEditorOpen(false);
    setIsPickingLocation(true);
  }, []);

  const handlePickCoordinates = useCallback(({ x, y }) => {
    setIsPickingLocation(false);
    setInitialCoordinates({ x, y });

    if (pendingNodeFormData) {
      const updatedData = { ...pendingNodeFormData.currentData, x, y };
      setEditingNode(updatedData);
      setIsEditorWaypoint(Boolean(pendingNodeFormData.currentData?.isWaypoint));
      setIsNodeEditorOpen(true);
    } else {
      setEditingNode(null);
      setIsNodeEditorOpen(true);
    }
  }, [pendingNodeFormData]);

  const handleOpenAddModal = useCallback(() => {
    setIsEditorWaypoint(false);
    setEditingNode(null);
    setInitialCoordinates(null);
    setPendingNodeFormData(null);
    setIsNodeEditorOpen(true);
  }, []);

  const handleOpenAddWaypoint = useCallback(() => {
    setIsEditorWaypoint(true);
    setEditingNode(null);
    setInitialCoordinates(null);
    setPendingNodeFormData(null);
    setIsNodeEditorOpen(true);
  }, []);

  const handleAdminEditNode = useCallback((node) => {
    setIsEditorWaypoint(Boolean(node.isWaypoint));
    setEditingNode(node);
    setInitialCoordinates(null);
    setPendingNodeFormData(null);
    setIsNodeEditorOpen(true);
  }, []);

  // Keyboard Navigation listener (WCAG AA)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'Escape') {
        if (isPickingLocation) {
          setIsPickingLocation(false);
          if (pendingNodeFormData) setIsNodeEditorOpen(true);
        } else if (isNodeEditorOpen) {
          setIsNodeEditorOpen(false);
        } else if (isManageModalOpen) {
          setIsManageModalOpen(false);
        } else if (isExportModalOpen) {
          setIsExportModalOpen(false);
        } else if (selectedPlace) {
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
  }, [
    selectedPlace, 
    isAboutOpen, 
    isNavigating, 
    activeTab, 
    isPickingLocation, 
    isNodeEditorOpen, 
    isManageModalOpen, 
    isExportModalOpen, 
    pendingNodeFormData
  ]);

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
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(prev => !prev)}
      />

      {/* Admin Mode Floating Toolbar */}
      {isAdminMode && (
        <AdminToolbar
          nodesCount={nodes.length}
          placesCount={placesCount}
          waypointsCount={waypointsCount}
          edgesCount={edges.length}
          onOpenAddModal={handleOpenAddModal}
          onOpenAddWaypoint={handleOpenAddWaypoint}
          onOpenManageModal={() => setIsManageModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onResetDefaults={handleResetDatabase}
          onExitAdmin={() => {
            setIsAdminMode(false);
            setIsPickingLocation(false);
          }}
          isPickingLocation={isPickingLocation}
          onCancelPickLocation={() => {
            setIsPickingLocation(false);
            if (pendingNodeFormData) {
              setIsNodeEditorOpen(true);
            }
          }}
        />
      )}

      {/* Main Map Application Canvas */}
      <main id="main-content" className="main-layout">
        {/* Full-bleed 3D Map Container */}
        <div className="map-viewport">
          <MapContainer
            nodes={nodes}
            edges={edges}
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
            activeCategory={activeCategory}
            cameraHeading={cameraHeading}
            onCameraHeadingChange={setCameraHeading}
            isDarkMode={isDarkMode}
            onRegisterControls={(api) => { canvasControlRef.current = api; }}
            isNavigating={isNavigating}
            isSimulating={isSimulating}
            onToggleSimulate={() => setIsSimulating(prev => !prev)}
            currentStep={currentStep}
            nextStep={nextStep}
            totalSteps={routeSteps.length}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onExitNav={() => {
              setIsNavigating(false);
              setIsSimulating(false);
            }}
            isAdminMode={isAdminMode}
            isPickingLocation={isPickingLocation}
            onPickCoordinates={handlePickCoordinates}
            onAdminEditNode={handleAdminEditNode}
          />
        </div>

        {/* Global Search Pill (Shown when not in directions panel) */}
        {activeTab !== 'directions' && activeTab !== 'places' && !isNavigating && (
          <GlobalSearchPill
            nodes={nodes}
            onSelectPlace={handleSelectPlaceFromMapOrSearch}
            onOpenDirections={handleGetDirectionsToPlace}
            selectedPlace={selectedPlace}
          />
        )}

        {/* Desktop Directions Sidebar (Desktop only) */}
        {activeTab === 'directions' && (
          <RoutePlannerSidebar
            nodes={nodes}
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
            onStopNavigation={() => {
              setIsNavigating(false);
              setIsSimulating(false);
            }}
            stepFreeOnly={stepFreeOnly}
            onToggleStepFree={setStepFreeOnly}
            onCloseDirections={() => setActiveTab('map')}
          />
        )}

        {/* Campus Places Directory Panel (When in Places tab) */}
        {activeTab === 'places' && (
          <PlacesDirectory
            nodes={nodes}
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
              nodes={nodes}
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
              onStopNavigation={() => {
                setIsNavigating(false);
                setIsSimulating(false);
              }}
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
                  To {nodes.find(n => n.id === endNodeId)?.name || 'Destination'}
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

        {/* Admin Node Editor Modal (Add & Edit) */}
        {isNodeEditorOpen && (
          <NodeEditorModal
            key={editingNode ? (editingNode.id ? `${editingNode.id}-${initialCoordinates ? `${initialCoordinates.x}_${initialCoordinates.y}` : 'edit'}` : `draft-${isEditorWaypoint ? 'waypoint' : 'place'}-${initialCoordinates ? `${initialCoordinates.x}_${initialCoordinates.y}` : 'edit'}`) : `new-${isEditorWaypoint ? 'waypoint' : 'place'}-${initialCoordinates ? `${initialCoordinates.x}_${initialCoordinates.y}` : 'default'}`}
            isOpen={isNodeEditorOpen}
            onClose={() => {
              setIsNodeEditorOpen(false);
              setEditingNode(null);
              setPendingNodeFormData(null);
              setInitialCoordinates(null);
              setIsEditorWaypoint(false);
            }}
            nodeToEdit={editingNode}
            allNodes={nodes}
            allEdges={edges}
            onSaveNode={handleSaveNode}
            onDeleteNode={handleDeleteNode}
            onStartPickLocation={handleStartPickLocation}
            initialCoordinates={initialCoordinates}
            initialIsWaypoint={isEditorWaypoint}
          />
        )}

        {/* Admin Manage Places & Quick Rename Modal */}
        <NodeManagerModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          nodes={nodes}
          onEditNode={handleAdminEditNode}
          onQuickRename={handleQuickRename}
          onDeleteNode={handleDeleteNode}
          onLocateNode={handleSelectPlaceFromMapOrSearch}
        />

        {/* Admin Database Export Modal (JSON & SQL Migration for DB Developers) */}
        <DbExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          nodes={nodes}
          edges={edges}
        />
      </main>
    </div>
  );
}
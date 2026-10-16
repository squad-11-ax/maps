import { useRef, useCallback } from 'react';
import MapCanvas from './MapCanvas';
import MapControls from './MapControls';
import PlaceCard from './PlaceCard';
import NavigationBanner from './NavigationBanner';

export default function MapContainer({
  routePlanner = [],
  currentStepIndex = 0,
  startNodeId = null,
  endNodeId = null,
  selectedPlace = null,
  onSelectPlace,
  onClosePlace,
  onGetDirections,
  onStartHere,
  is3D = true,
  onToggle3D,
  showPOIs = true,
  onTogglePOIs,
  cameraHeading = 0,
  onCameraHeadingChange,
  isDarkMode = false,
  onRegisterControls = null,
  isNavigating = false,
  currentStep = null,
  nextStep = null,
  totalSteps = 0,
  onNextStep,
  onPrevStep,
  onExitNav,
}) {
  const localControlsRef = useRef(null);

  const handleRegisterControls = useCallback((api) => {
    localControlsRef.current = api;
    if (onRegisterControls) {
      onRegisterControls(api);
    }
  }, [onRegisterControls]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: isDarkMode ? '#1A1A1A' : '#ECEFF1',
      }}
    >
      {/* 3D WebGL Canvas Layer */}
      <MapCanvas
        routePlanner={routePlanner}
        currentStepIndex={currentStepIndex}
        startNodeId={startNodeId}
        endNodeId={endNodeId}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
        is3D={is3D}
        showPOIs={showPOIs}
        onCameraHeadingChange={onCameraHeadingChange}
        isDarkMode={isDarkMode}
        onRegisterControls={handleRegisterControls}
      />

      {/* Floating Vertical Map Controls (Bottom-Right) */}
      <MapControls
        onZoomIn={() => localControlsRef.current?.zoomIn()}
        onZoomOut={() => localControlsRef.current?.zoomOut()}
        onResetNorth={() => localControlsRef.current?.resetNorth()}
        cameraRotation={cameraHeading}
        is3D={is3D}
        onToggle3D={onToggle3D}
        onLocateMe={() => localControlsRef.current?.locateMe()}
        showPOIs={showPOIs}
        onTogglePOIs={onTogglePOIs}
      />

      {/* Building Details Place Card (When building/POI is tapped) */}
      {selectedPlace && (
        <PlaceCard
          place={selectedPlace}
          onClose={onClosePlace}
          onGetDirections={onGetDirections}
          onStartHere={onStartHere}
        />
      )}

      {/* Sticky Turn-by-Turn Navigation Banner (When navigation is active) */}
      {isNavigating && currentStep && (
        <NavigationBanner
          currentStep={currentStep}
          nextStep={nextStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={onNextStep}
          onPrev={onPrevStep}
          onExit={onExitNav}
        />
      )}
    </div>
  );
}
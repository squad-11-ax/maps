import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { NODES } from '../data/nodesData';
import { 
  Utensils, 
  Bed, 
  FlaskConical, 
  CreditCard, 
  Car, 
  DoorOpen, 
  Bath, 
  BookOpen, 
  Building2,
  Navigation,
  Footprints
} from 'lucide-react';
import './MapOverlay.css';

const MAP_BASE_WIDTH = 100;

export default function MapCanvas({
  routePlanner = [],
  currentStepIndex = 0,
  startNodeId = null,
  endNodeId = null,
  selectedPlace = null,
  onSelectPlace,
  is3D = true,
  showPOIs = true,
  onCameraHeadingChange,
  isDarkMode = false,
  canvasControlRef = null,
}) {
  const mountRef = useRef(null);
  const engineRef = useRef({
    scene: null,
    camera: null,
    controls: null,
    renderer: null,
    mapToWorld: null,
    targetCameraPos: null,
    targetControlsTarget: null,
    flyAnimationStart: null,
    flyDuration: 700,
    flyStartPos: null,
    flyStartTarget: null,
    lineCasing: null,
    lineActive: null,
    lineWalked: null,
    resolution: new THREE.Vector2(1, 1),
  });

  const [projectedMarkers, setProjectedMarkers] = useState([]);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Icon selector helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food': return <Utensils size={14} aria-hidden="true" />;
      case 'Hostels': return <Bed size={14} aria-hidden="true" />;
      case 'Labs': return <FlaskConical size={14} aria-hidden="true" />;
      case 'ATM': return <CreditCard size={14} aria-hidden="true" />;
      case 'Parking': return <Car size={14} aria-hidden="true" />;
      case 'Gates': return <DoorOpen size={14} aria-hidden="true" />;
      case 'Washrooms': return <Bath size={14} aria-hidden="true" />;
      case 'Study': return <BookOpen size={14} aria-hidden="true" />;
      default: return <Building2 size={14} aria-hidden="true" />;
    }
  };

  // Setup Three.js scene
  useEffect(() => {
    const currentContainer = mountRef.current;
    if (!currentContainer) return;

    const width = currentContainer.clientWidth || window.innerWidth;
    const height = currentContainer.clientHeight || window.innerHeight;

    //! SCENE & BACKGROUND
    const scene = new THREE.Scene();
    const bgColor = isDarkMode ? 0x1A1A1A : 0xECEFF1;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 70, 240);

    //! AMBIENT INFINITE GROUND PLANE (Never black/empty void)
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshBasicMaterial({ color: bgColor });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.1;
    scene.add(groundMesh);

    //! CAMERA
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 1200);
    camera.position.set(0, 38, 32);

    //! CAMERA PRINCIPAL POINT OFFSET (accounting for desktop left panel)
    const updateCameraOffset = (w, h) => {
      if (w > 768) {
        const leftPanelWidth = 390;
        const topbarHeight = 56;
        camera.setViewOffset(w, h, -leftPanelWidth / 2, -topbarHeight / 2, w, h);
      } else {
        camera.clearViewOffset();
      }
    };
    updateCameraOffset(width, height);

    //! RENDERER
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentContainer.appendChild(renderer.domElement);

    //! ORBIT CONTROLS WITH DAMPING & CLAMPED PITCH
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = (65 * Math.PI) / 180; // Clamped to 65° max pitch
    controls.minPolarAngle = 0; // Overhead 0°
    controls.minDistance = 6;
    controls.maxDistance = 140;
    controls.target.set(0, 0, 0);

    //! LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    //! MAP BASE PLANE LOADING (Preserves user's SVG base map)
    const loadMapTexture = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const w = img.naturalWidth || img.width || 1810;
          const h = img.naturalHeight || img.height || 1210;
          const scale = 2; // 2x sharp vector rasterization
          const canvas = document.createElement('canvas');
          canvas.width = w * scale;
          canvas.height = h * scale;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          resolve({ texture, aspectRatio: h / w });
        };
        img.onerror = () => {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(encodeURI(url), (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const fallbackRatio = (tex.image?.height || 1210) / (tex.image?.width || 1810);
            resolve({ texture: tex, aspectRatio: fallbackRatio });
          });
        };
        img.src = encodeURI(url);
      });
    };

    let mapMesh = null;

    loadMapTexture('/enhaned maps.svg').then(({ texture: mapTexture, aspectRatio }) => {
      const mapWidth = MAP_BASE_WIDTH;
      const mapHeight = MAP_BASE_WIDTH * aspectRatio;

      const planeGeo = new THREE.PlaneGeometry(mapWidth, mapHeight);
      const planeMat = new THREE.MeshBasicMaterial({ 
        map: mapTexture,
        depthWrite: true,
      });
      mapMesh = new THREE.Mesh(planeGeo, planeMat);
      mapMesh.rotation.x = -Math.PI / 2;
      mapMesh.position.y = 0.05;
      scene.add(mapMesh);

      const mapToWorld = (u, v) => {
        const x = (u - 0.5) * mapWidth;
        const z = (v - 0.5) * mapHeight;
        return new THREE.Vector3(x, 0.2, z);
      };

      engineRef.current.mapToWorld = mapToWorld;
      window.dispatchEvent(new CustomEvent('mapEngineReady'));
    });

    //! STORE ENGINE REFS
    engineRef.current.scene = scene;
    engineRef.current.camera = camera;
    engineRef.current.controls = controls;
    engineRef.current.renderer = renderer;
    engineRef.current.resolution = new THREE.Vector2(width, height);

    //! RESIZE LISTENER
    const handleResize = () => {
      if (!currentContainer) return;
      const w = currentContainer.clientWidth;
      const h = currentContainer.clientHeight;
      camera.aspect = w / h;
      updateCameraOffset(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      engineRef.current.resolution.set(w, h);

      if (engineRef.current.lineCasing) {
        engineRef.current.lineCasing.material.resolution.set(w, h);
      }
      if (engineRef.current.lineActive) {
        engineRef.current.lineActive.material.resolution.set(w, h);
      }
      if (engineRef.current.lineWalked) {
        engineRef.current.lineWalked.material.resolution.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    //! KEYBOARD LISTENER FOR ACCESSIBILITY (WCAG)
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const panDelta = 2.5;
      switch (e.key) {
        case 'ArrowUp':
          controls.target.z -= panDelta;
          camera.position.z -= panDelta;
          break;
        case 'ArrowDown':
          controls.target.z += panDelta;
          camera.position.z += panDelta;
          break;
        case 'ArrowLeft':
          controls.target.x -= panDelta;
          camera.position.x -= panDelta;
          break;
        case 'ArrowRight':
          controls.target.x += panDelta;
          camera.position.x += panDelta;
          break;
        case '+':
        case '=':
          camera.position.lerp(controls.target, 0.15);
          break;
        case '-':
        case '_':
          camera.position.add(camera.position.clone().sub(controls.target).multiplyScalar(0.15));
          break;
        case 'r':
        case 'R':
          // Reset north
          resetNorth();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    //! ANIMATION RENDER LOOP
    let animationId;
    let lastHeading = null;

    const animate = (timestamp) => {
      animationId = requestAnimationFrame(animate);

      // Camera FlyTo Easing
      const { 
        flyAnimationStart, 
        flyDuration, 
        flyStartPos, 
        flyStartTarget, 
        targetCameraPos, 
        targetControlsTarget 
      } = engineRef.current;

      if (flyAnimationStart && targetCameraPos && targetControlsTarget) {
        const elapsed = timestamp - flyAnimationStart;
        const progress = Math.min(elapsed / flyDuration, 1);
        // Easing: cubic-bezier(0.25, 0.1, 0.25, 1) easeInOutCubic
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (prefersReducedMotion || progress >= 1) {
          camera.position.copy(targetCameraPos);
          controls.target.copy(targetControlsTarget);
          engineRef.current.flyAnimationStart = null;
        } else {
          camera.position.lerpVectors(flyStartPos, targetCameraPos, ease);
          controls.target.lerpVectors(flyStartTarget, targetControlsTarget, ease);
        }
      }

      // Clamp controls.target to campus bounds to prevent void panning
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -55, 55);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -45, 45);

      controls.update();
      renderer.render(scene, camera);

      // Report camera azimuth heading to controls
      const azimuth = controls.getAzimuthalAngle();
      if (onCameraHeadingChange && Math.abs(azimuth - lastHeading) > 0.02) {
        lastHeading = azimuth;
        onCameraHeadingChange(azimuth);
      }

      // Compute projected screen markers and collision culling
      if (engineRef.current.mapToWorld) {
        const markers = [];
        const camPos = camera.position;
        const camDist = camPos.distanceTo(controls.target);

        // Zoom tier based on camera distance
        // close (< 45), mid (45 - 85), far (> 85)
        const zoomTier = camDist < 45 ? 'close' : camDist < 85 ? 'mid' : 'far';

        const mapToWorld = engineRef.current.mapToWorld;
        const halfW = width / 2;
        const halfH = height / 2;

        NODES.forEach((node) => {
          const worldPos = mapToWorld(node.x, node.y);
          const screenVec = worldPos.clone().project(camera);

          // Check if within screen frustum
          if (screenVec.z < 1.0 && Math.abs(screenVec.x) <= 1.15 && Math.abs(screenVec.y) <= 1.15) {
            const screenX = (screenVec.x * halfW) + halfW;
            const screenY = (-(screenVec.y * halfH)) + halfH;

            const isStart = node.id === startNodeId;
            const isDest = node.id === endNodeId;
            const isSelected = selectedPlace?.id === node.id;
            const isUserLoc = node.id === 'PointA';

            markers.push({
              node,
              screenX,
              screenY,
              zoomTier,
              isStart,
              isDest,
              isSelected,
              isUserLoc,
              priority: isDest ? 100 : isStart ? 90 : isSelected ? 80 : isUserLoc ? 70 : 10,
            });
          }
        });

        // Collision culling: sort by priority descending
        markers.sort((a, b) => b.priority - a.priority);
        const culled = [];
        const minDistancePx = zoomTier === 'far' ? 44 : 32;

        for (const m of markers) {
          // Guaranteed visible: start, destination, selected, user
          if (m.priority >= 70) {
            culled.push(m);
            continue;
          }

          // Check collision with already accepted markers
          const collides = culled.some((other) => {
            const dx = m.screenX - other.screenX;
            const dy = m.screenY - other.screenY;
            return Math.hypot(dx, dy) < minDistancePx;
          });

          if (!collides) {
            culled.push(m);
          }
        }

        setProjectedMarkers(culled);
      }
    };
    animate(0);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (currentContainer.contains(renderer.domElement)) {
        currentContainer.removeChild(renderer.domElement);
      }
    };
  }, [isDarkMode, prefersReducedMotion]);

  // Helper: Reset North
  const resetNorth = useCallback(() => {
    const { camera, controls } = engineRef.current;
    if (!camera || !controls) return;
    const currentDist = camera.position.distanceTo(controls.target);
    const targetPos = new THREE.Vector3(
      controls.target.x,
      controls.target.y + (currentDist * Math.sin(controls.getPolarAngle())),
      controls.target.z + (currentDist * Math.cos(controls.getPolarAngle()))
    );
    flyTo(targetPos, controls.target.clone(), 500);
  }, []);

  // Helper: Smooth camera flyTo
  const flyTo = useCallback((targetPos, targetControlsTarget, duration = 700) => {
    const { camera, controls } = engineRef.current;
    if (!camera || !controls) return;

    if (prefersReducedMotion) {
      camera.position.copy(targetPos);
      controls.target.copy(targetControlsTarget);
      controls.update();
      return;
    }

    engineRef.current.flyStartPos = camera.position.clone();
    engineRef.current.flyStartTarget = controls.target.clone();
    engineRef.current.targetCameraPos = targetPos.clone();
    engineRef.current.targetControlsTarget = targetControlsTarget.clone();
    engineRef.current.flyDuration = duration;
    engineRef.current.flyAnimationStart = performance.now();
  }, [prefersReducedMotion]);

  // Toggle 2D / 3D tilt
  useEffect(() => {
    const { camera, controls } = engineRef.current;
    if (!camera || !controls) return;

    const currentDist = camera.position.distanceTo(controls.target) || 45;
    if (is3D) {
      // 3D perspective: ~50° pitch
      const pitchRad = (50 * Math.PI) / 180;
      const targetPos = new THREE.Vector3(
        controls.target.x,
        controls.target.y + currentDist * Math.cos(pitchRad),
        controls.target.z + currentDist * Math.sin(pitchRad)
      );
      flyTo(targetPos, controls.target.clone(), 600);
    } else {
      // 2D overhead: 0° pitch
      const targetPos = new THREE.Vector3(
        controls.target.x,
        controls.target.y + currentDist,
        controls.target.z + 0.001
      );
      flyTo(targetPos, controls.target.clone(), 600);
    }
  }, [is3D, flyTo]);

  //! EXPOSE IMPERATIVE CONTROLS TO PARENT
  useEffect(() => {
    if (!canvasControlRef) return;
    canvasControlRef.current = {
      zoomIn: () => {
        const { camera, controls } = engineRef.current;
        if (!camera || !controls) return;
        const targetPos = camera.position.clone().lerp(controls.target, 0.25);
        flyTo(targetPos, controls.target.clone(), 300);
      },
      zoomOut: () => {
        const { camera, controls } = engineRef.current;
        if (!camera || !controls) return;
        const offset = camera.position.clone().sub(controls.target).multiplyScalar(1.25);
        const targetPos = controls.target.clone().add(offset);
        flyTo(targetPos, controls.target.clone(), 300);
      },
      resetNorth,
      locateMe: () => {
        if (!engineRef.current.mapToWorld) return;
        const userNode = NODES.find(n => n.id === 'PointA');
        if (!userNode) return;
        const worldPos = engineRef.current.mapToWorld(userNode.x, userNode.y);
        const targetPos = new THREE.Vector3(worldPos.x, worldPos.y + 18, worldPos.z + 16);
        flyTo(targetPos, worldPos, 700);
      },
      flyToPlace: (place) => {
        if (!engineRef.current.mapToWorld || !place) return;
        const worldPos = engineRef.current.mapToWorld(place.x, place.y);
        const targetPos = new THREE.Vector3(worldPos.x, worldPos.y + 20, worldPos.z + 18);
        flyTo(targetPos, worldPos, 700);
      },
    };
  }, [canvasControlRef, flyTo, resetNorth]);

  //! RENDER CONSTANT SCREEN-SPACE ROUTE (Three.js Line2)
  useEffect(() => {
    const updateRouteLines = () => {
      const { scene, mapToWorld, resolution } = engineRef.current;
      if (!scene || !mapToWorld) return;

      // Clean up previous lines
      if (engineRef.current.lineCasing) {
        scene.remove(engineRef.current.lineCasing);
        engineRef.current.lineCasing.geometry.dispose();
        engineRef.current.lineCasing.material.dispose();
        engineRef.current.lineCasing = null;
      }
      if (engineRef.current.lineActive) {
        scene.remove(engineRef.current.lineActive);
        engineRef.current.lineActive.geometry.dispose();
        engineRef.current.lineActive.material.dispose();
        engineRef.current.lineActive = null;
      }
      if (engineRef.current.lineWalked) {
        scene.remove(engineRef.current.lineWalked);
        engineRef.current.lineWalked.geometry.dispose();
        engineRef.current.lineWalked.material.dispose();
        engineRef.current.lineWalked = null;
      }

      if (!routePlanner || routePlanner.length < 2) return;

      const fullPositions = [];
      const walkedPositions = [];
      const remainingPositions = [];

      routePlanner.forEach((p, idx) => {
        const world = mapToWorld(p.lat, p.lng);
        // Slightly elevated above map plane to avoid z-fighting
        const y = 0.25;
        fullPositions.push(world.x, y, world.z);

        if (idx <= currentStepIndex) {
          walkedPositions.push(world.x, y + 0.01, world.z);
        }
        if (idx >= currentStepIndex) {
          remainingPositions.push(world.x, y + 0.02, world.z);
        }
      });

      // 1. Casing line: 10px constant screen-space width (#FFFFFF)
      const casingGeo = new LineGeometry();
      casingGeo.setPositions(fullPositions);
      const casingMat = new LineMaterial({
        color: 0xFFFFFF,
        linewidth: 10, // 10px screen space
        resolution: resolution,
        depthTest: false,
        transparent: true,
        opacity: 0.95,
      });
      const casingLine = new Line2(casingGeo, casingMat);
      casingLine.renderOrder = 2;
      scene.add(casingLine);
      engineRef.current.lineCasing = casingLine;

      // 2. Walked portion: 6px constant screen-space width (#9AA0A6)
      if (walkedPositions.length >= 6) {
        const walkedGeo = new LineGeometry();
        walkedGeo.setPositions(walkedPositions);
        const walkedMat = new LineMaterial({
          color: 0x9AA0A6,
          linewidth: 6, // 6px screen space
          resolution: resolution,
          depthTest: false,
          transparent: true,
          opacity: 0.95,
        });
        const walkedLine = new Line2(walkedGeo, walkedMat);
        walkedLine.renderOrder = 3;
        scene.add(walkedLine);
        engineRef.current.lineWalked = walkedLine;
      }

      // 3. Active remaining portion: 6px constant screen-space width (#1A73E8)
      if (remainingPositions.length >= 6) {
        const activeGeo = new LineGeometry();
        activeGeo.setPositions(remainingPositions);
        const activeMat = new LineMaterial({
          color: isDarkMode ? 0x8AB4F8 : 0x1A73E8,
          linewidth: 6, // 6px screen space
          resolution: resolution,
          depthTest: false,
          transparent: true,
          opacity: 1.0,
        });
        const activeLine = new Line2(activeGeo, activeMat);
        activeLine.renderOrder = 4;
        scene.add(activeLine);
        engineRef.current.lineActive = activeLine;
      }
    };

    updateRouteLines();
    window.addEventListener('mapEngineReady', updateRouteLines);
    return () => window.removeEventListener('mapEngineReady', updateRouteLines);
  }, [routePlanner, currentStepIndex, isDarkMode]);

  //! AUTO-FIT CAMERA TO ROUTE OR FOCUS CURRENT STEP
  useEffect(() => {
    if (!engineRef.current.mapToWorld || !routePlanner.length) return;
    const { camera, controls, mapToWorld } = engineRef.current;
    if (!camera || !controls) return;

    const step = routePlanner[currentStepIndex];
    if (!step) return;

    const targetPoint = mapToWorld(step.lat, step.lng);
    const nextStep = routePlanner[currentStepIndex + 1];

    let cameraPos;
    if (nextStep) {
      const nextNode = mapToWorld(nextStep.lat, nextStep.lng);
      const dx = nextNode.x - targetPoint.x;
      const dz = nextNode.z - targetPoint.z;
      const length = Math.hypot(dx, dz) || 1;
      const distance = 16;
      const elevation = 14;
      cameraPos = new THREE.Vector3(
        targetPoint.x - distance * (dx / length),
        targetPoint.y + elevation,
        targetPoint.z - distance * (dz / length)
      );
    } else {
      cameraPos = new THREE.Vector3(targetPoint.x, targetPoint.y + 18, targetPoint.z + 18);
    }

    flyTo(cameraPos, targetPoint, 700);
  }, [currentStepIndex, routePlanner, flyTo]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0,
          touchAction: 'none' // Applied only to canvas so page and sheet still scroll!
        }} 
        aria-label="Interactive 3D campus map canvas. Use arrow keys to pan, plus and minus to zoom."
        role="application"
        tabIndex={0}
      />

      {/* Screen-Space Overlays: Constant Size Markers & Halo Labels */}
      <div className="map-overlay-layer" aria-hidden="false">
        {projectedMarkers.map((marker) => {
          const { node, screenX, screenY, zoomTier, isStart, isDest, isSelected, isUserLoc } = marker;

          return (
            <div
              key={node.id}
              className="map-marker-anchor"
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                zIndex: marker.priority,
              }}
              onClick={() => onSelectPlace(node)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPlace(node);
                }
              }}
              aria-label={`${node.name}, ${node.category || ''}, ${node.blockCode || ''}`}
            >
              {/* User Location Marker */}
              {isUserLoc && !isStart && !isDest && (
                <div className="marker-user" title="Your current location">
                  <div className="user-pulse-halo" />
                  <div className="user-heading-cone" />
                  <div className="user-center-dot" />
                </div>
              )}

              {/* Origin Marker */}
              {isStart && (
                <div className="marker-origin" title={`Starting point: ${node.name}`} />
              )}

              {/* Destination Marker */}
              {isDest && (
                <div className="marker-destination" title={`Destination: ${node.name}`}>
                  <svg viewBox="0 0 24 24" className="dest-pin-svg" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              )}

              {/* Standard POI Marker */}
              {!isStart && !isDest && !isUserLoc && showPOIs && (
                <div className={`marker-poi category-${(node.category || 'other').toLowerCase()}`}>
                  {getCategoryIcon(node.category)}
                </div>
              )}

              {/* 2px Halo Label: Reveals full name close up, code at mid zoom, always for destination */}
              {(isDest || isStart || isSelected || zoomTier === 'close' || (zoomTier === 'mid' && node.blockCode)) && (
                <span className={`marker-label ${isDest ? 'destination-label' : ''} ${zoomTier === 'mid' && !isDest ? 'code-only' : ''}`}>
                  {isDest || isSelected || zoomTier === 'close'
                    ? (node.shortName || node.name)
                    : (node.blockCode || node.shortName || node.name)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
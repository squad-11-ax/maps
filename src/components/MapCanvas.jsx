import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function MapCanvas({ routePlanner = [], currentStepIndex = 0 }) {
  const mountRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const currentContainer = mountRef.current;
    const width = currentContainer.clientWidth;
    const height = currentContainer.clientHeight;
    
    //! SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    //! CAMERA  
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 20, 0);

    //! OFFSET CAMERA TO ACCOUNT FOR FLOATING UI
    // Left panel is ~370px wide (350 + 20 margin), Navbar is ~60px tall
    // We shift the principal point to center the remaining space
    const offsetCamera = (w, h) => {
      const leftPanelWidth = 370;
      const navbarHeight = 60;
      // We want to shift the view so the center of the screen is moved right and down
      camera.setViewOffset(w, h, -leftPanelWidth / 2, -navbarHeight / 2, w, h);
    };
    offsetCamera(width, height);

    //! RENDER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentContainer.appendChild(renderer.domElement);

    //! CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    //! LIGHTING
    const light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);
    
    //! MAP PLANE WITH DYNAMIC ASPECT RATIO
    const MAP_BASE_WIDTH = 100;
    const textureLoader = new THREE.TextureLoader();

    // Store objects for external updates
    engineRef.current = { camera, controls, mapToWorld: null, scene, offsetCamera, targetCameraPos: null, targetControlsTarget: null };

    const loadMapTexture = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const width = img.naturalWidth || img.width || 1810;
          const height = img.naturalHeight || img.height || 1210;
          const scale = 2; // 2x scale for sharp vector rasterization
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = true;
          resolve({ texture, aspectRatio: height / width });
        };
        img.onerror = (err) => {
          console.error("Failed to load SVG into canvas, falling back to TextureLoader", err);
          textureLoader.load(encodeURI(url), (fallbackTex) => {
            const w = fallbackTex.image?.width || 1810;
            const h = fallbackTex.image?.height || 1210;
            fallbackTex.colorSpace = THREE.SRGBColorSpace;
            resolve({ texture: fallbackTex, aspectRatio: h / w });
          });
        };
        img.src = encodeURI(url);
      });
    };

    loadMapTexture('/enhaned maps.svg').then(({ texture: mapTexture, aspectRatio }) => {
      const mapWidth = MAP_BASE_WIDTH;
      const mapHeight = MAP_BASE_WIDTH * aspectRatio;

      const planeGeo = new THREE.PlaneGeometry(mapWidth, mapHeight);
      const planeMat = new THREE.MeshBasicMaterial({ map: mapTexture });
      const mapMesh = new THREE.Mesh(planeGeo, planeMat);
      
      mapMesh.rotation.x = -Math.PI / 2;
      scene.add(mapMesh);
      
      //! SCALE CONVERTER
      const mapToWorld = (u, v) => {
        const x = (u - 0.5) * mapWidth;
        const z = (v - 0.5) * mapHeight;
        return new THREE.Vector3(x, 0.5, z);
      };

      engineRef.current.mapToWorld = mapToWorld;

      //! PLOT POINTS HELPER
      const point = (position, hexColor) => {
        const geo = new THREE.SphereGeometry(0.5, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: hexColor });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        scene.add(mesh);
        return mesh;
      };
      
      //! PLOT ROUTE POINTS
      const red = 0xff0000;
      const pur = 0x8000ff;
      const routePoints3D = routePlanner.map(p => mapToWorld(p.lat, p.lng));
      
      routePoints3D.forEach((p, idx) => point(p, idx === 0 || idx === routePoints3D.length - 1 ? pur : red));
      
      //! GENERATE ARROW TEXTURE
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(32, 32);
      ctx.lineTo(96, 64);
      ctx.lineTo(32, 96);
      ctx.lineTo(48, 64);
      ctx.fill();
      const arrowTexture = new THREE.CanvasTexture(canvas);
      arrowTexture.wrapS = THREE.RepeatWrapping;
      arrowTexture.wrapT = THREE.RepeatWrapping;
      engineRef.current.pathTexture = arrowTexture;

      //! ROUTE LINE (2D Ribbon)
      if (routePoints3D.length > 1) {
        const ribbonWidth = 1.5;
        const vertices = [];
        const indices = [];
        const uvs = [];
        let distance = 0;

        for (let i = 0; i < routePoints3D.length; i++) {
          const p = routePoints3D[i];
          const next = routePoints3D[i + 1] || p;
          const prev = routePoints3D[i - 1] || p;
          
          if (i > 0) {
             distance += Math.hypot(p.x - prev.x, p.z - prev.z);
          }

          let dir;
          if (i === 0) dir = new THREE.Vector2(next.x - p.x, next.z - p.z).normalize();
          else if (i === routePoints3D.length - 1) dir = new THREE.Vector2(p.x - prev.x, p.z - prev.z).normalize();
          else dir = new THREE.Vector2(next.x - prev.x, next.z - prev.z).normalize();

          const normal = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(ribbonWidth / 2);

          vertices.push(p.x + normal.x, 0.1, p.z + normal.y);
          vertices.push(p.x - normal.x, 0.1, p.z - normal.y);

          const u = distance * 0.3; // scale factor for repeat
          uvs.push(u, 1);
          uvs.push(u, 0);

          if (i < routePoints3D.length - 1) {
            const idx = i * 2;
            indices.push(idx, idx + 1, idx + 2, idx + 1, idx + 3, idx + 2);
          }
        }

        const pathGeo = new THREE.BufferGeometry();
        pathGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        pathGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        pathGeo.setIndex(indices);
        const pathMat = new THREE.MeshBasicMaterial({ 
          map: arrowTexture, 
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          color: 0xffffff,
          opacity: 0.8
        });
        scene.add(new THREE.Mesh(pathGeo, pathMat));
      }

      // Initial trigger for step 0
      window.dispatchEvent(new CustomEvent('mapLoaded'));
    }); 

    //! RESIZE HANDLER
    const handleResize = () => {
      const w = currentContainer.clientWidth;
      const h = currentContainer.clientHeight;
      camera.aspect = w / h;
      offsetCamera(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    //! ANIMATION LOOP
    let animationFrameID;
    const animate = () => {
      animationFrameID = requestAnimationFrame(animate);
      if (engineRef.current?.targetCameraPos && engineRef.current?.targetControlsTarget) {
        camera.position.lerp(engineRef.current.targetCameraPos, 0.05);
        controls.target.lerp(engineRef.current.targetControlsTarget, 0.05);
      }
      if (engineRef.current?.pathTexture) {
        engineRef.current.pathTexture.offset.x -= 0.02;
      }
      controls.update();
      renderer.render(scene, camera);      
    };
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameID);
      controls.dispose();
      renderer.dispose();
      if (currentContainer.contains(renderer.domElement)){
        currentContainer.removeChild(renderer.domElement);
      }
    };
  }, [routePlanner]); // Re-init if route changes

  //! Handle Step Updates
  useEffect(() => {
    const updateCamera = () => {
      if (!engineRef.current?.mapToWorld) return;
      const { camera, controls, mapToWorld } = engineRef.current;
      
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
        const distance = 3;
        const elevation =2;
        cameraPos = new THREE.Vector3(
          targetPoint.x - distance * (dx / length),
          targetPoint.y + elevation,
          targetPoint.z - distance * (dz / length)
        );
      } else {
        // Last step fallback
        cameraPos = new THREE.Vector3(targetPoint.x, targetPoint.y + 10, targetPoint.z + 15);
      }

      if (!engineRef.current.targetCameraPos) {
        engineRef.current.targetCameraPos = cameraPos.clone();
        engineRef.current.targetControlsTarget = targetPoint.clone();
        camera.position.copy(cameraPos);
        controls.target.copy(targetPoint);
        controls.update();
      } else {
        engineRef.current.targetCameraPos.copy(cameraPos);
        engineRef.current.targetControlsTarget.copy(targetPoint);
      }
    };

    // If map already loaded
    updateCamera();
    
    // In case map is still loading
    window.addEventListener('mapLoaded', updateCamera);
    return () => window.removeEventListener('mapLoaded', updateCamera);
  }, [currentStepIndex, routePlanner]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    />
  );
}
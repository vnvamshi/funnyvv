// @ts-nocheck
// Page to load and display skyven_data.glb with mesh list using react-three-fiber
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as R3F from '@react-three/fiber';
import { Bounds, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { GLB_URLS } from '../../utils/glbUrls';
import CachedGLTF from '../../components/three/CachedGLTF';
import floorIcon from '../../assets/images/v3.2/glb/floor.svg';
import homeIcon from '../../assets/images/v3.2/glb/home.svg';
import clubhouseIcon from '../../assets/images/v3.2/glb/clubhouse.svg';
import oneImage from '../../assets/images/v3.2/glb/one.png';
import twoImage from '../../assets/images/v3.2/glb/two.png';
import threeImage from '../../assets/images/v3.2/glb/three.png';
import fourImage from '../../assets/images/v3.2/glb/four.png';
import oneDuplexImage from '../../assets/images/v3.2/glb/one_duplex.png';
import twoDuplexImage from '../../assets/images/v3.2/glb/two_duplex.png';

const Canvas = (R3F as any).Canvas;


// Property images mapping
const propertyImages: Record<string, string> = {
  one: oneImage,
  two: twoImage,
  three: threeImage,
  four: fourImage,
  one_duplex: oneDuplexImage,
  two_duplex: twoDuplexImage,
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        object?: unknown;
      };
      ambientLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        intensity?: number;
      };
      directionalLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: [number, number, number];
        intensity?: number;
        castShadow?: boolean;
      };
    }
  }
}

type ModelBounds = {
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
  maxHeight: number;
};

type UnitStatusTone = 'green' | 'red' | 'yellow';
type UnitStatus = { label: string; tone: UnitStatusTone };
type UnitInfo = {
  id: string;
  propertyId?: string | number;
  status?: UnitStatus;
  beds?: string;
  interior?: string;
  facing?: string;
  price?: number;
  residenceType?: string;
  amenities?: string[];
  image?: string;
  propertyType?: string;
  notProperty?: boolean;
  details?: string;
};
type MeshMeta = { floor: number; property: UnitInfo[] };
type MeshMetaMap = Record<string, MeshMeta>;

type ModelProps = {
  modelUrl: string;
  onMeshesLoaded: (names: string[]) => void;
  onBoundsComputed: (bounds: ModelBounds) => void;
};

// Default camera settings (kept outside component so references are stable)
const INITIAL_CAMERA_TARGET: [number, number, number] = [0, 0, 0];
const INITIAL_CAMERA_POS: [number, number, number] = [100, 50, 100];

const SkyvenDataModelScene: React.FC<Omit<ModelProps, 'modelUrl'> & { scene: THREE.Group | null | undefined }> = ({
  onMeshesLoaded,
  onBoundsComputed,
  scene,
}) => {

  // Gather mesh names once the scene is ready
  useEffect(() => {
    if (!scene) return;

    const names: string[] = [];
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        names.push(child.name || 'Unnamed mesh');
      }
    });
    onMeshesLoaded(names);
  }, [scene, onMeshesLoaded]);

  // Center the model based on its bounding box and report bounds once per load
  const centeredScene = useMemo(() => {
    if (!scene) return null;

    // Remove scene from any previous parent to avoid positioning issues
    if (scene.parent) {
      scene.parent.remove(scene);
    }

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const offset = center.multiplyScalar(-1);

    const wrapper = new THREE.Group();
    wrapper.add(scene);
    wrapper.position.copy(offset);

    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.z) * 0.5;
    const maxHeight = size.y;

    // Report bounds
    onBoundsComputed({
      center: new THREE.Vector3(0, 0, 0),
      size,
      radius,
      maxHeight,
    });

    return wrapper;
  }, [scene, onBoundsComputed]);

  if (!centeredScene) return null;
  return (
    <primitive
      object={centeredScene}
    />
  );
};

const SkyvenDataModel: React.FC<ModelProps> = ({ modelUrl, onMeshesLoaded, onBoundsComputed }) => {
  return (
    <CachedGLTF url={modelUrl} fallback={null}>
      {(gltf) => (
        <SkyvenDataModelScene
          scene={(gltf as any)?.scene}
          onMeshesLoaded={onMeshesLoaded}
          onBoundsComputed={onBoundsComputed}
        />
      )}
    </CachedGLTF>
  );
};

const SkyvenData: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected floor data from navigation state (passed from building view)
  const navigationState = location.state as { 
    selectedFloor?: number; 
    selectedMeshMeta?: { meshName: string; meta?: MeshMeta };
    glbUrl?: string;
  } | null;
  
  const modelUrl = navigationState?.glbUrl || GLB_URLS.SKYVEN_DATA;

  // Determine loader message based on GLB type
  const getLoaderMessage = useMemo(() => {
    if (!modelUrl) return { title: 'Loading Floor Plan', subtitle: 'Preparing 3D model... This may take a moment' };
    
    if (modelUrl === GLB_URLS.DUPLEX_FLOORPLAN) {
      return { title: 'Loading Duplex Floor Plan', subtitle: 'Preparing Sky Villas floor plan... This may take a moment' };
    }
    if (modelUrl === GLB_URLS.ONE) {
      return { title: 'Loading 1NE Floor Plan', subtitle: 'Preparing 1NE residence floor plan... This may take a moment' };
    }
    if (modelUrl === GLB_URLS.TWO) {
      return { title: 'Loading 2WO Floor Plan', subtitle: 'Preparing 2WO residence floor plan... This may take a moment' };
    }
    if (modelUrl === GLB_URLS.THREE) {
      return { title: 'Loading 3HREE Floor Plan', subtitle: 'Preparing 3HREE residence floor plan... This may take a moment' };
    }
    if (modelUrl === GLB_URLS.FOUR) {
      return { title: 'Loading 4OUR Floor Plan', subtitle: 'Preparing 4OUR residence floor plan... This may take a moment' };
    }
    return { title: 'Loading Floor Plan', subtitle: 'Preparing 3D model... This may take a moment' };
  }, [modelUrl]);

  const handlePropertyCardClick = useCallback((item: UnitInfo) => {
    if (item.propertyId) {
      navigate('/v3/property', { state: { propertyId: String(item.propertyId) } });
      return;
    }

    navigate('/v3/property', { 
      state: { 
        cardData: {
          id: item.id,
          beds: item.beds,
          interior: item.interior,
          facing: item.facing,
          price: item.price,
          residenceType: item.residenceType,
          amenities: item.amenities,
          image: item.image,
          propertyType: item.propertyType,
          status: item.status,
          details: item.details,
        }
      } 
    });
  }, [navigate]);
  
  const [meshes, setMeshes] = useState<string[]>([]);
  const [bounds, setBounds] = useState<ModelBounds | null>(null);
  const [cardCollapsed, setCardCollapsed] = useState<boolean>(false);
  const [floorCardCollapsed, setFloorCardCollapsed] = useState<boolean>(false);
  const [glbMeta, setGlbMeta] = useState<MeshMetaMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [compassRotation, setCompassRotation] = useState(0);
  const controlsRef = useRef<any>(null);
  const appliedInitialPose = useRef(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  
  // Get floor data to display - prefer navigation state, fallback to first floor with data
  const displayFloorMeta = useMemo(() => {
    // If we have selected floor data from navigation state, use it
    if (navigationState?.selectedMeshMeta?.meta) {
      return navigationState.selectedMeshMeta;
    }
    
    // Fallback: find first entry with property data
    const entries = Object.entries(glbMeta);
    if (entries.length === 0) return null;
    
    const firstWithData = entries.find(([_, meta]) => meta.property && meta.property.length > 0);
    if (firstWithData) {
      return { meshName: firstWithData[0], meta: firstWithData[1] };
    }
    return null;
  }, [glbMeta, navigationState]);

  // Handle floor plan click - refresh the current floorplan view with the selected property
  const handleFloorPlanClick = useCallback((item: UnitInfo) => {
    const glbMap: Record<string, string> = {
      '1NE': GLB_URLS.ONE,
      '2WO': GLB_URLS.TWO,
      '3HREE': GLB_URLS.THREE,
      '4OUR': GLB_URLS.FOUR,
    };

    // Duplex units (floors 54/55) are "Sky Villas" in `glb.json` and need a dedicated floorplan GLB
    const isDuplex =
      item?.propertyType === 'Sky Villas' ||
      /duplex/i.test(item?.id || '') ||
      /duplex/i.test(item?.image || '');

    const glbUrl = isDuplex ? GLB_URLS.DUPLEX_FLOORPLAN : (glbMap[item.id] || GLB_URLS.SKYVEN_DATA);

    // Navigate to the same page with updated state
    navigate('/skyven-data', {
      state: {
        selectedFloor: displayFloorMeta?.meta?.floor,
        selectedMeshMeta: displayFloorMeta,
        selectedPropertyId: item.id,
        glbUrl,
      },
    });
  }, [navigate, displayFloorMeta]);
  
  const handleBackToBuilding = useCallback(() => {
    navigate(-1); // Go back to previous page
  }, [navigate]);

  // Reset loading state when model URL changes
  useEffect(() => {
    setIsLoading(true);
  }, [modelUrl]);

  // Load GLB metadata from JSON file
  useEffect(() => {
    fetch('/glb.json')
      .then((res) => res.json())
      .then((data) => {
        setGlbMeta(data);
      })
      .catch((err) => console.error('Failed to load glb.json:', err));
  }, []);

  const handleBoundsComputed = useCallback((computed: ModelBounds) => {
    setBounds(computed);
    setIsLoading(false); // Model loaded, hide loader
  }, []);

  const cameraTarget = bounds;
  const orbitTarget = useMemo(() => INITIAL_CAMERA_TARGET, []);
  const cameraProps = {
    position: INITIAL_CAMERA_POS,
    fov: 50,
  };

  // Initial camera setup - reset on every mount
  useEffect(() => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    
    // Reset camera to initial position every time the page loads
    camera.position.set(...INITIAL_CAMERA_POS);
    controls.target.set(...INITIAL_CAMERA_TARGET);
    controls.update();
    
    appliedInitialPose.current = true;
    setIsAutoRotating(true);
    
    // Cleanup function to reset the flag when component unmounts
    return () => {
      appliedInitialPose.current = false;
    };
  }, []);

  // Handle user interaction to pause auto-rotate temporarily
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    const handleStart = () => {
      setIsAutoRotating(false);
    };

    const handleEnd = () => {
      setTimeout(() => {
        setIsAutoRotating(true);
      }, 3000);
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, []);

  // Update compass rotation based on camera angle
  useEffect(() => {
    let animationFrameId: number;
    let lastRotation = 0;
    let isRunning = true;

    const updateCompass = () => {
      if (!isRunning) return;

      if (!controlsRef.current) {
        // Retry if controls not ready yet
        animationFrameId = requestAnimationFrame(updateCompass);
        return;
      }

      const controls = controlsRef.current;
      const camera = controls.object as THREE.PerspectiveCamera;

      // Calculate azimuthal angle (rotation around Y-axis)
      const target = controls.target;
      const position = camera.position;

      // Get the horizontal direction vector (xz plane)
      const dx = position.x - target.x;
      const dz = position.z - target.z;

      // Calculate angle in radians, then convert to degrees
      const angleRad = Math.atan2(dx, dz);
      const angleDeg = angleRad * (180 / Math.PI);
      const newRotation = -angleDeg; // Negative because compass rotates opposite to camera

      // Only update if rotation changed by more than 0.5 degrees to reduce re-renders
      if (Math.abs(newRotation - lastRotation) > 0.5) {
        setCompassRotation(newRotation);
        lastRotation = newRotation;
      }

      // Continue updating on next frame
      animationFrameId = requestAnimationFrame(updateCompass);
    };

    // Start updating
    updateCompass();

    return () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div style={styles.page}>
      {/* CSS animations for loader */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      
      {/* Full page loader - shows while GLB is loading */}
      {isLoading && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loaderCard}>
            {/* Spinning loader */}
            <div style={styles.spinnerContainer}>
              <svg style={styles.spinner} viewBox="0 0 50 50">
                <defs>
                  <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#905E26" />
                    <stop offset="50%" stopColor="#F5EC9B" />
                    <stop offset="100%" stopColor="#905E26" />
                  </linearGradient>
                </defs>
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="url(#spinnerGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90, 150"
                  strokeDashoffset="0"
                  style={{ animation: 'dash 1.5s ease-in-out infinite' }}
                />
              </svg>
            </div>
            
            {/* Loading text */}
            <div style={styles.loaderTitle}>{getLoaderMessage.title}</div>
            <div style={styles.loaderSubtitle}>
              {getLoaderMessage.subtitle}
            </div>
            
            {/* Progress dots animation */}
            <div style={styles.loaderDots}>
              <span style={{...styles.dot, animationDelay: '0s'}}>●</span>
              <span style={{...styles.dot, animationDelay: '0.2s'}}>●</span>
              <span style={{...styles.dot, animationDelay: '0.4s'}}>●</span>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.viewerWrapper}>
        <Canvas camera={cameraProps}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[12, 16, 10]} intensity={1.2} castShadow />
          <directionalLight position={[-8, 10, -6]} intensity={0.5} />

          <Suspense fallback={null}>
            <Bounds clip margin={1.2}>
            <SkyvenDataModel
              modelUrl={modelUrl}
                onMeshesLoaded={setMeshes}
                onBoundsComputed={handleBoundsComputed}
              />
            </Bounds>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            panSpeed={1.0}
            screenSpacePanning={true}
            target={orbitTarget}
            minDistance={cameraTarget ? Math.max(0.1, cameraTarget.radius * 0.2) : 1}
            maxDistance={cameraTarget ? cameraTarget.radius * 5 : 500}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI * 0.49}
            autoRotate={isAutoRotating}
            autoRotateSpeed={0.5}
            enableDamping
            dampingFactor={0.05}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN
            }}
          />
        </Canvas>

        {/* Compass */}
        <div
          style={{
            ...styles.compassContainer,
            transform: cardCollapsed ? 'translateX(-238px)' : 'translateX(0)',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" style={styles.compassSvg}>
            {/* Compass Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="rgba(0, 66, 54, 0.9)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />

            {/* Rotating Compass Needle */}
            <g transform={`rotate(${compassRotation} 50 50)`}>
              {/* North pointer (red) */}
              <path
                d="M 50 15 L 45 50 L 50 45 L 55 50 Z"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="1"
              />
              {/* South pointer (white) */}
              <path
                d="M 50 85 L 45 50 L 50 55 L 55 50 Z"
                fill="#fff"
                stroke="#94a3b8"
                strokeWidth="1"
              />
            </g>

            {/* Cardinal Direction Labels (Fixed, don't rotate) */}
            <text
              x="50"
              y="12"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="14"
              fontWeight="800"
            >
              N
            </text>
            <text
              x="88"
              y="54"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
              fontWeight="700"
            >
              E
            </text>
            <text
              x="50"
              y="95"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
              fontWeight="700"
            >
              S
            </text>
            <text
              x="12"
              y="54"
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
              fontWeight="700"
            >
              W
            </text>

            {/* Center dot */}
            <circle
              cx="50"
              cy="50"
              r="4"
              fill="rgba(245, 236, 155, 1)"
              stroke="#fff"
              strokeWidth="1"
            />
          </svg>
          <div style={styles.compassLabel}>Compass</div>
        </div>

        {/* Back to Building Button */}
        <button style={styles.backButton} onClick={handleBackToBuilding}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back to Building</span>
        </button>

        {/* Highlights card (left bottom) */}
        <div
          style={{
            ...styles.highlightsCard,
            transform: cardCollapsed ? 'translateX(-85%)' : 'translateX(0)',
          }}
        >
          <button
            style={{
              ...styles.cardToggle,
              transform: cardCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onClick={() => setCardCollapsed((v) => !v)}
            aria-label={cardCollapsed ? 'Show highlights' : 'Hide highlights'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div style={styles.cardHeading}>SKYVEN Highlights</div>
          <div style={styles.cardGrid}>
            <div style={styles.cardItem}>
              <div style={styles.iconCircle}>
                <img src={floorIcon} alt="Floors" style={styles.iconImg} />
              </div>
              <div>
                <div style={styles.cardValue}>63</div>
                <div style={styles.cardLabel}>Floors</div>
              </div>
            </div>

            <div style={styles.cardItem}>
              <div style={styles.iconCircle}>
                <img src={homeIcon} alt="Residence" style={styles.iconImg} />
              </div>
              <div>
                <div style={styles.cardValue}>210</div>
                <div style={styles.cardLabel}>Residence</div>
              </div>
            </div>

            <div style={{ ...styles.cardItem, gridColumn: '1 / span 2' }}>
              <div style={styles.iconCircle}>
                <img src={clubhouseIcon} alt="Clubhouses" style={styles.iconImg} />
              </div>
              <div>
                <div style={styles.cardValue}>5 Floor</div>
                <div style={styles.cardLabel}>Clubhouses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floor Card */}
        <div
          style={{
            ...styles.floorCard,
            transform: floorCardCollapsed ? 'translateX(calc(100% - 60px))' : 'translateX(0)',
          }}
        >
          <button
            style={{
              ...styles.floorCardToggle,
              transform: floorCardCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onClick={() => setFloorCardCollapsed((v) => !v)}
            aria-label={floorCardCollapsed ? 'Show floor details' : 'Hide floor details'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <div style={styles.floorHeader}>
            <div style={styles.floorTitle}>
              {displayFloorMeta?.meta?.floor ? `Floor ${displayFloorMeta.meta.floor}` : displayFloorMeta?.meshName ? `Floor ${displayFloorMeta.meshName}` : 'Select a floor'}
            </div>
            <div style={styles.floorUnderline} />
          </div>

          <div style={styles.residenceSection}>
            <div style={styles.residenceTitle}>
              {displayFloorMeta?.meta?.property?.[0]?.propertyType || 'Residence'}
            </div>
          </div>

          <div style={styles.floorList}>
            {(displayFloorMeta?.meta?.property ?? []).map((item, index) => {
              // Simple card for non-property items (clubhouse, amenities, etc.)
              if (item.notProperty) {
                return (
                  <div key={`${item.id}-${index}`} style={styles.newUnitCard}>
                    <div style={styles.newUnitContent}>
                      {/* Image */}
                      <div style={styles.unitImage}>
                        <img 
                          src={item.image && propertyImages[item.image] ? propertyImages[item.image] : homeIcon} 
                          alt={item.id} 
                          style={styles.unitImageImg} 
                        />
                      </div>

                      {/* Simple details */}
                      <div style={styles.unitDetails}>
                        <div style={styles.propertyName}>
                          <span style={styles.propertyId}>{item.id}</span>
                        </div>
                        
                        {item.details && (
                          <div style={styles.propertyDetails}>
                            {item.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Regular property card
              return (
                <div 
                  key={`${item.id}-${index}`} 
                  style={{ ...styles.newUnitCard, cursor: 'pointer', position: 'relative' }}
                  onClick={() => handlePropertyCardClick(item)}
                  onMouseEnter={() => setHoveredUnitId(item.id)}
                  onMouseLeave={() => setHoveredUnitId(null)}
                >
                  {/* Facing with icon and Status Badge */}
                  <div style={styles.newUnitTopRow}>
                    <div style={styles.facingLabel}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{item.facing} Facing</span>
                    </div>
                    <span
                      style={{
                        ...styles.newStatusPill,
                        backgroundColor:
                          item.status?.tone === 'green'
                            ? '#22c55e'
                            : item.status?.tone === 'yellow'
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    >
                      {item.status?.label}
                    </span>
                  </div>

                  {/* Main content with image and details */}
                  <div style={styles.newUnitContent}>
                    {/* Property image */}
                    <div style={styles.unitImage}>
                      <img 
                        src={item.image && propertyImages[item.image] ? propertyImages[item.image] : homeIcon} 
                        alt={item.id} 
                        style={styles.unitImageImg} 
                      />
                    </div>

                    {/* Property details */}
                    <div style={styles.unitDetails}>
                      <div style={styles.propertyName}>
                        <span style={styles.propertyId}>{item.id}</span>
                      </div>
                      
                      <div style={styles.propertySpecs}>
                        {item.beds} | 5 Bathrooms | {item.interior}
                      </div>
                      
                      <div style={styles.propertyPrice}>
                        Rs. {item.price} Cr
                      </div>
                      
                      <div
                        style={{
                          ...styles.unitActions,
                          ...(hoveredUnitId === item.id ? styles.unitActionsVisible : styles.unitActionsHidden),
                        }}
                      >
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFloorPlanClick(item);
                          }}
                        >
                          Floor Plan
                        </button>
                        <button
                          type="button"
                          style={styles.primaryButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyCardClick(item);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(displayFloorMeta?.meta?.property ?? []).length === 0 && (
              <div style={styles.emptyState}>
                {/* Floor icon */}
                <div style={styles.emptyStateIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 21V7l3-4 3 4v14" />
                  </svg>
                </div>
                
                {/* Message */}
                <div style={styles.emptyStateTitle}>
                  Floor Details
                </div>
                <div style={styles.emptyStateText}>
                  Select a floor in the building view and click <strong>Explore</strong> to view the details of properties on that floor.
                </div>
                
                {/* Hint */}
                <div style={styles.emptyStateHint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>Go back to select a floor</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkyvenData;

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F2FE 45%, #F9FAFB 100%)',
    overflow: 'hidden',
  },
  viewerWrapper: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  highlightsCard: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    background: 'linear-gradient(180deg, rgba(0, 67, 54, 0.95) 0%, rgba(0, 66, 54, 0.92) 100%)',
    borderRadius: 16,
    padding: '16px 14px',
    color: '#e2e8f0',
    width: 280,
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'transform 0.3s ease',
    overflow: 'visible',
  },
  cardHeading: {
    fontWeight: 800,
    fontSize: 16,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '0.01em',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    columnGap: 18,
  },
  cardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 800,
    color: '#f8fafc',
    lineHeight: 1.1,
  },
  cardLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 1.2,
  },
  iconImg: {
    width: 20,
    height: 20,
    objectFit: 'contain',
  },
  cardToggle: {
    position: 'absolute',
    right: -12,
    top: 16,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(14,165,233,0.5)',
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
  },
  floorCard: {
    position: 'absolute',
    right: 16,
    top: 24,
    width: 360,
    maxHeight: '90vh',
    background: 'linear-gradient(180deg, rgba(0, 67, 54, 0.95) 0%, rgba(0, 66, 54, 0.92) 100%)',
    borderRadius: 16,
    boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
    color: '#e2e8f0',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(2px)',
    transition: 'transform 0.3s ease',
    overflow: 'visible',
  },
  floorCardToggle: {
    position: 'absolute',
    left: -12,
    top: 16,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(14,165,233,0.5)',
    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
    transition: 'transform 0.3s ease',
  },
  floorHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingLeft: 8,
  },
  floorTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff',
    letterSpacing: '0.01em',
  },
  floorUnderline: {
    height: 2,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 999,
    width: '100%',
  },
  residenceSection: {
    paddingLeft: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  residenceTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff',
    letterSpacing: '0.02em',
  },
  floorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 'calc(100% - 120px)',
    overflowY: 'auto',
    paddingRight: 6,
    paddingTop: 0,
  },
  newUnitCard: {
    background: 'rgba(0, 66, 54, 1)',
    borderRadius: 10,
    padding: '6px 8px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  newUnitTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  facingLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    color: 'rgba(245, 236, 155, 1)',
    fontWeight: 400,
    background: 'rgba(0, 126, 103, 0.2)',
    padding: '3px 6px',
    borderRadius: 5,
  },
  newStatusPill: {
    padding: '3px 8px',
    borderRadius: 5,
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 10,
    lineHeight: 1.2,
  },
  newUnitContent: {
    display: 'flex',
    gap: 6,
    alignItems: 'flex-start',
  },
  unitImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  unitImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 6,
  },
  unitDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  propertyId: {
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  },
  propertySpecs: {
    fontSize: 10,
    color: 'rgba(245, 236, 155, 1)',
    lineHeight: 1.3,
    fontWeight: 400,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '0.01em',
  },
  propertyDetails: {
    fontSize: 10,
    color: '#cbd5e1',
    lineHeight: 1.4,
    fontWeight: 400,
    marginTop: 2,
  },
  unitActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    inset: 0,
    padding: '10px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.36) 100%)',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    zIndex: 2,
    borderRadius: 10,
  },
  unitActionsHidden: {
    opacity: 0,
    pointerEvents: 'none',
    transform: 'scale(0.99)',
  },
  unitActionsVisible: {
    opacity: 0.92,
    pointerEvents: 'auto',
    transform: 'scale(1)',
  },
  primaryButton: {
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
    color: '#2e1a04',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(144, 94, 38, 0.25)',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  secondaryButton: {
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(90deg, rgba(144,94,38,0.9) 0%, rgba(245,236,155,0.85) 50%, rgba(144,94,38,0.9) 100%)',
    color: '#2e1a04',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(144, 94, 38, 0.4)',
    transition: 'all 0.2s ease',
    zIndex: 1000,
  },
  emptyState: {
    padding: 24,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px dashed rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(144, 94, 38, 0.2) 0%, rgba(245, 236, 155, 0.1) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#F5EC9B',
    marginBottom: 4,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 700,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
    maxWidth: 260,
  },
  emptyStateHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    padding: '8px 12px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  compassContainer: {
    position: 'absolute',
    left: 310,
    bottom: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    zIndex: 100,
    transition: 'transform 0.3s ease',
  },
  compassSvg: {
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
    transition: 'none',
  },
  compassLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    background: 'rgba(0, 66, 54, 0.9)',
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.2)',
    letterSpacing: '0.5px',
  },
  // Loader styles
  loaderOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, rgba(0, 66, 54, 0.98) 0%, rgba(0, 40, 32, 0.98) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  loaderCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '40px 60px',
    background: 'rgba(0, 66, 54, 0.8)',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  spinnerContainer: {
    width: 80,
    height: 80,
  },
  spinner: {
    width: '100%',
    height: '100%',
    animation: 'spin 1s linear infinite',
  },
  spinnerPath: {
    stroke: 'url(#spinnerGradient)',
    strokeLinecap: 'round',
    strokeDasharray: '90, 150',
    strokeDashoffset: 0,
    animation: 'dash 1.5s ease-in-out infinite',
  },
  loaderTitle: {
    fontSize: 24,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  loaderSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  loaderDots: {
    display: 'flex',
    gap: 8,
  },
  dot: {
    fontSize: 16,
    color: '#F5EC9B',
    animation: 'pulse 1s ease-in-out infinite',
  },
};


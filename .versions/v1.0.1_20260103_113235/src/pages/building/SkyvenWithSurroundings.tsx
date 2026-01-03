// @ts-nocheck
// Page to load and display SkyvenWithSurrroundings.glb with mesh list using react-three-fiber
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as R3F from '@react-three/fiber';
import { Bounds, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { GLB_URLS } from '../../utils/glbUrls';
import MeshListPanel from '../../components/building/MeshListPanel';
import FilterCard, { FilterOptions } from '../../components/building/FilterCard';
import FloorCalendar from '../../components/building/FloorCalendar';
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
import swimmingPoolImage from '../../assets/images/v3.2/glb/swimming_pool.png';
import gymImage from '../../assets/images/v3.2/glb/gym.png';
import tennisCourtImage from '../../assets/images/v3.2/glb/tennis_court.png';
import observatoryImage from '../../assets/images/v3.2/glb/observatory.png';
import workstationImage from '../../assets/images/v3.2/glb/workstation.png';
import infintePoolImage from '../../assets/images/v3.2/glb/infinte_pool.png';
import banquetHallImage from '../../assets/images/v3.2/glb/banquet_hall.png';
import libraryImage from '../../assets/images/v3.2/glb/library.png';
import heliPadImage from '../../assets/images/v3.2/glb/heli_pad.png';
import three60WalkoutAreaImage from '../../assets/images/v3.2/glb/360.png';
import yogaStudioImage from '../../assets/images/v3.2/glb/yoga_studio.png';
import amphitheaterImage from '../../assets/images/v3.2/glb/amphitheater.png';
import kidsPlayAreaImage from '../../assets/images/v3.2/glb/kids_play_area.png';
import saloonImage from '../../assets/images/v3.2/glb/saloon.png';
import spaImage from '../../assets/images/v3.2/glb/spa.png';
import ClubhouseModal from '../../v3/components/ClubhouseModal';


const Canvas = (R3F as any).Canvas;

// Image mapping for property cards
const propertyImages: Record<string, string> = {
  one: oneImage,
  two: twoImage,
  three: threeImage,
  four: fourImage,
  one_duplex: oneDuplexImage,
  two_duplex: twoDuplexImage,
  gym: gymImage,
  tennis_court: tennisCourtImage,
  observatory: observatoryImage,
  swimming_pool: swimmingPoolImage,
  infinte_pool: infintePoolImage,
  workstation: workstationImage,
  banquet_hall: banquetHallImage,
  library: libraryImage,
  heli_pad: heliPadImage,
  three60_walkout_area: three60WalkoutAreaImage,
  yoga_studio: yogaStudioImage,
  amphitheater: amphitheaterImage,
  kids_play_area: kidsPlayAreaImage,
  saloon: saloonImage,
  spa: spaImage,
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
  largestMesh?: {
    name: string;
    size: THREE.Vector3;
    center: THREE.Vector3;
    radius: number;
    maxHeight: number;
  } | null;
};

type ModelProps = {
  scale?: number;
  onMeshesLoaded: (names: string[]) => void;
  onBoundsComputed: (bounds: ModelBounds) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
  onClick?: (e: any) => void;
  onSceneReady?: (scene: THREE.Group) => void;
};

const SkyvenModelScene: React.FC<ModelProps & { scene: THREE.Group | null | undefined }> = ({
  scale = 1,
  onMeshesLoaded,
  onBoundsComputed,
  onPointerOver,
  onPointerOut,
  onClick,
  onSceneReady,
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
    wrapper.scale.set(scale, scale, scale);

    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.z) * 0.5 * scale;
    const maxHeight = size.y * scale;

    // Find the largest mesh by volume so we can zoom/rotate around it; account for offset
    let largestMesh: ModelBounds['largestMesh'] = null;
    let largestVolume = -Infinity;
    scene.traverse((child: THREE.Object3D) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const meshBox = new THREE.Box3().setFromObject(child);
      const meshSize = meshBox.getSize(new THREE.Vector3());
      const meshVolume = meshSize.x * meshSize.y * meshSize.z;
      if (meshVolume > largestVolume) {
        largestVolume = meshVolume;
        const meshCenter = meshBox.getCenter(new THREE.Vector3()).add(offset);
        largestMesh = {
          name: child.name || 'Unnamed mesh',
          size: meshSize,
          center: meshCenter,
          radius: Math.max(meshSize.x, meshSize.z) * 0.5,
          maxHeight: meshSize.y,
        };
      }
    });

    // Report bounds separately so the wrapper instance stays memoized
    onBoundsComputed({
      center: new THREE.Vector3(0, 0, 0),
      size,
      radius,
      maxHeight,
      largestMesh,
    });

    return wrapper;
  }, [scene, onBoundsComputed, scale]);

  useEffect(() => {
    if (centeredScene && onSceneReady) {
      onSceneReady(centeredScene);
    }
  }, [centeredScene, onSceneReady]);

  if (!centeredScene) return null;
  return (
    <primitive
      object={centeredScene}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  );
};

const SkyvenModel: React.FC<ModelProps> = (props) => {
  return (
    <CachedGLTF url={GLB_URLS.SKYVEN_WITH_SURROUNDINGS} fallback={null}>
      {(gltf) => <SkyvenModelScene {...props} scene={(gltf as any)?.scene} />}
    </CachedGLTF>
  );
};

type SkyvenWithSurroundingsProps = {
  showMeshList?: boolean;
  showHighlightsCard?: boolean;
  showFloorCard?: boolean;
  showFilterCard?: boolean;
};

type UnitStatusTone = 'green' | 'red' | 'yellow';
type UnitStatus = { label: string; tone: UnitStatusTone };
type UnitInfo = {
  id: string;
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
  propertyId?: string | number;
};
type MeshMeta = { floor: number; property: UnitInfo[] };
type MeshMetaMap = Record<string, MeshMeta>;

// Camera constants - defined outside component to prevent recreation on each render
const INITIAL_CAMERA_TARGET: [number, number, number] = [12.01, -59.59, 0];
const INITIAL_CAMERA_POS: [number, number, number] = [454.01, -28.79, 874.75];

// Persist selection/highlight info on the mesh itself so it survives GLTF caching across navigation.
const USERDATA_SELECTED_KEY = '__vvSelected';
const USERDATA_FILTERED_KEY = '__vvFiltered';

const SkyvenWithSurroundings: React.FC<SkyvenWithSurroundingsProps> = ({
  showMeshList = true,
  showHighlightsCard = false,
  showFloorCard = false,
  showFilterCard = false,
}) => {
  const [meshes, setMeshes] = useState<string[]>([]);
  const [bounds, setBounds] = useState<ModelBounds | null>(null);
  const [hoveredMeshName, setHoveredMeshName] = useState<string | null>(null);
  const [selectedMeshName, setSelectedMeshName] = useState<string | null>(null);
  // Left-bottom highlights card should be open on initial load
  const [cardCollapsed, setCardCollapsed] = useState<boolean>(false);
  const [floorCardCollapsed, setFloorCardCollapsed] = useState<boolean>(true);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [glbMeta, setGlbMeta] = useState<MeshMetaMap>({});
  const [selectedMeshMeta, setSelectedMeshMeta] = useState<{ meshName: string; meta?: MeshMeta } | null>(null);
  const selectedMeshesRef = useRef<THREE.Mesh[]>([]);
  const sceneRef = useRef<THREE.Group | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);
  const filteredMeshesRef = useRef<THREE.Mesh[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClubhouseModalOpen, setIsClubhouseModalOpen] = useState(false);
  const [selectedClubhouse, setSelectedClubhouse] = useState<UnitInfo | null>(null);
  const navigate = useNavigate();

  // Auto-open the right-side floor/details card when its content changes (selection/filter results).
  useEffect(() => {
    if (!showFloorCard) return;
    if (!selectedMeshMeta) return;
    setFloorCardCollapsed(false);
  }, [showFloorCard, selectedMeshMeta?.meshName, selectedMeshMeta?.meta?.floor]);
  
  // Handle property card click - navigate to property page
  const handlePropertyCardClick = useCallback((item: UnitInfo) => {
    // If property has an existing propertyId, navigate normally
    if (item.propertyId) {
      navigate('/v3/property', { 
        state: { propertyId: String(item.propertyId) } 
      });
    } else {
      // For new properties from card, pass the card data
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
    }
  }, [navigate]);
  
  // Handle vertical navigation through building
  const navigateVertical = useCallback((direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const target = controls.target.clone();
    
    switch (direction) {
      case 'up':
        target.y += 30;
        break;
      case 'down':
        target.y -= 30;
        break;
      case 'top':
        target.y = 200;
        break;
      case 'bottom':
        target.y = -400;
        break;
    }
    
    // Smooth transition
    const startTarget = controls.target.clone();
    const duration = 500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      controls.target.lerpVectors(startTarget, target, eased);
      controls.update();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
    setIsAutoRotating(false);
  }, []);
  const blockedMeshNames = useMemo(
    () =>
      new Set([
        'SKY_OuterDesign001',
        'Plane371',
        'Plane371_1',
        'Plane373',
        'Cylinder125_2',
        'SKY_Ground001',
        'Mesh003_2',
        'Plane373_1',
        'Mesh003_3',
        'Material21134_1',
        'Material21134_2',
        'Material21134_3',
        'Material21134_4',
        'Material21134_5',
        'Material21134_6',
        'Material21134_7',
        'Material21134_8',
        'Material21134_9',
        'Material21134_10',
        'Material21134_11',
        'Material21134_12',
        'Material21134_13',
        'Material21134_14',
        'Material21134_15',
        'Material21134_16',
        'Material21134_17',
        'Material21134_18',
        'Material21134_19',
        'Material21134_20',
        'Material21134_21',
        'Material21134_22',
        'Material21134_23',
        'Material21134_24',
        'Material21134_25',
        'Material21134_26',
        'Material21134_27',
        'Material21134_28',
        'Material21134_29',
        'Material21134_30',
        'Material21134_31',
        'Material21134_32',
        'Material21134_33',
        'Material21134_34',
        'Material21134_35',
        'Material21134_36',
        'Material21134_37',
        'Material21134_38',
        'Material21134_39',
        'Material21134_40',
        'Material21134_41',
        'Material21134_42',
        'Material21134_43',
        'Material21134_44',
        'Material21134_45',
        'Material21134_46',
        'Material21134_47',
        'Material21134_48',
        'Material21134_49',
        'Material21134_50',
        'Material21134_51',
        'Material21134_52',
        'Material21134_53',
        'Material21134_54',
        'Material21134_55',
        'Material21134_56',
        'Material21134_57',
        'Material21134_58',
        'Material21134_59',
        'Material21134_60',
        'Material21134_61',
        'Material21134_62',
        'Material21134_63',
        'Material21134_64',
        'Material21134_65',
        'Material21134_66',
        'Material21134_67',
        'Material21134_68',
        'Material21134_69',
        'Material21134_70',
        'Material21134_71',
        'Material21134_72',
        'Material21134_73',
        'Material21134_74',
        'Material21134_75',
        'Material21134_76',
        'Material21134_77',
        'Material21134_78',
        'Material21134_79',
        'Material21134_80',
        'Material21134_81',
        'Material21134_82',
        'Material21134_83',
        'Material21134_84',
        'Material21134_85',
        'Material21134_86',
        'Material21134_87',
        'Material21134_88',
        'Material21134_89',
        'Material21134_90',
        'Material21134_91',
        'Material21134_92',
        'Material21134_93',
        'Material21134_94',
        'Material21134_95',
        'Material21134_96',
        'Material21134_97',
        'Material21134_98',
        'Material21134_99',
        'Material21134_100',
        'Material2201',
        'Material2202',
        'Material2203',
        'Material2204',
        'Material2209',
        'Material2210',
        'Material22727',
        'Material22728',
        'Material22729',
        'Material22740',
        'Material22741',
        'Material22742',
        'Material22743',
        'Material22744',
        'Material22745',
        'Material2291',
        'Material2292',
        'Material2351',
        'Material2352',
        'Material2353',
        'Material2354',
        'Material2355',
        'Material2356',
        'Material2397',
        'Material2398',
        'Material2399',
        'Material3022',
        'Material32323',
        'Material32417',
        'Material32441',
        'Material32504',
        'Material32636',
        'Material32640',
        'Material32642',
        'Material32644',
        'Material32693',
        'Material32694',
        'Material32695',
        'Material32696',
        'Material32697',
        'Material32698',
        'Material32823',
        'Material32827',
        'Material32829',
        'Material32831',
        'Material3920',
        'Material3921',
        'Material3922',
        'Material3923',
        'Material3925',
        'Material3927',
        'Material3965',
      ]),
    [],
  );

  const handleBoundsComputed = useCallback((computed: ModelBounds) => {
    setBounds(computed);
    setIsLoading(false); // Model loaded, hide loader
  }, []);

  const handleSceneReady = useCallback((scene: THREE.Group) => {
    sceneRef.current = scene;
  }, []);

  const cameraTarget = bounds?.largestMesh ?? bounds;
  const orbitTarget = useMemo(
    () => INITIAL_CAMERA_TARGET,
    [],
  );
  const cameraProps = {
    position: INITIAL_CAMERA_POS,
    fov: 42,
  };

  const controlsRef = useRef<any>(null);
  const appliedInitialPose = useRef(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [compassRotation, setCompassRotation] = useState(0);

  // Shared camera reset animation function
  const animateCameraToPosition = useCallback((targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, onComplete?: () => void) => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      camera.position.lerpVectors(startPos, targetPos, eased);
      controls.target.lerpVectors(startTarget, targetLookAt, eased);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();
  }, []);

  // Initial camera setup - reset on every mount
  useEffect(() => {
    if (!controlsRef.current) return;
    
    // Directly set camera to initial position (same as reset)
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
    let timeoutId: NodeJS.Timeout | null = null;
    
    const checkControls = () => {
      if (!controlsRef.current) {
        // Retry after a short delay if controls not ready
        setTimeout(checkControls, 100);
        return;
      }
      
      const controls = controlsRef.current;

      const handleStart = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        setIsAutoRotating(false);
      };

      const handleEnd = () => {
        // Resume auto-rotate after 5 seconds of inactivity
        timeoutId = setTimeout(() => {
          setIsAutoRotating(true);
        }, 5000);
      };

      controls.addEventListener('start', handleStart);
      controls.addEventListener('end', handleEnd);
    };

    checkControls();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      // atan2 gives us the angle, and we need to adjust for compass orientation
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

  // Keyboard controls for vertical navigation (up/down through building)
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      const panAmount = 20; // Amount to pan per key press
      const target = controls.target.clone();

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          // Move up along the building
          target.y += panAmount;
          controls.target.copy(target);
          controls.update();
          setIsAutoRotating(false);
          e.preventDefault();
          break;
        case 'arrowdown':
        case 's':
          // Move down along the building
          target.y -= panAmount;
          controls.target.copy(target);
          controls.update();
          setIsAutoRotating(false);
          e.preventDefault();
          break;
        case 'home':
          // Jump to top of building
          target.y = 200; // Approximate top floor
          controls.target.copy(target);
          controls.update();
          setIsAutoRotating(false);
          e.preventDefault();
          break;
        case 'end':
          // Jump to bottom of building
          target.y = -400; // Ground level
          controls.target.copy(target);
          controls.update();
          setIsAutoRotating(false);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const setHighlight = useCallback((mesh: THREE.Mesh, color: number, intensity: number) => {
    const mat: any = mesh.material;
    if (!mat || !mat.emissive) return;
    if (!mesh.userData.__origEmissiveColor) {
      mesh.userData.__origEmissiveColor = mat.emissive.clone();
      mesh.userData.__origEmissiveIntensity = mat.emissiveIntensity ?? 1;
    }
    // Clone material so we don't affect shared materials
    if (!mesh.userData.__clonedMaterial) {
      mesh.userData.__clonedMaterial = mat.clone();
      mesh.material = mesh.userData.__clonedMaterial;
    }
    mesh.material.emissive.setHex(color);
    mesh.material.emissiveIntensity = intensity;
  }, []);

  const clearHighlight = useCallback((mesh: THREE.Mesh) => {
    const mat: any = mesh.material;
    if (!mat || !mesh.userData.__origEmissiveColor) return;
    mat.emissive.copy(mesh.userData.__origEmissiveColor);
    mat.emissiveIntensity = mesh.userData.__origEmissiveIntensity ?? mat.emissiveIntensity;
  }, []);

  const isMeshSelected = (mesh: THREE.Mesh) =>
    Boolean((mesh.userData as any)?.[USERDATA_SELECTED_KEY]) || selectedMeshesRef.current.some((m) => m === mesh);

  const isMeshFiltered = (mesh: THREE.Mesh) =>
    Boolean((mesh.userData as any)?.[USERDATA_FILTERED_KEY]) || filteredMeshesRef.current.some((m) => m === mesh);

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      const mesh = e.object as THREE.Mesh;
      if (!mesh || !(mesh as any).isMesh) return;
      const meshName = mesh.name || 'Unnamed mesh';
      if (blockedMeshNames.has(meshName)) return;
      // If already selected, keep selection color
      if (isMeshSelected(mesh)) {
        setHoveredMeshName(meshName);
        return;
      }
      // If mesh is filtered, keep its filter highlight color instead of hover color
      if (isMeshFiltered(mesh)) {
        setHoveredMeshName(meshName);
        return;
      }
      setHighlight(mesh, 0xf97316, 0.8);
      setHoveredMeshName(meshName);
    },
    [setHighlight, blockedMeshNames, isMeshSelected, isMeshFiltered],
  );

  const handlePointerOut = useCallback(
    (e: any) => {
      e.stopPropagation();
      const mesh = e.object as THREE.Mesh;
      if (!mesh || !(mesh as any).isMesh) return;
      const meshName = mesh.name || 'Unnamed mesh';
      if (blockedMeshNames.has(meshName)) return;
      if (isMeshSelected(mesh)) {
        setHoveredMeshName(null);
        return; // keep selected highlight
      }
      if (isMeshFiltered(mesh)) {
        setHoveredMeshName(null);
        return; // keep filtered highlight
      }
      clearHighlight(mesh);
      setHoveredMeshName(null);
    },
    [clearHighlight, blockedMeshNames, isMeshSelected, isMeshFiltered],
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      const mesh = e.object as THREE.Mesh;
      if (!mesh || !(mesh as any).isMesh) return;
      const meshName = mesh.name || 'Unnamed mesh';
      if (blockedMeshNames.has(meshName)) return;

      // Define mesh groups that should be selected together
      // Floors 54 and 55 share the same properties (upper and lower), so they should be selected together
      const meshGroups = [
        ['Plane429', 'Plane429_1', 'Plane429_2', 'Plane429_3'],
        ['Plane428', 'Plane428_1', 'Plane428_2', 'Plane428_3'],
        ['Plane369', 'Plane369_1', 'Plane369_2', 'Plane369_3'],
        ['Plane367', 'Plane367_1', 'Plane367_2', 'Plane367_3'],
        ['Plane368', 'Plane368_1', 'Plane368_2', 'Plane368_3'],
        // Floors 54 and 55 - same properties in upper and lower
        ['Plane418', 'Plane418_1', 'Plane418_2', 'Plane418_3', 'Plane419', 'Plane419_1', 'Plane419_2', 'Plane419_3'],
      ];

      // Clear previous selection highlight
      selectedMeshesRef.current.forEach((m) => {
        (m.userData as any)[USERDATA_SELECTED_KEY] = false;
        clearHighlight(m);
      });
      selectedMeshesRef.current = [];

      const selectedList: THREE.Mesh[] = [mesh];

      // Check if the clicked mesh is part of a special group
      const matchedGroup = meshGroups.find((group) => group.includes(meshName));

      if (matchedGroup) {
        // Select all meshes in the group
        matchedGroup.forEach((groupMeshName) => {
          if (groupMeshName !== meshName && !blockedMeshNames.has(groupMeshName) && sceneRef.current) {
            const groupMesh = sceneRef.current.getObjectByName(groupMeshName) as THREE.Mesh | null;
            if (groupMesh && (groupMesh as any).isMesh) {
              selectedList.push(groupMesh);
            }
          }
        });
      } else {
        // Use existing companion logic for other meshes (bidirectional: base <-> base_1)
        const companionName = meshName.endsWith('_1') ? meshName.slice(0, -2) : `${meshName}_1`;
        
        if (!blockedMeshNames.has(companionName) && sceneRef.current) {
          const companionMesh = sceneRef.current.getObjectByName(companionName) as THREE.Mesh | null;
          if (companionMesh && (companionMesh as any).isMesh) {
            selectedList.push(companionMesh);
          }
        }
      }

      selectedMeshesRef.current = selectedList;

      selectedList.forEach((m) => {
        (m.userData as any)[USERDATA_SELECTED_KEY] = true;
        setHighlight(m, 0x38bdf8, 1.0);
      });
      const names = selectedList.map((m) => m.name || 'Unnamed mesh').join(', ');
      
      // Extract base mesh name (remove _1, _2, _3 suffixes)
      let baseMeshName = meshName;
      if (matchedGroup) {
        // For grouped meshes, use the first item in the group (base name without suffix)
        baseMeshName = matchedGroup[0];
      } else {
        // For other meshes, use existing logic
        baseMeshName = meshName.endsWith('_1') ? meshName.slice(0, -2) : meshName;
      }
      
      setSelectedMeshName(names);
      
      // Special handling for floors 54 and 55 - combine their property data
      let combinedMeta: MeshMeta | undefined;
      if (matchedGroup && (matchedGroup.includes('Plane418') || matchedGroup.includes('Plane419'))) {
        // Combine properties from both floors 54 and 55
        const meta54 = glbMeta['Plane418'];
        const meta55 = glbMeta['Plane419'];
        
        if (meta54 && meta55) {
          // Combine properties from both floors, avoiding duplicates based on id
          const combinedProperties: UnitInfo[] = [];
          const seenIds = new Set<string>();
          
          // Add properties from floor 54
          if (meta54.property) {
            meta54.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          // Add properties from floor 55 (only if not already added)
          if (meta55.property) {
            meta55.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          combinedMeta = {
            floor: 54, // Use floor 54 as base, but indicate it's combined
            property: combinedProperties,
          };
        } else if (meta54) {
          combinedMeta = meta54;
        } else if (meta55) {
          combinedMeta = meta55;
        }
      } else {
        combinedMeta = glbMeta[baseMeshName];
      }
      
      setSelectedMeshMeta({
        meshName: baseMeshName,
        meta: combinedMeta,
      });
      
      // Update selected floor in calendar
      if (combinedMeta?.floor) {
        setSelectedFloor(combinedMeta.floor);
      } else if (glbMeta[baseMeshName]?.floor) {
        setSelectedFloor(glbMeta[baseMeshName].floor);
      }
    },
    [clearHighlight, setHighlight, blockedMeshNames, glbMeta],
  );

  // Load mesh metadata from glb.json
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const resp = await fetch('/glb.json');
        if (!resp.ok) throw new Error(`Failed to load glb metadata: ${resp.status}`);
        const data = (await resp.json()) as MeshMetaMap;
        setGlbMeta(data);
        // If a mesh was already selected before meta loaded, hydrate the meta reference
        setSelectedMeshMeta((prev) =>
          prev ? { meshName: prev.meshName, meta: data[prev.meshName] } : prev,
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadMeta();
  }, []);

  // Filter matching function
  const matchesFilter = useCallback(
    (property: UnitInfo, filters: FilterOptions): boolean => {
      // Amenities filter applies to all items (both property and non-property)
      if (filters.amenities.length > 0) {
        const hasAmenity = filters.amenities.some(
          (amenity) => property.amenities?.includes(amenity) ?? false,
        );
        if (!hasAmenity) {
          return false;
        }
      }
      
      // For non-property items (clubhouses, amenities, etc.), only show when no property filters are active
      if (property.notProperty) {
        return filters.status.length === 0 && filters.residenceType.length === 0 &&
               filters.priceRange[0] === 3 && filters.priceRange[1] === 10;
      }
      
      // Status filter
      if (filters.status.length > 0 && property.status && !filters.status.includes(property.status.label)) {
        return false;
      }

      // Price range filter
      if (property.price !== undefined) {
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
          return false;
        }
      }

      // Residence type filter
      if (filters.residenceType.length > 0) {
        // Check if Duplex is selected - if so, match Sky Villas propertyType
        const isDuplexSelected = filters.residenceType.includes('Duplex');
        const matchesResidenceType = filters.residenceType.includes(property.residenceType || property.id);
        const isSkyVilla = isDuplexSelected && property.propertyType === 'Sky Villas';
        
        if (!matchesResidenceType && !isSkyVilla) {
          return false;
        }
      }

      return true;
    },
    [],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filters: FilterOptions) => {
      setActiveFilters(filters);

      if (!sceneRef.current) return;

      // Clear previous filtered highlights
      filteredMeshesRef.current.forEach((m) => {
        (m.userData as any)[USERDATA_FILTERED_KEY] = false;
        clearHighlight(m);
      });
      filteredMeshesRef.current = [];

      // If no filters active, return
      const hasActiveFilters =
        filters.status.length > 0 ||
        filters.residenceType.length > 0 ||
        filters.amenities.length > 0 ||
        filters.priceRange[0] !== 3 ||
        filters.priceRange[1] !== 10;

      if (!hasActiveFilters) {
        return;
      }

      // Find matching meshes
      const matchingMeshes: THREE.Mesh[] = [];

      Object.entries(glbMeta).forEach(([meshName, meta]) => {
        const hasMatchingProperty = meta.property.some((prop) => matchesFilter(prop, filters));

        if (hasMatchingProperty && sceneRef.current) {
          // Find the mesh and its companion
          const mesh = sceneRef.current.getObjectByName(meshName) as THREE.Mesh | null;
          const companionName = `${meshName}_1`;
          const companionMesh = sceneRef.current.getObjectByName(companionName) as THREE.Mesh | null;

          if (mesh && (mesh as any).isMesh && !blockedMeshNames.has(meshName)) {
            matchingMeshes.push(mesh);
          }
          if (companionMesh && (companionMesh as any).isMesh && !blockedMeshNames.has(companionName)) {
            matchingMeshes.push(companionMesh);
          }
        }
      });

      // Highlight matching meshes based on property status
      matchingMeshes.forEach((mesh) => {
        const meshName = mesh.name.replace(/_1$/, ''); // Remove companion suffix
        const meta = glbMeta[meshName];
        let highlightColor = 0xfbbf24; // Default fallback color

        if (meta && meta.property.length > 0) {
          // If status filters are active, use the selected status to determine color
          if (filters.status.length > 0) {
            const selectedStatus = filters.status[0]; // Take first selected status
            if (selectedStatus === 'Available') {
              highlightColor = 0x22c55e; // Green for available
            } else if (selectedStatus === 'Reserved') {
              highlightColor = 0xfbbf24; // Yellow for reserved
            } else if (selectedStatus === 'Sold') {
              highlightColor = 0xef4444; // Red for sold
            }
          } else if (filters.residenceType.length > 0) {
            // Residence type filters active - highlight based on property availability
            const hasSoldProperty = meta.property.some(prop => prop.status?.label === 'Sold');
            highlightColor = hasSoldProperty ? 0xef4444 : 0x22c55e; // Red for sold, green for available
          } else {
            // No status or residence type filters active - use tone-based coloring
            // Priority: red (sold) > yellow (reserved) > green (available)
            highlightColor = 0x22c55e; // Default to green for available

            const hasRedTone = meta.property.some(prop => prop.status?.tone === 'red');
            const hasYellowTone = meta.property.some(prop => prop.status?.tone === 'yellow');

            if (hasRedTone) {
              highlightColor = 0xef4444; // Red for sold
            } else if (hasYellowTone) {
              highlightColor = 0xfbbf24; // Yellow for reserved
            }
          }
        }

        setHighlight(mesh, highlightColor, 1.2);
        (mesh.userData as any)[USERDATA_FILTERED_KEY] = true;
      });
      filteredMeshesRef.current = matchingMeshes;

      // Zoom camera to show all filtered meshes
      if (matchingMeshes.length > 0) {
        zoomToMeshes(matchingMeshes);

        // Automatically select the first highlighted property to show its data in the right side card
        const firstMesh = matchingMeshes[0];
        if (firstMesh) {
          const meshName = firstMesh.name || 'Unnamed mesh';
          let baseMeshName = meshName;

          // Handle companion meshes
          if (meshName.endsWith('_1')) {
            baseMeshName = meshName.slice(0, -2);
          }

          // Get the meta data for the first highlighted property
          const meta = glbMeta[baseMeshName];
          if (meta) {
            setSelectedMeshMeta({
              meshName: baseMeshName,
              meta: meta,
            });

            // Update selected floor if available
            if (meta.floor) {
              setSelectedFloor(meta.floor);
            }
          }
        }
      } else {
        // Clear selection when no meshes match the filters
        setSelectedMeshMeta(null);
      }
    },
    [glbMeta, clearHighlight, setHighlight, matchesFilter, blockedMeshNames],
  );

  // Zoom camera to show meshes
  const zoomToMeshes = useCallback((meshes: THREE.Mesh[]) => {
    if (!controlsRef.current || meshes.length === 0) return;

    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;

    // Calculate bounding box of all filtered meshes
    const box = new THREE.Box3();
    meshes.forEach((mesh) => {
      const meshBox = new THREE.Box3().setFromObject(mesh);
      box.union(meshBox);
    });

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2;

    // Ensure minimum distance
    cameraZ = Math.max(cameraZ, maxDim * 2);

    // Position camera to look at the center from an angle
    const cameraOffset = new THREE.Vector3(
      cameraZ * 0.3,
      cameraZ * 0.4,
      cameraZ * 0.9,
    );
    const newCameraPos = center.clone().add(cameraOffset);

    // Smoothly transition camera (consistent with reset/load animations)
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 2000; // Match other animations
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      camera.position.lerpVectors(startPos, newCameraPos, eased);
      controls.target.lerpVectors(startTarget, center, eased);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Resume auto-rotation after zoom completes
        setIsAutoRotating(true);
      }
    };

    animate();
  }, []);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    setActiveFilters(null);
    filteredMeshesRef.current.forEach((m) => {
      (m.userData as any)[USERDATA_FILTERED_KEY] = false;
      clearHighlight(m);
    });
    filteredMeshesRef.current = [];
    
    // Clear floor selection
    selectedMeshesRef.current.forEach((m) => {
      (m.userData as any)[USERDATA_SELECTED_KEY] = false;
      clearHighlight(m);
    });
    selectedMeshesRef.current = [];
    setSelectedFloor(null);
    setSelectedMeshName(null);
    setSelectedMeshMeta(null);

    // Use shared camera reset animation
    animateCameraToPosition(
      new THREE.Vector3(...INITIAL_CAMERA_POS),
      new THREE.Vector3(...INITIAL_CAMERA_TARGET),
      () => setIsAutoRotating(true)
    );
  }, [clearHighlight, animateCameraToPosition]);

  // Handle floor selection from calendar
  const handleFloorSelect = useCallback((floorNumber: number, meshName: string) => {
    if (!sceneRef.current) return;
    
    // Special handling: if floor 54 or 55 is selected, select both
    if (floorNumber === 54 || floorNumber === 55) {
      // Use Plane418 for floor 54 and Plane419 for floor 55
      const floor54MeshName = floorNumber === 54 ? meshName : 'Plane418';
      const floor55MeshName = floorNumber === 55 ? meshName : 'Plane419';
      
      // Select both floors
      const floor54Group = ['Plane418', 'Plane418_1', 'Plane418_2', 'Plane418_3'];
      const floor55Group = ['Plane419', 'Plane419_1', 'Plane419_2', 'Plane419_3'];
      const allMeshNames = [...floor54Group, ...floor55Group];
      
      const selectedList: THREE.Mesh[] = [];
      allMeshNames.forEach((groupMeshName) => {
        if (!blockedMeshNames.has(groupMeshName)) {
          const groupMesh = sceneRef.current!.getObjectByName(groupMeshName) as THREE.Mesh | null;
          if (groupMesh && (groupMesh as any).isMesh) {
            selectedList.push(groupMesh);
          }
        }
      });
      
      if (selectedList.length > 0) {
        // Clear previous selection
        selectedMeshesRef.current.forEach((m) => {
          (m.userData as any)[USERDATA_SELECTED_KEY] = false;
          clearHighlight(m);
        });

        selectedMeshesRef.current = selectedList;
        selectedList.forEach((m) => {
          (m.userData as any)[USERDATA_SELECTED_KEY] = true;
          setHighlight(m, 0x38bdf8, 1.0);
        });
        
        const names = selectedList.map((m) => m.name || 'Unnamed mesh').join(', ');
        
        // Combine properties from both floors 54 and 55
        const meta54 = glbMeta['Plane418'];
        const meta55 = glbMeta['Plane419'];
        
        let combinedMeta: MeshMeta | undefined;
        if (meta54 && meta55) {
          const combinedProperties: UnitInfo[] = [];
          const seenIds = new Set<string>();
          
          if (meta54.property) {
            meta54.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          if (meta55.property) {
            meta55.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          combinedMeta = {
            floor: 54,
            property: combinedProperties,
          };
        } else if (meta54) {
          combinedMeta = meta54;
        } else if (meta55) {
          combinedMeta = meta55;
        }
        
        setSelectedMeshName(names);
        setSelectedMeshMeta({
          meshName: 'Plane418',
          meta: combinedMeta,
        });
        
        setSelectedFloor(54);
        return;
      }
    }

    // Clear previous selection
    selectedMeshesRef.current.forEach((m) => {
      (m.userData as any)[USERDATA_SELECTED_KEY] = false;
      clearHighlight(m);
    });
    selectedMeshesRef.current = [];

    // Clear filtered highlights
    filteredMeshesRef.current.forEach((m) => {
      (m.userData as any)[USERDATA_FILTERED_KEY] = false;
      clearHighlight(m);
    });
    filteredMeshesRef.current = [];

    // Define mesh groups for special handling
    // Floors 54 and 55 share the same properties (upper and lower), so they should be selected together
    const meshGroups = [
      ['Plane429', 'Plane429_1', 'Plane429_2', 'Plane429_3'],
      ['Plane428', 'Plane428_1', 'Plane428_2', 'Plane428_3'],
      ['Plane369', 'Plane369_1', 'Plane369_2', 'Plane369_3'],
      ['Plane367', 'Plane367_1', 'Plane367_2', 'Plane367_3'],
      ['Plane368', 'Plane368_1', 'Plane368_2', 'Plane368_3'],
      // Floors 54 and 55 - same properties in upper and lower
      ['Plane418', 'Plane418_1', 'Plane418_2', 'Plane418_3', 'Plane419', 'Plane419_1', 'Plane419_2', 'Plane419_3'],
    ];

    const selectedList: THREE.Mesh[] = [];

    // Check if the mesh is part of a special group
    const matchedGroup = meshGroups.find((group) => group.includes(meshName));

    if (matchedGroup) {
      // Select all meshes in the group
      matchedGroup.forEach((groupMeshName) => {
        if (!blockedMeshNames.has(groupMeshName)) {
          const groupMesh = sceneRef.current!.getObjectByName(groupMeshName) as THREE.Mesh | null;
          if (groupMesh && (groupMesh as any).isMesh) {
            selectedList.push(groupMesh);
          }
        }
      });
    } else {
      // Find the main mesh
      const mesh = sceneRef.current.getObjectByName(meshName) as THREE.Mesh | null;
      if (mesh && (mesh as any).isMesh && !blockedMeshNames.has(meshName)) {
        selectedList.push(mesh);
      }

      // Find companion mesh (base <-> base_1)
      const companionName = meshName.endsWith('_1') ? meshName.slice(0, -2) : `${meshName}_1`;
      if (!blockedMeshNames.has(companionName)) {
        const companionMesh = sceneRef.current.getObjectByName(companionName) as THREE.Mesh | null;
        if (companionMesh && (companionMesh as any).isMesh) {
          selectedList.push(companionMesh);
        }
      }
    }

    if (selectedList.length > 0) {
      selectedMeshesRef.current = selectedList;
      selectedList.forEach((m) => {
        (m.userData as any)[USERDATA_SELECTED_KEY] = true;
        setHighlight(m, 0x38bdf8, 1.0);
      });

      const names = selectedList.map((m) => m.name || 'Unnamed mesh').join(', ');
      const baseMeshName = matchedGroup ? matchedGroup[0] : (meshName.endsWith('_1') ? meshName.slice(0, -2) : meshName);
      
      // Special handling for floors 54 and 55 - combine their property data
      let combinedMeta: MeshMeta | undefined;
      if (matchedGroup && (matchedGroup.includes('Plane418') || matchedGroup.includes('Plane419'))) {
        // Combine properties from both floors 54 and 55
        const meta54 = glbMeta['Plane418'];
        const meta55 = glbMeta['Plane419'];
        
        if (meta54 && meta55) {
          // Combine properties from both floors, avoiding duplicates based on id
          const combinedProperties: UnitInfo[] = [];
          const seenIds = new Set<string>();
          
          // Add properties from floor 54
          if (meta54.property) {
            meta54.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          // Add properties from floor 55 (only if not already added)
          if (meta55.property) {
            meta55.property.forEach((prop: UnitInfo) => {
              if (!seenIds.has(prop.id)) {
                combinedProperties.push(prop);
                seenIds.add(prop.id);
              }
            });
          }
          
          combinedMeta = {
            floor: 54, // Use floor 54 as base, but indicate it's combined
            property: combinedProperties,
          };
        } else if (meta54) {
          combinedMeta = meta54;
        } else if (meta55) {
          combinedMeta = meta55;
        }
      } else {
        combinedMeta = glbMeta[baseMeshName];
      }
      
      setSelectedMeshName(names);
      setSelectedMeshMeta({
        meshName: baseMeshName,
        meta: combinedMeta,
      });
      setSelectedFloor(floorNumber);

      // Zoom to selected meshes
      zoomToMeshes(selectedList);
    }
  }, [clearHighlight, setHighlight, blockedMeshNames, glbMeta, zoomToMeshes]);

  // Handle explore button - navigate to floor plan page with selected floor data
  const handleExplore = useCallback(() => {
    navigate('/skyven-data', {
      state: {
        selectedFloor: selectedFloor,
        selectedMeshMeta: selectedMeshMeta,
      }
    });
  }, [navigate, selectedFloor, selectedMeshMeta]);

  // Open floor plan view for the selected floor and property
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

    navigate('/skyven-data', {
      state: {
        selectedFloor,
        selectedMeshMeta,
        selectedPropertyId: item.id,
        glbUrl,
      },
    });
  }, [navigate, selectedFloor, selectedMeshMeta]);

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
                  <linearGradient id="spinnerGradientBuilding" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  stroke="url(#spinnerGradientBuilding)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="90, 150"
                  strokeDashoffset="0"
                  style={{ animation: 'dash 1.5s ease-in-out infinite' }}
                />
              </svg>
            </div>
            
            {/* Loading text */}
            <div style={styles.loaderTitle}>Loading Building Model</div>
            <div style={styles.loaderSubtitle}>
              Preparing 3D building view... This may take a moment
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

          <Suspense
            fallback={null}
          >
            <Bounds clip margin={1.05}>
              <SkyvenModel
                onMeshesLoaded={setMeshes}
                onBoundsComputed={handleBoundsComputed}
                onSceneReady={handleSceneReady}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
              />
            </Bounds>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableRotate={true}
            enableZoom={true}
            enablePan={true}
            rotateSpeed={1.0}
            panSpeed={1.0}
            zoomSpeed={1.0}
            screenSpacePanning={true}
            target={orbitTarget}
            minDistance={cameraTarget ? Math.max(0.1, cameraTarget.radius * 0.2) : undefined}
            // maxDistance={cameraTarget ? cameraTarget.radius * 3 : 120}
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
        <div style={{
          ...styles.compassContainer,
          // Move compass when highlights card collapses (only if card is shown)
          transform: (showHighlightsCard && cardCollapsed) ? 'translateX(-238px)' : 'translateX(0)',
          // Adjust position if highlights card is not shown
          left: showHighlightsCard ? 310 : 16,
        }}>
          <svg width="80" height="80" viewBox="0 0 100 100" style={styles.compassSvg}>
            {/* Compass Background Circle */}
            <circle cx="50" cy="50" r="45" fill="rgba(0, 66, 54, 0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            
            {/* Rotating Compass Needle */}
            <g transform={`rotate(${compassRotation} 50 50)`}>
              {/* North pointer (red) */}
              <path d="M 50 15 L 45 50 L 50 45 L 55 50 Z" fill="#ef4444" stroke="#fff" strokeWidth="1" />
              {/* South pointer (white) */}
              <path d="M 50 85 L 45 50 L 50 55 L 55 50 Z" fill="#fff" stroke="#94a3b8" strokeWidth="1" />
            </g>
            
            {/* Cardinal Direction Labels (Fixed, don't rotate) */}
            <text x="50" y="12" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="800">N</text>
            <text x="88" y="54" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">E</text>
            <text x="50" y="95" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">S</text>
            <text x="12" y="54" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">W</text>
            
            {/* Center dot */}
            <circle cx="50" cy="50" r="4" fill="rgba(245, 236, 155, 1)" stroke="#fff" strokeWidth="1" />
          </svg>
          <div style={styles.compassLabel}>Compass</div>
        </div>

        {showFilterCard && (
          <>
            <FilterCard onFilterChange={handleFilterChange} onReset={handleFilterReset} />
            
            {/* Floor Calendar */}
            <FloorCalendar 
              glbMeta={glbMeta} 
              onFloorSelect={handleFloorSelect}
              selectedFloor={selectedFloor}
              onExplore={handleExplore}
            />
          </>
        )}

        {/* Vertical Navigation Controls */}
        {showFilterCard && (
          <div
            style={{
              ...styles.verticalNav,
              width: navCollapsed ? 'auto' : 'auto',
              top: navCollapsed ? 6 : 6,
              background: navCollapsed ? 'transparent' : 'rgba(0, 66, 54, 0.88)',
              border: navCollapsed ? 'none' : '1px solid rgba(255,255,255,0.08)',
              padding: navCollapsed ? 0 : '6px 8px',
              boxShadow: navCollapsed ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
              backdropFilter: navCollapsed ? 'none' : 'blur(3px)',
              height: navCollapsed ? 'auto' : 52,
              minHeight: navCollapsed ? 'auto' : 62,
              maxHeight: navCollapsed ? 'auto' : 52,
            }}
          >
            {!navCollapsed ? (
              <>
                <button
                  style={styles.navButton}
                  onClick={() => navigateVertical('top')}
                  aria-label="Go to top"
                  title="Top Floor (Home)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                    <path d="M18 15l-6-6-6 6M18 9l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  style={styles.navButton}
                  onClick={() => navigateVertical('up')}
                  aria-label="Move up"
                  title="Move Up (↑ or W)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <div style={styles.navDivider} />
                <button
                  style={styles.navButton}
                  onClick={() => navigateVertical('down')}
                  aria-label="Move down"
                  title="Move Down (↓ or S)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <button
                  style={styles.navButton}
                  onClick={() => navigateVertical('bottom')}
                  aria-label="Go to bottom"
                  title="Ground Floor (End)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                    <path d="M6 9l6 6 6-6M6 15l6 6 6-6" />
                  </svg>
                </button>
                <button
                  style={styles.navToggle}
                  onClick={() => setNavCollapsed(true)}
                  aria-label="Hide navigation"
                  title="Hide Navigation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                style={{...styles.navToggle, width: 'auto', justifyContent: 'center', marginLeft: 0}}
                onClick={() => setNavCollapsed(false)}
                aria-label="Show navigation"
                title="Show Navigation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                  <path d="M18 15l-6-6-6 6M18 9l-6-6-6 6" />
                  <path d="M18 15l-6 6-6-6" transform="translate(0, 6)" />
                </svg>
              </button>
            )}
          </div>
        )}

        {showHighlightsCard && (
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
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
        )}

        {showFloorCard && (
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5EC9B" strokeWidth="3">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div style={styles.floorHeader}>
              <div style={styles.floorTitle}>
                {selectedMeshMeta?.meta?.floor 
                  ? (selectedMeshMeta.meta.floor === 54 && (selectedMeshMeta.meshName?.includes('Plane418') || selectedMeshMeta.meshName?.includes('Plane419') || selectedMeshName?.includes('Plane418') || selectedMeshName?.includes('Plane419')))
                    ? 'Floor 54-55' 
                    : `Floor ${selectedMeshMeta.meta.floor}`
                  : selectedMeshMeta?.meshName 
                    ? `Floor ${selectedMeshMeta.meshName}` 
                    : 'Select a floor'}
              </div>
              <div style={styles.floorUnderline} />
            </div>

            <div style={styles.residenceSection}>
              <div style={styles.residenceTitle}>
                {selectedMeshMeta?.meta?.property?.[0]?.propertyType || 'Residence'}
              </div>
            </div>

            <div style={styles.floorList}>
              {(selectedMeshMeta?.meta?.property ?? []).map((item, index) => {
                const gradId = `locGrad-${item.id}-${index}`;
                
                // Simple card for non-property items (clubhouse, amenities, etc.)
                if (item.notProperty) {
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      style={{ ...styles.newUnitCard, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedClubhouse(item);
                        setIsClubhouseModalOpen(true);
                      }}
                    >
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
                    style={{...styles.newUnitCard, cursor: 'pointer'}}
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
              {(selectedMeshMeta?.meta?.property ?? []).length === 0 && (
                <div style={styles.emptyState}>
                  {/* Floor icon */}
                  <div style={styles.emptyStateIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 21V7l3-4 3 4v14" />
                    </svg>
                  </div>
                  
                  {/* Message */}
                  <div style={styles.emptyStateTitle}>
                    {selectedMeshMeta ? 'No Details Available' : 'Floor Details'}
                  </div>
                  <div style={styles.emptyStateText}>
                    {selectedMeshMeta
                      ? 'No property information found for this selection.'
                      : 'Click on any floor in the 3D model to view the details of properties on that floor.'}
                  </div>
                  
                  {/* Hint */}
                  <div style={styles.emptyStateHint}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span>{selectedMeshMeta ? 'Try selecting another floor' : 'Click on a floor to get started'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showMeshList && (
        <MeshListPanel
          hoveredMeshName={hoveredMeshName}
          selectedMeshName={selectedMeshName}
          meshes={meshes}
        />
      )}

      {/* Clubhouse / amenity details modal (for non-property items) */}
      {selectedClubhouse && (
        <ClubhouseModal
          isOpen={isClubhouseModalOpen}
          onClose={() => setIsClubhouseModalOpen(false)}
          name={selectedClubhouse.id}
          image={
            selectedClubhouse.image && propertyImages[selectedClubhouse.image]
              ? propertyImages[selectedClubhouse.image]
              : undefined
          }
          details={selectedClubhouse.details}
          amenities={selectedClubhouse.amenities}
        />
      )}
    </div>
  );
};

export default SkyvenWithSurroundings;

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
  viewer: {
    width: '100%',
    height: '100%',
    outline: 'none',
  },
  highlightsCard: {
    position: 'absolute',
    left: 16,
    bottom: 88,
    background: 'rgba(0, 66, 54, 0.8)',
    borderRadius: 12,
    padding: '14px 16px',
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
  unitCard: {
    background: 'linear-gradient(180deg, rgba(3, 73, 60, 0.95) 0%, rgba(5, 63, 52, 0.95) 100%)',
    borderRadius: 12,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  unitTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitId: {
    fontSize: 22,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  statusPill: {
    padding: '6px 12px',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    lineHeight: 1,
  },
  unitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  unitIcon: {
    width: 22,
    height: 22,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '0.02em',
  },
  unitValue: {
    fontSize: 16,
    fontWeight: 800,
    color: '#f8fafc',
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
  verticalNav: {
    position: 'absolute',
    top: 6,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(0, 66, 54, 0.88)',
    borderRadius: 8,
    padding: '6px 8px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(3px)',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    height: 52,
    minHeight: 62,
    maxHeight: 52,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid rgba(14,165,233,0.3)',
    background: 'rgba(0, 126, 103, 0.4)',
    color: '#0EA5E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'none',
    boxSizing: 'border-box',
  },
  navToggle: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: 2,
  },
  navToggleText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#cbd5e1',
    whiteSpace: 'nowrap',
  },
  navDivider: {
    width: 1,
    height: 20,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 2px',
  },
  // New card design styles
  newUnitCard: {
    background: 'rgba(0, 66, 54, 1)',
    borderRadius: 10,
    padding: '6px 8px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'relative',
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
  propertyType: {
    color: '#ffffff',
    fontWeight: 700,
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
  compassContainer: {
    position: 'absolute',
    left: 310,
    bottom: 88,
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
import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";
import * as THREE from "three";
import BlueHorizonUrl from "../../assets/BlueHorizon.glb";
import bedroomImg from "../../assets/images/v3/bed-room.png";
import kitchenImg from "../../assets/images/v3/kitchen.png";
import livingHallImg from "../../assets/images/v3/living-hall.png";
import garageImg from "../../assets/images/v3/garage.png";
import CachedGLTF from "../../components/three/CachedGLTF";

// Extend JSX.IntrinsicElements with Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
    }
  }
}

interface MarkerData {
  point: [number, number, number];
  label: string;
  content: {
    image: string;
    description: string;
    features?: string[];
  };
}

// Define markers before they are used
const markers: MarkerData[] = [
  { 
    point: [-231.2, 44.8, 18] as [number, number, number], 
    label: "Store Room",
    content: {
      image: garageImg,
      description: "Spacious storage area with built-in shelving and climate control.",
      features: ["Climate controlled", "Built-in shelving", "Security system"]
    }
  },
  { 
    point: [-361.8, 171.2, 80.8] as [number, number, number], 
    label: "Master Bed Room",
    content: {
      image: bedroomImg,
      description: "Luxurious master suite with en-suite bathroom and walk-in closet.",
      features: ["En-suite bathroom", "Walk-in closet", "Private balcony"]
    }
  },
  { 
    point: [-208.2, 51.5, 316.9] as [number, number, number], 
    label: "Entrance",
    content: {
      image: garageImg,
      description: "Grand entrance with double-height ceiling and elegant chandelier.",
      features: ["Double-height ceiling", "Chandelier", "Security system"]
    }
  },
  { 
    point: [-184, 169, 65.5] as [number, number, number], 
    label: "Living Room",
    content: {
      image: livingHallImg,
      description: "Spacious living area with panoramic windows and fireplace.",
      features: ["Panoramic windows", "Fireplace", "Built-in entertainment system"]
    }
  },
  { 
    point: [-22.6, 62.1, 523] as [number, number, number], 
    label: "Secondary Bed Room",
    content: {
      image: bedroomImg,
      description: "Comfortable secondary bedroom with built-in wardrobe.",
      features: ["Built-in wardrobe", "Large windows", "Study area"]
    }
  },
  { 
    point: [-190.8, 40.4, 602.6] as [number, number, number], 
    label: "Kitchen",
    content: {
      image: kitchenImg,
      description: "Modern kitchen with premium appliances and island counter.",
      features: ["Island counter", "Premium appliances", "Walk-in pantry"]
    }
  },
];

interface SceneProps {
  markers: MarkerData[];
  onMarkerSelect: (label: string) => void;
  updateMarkerScreenPositions: (positions: { [key: string]: { x: number; y: number; visible: boolean } }) => void;
  modelPath: string;
  onLoaded?: () => void;
}

/* ------------------- HOUSE MODEL ------------------- */
function HouseModelInner({ model, onLoaded }: { model: any; onLoaded?: () => void }) {
  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  return (
    <mesh>
      <primitive
        object={model?.scene}
        // Let Bounds handle centering/scaling; preserve model's own orientation
      />
    </mesh>
  );
}

function HouseModel({ modelPath, onLoaded }: { modelPath: string; onLoaded?: () => void }) {
  return (
    <CachedGLTF url={modelPath} fallback={null}>
      {(model) => <HouseModelInner model={model as any} onLoaded={onLoaded} />}
    </CachedGLTF>
  );
}

/* ------------------- SCENE SETUP ------------------- */
function Scene({ markers, onMarkerSelect, updateMarkerScreenPositions, modelPath, onLoaded }: SceneProps & { modelPath: string }) {
  const { camera, size, scene } = useThree();
  const tempV = new THREE.Vector3();
  const tempVec = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  useFrame(() => {
    const positions: { [key: string]: { x: number; y: number; visible: boolean } } = {};
    
    markers.forEach((marker) => {
      // Convert world position to screen position
      tempVec.set(...marker.point);
      tempV.copy(tempVec);
      
      // Get screen position
      tempV.project(camera);
      
      // Calculate visibility
      const camPos = camera.position;
      const markerDir = new THREE.Vector3().subVectors(tempVec, camPos);
      const distance = markerDir.length();
      markerDir.normalize();
      
      // Get camera direction
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      
      // Calculate angle between camera and marker
      const angle = camDir.angleTo(markerDir);
      
      // Check if marker is within camera's field of view (70 degrees = about 1.22 radians)
      const angleVisibility = angle < 1.22;
      
      // Check if marker is within reasonable vertical angle
      const camUp = new THREE.Vector3(0, 1, 0);
      camera.localToWorld(camUp).normalize();
      const upDot = Math.abs(camUp.dot(markerDir));
      const verticalVisibility = upDot < 0.85; // Slightly more restrictive vertical angle
      
      // Check if marker is within reasonable distance
      const distanceVisibility = distance < 800; // Slightly reduced distance for better visibility
      
      // Check if marker is within screen bounds with some margin
      const screenBounds = 
        tempV.x >= -1.05 && 
        tempV.x <= 1.05 && 
        tempV.y >= -1.05 && 
        tempV.y <= 1.05 && 
        tempV.z < 1;

      // Raycast to check if marker is behind objects
      raycaster.set(camPos, markerDir);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const occlusionVisibility = intersects.length === 0 || 
        intersects[0].distance > distance - 1; // Allow small margin for marker thickness
      
      // Final visibility check combining all conditions
      const visible = 
        angleVisibility && 
        verticalVisibility && 
        distanceVisibility && 
        screenBounds &&
        occlusionVisibility;
      
      // Convert to screen coordinates
      const x = (tempV.x + 1) * size.width / 2;
      const y = (-tempV.y + 1) * size.height / 2;
      
      positions[marker.label] = { x, y, visible };
    });
    
    updateMarkerScreenPositions(positions);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 15]} intensity={0.9} />

      {/* Auto-fit model to view while keeping its authored orientation */}
      <Bounds fit clip observe margin={1}>
        <HouseModel modelPath={modelPath} onLoaded={onLoaded} />
      </Bounds>

      <OrbitControls
        makeDefault
        enableZoom
        enablePan
      />
    </>
  );
}

/* ------------------- MARKER OVERLAY ------------------- */
interface MarkerOverlayProps {
  positions: { [key: string]: { x: number; y: number; visible: boolean } };
  selected: string | null;
  onSelect: (label: string) => void;
}

function MarkerOverlay({ positions, selected, onSelect }: MarkerOverlayProps) {
  const [showContent, setShowContent] = useState<string | null>(null);

  const handleSelect = (label: string) => {
    if (showContent === label) {
      setShowContent(null);
    } else {
      setShowContent(label);
      onSelect(label);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Object.entries(positions).map(([label, pos]) => {
        const marker = markers.find(m => m.label === label);
        if (!marker || !pos.visible) return null;

        return (
          <div key={label} className="relative">
            {/* Marker at exact 3D position */}
            <div
              className="absolute pointer-events-auto"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Large green circle */}
              <div
                onClick={() => handleSelect(label)}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#064E3B",
                  position: "relative",
                  cursor: "pointer",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 6px rgba(6, 78, 59, 0.3)",
                }}
              >
                {/* Center gold dot */}
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)",
                  }}
                />
              </div>
            </div>

            {/* Label positioned top right */}
            <div
              className="absolute pointer-events-auto"
              style={{
                left: `${pos.x + 8}px`,
                top: `${pos.y - 8}px`,
                transform: 'translate(0, -100%)',
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  whiteSpace: "nowrap",
                  opacity: selected === label ? 1 : 0.9,
                  transform: `scale(${selected === label ? 1.1 : 1})`,
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {/* Diagonal line with gradient */}
                <div
                  style={{
                    position: "absolute",
                    width: "25px",
                    height: "1px",
                    background: "linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)",
                    transform: "rotate(-45deg)",
                    transformOrigin: "left bottom",
                    bottom: "0",
                    left: "-5px",
                  }}
                />

                {/* Label box with gradient border */}
                <div
                  onClick={() => handleSelect(label)}
                  style={{
                    background: "#064E3B",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    border: "2px solid transparent",
                    backgroundImage: "linear-gradient(#064E3B, #064E3B), linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "80px",
                    textAlign: "center",
                    marginLeft: "15px",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Card */}
            {showContent === label && (
              <ContentCard
                content={marker.content}
                position={pos}
                onClose={() => setShowContent(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------- CONTENT CARD ------------------- */
interface ContentCardProps {
  content: MarkerData['content'];
  position: { x: number; y: number };
  onClose: () => void;
}

function ContentCard({ content, position, onClose }: ContentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const cardHeight = cardRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - position.y;
      
      // If there's not enough space below (need at least card height + 20px padding)
      setShowAbove(spaceBelow < (cardHeight + 20));
    }
  }, [position.y]);

  return (
    <div
      ref={cardRef}
      className="absolute pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: showAbove ? `${position.y - 20}px` : `${position.y + 20}px`,
        transform: showAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: '#064E3B',
          borderRadius: '8px',
          padding: '12px',
          width: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '2px solid transparent',
          backgroundImage: "linear-gradient(#064E3B, #064E3B), linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)",
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        {/* Connecting line */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            width: '2px',
            height: '20px',
            background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
            transform: 'translateX(-50%)',
            ...(showAbove
              ? { bottom: '-20px' }
              : { top: '-20px' }
            )
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ✕
        </button>

        <img
          src={content.image}
          alt="Room preview"
          style={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
        />

        <p style={{
          color: '#F5EC9B',
          fontSize: '14px',
          lineHeight: '1.4',
          marginBottom: '8px',
        }}>
          {content.description}
        </p>

        {content.features && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            {content.features.map((feature, index) => (
              <li
                key={index}
                style={{
                  color: '#F5EC9B',
                  fontSize: '12px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ marginRight: '6px' }}>•</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------- MAIN VIEWER ------------------- */
interface ViewerProps {
  modelPath: string;
  showMarkers?: boolean;
}

export default function Viewer({ modelPath, showMarkers = true }: ViewerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [markerPositions, setMarkerPositions] = useState<{ [key: string]: { x: number; y: number; visible: boolean } }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // reset loaded state when model path changes
    setIsLoaded(false);
  }, [modelPath]);

  return (
    <div className="relative w-full h-screen">
      <Canvas 
        camera={{ 
          fov: 60, 
          position: [50, 60, 50],
          near: 1,
          far: 1000
        }}
      >
        <Suspense
          fallback={
            <mesh>
              {/* empty fallback; we show a DOM loader below */}
            </mesh>
          }
        >
          <Scene 
            markers={showMarkers ? markers : []} 
            onMarkerSelect={setSelected} 
            updateMarkerScreenPositions={showMarkers ? setMarkerPositions : () => {}}
            modelPath={modelPath}
            onLoaded={() => setIsLoaded(true)}
          />
        </Suspense>
      </Canvas>
      {showMarkers && (
        <MarkerOverlay 
          positions={markerPositions}
          selected={selected}
          onSelect={setSelected}
        />
      )}
      {/* DOM loading indicator overlay while GLB is being fetched */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="w-12 h-12 rounded-full border-4 border-[#F5EC9B] border-t-transparent animate-spin mb-3" />
          <p className="text-sm font-medium tracking-wide text-[#F5EC9B]">
            Loading 3D model...
          </p>
        </div>
      )}
    </div>
  );
}

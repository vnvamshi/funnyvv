import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const FLOOR_COUNT = 40;
const FLOOR_HEIGHT = 0.22;
const FLOOR_WIDTH = 3.4;
const FLOOR_DEPTH = 3.0;
const CORE_WIDTH = 1.6;
const CORE_DEPTH = 1.1;
const TOWER_BASE_Y = (FLOOR_COUNT * FLOOR_HEIGHT) / 2 - FLOOR_HEIGHT / 2;

type FloorProps = {
  index: number;
  position: [number, number, number];
  onClick: (id: number) => void;
  isSelected: boolean;
  onPointerOver: (id: number) => void;
  onPointerOut: (id: number | null) => void;
  hovered: boolean;
};

function Floor({
  index,
  position,
  onClick,
  isSelected,
  onPointerOver,
  onPointerOut,
  hovered,
}: FloorProps) {
  const mesh = useRef<THREE.Mesh | null>(null);
  const balconyRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!mesh.current) return;

    const mat = mesh.current.material as THREE.MeshStandardMaterial | undefined;
    const balconyMat = balconyRef.current
      ? (balconyRef.current.material as THREE.MeshStandardMaterial | undefined)
      : undefined;

    if (isSelected) {
      const t = state.clock.getElapsedTime() * 3;
      const s = 1 + Math.abs(Math.sin(t)) * 0.06;
      mesh.current.scale.set(s, 1, s);
      if (mat) mat.emissiveIntensity = 1.8 + Math.abs(Math.sin(t)) * 1.2;
      if (balconyMat) balconyMat.emissiveIntensity = 0.8;
    } else {
      mesh.current.scale.set(1, 1, 1);
      if (mat) mat.emissiveIntensity = hovered ? 1.2 : 0.6;
      if (balconyMat) balconyMat.emissiveIntensity = hovered ? 0.4 : 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={balconyRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index + 1);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver(index + 1);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut(null);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[FLOOR_WIDTH, FLOOR_HEIGHT * 0.55, FLOOR_DEPTH]} />
        <meshStandardMaterial
          color={isSelected ? '#e5f0ff' : '#f5f7fb'}
          metalness={0.2}
          roughness={0.4}
          emissive={isSelected ? new THREE.Color('#60a5fa') : new THREE.Color('#0f172a')}
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>

      <mesh
        ref={mesh}
        position={[0, 0, -CORE_DEPTH * 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index + 1);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver(index + 1);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut(null);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[CORE_WIDTH * 0.9, FLOOR_HEIGHT * 0.9, CORE_DEPTH * 0.7]} />
        <meshStandardMaterial
          color={isSelected ? '#1d4ed8' : '#020617'}
          metalness={0.7}
          roughness={0.18}
          transparent
          opacity={0.9}
          emissive={isSelected ? new THREE.Color('#1d4ed8') : new THREE.Color('#020617')}
          emissiveIntensity={hovered ? 0.9 : 0.4}
        />
      </mesh>

      <Html
        position={[0, FLOOR_HEIGHT * 0.7, FLOOR_DEPTH / 2 + 0.12]}
        center
        distanceFactor={7}
        style={{
          pointerEvents: 'none',
          fontSize: 10,
          fontWeight: 600,
          color: isSelected ? '#0f172a' : '#1f2937',
          background: 'rgba(255,255,255,0.9)',
          padding: '1px 4px',
          borderRadius: 4,
        }}
      >
        {index + 1}
      </Html>
    </group>
  );
}

type BuildingGroupProps = {
  selectedFloor: number | null;
  setSelectedFloor: (id: number) => void;
  hoveredFloor: number | null;
  setHoveredFloor: (id: number | null) => void;
  autoRotateRef: React.MutableRefObject<boolean>;
};

function BuildingGroup({
  selectedFloor,
  setSelectedFloor,
  hoveredFloor,
  setHoveredFloor,
  autoRotateRef,
}: BuildingGroupProps) {
  const group = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (autoRotateRef.current) {
      group.current.rotation.y += delta * 0.25;
    }
  });

  const floors = useMemo(
    () =>
      Array.from({ length: FLOOR_COUNT }).map((_, i) => {
        const y = -TOWER_BASE_Y + i * FLOOR_HEIGHT;
        return { id: i + 1, position: [0, y, 0] as [number, number, number], index: i };
      }),
    []
  );

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, -TOWER_BASE_Y - 0.5, 0]}>
        <boxGeometry args={[FLOOR_WIDTH * 1.5, 1.2, FLOOR_DEPTH * 1.4]} />
        <meshStandardMaterial color="#020617" metalness={0.4} roughness={0.6} />
      </mesh>

      <mesh position={[0, 0, -CORE_DEPTH * 0.35]}>
        <boxGeometry args={[CORE_WIDTH, FLOOR_COUNT * FLOOR_HEIGHT * 1.05, CORE_DEPTH]} />
        <meshStandardMaterial
          color="#020617"
          metalness={0.6}
          roughness={0.35}
          emissive="#020617"
          emissiveIntensity={0.6}
        />
      </mesh>

      {floors.map((f) => (
        <Floor
          key={f.id}
          index={f.index}
          position={f.position}
          onClick={setSelectedFloor}
          isSelected={selectedFloor === f.id}
          onPointerOver={setHoveredFloor}
          onPointerOut={setHoveredFloor}
          hovered={hoveredFloor === f.id}
        />
      ))}

      <mesh position={[FLOOR_WIDTH / 2 + 0.06, 0, 0]}>
        <boxGeometry args={[0.18, FLOOR_COUNT * FLOOR_HEIGHT * 1.05, 0.9]} />
        <meshStandardMaterial
          color="#e5e7eb"
          emissive="#facc15"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[-FLOOR_WIDTH / 2 - 0.06, 0, 0]}>
        <boxGeometry args={[0.18, FLOOR_COUNT * FLOOR_HEIGHT * 1.05, 0.9]} />
        <meshStandardMaterial
          color="#e5e7eb"
          emissive="#facc15"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const y =
          -TOWER_BASE_Y +
          FLOOR_HEIGHT * 2 +
          i * ((FLOOR_COUNT * FLOOR_HEIGHT - FLOOR_HEIGHT * 6) / 5);
        return (
          <mesh key={`glass-deck-${i}`} position={[0, y, FLOOR_DEPTH * 0.2]}>
            <boxGeometry args={[FLOOR_WIDTH * 0.9, FLOOR_HEIGHT * 0.25, FLOOR_DEPTH * 0.6]} />
            <meshStandardMaterial
              color="#e0f2fe"
              metalness={0.5}
              roughness={0.1}
              transparent
              opacity={0.35}
              emissive="#38bdf8"
              emissiveIntensity={0.35}
            />
          </mesh>
        );
      })}

      <mesh position={[0, TOWER_BASE_Y + FLOOR_HEIGHT * 3, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.12, 40]} />
        <meshStandardMaterial color="#16a34a" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, TOWER_BASE_Y + FLOOR_HEIGHT * 3.08, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.03, 40]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <mesh
        position={[FLOOR_WIDTH / 2 + 0.22, TOWER_BASE_Y + FLOOR_HEIGHT * 1.4, CORE_DEPTH * 0.1]}
      >
        <boxGeometry args={[0.22, FLOOR_HEIGHT * 4, 1.4]} />
        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.3} />
      </mesh>
      <Html
        position={[FLOOR_WIDTH / 2 + 0.24, TOWER_BASE_Y + FLOOR_HEIGHT * 1.4, CORE_DEPTH * 0.9]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          fontSize: 22,
          letterSpacing: 3,
          fontWeight: 800,
          color: '#f9fafb',
          textShadow: '0 4px 12px rgba(0,0,0,0.85)',
        }}
      >
        SKYVEN
      </Html>

      {Array.from({ length: 8 }).map((_, i) => {
        const y = -TOWER_BASE_Y + i * (FLOOR_COUNT * FLOOR_HEIGHT) / 7;
        return (
          <mesh key={`green-${i}`} position={[CORE_WIDTH * 0.55, y, FLOOR_DEPTH * 0.45]}>
            <boxGeometry args={[0.12, FLOOR_HEIGHT * 3, 0.12]} />
            <meshStandardMaterial
              color="#16a34a"
              emissive="#15803d"
              emissiveIntensity={0.5}
              roughness={0.8}
            />
          </mesh>
        );
      })}

      <Sparkles
        size={4}
        scale={[4, FLOOR_COUNT * FLOOR_HEIGHT + 2, 4]}
        position={[0, FLOOR_HEIGHT, 0]}
        count={20}
      />
    </group>
  );
}

const FuturisticTowerClassic: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
  const autoRotateRef = useRef<boolean>(true);

  return (
    <div style={styles.app}>
      <div style={styles.left}>
        <Canvas
          shadows
          camera={{ position: [7, 5, 8], fov: 45 }}
          style={{
            background:
              'linear-gradient(to bottom, #87CEEB 0%, #E0F2FE 45%, #F9FAFB 100%)',
          }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[10, 18, 8]} intensity={1.4} castShadow />
          <directionalLight position={[-10, 10, -6]} intensity={0.4} />

          <mesh rotation-x={-Math.PI / 2} position={[0, -TOWER_BASE_Y - 0.95, 0]}>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#374151" roughness={0.9} />
          </mesh>

          <BuildingGroup
            selectedFloor={selectedFloor}
            setSelectedFloor={(id) => setSelectedFloor((s) => (s === id ? null : id))}
            hoveredFloor={hoveredFloor}
            setHoveredFloor={setHoveredFloor}
            autoRotateRef={autoRotateRef}
          />

          <OrbitControls enablePan={false} enableZoom enableRotate makeDefault />
        </Canvas>

        <div style={styles.controls}>
          <button
            onClick={() => {
              autoRotateRef.current = !autoRotateRef.current;
            }}
            style={styles.controlBtn}
          >
            {autoRotateRef.current ? 'Stop Auto-Rotate' : 'Start Auto-Rotate'}
          </button>
          <div style={{ color: '#cbd5e1', marginLeft: 12 }}>
            Hover floor to glow • Click to select
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <h2 style={{ marginTop: 0, color: '#111827' }}>Skyven Tower (Procedural)</h2>
        {selectedFloor ? (
          <div style={styles.infoCard}>
            <h3 style={{ margin: '6px 0' }}>Floor {selectedFloor}</h3>
            <p style={{ marginTop: 0 }}>
              Modern residential floor with wide balconies and vertical green pockets. You can add
              any metadata here: unit mix, tenants, amenities, plan links, images, etc.
            </p>
            <div style={{ marginTop: 12 }}>
              <strong>Suggested details (examples):</strong>
              <ul>
                <li>Floor type: Premium residential</li>
                <li>Capacity: {Math.floor(10 + Math.random() * 50)} persons</li>
                <li>Balcony depth: 2.4 m continuous</li>
                <li>Maintenance note: {selectedFloor % 5 === 0 ? 'Facade cleaning due' : 'OK'}</li>
              </ul>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={() => alert(`Zooming into Floor ${selectedFloor} (sample)`)}
                style={styles.actionBtn}
              >
                Zoom to Floor
              </button>
              <button
                onClick={() => alert(`Open Floor ${selectedFloor} plan (sample)`)}
                style={{ ...styles.actionBtn, background: '#6b21a8' }}
              >
                Open Plan
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.infoCard}>
            <h3 style={{ marginTop: 0 }}>No floor selected</h3>
            <p>
              Click a floor on the building to view details. Try rotating the building or hovering
              floors to highlight the balcony plates.
            </p>
            <hr />
            <div>
              <strong>Quick tips</strong>
              <ul>
                <li>Drag the scene to rotate manually</li>
                <li>Scroll to zoom</li>
                <li>Use the Auto-Rotate toggle to see continuous spin</li>
              </ul>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', color: '#94a3b8', fontSize: 13 }}>
          Built with React Three Fiber • Procedural massing demo
        </div>
      </div>
    </div>
  );
};

export default FuturisticTowerClassic;

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily:
      "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    background: 'linear-gradient(180deg, #E0F2FE 0%, #F9FAFB 100%)',
  },
  left: {
    width: '70%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  right: {
    width: '30%',
    padding: 24,
    boxSizing: 'border-box',
    borderLeft: '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  controls: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(15,23,42,0.25)',
  },
  controlBtn: {
    background: 'linear-gradient(90deg,#2563eb,#1d4ed8)',
    color: '#fff',
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
  },
  infoCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    padding: 16,
    borderRadius: 10,
    color: '#111827',
  },
  actionBtn: {
    background: '#2563eb',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
  },
};









// @ts-nocheck
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { GLB_URLS } from '../../utils/glbUrls';
import { cacheGLB } from '../../utils/glbCache';

type SkyvenMesh = {
  name: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

const hoverPalette = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#e11d48', '#14b8a6', '#facc15'];

const getHoverColor = (name: string) => {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return hoverPalette[sum % hoverPalette.length];
};

type SkyvenModelProps = {
  autoRotateRef: React.MutableRefObject<boolean>;
  onHover: (info: { name: string; position: THREE.Vector3 } | null) => void;
  onReady?: (bounds: { center: THREE.Vector3; radius: number }) => void;
  hoveredName: string | null;
  clickedMeshName: string | null;
  onMeshClick: (name: string | null) => void;
  onMeshesLoaded?: (names: string[]) => void;
};

function SkyvenModel({ autoRotateRef, onHover, onReady, hoveredName, clickedMeshName, onMeshClick, onMeshesLoaded }: SkyvenModelProps) {
  const group = useRef<THREE.Group | null>(null);
  const targetScale = useRef(1.0);
  const currentScale = useRef(1.0);
  const currentSpinSpeed = useRef(0);
  const gltf = useGLTF(GLB_URLS.SKYVEN) as unknown as {
    nodes: Record<string, THREE.Mesh>;
    scene: THREE.Group;
  };

  const meshes: SkyvenMesh[] = useMemo(() => {
    // Ensure world matrices are computed so child transforms are respected
    gltf.scene?.updateMatrixWorld(true);

    return Object.values(gltf.nodes)
      .filter((node) => (node as THREE.Mesh).isMesh)
      .map((mesh) => {
        const worldMatrix = mesh.matrixWorld.clone();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        worldMatrix.decompose(position, quaternion, scale);

        return {
          name: mesh.name || 'Unnamed mesh',
          geometry: mesh.geometry,
          material: mesh.material,
          position,
          rotation: new THREE.Euler().setFromQuaternion(quaternion),
          scale,
        };
      });
  }, [gltf.nodes, gltf.scene]);

  useEffect(() => {
    if (onMeshesLoaded) {
      onMeshesLoaded(meshes.map((m) => m.name));
    }
  }, [meshes, onMeshesLoaded]);

  useEffect(() => {
    if (!group.current) return;
    const box = new THREE.Box3().setFromObject(group.current);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const radius = size.length() / 2;
    onReady?.({ center, radius });
  }, [onReady, meshes]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const nextSpeed = autoRotateRef.current ? 0.25 : 0;
    currentSpinSpeed.current = THREE.MathUtils.lerp(currentSpinSpeed.current, nextSpeed, 0.08);
    group.current.rotation.y += delta * currentSpinSpeed.current;

    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 0.08);
    group.current.scale.setScalar(currentScale.current);
  });

  return (
    <group
      ref={group}
      position={[0, -1.1, 0]}
      scale={currentScale.current}
      onPointerOver={(e) => {
        targetScale.current = 1.08;
        if (group.current) {
          const worldPos = new THREE.Vector3();
          group.current.getWorldPosition(worldPos);
          onHover({ name: 'Skyven Tower', position: worldPos });
        }
      }}
      onPointerOut={(e) => {
        targetScale.current = 1.0;
        onHover(null);
      }}
      onPointerMissed={() => {
        targetScale.current = 1.0;
        onHover(null);
      }}
      onClick={(e) => {
        // If clicking on the group itself (not a mesh), deselect
        if (e.target === e.currentTarget) {
          onMeshClick(null);
        }
      }}
    >
      {meshes.map((mesh) => {
        const isHighlighted = mesh.name === 'Cube019_13' || mesh.name === 'Cube019_14';
        const isHovered = hoveredName === mesh.name;
        const isClicked = clickedMeshName === mesh.name;
        let materialToUse = mesh.material;

        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          const cloned = mesh.material.clone();
          if (isClicked) {
            // Clicked mesh gets a bright highlight color
            cloned.emissive = new THREE.Color('#00ff00');
            cloned.emissiveIntensity = 2.0;
            cloned.color = new THREE.Color('#00ff00').multiplyScalar(0.8);
          } else if (isHovered) {
            cloned.emissive = new THREE.Color(getHoverColor(mesh.name));
            cloned.emissiveIntensity = 1.8;
          } else if (isHighlighted) {
            cloned.emissive = new THREE.Color('#f59e0b');
            cloned.emissiveIntensity = 1.6;
          }
          materialToUse = cloned;
        } else if (isClicked) {
          // Fallback: basic material highlight when clicked but not MeshStandardMaterial
          const c = new THREE.Color('#00ff00');
          materialToUse = (mesh.material as THREE.Material).clone();
          (materialToUse as any).color = c;
        } else if (isHovered) {
          // Fallback: basic material highlight when not MeshStandardMaterial
          const c = new THREE.Color(getHoverColor(mesh.name));
          materialToUse = (mesh.material as THREE.Material).clone();
          (materialToUse as any).color = c;
        }

        return (
          <mesh
            key={mesh.name}
            geometry={mesh.geometry}
            material={materialToUse}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
            onPointerOver={(e) => {
              targetScale.current = 1.08;
              const worldPos = new THREE.Vector3();
              e.object.getWorldPosition(worldPos);
              onHover({ name: mesh.name || 'Skyven Tower', position: worldPos });
            }}
            onPointerOut={(e) => {
              targetScale.current = 1.0;
              onHover(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle: if clicking the same mesh, deselect it; otherwise select the new one
              if (clickedMeshName === mesh.name) {
                onMeshClick(null);
              } else {
                onMeshClick(mesh.name);
              }
            }}
          />
        );
      })}
    </group>
  );
}

// Building surroundings component
function BuildingSurroundings() {
  const groundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  );

  // Generate surrounding buildings
  const buildings = useMemo(() => {
    const buildingPositions = [
      // Front buildings
      { x: -8, z: -6, width: 2, depth: 2, height: 3 },
      { x: -5, z: -7, width: 1.5, depth: 1.5, height: 2.5 },
      { x: -2, z: -8, width: 2.5, depth: 2.5, height: 4 },
      { x: 2, z: -7, width: 2, depth: 2, height: 3.5 },
      { x: 6, z: -6, width: 1.8, depth: 1.8, height: 2.8 },
      { x: 9, z: -5, width: 2.2, depth: 2.2, height: 3.2 },
      // Back buildings
      { x: -7, z: 6, width: 2, depth: 2, height: 3.5 },
      { x: -3, z: 7, width: 1.5, depth: 1.5, height: 2.2 },
      { x: 1, z: 8, width: 2.5, depth: 2.5, height: 4.2 },
      { x: 5, z: 6, width: 2, depth: 2, height: 3 },
      { x: 8, z: 5, width: 1.8, depth: 1.8, height: 2.5 },
      // Left side buildings
      { x: -10, z: -2, width: 2, depth: 2, height: 3.8 },
      { x: -11, z: 2, width: 1.5, depth: 1.5, height: 2.8 },
      { x: -9, z: 4, width: 2.2, depth: 2.2, height: 3.5 },
      // Right side buildings
      { x: 10, z: -3, width: 2, depth: 2, height: 3.2 },
      { x: 11, z: 1, width: 1.8, depth: 1.8, height: 2.6 },
      { x: 9, z: 4, width: 2.5, depth: 2.5, height: 4 },
    ];
    return buildingPositions;
  }, []);

  const buildingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.7,
        metalness: 0.2,
      }),
    []
  );

  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        emissive: '#1e293b',
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  return (
    <group>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.1, 0]}
        material={groundMaterial}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
      </mesh>

      {/* Surrounding buildings */}
      {buildings.map((building, index) => (
        <group key={index} position={[building.x, -1.1 + building.height / 2, building.z]}>
          {/* Main building structure */}
          <mesh
            geometry={new THREE.BoxGeometry(building.width, building.height, building.depth)}
            material={buildingMaterial}
            castShadow
            receiveShadow
          />
          {/* Windows */}
          {Array.from({ length: Math.floor(building.height) }).map((_, floor) => (
            <group key={floor} position={[0, -building.height / 2 + floor + 0.5, building.depth / 2 + 0.01]}>
              <mesh
                geometry={new THREE.PlaneGeometry(building.width * 0.8, 0.3)}
                material={windowMaterial}
                position={[-building.width * 0.1, 0, 0]}
              />
              <mesh
                geometry={new THREE.PlaneGeometry(building.width * 0.8, 0.3)}
                material={windowMaterial}
                position={[building.width * 0.1, 0, 0]}
              />
            </group>
          ))}
        </group>
      ))}

      {/* Additional decorative elements - simple trees/plants */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 12 + Math.random() * 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={`tree-${i}`} position={[x, -1.1, z]}>
            {/* Tree trunk */}
            <mesh
              geometry={new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8)}
              material={new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })}
              position={[0, 0.75, 0]}
              castShadow
            />
            {/* Tree foliage */}
            <mesh
              geometry={new THREE.ConeGeometry(0.8, 1.5, 8)}
              material={new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.9 })}
              position={[0, 1.5, 0]}
              castShadow
            />
          </group>
        );
      })}
    </group>
  );
}

const FuturisticTower: React.FC = () => {
  const [hoveredMesh, setHoveredMesh] = useState<{ name: string; position: THREE.Vector3 } | null>(
    null
  );
  const [clickedMeshName, setClickedMeshName] = useState<string | null>(null);
  const autoRotateRef = useRef<boolean>(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const boundsRef = useRef<{ center: THREE.Vector3; radius: number } | null>(null);
  const [meshNames, setMeshNames] = useState<string[]>([]);

  const handleZoom = (dir: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const delta = 1.15;
    if (dir === 'in') {
      controlsRef.current.dollyIn(delta);
    } else {
      controlsRef.current.dollyOut(delta);
    }
    controlsRef.current.update();
  };

  const handleZoomOutMax = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const maxDist = controls.maxDistance ?? 80;
    const offset = tempVec.copy(camera.position).sub(controls.target);
    const current = offset.length();
    const factor = current > 0 ? maxDist / current : 1;
    controls.dollyOut(factor);
    controls.update();
  };

  const fitCameraToBounds = (bounds?: { center: THREE.Vector3; radius: number }) => {
    if (!controlsRef.current) return;
    const data = bounds ?? boundsRef.current;
    if (!data) return;
    const { center, radius } = data;
    boundsRef.current = data;
    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;
    const fitOffset = 1.35;
    const vFov = (camera.fov * Math.PI) / 180;
    const distance = (radius * fitOffset) / Math.tan(vFov / 2);
    const dir = new THREE.Vector3(0.7, 0.55, 1).normalize();
    const targetPos = center.clone().add(dir.multiplyScalar(distance));
    camera.position.copy(targetPos);
    controls.target.copy(center);
    controls.maxDistance = Math.max(controls.maxDistance ?? 0, distance * 2);
    controls.minDistance = Math.min(controls.minDistance ?? distance / 4, distance / 4);
    controls.update();
  };

  return (
    <div style={styles.app}>
      <div style={styles.left}>
        <Canvas
          shadows
          camera={{ position: [9, 8, 14], fov: 45 }}
          style={{
            background:
              'linear-gradient(to bottom, #87CEEB 0%, #E0F2FE 45%, #F9FAFB 100%)',
          }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[10, 18, 8]} intensity={1.4} castShadow />
          <directionalLight position={[-10, 10, -6]} intensity={0.4} />

          <BuildingSurroundings />

          <Suspense
            fallback={
              <Html center style={{ color: '#0f172a', fontWeight: 600 }}>
                Loading Skyven tower...
              </Html>
            }
          >
            <SkyvenModel
              autoRotateRef={autoRotateRef}
              onHover={setHoveredMesh}
              hoveredName={hoveredMesh?.name ?? null}
              clickedMeshName={clickedMeshName}
              onMeshClick={setClickedMeshName}
              onReady={(bounds) => {
                fitCameraToBounds(bounds);
              }}
              onMeshesLoaded={(names) => setMeshNames(names)}
            />
          </Suspense>

          {hoveredMesh && (
            <Html
              position={[hoveredMesh.position.x, hoveredMesh.position.y + 0.6, hoveredMesh.position.z]}
              center
              distanceFactor={10}
              style={{
                background: 'rgba(15,23,42,0.8)',
                color: '#e5e7eb',
                padding: '6px 10px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: 'nowrap',
              }}
            >
              {hoveredMesh.name}
            </Html>
          )}

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom
            enableRotate
            makeDefault
            enableDamping
            dampingFactor={0.1}
            minDistance={6}
            maxDistance={80}
            zoomSpeed={0.8}
          />
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
          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            <button style={styles.smallBtn} onClick={() => handleZoom('in')}>
              Zoom In
            </button>
            <button style={styles.smallBtn} onClick={() => handleZoom('out')}>
              Zoom Out
            </button>
            <button style={styles.smallBtn} onClick={handleZoomOutMax}>
              Zoom Out Max
            </button>
            <button style={styles.smallBtn} onClick={() => fitCameraToBounds()}>
              Reset View
            </button>
          </div>
          <div style={{ color: '#cbd5e1', marginLeft: 12 }}>
            {hoveredMesh ? `Hovering: ${hoveredMesh.name}` : 'Hover a mesh to see its name'}
            {clickedMeshName && (
              <div style={{ color: '#00ff00', marginTop: 4, fontWeight: 600 }}>
                Selected: {clickedMeshName}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <h2 style={{ marginTop: 0, color: '#111827' }}>Skyven Tower (GLB)</h2>
        <div style={styles.infoCard}>
          <h3 style={{ margin: '6px 0' }}>Mesh explorer</h3>
          <p style={{ marginTop: 0 }}>
            The GLB from <code>public/skyven.glb</code> is loaded via import. Hover any mesh in the
            viewport to read its name. Use the auto‑rotate toggle or orbit controls to inspect all
            sides of the tower.
          </p>
            <ul>
            <li>Drag to rotate • Scroll to zoom</li>
            <li>Hover to reveal mesh names</li>
            <li>Click any mesh to highlight it</li>
            <li>Auto‑rotate can be paused anytime</li>
          </ul>
          {hoveredMesh && (
            <div style={{ marginTop: 12, fontWeight: 700, color: '#0f172a' }}>
              Currently hovering: {hoveredMesh.name}
            </div>
          )}
          {clickedMeshName && (
            <div style={{ marginTop: 12, fontWeight: 700, color: '#00ff00' }}>
              Selected mesh: {clickedMeshName}
            </div>
          )}
          {meshNames.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Available meshes ({meshNames.length}):</strong>
              <div
                style={{
                  marginTop: 6,
                  padding: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  maxHeight: 220,
                  overflow: 'auto',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: '#0f172a',
                }}
              >
                {meshNames.map((name) => (
                  <div key={name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: getHoverColor(name),
                        display: 'inline-block',
                      }}
                    />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', color: '#94a3b8', fontSize: 13 }}>
          Built with React Three Fiber • Model: SKYVEN GLB
        </div>
      </div>
    </div>
  );
};

// Cache GLB model on module load
cacheGLB(GLB_URLS.SKYVEN);

export default FuturisticTower;

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
  smallBtn: {
    background: '#0ea5e9',
    color: '#ffffff',
    padding: '6px 10px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
};



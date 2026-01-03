import React from 'react';
import * as R3F from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import CachedGLTF from '../../components/three/CachedGLTF';
import gridIcon from '../../assets/images/v3.2/grid.png';
import fullviewIcon from '../../assets/images/v3.2/fullview.png';
import ModalCloseButton from '../../components/ModalCloseButton';

const Canvas = (R3F as any).Canvas;

type FloorPlanModelBounds = {
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
  maxHeight: number;
};

type FloorPlanModelProps = {
  modelUrl: string;
  onBoundsComputed: (bounds: FloorPlanModelBounds) => void;
};

const FloorPlanGlbModelScene: React.FC<Omit<FloorPlanModelProps, 'modelUrl'> & { scene: THREE.Group | null | undefined }> = ({
  onBoundsComputed,
  scene,
}) => {
  const centeredScene = React.useMemo(() => {
    if (!scene) return null;

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

    onBoundsComputed({
      center: new THREE.Vector3(0, 0, 0),
      size,
      radius,
      maxHeight,
    });

    return wrapper;
  }, [scene, onBoundsComputed]);

  if (!centeredScene) return null;
  return <primitive object={centeredScene} />;
};

const FloorPlanGlbModel: React.FC<FloorPlanModelProps> = ({ modelUrl, onBoundsComputed }) => {
  return (
    <CachedGLTF url={modelUrl} fallback={null}>
      {(gltf) => (
        <FloorPlanGlbModelScene
          scene={(gltf as any)?.scene}
          onBoundsComputed={onBoundsComputed}
        />
      )}
    </CachedGLTF>
  );
};

export const FloorPlanGlbViewer: React.FC<{ glbUrl: string; fullHeight?: boolean }> = ({ glbUrl, fullHeight = false }) => {
  const [bounds, setBounds] = React.useState<FloorPlanModelBounds | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const controlsRef = React.useRef<any>(null);
  const [isAutoRotating, setIsAutoRotating] = React.useState(true);

  const cameraProps = {
    position: [100, 50, 100] as [number, number, number],
    fov: 50,
  };

  const handleBoundsComputed = React.useCallback((computed: FloorPlanModelBounds) => {
    setBounds(computed);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const camera = controls.object as THREE.PerspectiveCamera;

    camera.position.set(100, 50, 100);
    controls.target.set(0, 0, 0);
    controls.update();

    setIsAutoRotating(true);
  }, []);

  React.useEffect(() => {
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

  return (
    <div
      className="w-full"
      style={{
        position: 'relative',
        height: fullHeight ? '100%' : 320,
        background: 'linear-gradient(to bottom, #e0f2fe 0%, #f9fafb 100%)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <Canvas camera={cameraProps}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[12, 16, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-8, 10, -6]} intensity={0.5} />

        <React.Suspense fallback={null}>
          <Bounds clip margin={1.2}>
            <FloorPlanGlbModel modelUrl={glbUrl} onBoundsComputed={handleBoundsComputed} />
          </Bounds>
        </React.Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          panSpeed={1.0}
          screenSpacePanning={true}
          target={[0, 0, 0]}
          minDistance={bounds ? Math.max(0.1, bounds.radius * 0.3) : 1}
          maxDistance={bounds ? bounds.radius * 5 : 500}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI * 0.49}
          autoRotate={isAutoRotating}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
      </Canvas>

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-[#905E26] border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-gray-600 font-medium">Loading 3D floor plan...</div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FloorPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlanImages: string[];
  currentFloorPlanIndex: number;
  onFloorPlanSelect: (index: number) => void;
  title?: string;
  glbUrl?: string;
}

const FloorPlanModal: React.FC<FloorPlanModalProps> = ({
  isOpen,
  onClose,
  floorPlanImages,
  currentFloorPlanIndex,
  onFloorPlanSelect,
  title = "Floor Plan",
  glbUrl,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'full' | 'grid'>('full');

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  const handlePrevious = () => {
    const newIndex = currentFloorPlanIndex > 0 ? currentFloorPlanIndex - 1 : floorPlanImages.length - 1;
    onFloorPlanSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentFloorPlanIndex < floorPlanImages.length - 1 ? currentFloorPlanIndex + 1 : 0;
    onFloorPlanSelect(newIndex);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 66, 54, 0.8)' }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden transform transition-all duration-300 relative ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        <ModalCloseButton
          onClick={onClose}
          ariaLabel="Close floor plans"
          className="absolute top-4 right-4 z-50"
        />
        
        {/* Top Right Controls */}
        <div className="absolute top-4 right-20 z-40 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Only show controls if there are multiple images */}
          {floorPlanImages.length > 1 && (
            <>
              {/* Arrow navigation (works in any view mode) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm text-gray-700 hover:text-black transition-all duration-200"
                  title="Previous floor plan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm text-gray-700 hover:text-black transition-all duration-200"
                  title="Next floor plan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* View mode toggle */}
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm ${
                  viewMode === 'grid' ? 'ring-2 ring-[#004236]' : ''
                }`}
                title="Grid View"
              >
                <img src={gridIcon} alt="Grid View" className="w-5 h-5" />
              </button>

              <button
                onClick={() => setViewMode('full')}
                className={`p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 shadow-sm ${
                  viewMode === 'full' ? 'ring-2 ring-[#004236]' : ''
                }`}
                title="Full View"
              >
                <img src={fullviewIcon} alt="Full View" className="w-5 h-5" />
              </button>

              {/* Floor Plan Counter - only show in full view */}
              {viewMode === 'full' && (
                <div className="px-3 py-1 bg-white bg-opacity-90 rounded-lg text-sm text-gray-600 shadow-sm">
                  {currentFloorPlanIndex + 1} of {floorPlanImages.length}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-hidden max-h-[calc(95vh-3rem)]">
          {/* Heading */}
          <div className="mb-4 text-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {title}
            </h2>
          </div>

          {floorPlanImages.length === 1 ? (
            /* Single Image View with 3D side-by-side */
            <div className="flex justify-center items-center" style={{ height: 'calc(90vh - 3rem)' }}>
              <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch h-full">
                <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center h-full">
                  <img
                    src={floorPlanImages[0]}
                    alt={title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                {glbUrl && (
                  <div className="rounded-lg bg-gray-50 h-full">
                    <FloorPlanGlbViewer glbUrl={glbUrl} fullHeight />
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'full' ? (
            /* Full View with 3D side-by-side */
            <div className="flex justify-center items-center" style={{ height: 'calc(90vh - 3rem)' }}>
              <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch h-full">
                {/* Image side */}
                <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center bg-white h-full">
                  <img
                    src={floorPlanImages[currentFloorPlanIndex]}
                    alt={`Floor Plan ${currentFloorPlanIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 3D side */}
                {glbUrl && (
                  <div className="rounded-lg bg-gray-50 h-full">
                    <FloorPlanGlbViewer glbUrl={glbUrl} fullHeight />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Grid View - Layout similar to the image */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Top Section - Two larger images side by side */}
              <div className="grid grid-cols-2 gap-4">
                {floorPlanImages.slice(0, 2).map((image, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onFloorPlanSelect(index);
                      setViewMode('full');
                    }}
                    className="cursor-pointer group rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={image}
                        alt={`Floor Plan ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Section - Horizontal grid of smaller images */}
              {floorPlanImages.length > 2 && (
                <div className="grid grid-cols-3 gap-4 pr-20">
                  {floorPlanImages.slice(2).map((image, index) => (
                    <div
                      key={index + 2}
                      onClick={() => {
                        onFloorPlanSelect(index + 2);
                        setViewMode('full');
                      }}
                      className="cursor-pointer group rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Floor Plan ${index + 3}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanModal;

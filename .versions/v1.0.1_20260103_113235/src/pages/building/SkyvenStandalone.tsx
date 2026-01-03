// Simple standalone page to preview the Skyven GLB
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';

import { GLB_URLS } from '../../utils/glbUrls';
import CachedGLTF from '../../components/three/CachedGLTF';

const SkyvenMesh = () => {
  return (
    <CachedGLTF url={GLB_URLS.SKYVEN} fallback={null}>
      {(gltf) => <primitive object={(gltf as any)?.scene} position={[0, -1, 0]} />}
    </CachedGLTF>
  );
};

const SkyvenStandalone: React.FC = () => {
  return (
    <div style={styles.page}>
      <Canvas camera={{ position: [8, 6, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <directionalLight position={[-8, 10, -6]} intensity={0.4} />

        <Suspense
          fallback={
            <Html center style={{ color: '#0f172a', fontWeight: 600 }}>
              Loading skyven.glb...
            </Html>
          }
        >
          <SkyvenMesh />
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default SkyvenStandalone;

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(to bottom, #e0f2fe, #f9fafb)',
  },
};








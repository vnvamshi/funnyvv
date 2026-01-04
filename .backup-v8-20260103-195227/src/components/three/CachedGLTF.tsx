import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';

import { getGLBObjectUrl } from '../../utils/glbCache';

type Props = {
  url: string;
  /**
   * Render-prop that receives the loaded GLTF (from a cached blob URL when possible).
   * This keeps `useGLTF()` usage inside a stable component and avoids conditional hook calls.
   */
  children: (gltf: GLTF) => React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: unknown) => void;
};

function GLTFInner({ resolvedUrl, children }: { resolvedUrl: string; children: (gltf: GLTF) => React.ReactNode }) {
  const gltf = useGLTF(resolvedUrl) as unknown as GLTF;
  return <>{children(gltf)}</>;
}

/**
 * `useGLTF()` caches in-memory within a single session, but it does not automatically read
 * from the browser Cache Storage. This wrapper resolves the given URL into a cached blob URL
 * (using Cache Storage when available) so repeat visits don't re-download the GLB.
 */
const CachedGLTF: React.FC<Props> = ({ url, children, fallback = null, onError }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResolvedUrl(null);

    (async () => {
      try {
        const objectUrl = await getGLBObjectUrl(url);
        if (!cancelled) setResolvedUrl(objectUrl);
      } catch (e) {
        if (!cancelled) {
          // Fallback to original URL so the viewer can still work even if Cache API fails.
          setResolvedUrl(url);
          onError?.(e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, onError]);

  if (!resolvedUrl) return <>{fallback}</>;
  return <GLTFInner resolvedUrl={resolvedUrl}>{children}</GLTFInner>;
};

export default CachedGLTF;



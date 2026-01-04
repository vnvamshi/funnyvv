// GLB Model Caching Utility
// Provides Cache Storage (persistent) caching + Three.js preload (in-memory)

const GLB_CACHE_NAME = 'glb-model-cache-v1';

// In-memory map to avoid recreating blob URLs within the same session
const GLB_OBJECT_URLS = new Map<string, string>();
// Deduplicate concurrent calls per URL
const IN_FLIGHT_OBJECT_URL = new Map<string, Promise<string>>();

/**
 * Cache GLB file using browser Cache API for persistent storage
 * @param url - The GLB file URL to cache
 */
export const cacheGLBInBrowser = async (url: string): Promise<void> => {
  try {
    // Check if Cache API is available
    if (!('caches' in window)) {
      console.warn('Cache API not available, skipping browser caching for GLB:', url);
      return;
    }

    const cache = await caches.open(GLB_CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      console.log(`✅ GLB loaded from browser cache: ${url}`);
      return;
    }

    // Not in cache, fetch and store
    console.log(`📥 Downloading and caching GLB: ${url}`);
    // NOTE: Cache Storage is NOT automatically used by `fetch()` without a Service Worker.
    // This function only warms the Cache Storage for later retrieval.
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      await cache.put(url, response.clone());
      console.log(`✅ GLB cached in browser successfully: ${url}`);
    } else {
      console.warn(`Failed to fetch GLB: ${url}, status: ${response.status}`);
    }
  } catch (error) {
    console.warn('Failed to cache GLB model in browser:', error);
  }
};

/**
 * Preload GLB using Three.js useGLTF internal caching
 * This ensures the model is loaded and cached in Three.js memory
 * @param url - The GLB file URL to preload
 */
export const preloadGLBInThreeJS = (url: string): void => {
  try {
    // Dynamic import to avoid circular dependencies and ensure useGLTF is available
    import('@react-three/drei').then(({ useGLTF }) => {
      useGLTF.preload(url);
      console.log(`✅ GLB preloaded in Three.js: ${url}`);
    }).catch((error) => {
      console.warn('Failed to preload GLB in Three.js:', error);
    });
  } catch (error) {
    console.warn('Failed to preload GLB in Three.js:', error);
  }
};

/**
 * Resolve a GLB URL to a cached blob URL.
 * - If present in Cache Storage, returns a blob URL without hitting the network.
 * - Otherwise downloads once, stores in Cache Storage, and returns a blob URL.
 *
 * This is the missing link: `useGLTF(url)` does not read Cache Storage by itself.
 */
export const getGLBObjectUrl = async (url: string): Promise<string> => {
  const existing = GLB_OBJECT_URLS.get(url);
  if (existing) return existing;

  const inFlight = IN_FLIGHT_OBJECT_URL.get(url);
  if (inFlight) return inFlight;

  const promise = (async () => {
    // Cache Storage path (preferred; persists across reloads)
    if ('caches' in window) {
      const cache = await caches.open(GLB_CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const blob = await cachedResponse.clone().blob();
        const objectUrl = URL.createObjectURL(blob);
        GLB_OBJECT_URLS.set(url, objectUrl);
        console.log(`✅ GLB served from Cache Storage (no re-download): ${url}`);
        return objectUrl;
      }

      // Not in cache: fetch once, store, then create blob URL
      console.log(`📥 Downloading GLB (first time) and storing in Cache Storage: ${url}`);
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(`Failed to fetch GLB: ${url}, status: ${response.status}`);

      const cachePutResponse = response.clone();
      const blob = await response.blob();
      await cache.put(url, cachePutResponse);

      const objectUrl = URL.createObjectURL(blob);
      GLB_OBJECT_URLS.set(url, objectUrl);
      return objectUrl;
    }

    // Fallback: no Cache Storage (older browsers) — still return a blob URL for this session
    console.log(`📥 Downloading GLB (no Cache Storage available): ${url}`);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Failed to fetch GLB: ${url}, status: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    GLB_OBJECT_URLS.set(url, objectUrl);
    return objectUrl;
  })();

  IN_FLIGHT_OBJECT_URL.set(url, promise);
  try {
    return await promise;
  } finally {
    IN_FLIGHT_OBJECT_URL.delete(url);
  }
};

/**
 * Comprehensive GLB caching - caches in both browser and Three.js
 * @param url - The GLB file URL to cache
 * @param preloadInThreeJS - Whether to also preload in Three.js (default: true)
 */
export const cacheGLB = async (url: string, preloadInThreeJS: boolean = true): Promise<void> => {
  // Cache in browser first
  await cacheGLBInBrowser(url);

  // Preload in Three.js if requested
  if (preloadInThreeJS) {
    preloadGLBInThreeJS(url);
  }
};

/**
 * Cache multiple GLB URLs
 * @param urls - Array of GLB URLs to cache
 * @param preloadInThreeJS - Whether to preload in Three.js (default: true)
 */
export const cacheMultipleGLBs = async (urls: string[], preloadInThreeJS: boolean = true): Promise<void> => {
  const cachePromises = urls.map(url => cacheGLB(url, preloadInThreeJS));
  await Promise.allSettled(cachePromises);
};

/**
 * Clear all cached GLB files from browser cache
 */
export const clearGLBCache = async (): Promise<void> => {
  try {
    if (!('caches' in window)) {
      console.warn('Cache API not available, cannot clear GLB cache');
      return;
    }

    const cacheNames = await caches.keys();
    const glbCacheNames = cacheNames.filter(name => name.includes('glb-model-cache'));

    await Promise.all(
      glbCacheNames.map(cacheName => caches.delete(cacheName))
    );

    console.log('✅ GLB cache cleared successfully');
  } catch (error) {
    console.warn('Failed to clear GLB cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getGLBCacheStats = async (): Promise<{ cacheName: string; size: number; urls: string[] } | null> => {
  try {
    if (!('caches' in window)) {
      return null;
    }

    const cache = await caches.open(GLB_CACHE_NAME);
    const requests = await cache.keys();
    const urls = requests.map(request => request.url);

    return {
      cacheName: GLB_CACHE_NAME,
      size: urls.length,
      urls
    };
  } catch (error) {
    console.warn('Failed to get GLB cache stats:', error);
    return null;
  }
};

export default {
  cacheGLB,
  cacheMultipleGLBs,
  cacheGLBInBrowser,
  preloadGLBInThreeJS,
  getGLBObjectUrl,
  clearGLBCache,
  getGLBCacheStats
};

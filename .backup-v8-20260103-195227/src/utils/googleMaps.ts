/**
 * Google Maps API utility functions
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('VITE_GOOGLE_MAPS_API_KEY is not set in environment variables');
}

/**
 * Generate a static map URL for Google Maps
 * @param center - The center coordinates (e.g., "Punta+Cana")
 * @param zoom - The zoom level (1-20)
 * @param size - The size of the map (e.g., "600x600")
 * @param maptype - The type of map (roadmap, satellite, hybrid, terrain)
 * @returns The complete static map URL
 */
export const getStaticMapUrl = (
  center: string = 'Punta+Cana',
  zoom: number = 11,
  size: string = '600x600',
  maptype: string = 'roadmap'
): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&maptype=${maptype}&key=${GOOGLE_MAPS_API_KEY}`;
};

/**
 * Get the Google Maps API key
 * @returns The API key from environment variables
 */
export const getGoogleMapsApiKey = (): string => {
  return GOOGLE_MAPS_API_KEY || '';
}; 
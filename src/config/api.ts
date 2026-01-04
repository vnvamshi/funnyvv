export const API_CONFIG = {
  BASE_URL: 'http://localhost:1117',
  VENDORS: '/api/vendors',
  PRODUCTS: '/api/products',
  AI_STATS: '/api/ai/training/stats',
  NOTIFICATIONS: '/api/notifications'
};
export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
export default API_CONFIG;

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { encryptData, decryptData } from './crypto-helpers';
import React from 'react';
import { ToastContext } from '../App';
import { useAuthData } from '../contexts/AuthContext';
import { CryptoStorage } from './storage';

const ENCRYPTION_ENABLED = import.meta.env.VITE_API_ENCRYPTION_ENABLED !== 'false';

// Helper to detect endpoints where crypto should be bypassed
const shouldBypassCryptoForUrl = (url?: string) => {
	if (!url) return false;
	return url.includes('/common/file/upload/') || url.includes('/common/profile/photo/upload/');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to show toast globally
function showApiToast(message: string, duration = 3000) {
  // Try React context first
  try {
    const context = React.useContext(ToastContext);
    if (context && context.showToast) {
      context.showToast(message, duration);
      return;
    }
  } catch {}
  // Fallback: if window._showToast is set by app root
  if (typeof window !== 'undefined' && typeof (window as any)._showToast === 'function') {
    (window as any)._showToast(message, duration);
  }
}

// Encrypt request data and wrap in { data: encryptedString } if enabled
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url || '';
  const bypassCrypto = shouldBypassCryptoForUrl(url);
  if (config.data && ENCRYPTION_ENABLED && !bypassCrypto) {
    config.data = { data: encryptData(config.data) };
  }
  // Attach access token if available
  const token = CryptoStorage.get("authentication")?.access_token || localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // console.log(token, "token");
  return config;
});

// Helper to get Authorization header for non-axios fetch calls
export const getAuthorizationHeader = (): string | undefined => {
  const defaultAuth = (api.defaults.headers.common['Authorization'] as unknown as string) || undefined;
  if (defaultAuth) return defaultAuth;
  const token = CryptoStorage.get("authentication")?.access_token;
  if (token) return `Bearer ${token}`;
  const bypass = (import.meta.env as any).VITE_BYPASS_BEARER as string | undefined;
  return bypass || undefined;
};

// Helper to refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Decrypt response.data.data if present and encryption is enabled
    const url = response.config?.url || '';
    const bypassCrypto = shouldBypassCryptoForUrl(url);
    if (ENCRYPTION_ENABLED && !bypassCrypto && response.data && (response.data as any).data) {
      try {
        response.data = decryptData((response.data as any).data);
      } catch (e) {
        // fallback to raw data if decryption fails
      }
    }
    // Show success toast if message present
    if (response.data && (response.data as any).message) {
      showApiToast((response.data as any).message, 3000);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    // Show error toast if message present
    if (error.response && error.response.data && (error.response.data as any).message) {
      showApiToast((error.response.data as any).message, 4000);
    }
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          if (originalRequest.headers)
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('authentication');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        // Wrap refresh token in { data: encryptedString } if enabled
        let refreshRequestData;
        if (ENCRYPTION_ENABLED) {
          refreshRequestData = { data: encryptData({ refresh_token: refreshToken }) };
        } else {
          refreshRequestData = { refresh_token: refreshToken };
        }
        const response = await api.post('/common/refresh/', refreshRequestData);
        let tokens;
        if (ENCRYPTION_ENABLED) {
          tokens = decryptData((response.data as any).data);
        } else {
          tokens = response.data;
        }
        const { access_token, refresh_token } = tokens;
        // Store new tokens
        // Always store in localStorage so it persists across refresh
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('authentication');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch saved homes for the buyer with pagination and optional sorting.
 * @param {number} page - The page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @param {string} [sort_by] - Optional sort order: 'low_to_high' or 'high_to_low'
 * @returns {Promise<any>} - API response data
 */
export async function fetchSavedHomes(page = 1, pageSize = 10, sort_by?: 'low_to_high' | 'high_to_low') {
  const body: any = {};
  if (sort_by) body.sort_by = sort_by;
  const response = await api.post(`/buyer/saved-homes/?page=${page}&page_size=${pageSize}`, body);
  return response.data;
}

/**
 * Toggle save/unsave a property for a user.
 * @param {string} userId
 * @param {string} propertyId
 * @param {boolean} isSaved
 * @returns {Promise<any>} - API response data
 */
export async function toggleSaveProperty(userId: string, propertyId: string, isSaved: boolean) {
  const response = await api.post('/buyer/saved-homes/toggle/', {
    user_id: userId,
    property_id: propertyId,
    is_saved: isSaved,
  });
  return response.data;
}

/**
 * Fetch orders for the buyer with pagination.
 * @param {number} page - The page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<any>} - API response data
 */
export async function fetchOrders(page = 1, pageSize = 20) {
  const response = await api.get(`/buyer/orders/?page=${page}&page_size=${pageSize}`);
  return response.data;
}

/**
 * Fetch agent's 3D homes (VR homes) list with pagination.
 * @param {number} page - The page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<any>} - API response data
 */
export async function fetchAgentVRHomes(page = 1, pageSize = 10) {
  const response = await api.get(`/agent/property/vr-list/?page=${page}&page_size=${pageSize}`);
  return response.data;
}

/**
 * Fetch VR images for a property by property_id.
 * @param {string} propertyId - The property ID
 * @returns {Promise<any>} - API response data
 */
export async function fetchPropertyVRImages(propertyId: string) {
  const response = await api.get(`/agent/property/${propertyId}/vr-images/`);
  return response.data;
}

interface LocationInfoResponse {
  country: string;
  country_code: string;
  flag_svg: string;
  flag_png: string;
  states: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const getLocationInfo = async (params: { country?: string; latitude?: number; longitude?: number }): Promise<LocationInfoResponse> => {
  const auth = getAuthorizationHeader();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/common/location-info/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch location info');
  }

  return response.json();
};

export const getSelectedCountries = async () => {
  const response = await api.get('/common/selected-countries/');
  return response.data;
};

/**
 * Interface for country response
 */
export interface Country {
  id?: string;
  country: string;
  country_code: string;
  code: string;
  phone_code: string;
  flag_svg: string;
  flag_png: string;
}

/**
 * Interface for city response
 */
export interface City {
  id: string;
  name: string;
}

/**
 * Interface for state response with cities
 */
export interface State {
  id: string;
  name: string;
  code: string;
  cities: City[];
}

/**
 * Interface for state-city hierarchy response
 */
export interface StateCityHierarchy {
  country: {
    id: string;
    name: string;
    code: string;
    alpha2_code: string;
  };
  states: State[];
}

/**
 * Fetch countries from auth API
 * @returns {Promise<Country[]>} - Array of countries
 */
export const fetchCountries = async (): Promise<Country[]> => {
  const authApiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  const response = await fetch(`${authApiBaseUrl}/api/v1/common/countries/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }

  const data = await response.json();
  console.log('Countries API response:', data);
  
  let countries: Country[] = [];
  
  // Handle different response structures
  if (data.results && Array.isArray(data.results)) {
    countries = data.results;
  } else if (data.data && Array.isArray(data.data)) {
    countries = data.data;
  } else if (Array.isArray(data)) {
    countries = data;
  }
  
  // Normalize country IDs - try multiple possible field names
  const normalizedCountries = countries.map((country: any) => ({
    ...country,
    id: country.id || country._id || country.countryId || country.country_id || undefined,
  }));
  
  console.log('Normalized countries:', normalizedCountries);
  return normalizedCountries;
};

/**
 * Fetch state-city hierarchy from auth API
 * @param {string} countryId - The country ID to fetch states and cities for
 * @returns {Promise<StateCityHierarchy>} - State-city hierarchy data
 */
export const fetchStateCityHierarchy = async (countryId: string): Promise<StateCityHierarchy> => {
  if (!countryId || countryId.trim() === '') {
    throw new Error('Country ID is required');
  }
  
  const authApiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  console.log('Fetching state-city hierarchy with country_id:', countryId, 'from:', `${authApiBaseUrl}/api/v1/common/state-city-hierarchy/?country_id=${countryId}`);
  
  const response = await fetch(`${authApiBaseUrl}/api/v1/common/state-city-hierarchy/?country_id=${countryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('State-city hierarchy API error:', response.status, errorText);
    throw new Error(`Failed to fetch state-city hierarchy: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('State-city hierarchy API response:', data);
  
  if (data.status && data.data) {
    return data.data;
  }
  throw new Error('Invalid response format');
};

/**
 * Interface for company type response
 */
export interface CompanyType {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * Interface for role type response
 */
export interface RoleType {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * Fetch company types from agent API
 * @returns {Promise<CompanyType[]>} - Array of company types
 */
export const fetchCompanyTypes = async (): Promise<CompanyType[]> => {
  const agentApiBaseUrl = import.meta.env.VITE_AGENT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  const response = await fetch(`${agentApiBaseUrl}/api/v1/agent/builder/company-types/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch company types');
  }

  const data = await response.json();
  // Return only active company types, sorted by sort_order
  if (data.status && data.data && Array.isArray(data.data)) {
    return data.data
      .filter((type: CompanyType) => type.is_active)
      .sort((a: CompanyType, b: CompanyType) => a.sort_order - b.sort_order);
  }
  return [];
};

/**
 * Fetch role types from agent API
 * @returns {Promise<RoleType[]>} - Array of role types
 */
export const fetchRoleTypes = async (): Promise<RoleType[]> => {
  const agentApiBaseUrl = import.meta.env.VITE_AGENT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  const response = await fetch(`${agentApiBaseUrl}/api/v1/agent/builder/role-types/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch role types');
  }

  const data = await response.json();
  // Return only active role types, sorted by sort_order
  if (data.status && data.data && Array.isArray(data.data)) {
    return data.data
      .filter((type: RoleType) => type.is_active)
      .sort((a: RoleType, b: RoleType) => a.sort_order - b.sort_order);
  }
  return [];
};

/**
 * Submit builder onboarding step 1 (Company & Compliance Details)
 */
export interface BuilderOnboardingStep1Data {
  step: 1;
  user_id: string;
  country_id: string;
  business_name: string;
  govt_number: string;
  number_type: string;
  govt_certificate: string;
  govt_details: {
    rera_id_type: string;
    rera_id: string;
  };
}

/**
 * Submit builder onboarding step 2 (Company Details)
 */
export interface BuilderOnboardingStep2Data {
  step: 2;
  user_id: string;
  company_type_id: string;
  year: number;
  logo_url: string;
  address_line1: string;
  address_line2?: string;
  city_id: string;
  state_id: string;
  country_id: string;
  postal_code: string;
}

/**
 * Submit builder onboarding step 3 (Service Geography)
 */
export interface ServiceLocation {
  country_id: string;
  project_name: string;
  location_type: 'state' | 'city';
  state_id: string | null;
  city_id: string | null;
}

export interface BuilderOnboardingStep3Data {
  step: 3;
  user_id: string;
  no_of_service_locations: number;
  service_locations: ServiceLocation[];
}

/**
 * Submit builder onboarding step 4 (Authorized Contacts)
 */
export interface ContactPerson {
  name: string;
  role_type_id: string;
  contact_no: string;
  email_id: string;
}

export interface BuilderOnboardingStep4Data {
  step: 4;
  user_id: string;
  contact_persons: ContactPerson[];
}

/**
 * Submit builder onboarding data
 */
/**
 * Fetch builder onboarding data
 */
export const fetchBuilderOnboarding = async (userId: string): Promise<any> => {
  const agentApiBaseUrl = import.meta.env.VITE_AGENT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  const response = await fetch(`${agentApiBaseUrl}/api/v1/agent/builder/onboarding/?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Builder onboarding fetch API error:', response.status, errorText);
    throw new Error(`Failed to fetch onboarding data: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Builder onboarding fetch API response:', result);
  return result;
};

export const submitBuilderOnboarding = async (
  data: BuilderOnboardingStep1Data | BuilderOnboardingStep2Data | BuilderOnboardingStep3Data | BuilderOnboardingStep4Data
): Promise<any> => {
  const agentApiBaseUrl = import.meta.env.VITE_AGENT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  const auth = getAuthorizationHeader();
  
  console.log('Submitting builder onboarding data:', {
    step: data.step,
    url: `${agentApiBaseUrl}/api/v1/agent/builder/onboarding/`,
    hasAuth: !!auth,
  });
  
  const response = await fetch(`${agentApiBaseUrl}/api/v1/agent/builder/onboarding/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Builder onboarding API error:', response.status, errorText);
    throw new Error(`Failed to submit onboarding data: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Builder onboarding API response:', result);
  return result;
};

/**
 * Send message to Gemini AI API for chatbot responses
 * @param {string} message - User's message
 * @param {string} [context] - Optional context about the conversation
 * @returns {Promise<string>} - AI response text
 */
export const sendToGeminiAI = async (message: string, context?: string): Promise<string> => {
  console.log('Starting Gemini API call...');
  
  try {
    console.log('Trying backend API endpoint...');
    // First try the backend API endpoint
    const response = await api.post('/common/ai/chat/', {
      message: message,
      context: context || 'You are VistaView AI, a comprehensive real estate and home solutions assistant. You can help with: Real Estate (finding properties, locations, prices, and features), Products (browsing furniture, appliances, flooring, and home items), Warranty (information about product warranties and guarantees), and Insurance (product protection and insurance options). IMPORTANT: Use ONLY *asterisks* for emphasis. Do NOT use **double asterisks** or any other formatting. Replace any bold formatting with single asterisks.',
      model: 'gemini'
    });
    
    console.log('Backend API response:', response.data);
    return response.data.response || response.data.message || 'I apologize, but I could not process your request at the moment.';
  } catch (error) {
    console.error('Backend Gemini API error:', error);
    
    // Fallback: Try direct Gemini API if backend is not available
    try {
      console.log('Trying direct Gemini API...');
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('Gemini API key available:', !!geminiApiKey);
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
      }
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `You are VistaView AI, a helpful real estate assistant. Help users find properties, answer questions about real estate, and provide information about locations, prices, and property features.

            FORMAT:
            - Use standard Markdown for emphasis and lists (bold, italics, bullet points)
            - Keep responses simple and clean

            ${context ? `Previous conversation context:\n${context}\n\n` : ''}

            User message: ${message}

            Please provide a helpful response as a real estate assistant using standard Markdown.`
          }]
        }]
      };
      
      console.log('Direct API request body:', requestBody);
      
      // Try different model names in order of preference
      const models = ['gemini-2.5-flash'];
      let lastError = null;
      
      for (const model of models) {
        try {
          console.log(`Trying model: ${model}`);
          
          const directResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });
          
          console.log(`Model ${model} response status:`, directResponse.status);
          
          if (!directResponse.ok) {
            const errorText = await directResponse.text();
            console.error(`Model ${model} error response:`, errorText);
            lastError = new Error(`Model ${model} error: ${directResponse.status} - ${errorText}`);
            continue; // Try next model
          }
          
          const data = await directResponse.json();
          console.log(`Model ${model} response data:`, data);
          
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (aiResponse) {
            console.log(`Successfully got AI response from ${model}:`, aiResponse);
            return aiResponse;
          } else {
            console.error(`No AI response in data from ${model}:`, data);
            lastError = new Error(`No response from ${model} - check API key and quota`);
            continue; // Try next model
          }
        } catch (modelError) {
          console.error(`Model ${model} failed:`, modelError);
          lastError = modelError;
          continue; // Try next model
        }
      }
      
      // If all models failed, throw the last error
      throw lastError || new Error('All Gemini models failed');
      
    } catch (directError) {
      console.error('Direct Gemini API error:', directError);
      if (directError instanceof Error) {
        throw new Error(`Direct API failed: ${directError.message}`);
      } else {
        throw new Error('Direct API failed with unknown error');
      }
    }
  }
};

/**
 * Search properties based on location and other criteria
 * @param {string} location - Location to search for (e.g., "New York", "Brooklyn")
 * @param {object} filters - Additional filters like price, beds, baths
 * @returns {Promise<any[]>} - Array of matching properties
 */
export const searchProperties = async (location: string = '', filters: any = {}): Promise<any[]> => {
  try {
    // Import properties data
    const propertiesJson = await import('../v3/data/properties.json');
    const { processProperties } = await import('../v3/utils/imageMapping');
    const allProperties = processProperties(propertiesJson.default);
    
    // If no location specified, return all properties
    if (!location.trim()) {
      return allProperties;
    }
    
    // Filter properties based on location and other criteria
    let filteredProperties = allProperties.filter((property: any) => {
      // Location filter (case insensitive)
      const locationMatch = property.location.toLowerCase().includes(location.toLowerCase()) ||
                           property.title.toLowerCase().includes(location.toLowerCase());
      
      if (!locationMatch) return false;
      
      // Additional filters
      if (filters.priceMin && property.price < filters.priceMin) return false;
      if (filters.priceMax && property.price > filters.priceMax) return false;
      if (filters.bedsMin && property.beds < filters.bedsMin) return false;
      if (filters.bedsMax && property.beds > filters.bedsMax) return false;
      if (filters.bathsMin && property.baths < filters.bathsMin) return false;
      if (filters.bathsMax && property.baths > filters.bathsMax) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      if (filters.listingType && property.listingType !== filters.listingType) return false;
      
      return true;
    });
    
    // Sort by price (low to high) by default
    filteredProperties.sort((a: any, b: any) => a.price - b.price);
    
    // Limit to top 6 results for chatbot display
    return filteredProperties.slice(0, 6);
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
};

/**
 * Geocoding API response types
 */
export interface GeocodingFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    id: string;
    gid: string;
    layer: string;
    source: string;
    source_id: string;
    country_code: string;
    name: string;
    confidence: number;
    match_type: string;
    accuracy: string;
    country: string;
    country_gid: string;
    country_a: string;
    region?: string;
    region_gid?: string;
    region_a?: string;
    county?: string;
    county_gid?: string;
    county_a?: string;
    locality?: string;
    locality_gid?: string;
    continent: string;
    continent_gid: string;
    label: string;
  };
  bbox: [number, number, number, number];
}

export interface GeocodingResponse {
  geocoding: {
    version: string;
    attribution: string;
    query: {
      text: string;
      size: number;
      layers: string[];
      private: boolean;
      'boundary.country': string[];
      lang: {
        name: string;
        iso6391: string;
        iso6393: string;
        via: string;
        defaulted: boolean;
      };
      querySize: number;
      parser: string;
      parsed_text: {
        street?: string;
        city?: string;
      };
    };
    warnings: string[];
    engine: {
      name: string;
      author: string;
      version: string;
    };
    timestamp: number;
  };
  type: string;
  features: GeocodingFeature[];
  bbox: [number, number, number, number];
}

/**
 * Search for address suggestions using Geocode.earth API
 * @param {string} text - The search text
 * @param {string} [country] - Country code (e.g., 'IN', 'US')
 * @param {number} [size] - Number of results to return (default: 10)
 * @returns {Promise<GeocodingResponse>} - API response with address suggestions
 */
export const searchAddressSuggestions = async (
  text: string,
  country: string = 'IN',
  size: number = 10
): Promise<GeocodingResponse> => {
  const apiKey = import.meta.env.VITE_GEOCODE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Geocode API key not configured. Please add VITE_GEOCODE_API_KEY to your environment variables.');
  }

  const params = new URLSearchParams({
    text: text,
    'boundary.country': country,
    api_key: apiKey,
    size: size.toString()
  });

  const auth = getAuthorizationHeader();
  const response = await fetch(`https://api.geocode.earth/v1/search?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};

/**
 * Transcribe audio file using the backend API
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<any>} - API response with transcribed text
 */
export const transcribeAudio = async (audioFile: File): Promise<any> => {
  const formData = new FormData();
  formData.append('audio', audioFile);

  const response = await api.post('/common/audio/transcribe/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Upload file to the API with path parameter and progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored (e.g., "builder/onboarding/certificates")
 * @param {function} onProgress - Optional callback function to track upload progress (receives percentage 0-100)
 * @returns {Promise<string | null>} - The uploaded file URL or null if upload fails
 */
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('path', path);
  
  try {
    const response = await api.post('/common/file/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    
    if (response.data.status_code === 200) {
      // Ensure progress is 100% when complete
      if (onProgress) {
        onProgress(100);
      }
      return response.data?.data?.files?.[0]?.url || null;
    }
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Validate file format and size
 * @param {File} file - The file to validate
 * @param {string[]} allowedExtensions - Array of allowed file extensions (e.g., ['.pdf', '.jpg', '.png'])
 * @param {number} maxSizeBytes - Maximum file size in bytes
 * @returns {{ valid: boolean; error?: string }} - Validation result
 */
export const validateFile = (
  file: File,
  allowedExtensions: string[],
  maxSizeBytes: number
): { valid: boolean; error?: string } => {
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed formats: ${allowedExtensions.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB} MB`,
    };
  }

  return { valid: true };
};

export default api; 

/**
 * Use Gemini to extract structured filters from a property-related prompt.
 * Optionally provide a compact list of properties (id, title, location, price, beds, baths, propertyType)
 * so the model can pick direct matches by id/title and suggest filters.
 */
export interface AIPropertyExtraction {
  intent?: 'show_one' | 'search' | 'media' | 'other';
  propertyId?: number;
  titleText?: string;
  locationText?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  amenities?: string[];
  wantsPhotos?: boolean;
  wantsVideos?: boolean;
  wantsFloorplans?: boolean;
  wantsVRTour?: boolean;
}

export const extractPropertyQueryAI = async (
  message: string,
  compactProperties?: Array<{
    id: number;
    title: string;
    location: string;
    price: number;
    beds: number;
    baths: number;
    propertyType: string;
  }>
): Promise<AIPropertyExtraction | null> => {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiApiKey) return null;

    const schema = {
      intent: "show_one|search|media|other",
      propertyId: "number?",
      titleText: "string?",
      locationText: "string?",
      priceMin: "number?",
      priceMax: "number?",
      beds: "number?",
      baths: "number?",
      propertyType: "string?",
      amenities: "string[]?",
      wantsPhotos: "boolean?",
      wantsVideos: "boolean?",
      wantsFloorplans: "boolean?",
      wantsVRTour: "boolean?"
    };

    const propNote = compactProperties && compactProperties.length
      ? `Here is a compact property list you may use to resolve direct references by id/title and to infer filters. Use it only for selection, do not hallucinate fields.
PROPERTIES_JSON = ${JSON.stringify(compactProperties).slice(0, 9000)}
`
      : '';

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a real estate query parser. Extract structured filters from the user's message.
Return STRICT JSON only, matching this TypeScript-like schema (omit undefined fields):
${JSON.stringify(schema, null, 2)}

Rules:
- intent: 'show_one' if the user refers to a specific property (by id or exact title), 'media' if they ask for photos/videos/floorplans/vr, 'search' if they describe filters, otherwise 'other'.
- propertyId: parse integers like "property 12", "id 12", "#12" if present.
- titleText: if an explicit property title is mentioned exactly.
- locationText: a short area/borough/city phrase if present.
- priceMin/priceMax: infer ranges from words like between/under/over.
- beds/baths/propertyType/amenities: parse if present in the message.
- wantsPhotos/wantsVideos/wantsFloorplans/wantsVRTour: set true if user requests these.
- DO NOT include any commentary. Output only JSON.

${propNote}

USER_MESSAGE = ${message}`
        }]
      }]
    };

    const model = 'gemini-2.5-flash';
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return null;
    // Try to parse JSON safely (strip possible markdown fences)
    const jsonText = text.trim().replace(/^```json\s*|```$/g, '').trim();
    try {
      const parsed = JSON.parse(jsonText);
      return parsed as AIPropertyExtraction;
    } catch {
      // Try to find first JSON block
      const m = jsonText.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          return JSON.parse(m[0]) as AIPropertyExtraction;
        } catch {}
      }
    }
    return null;
  } catch {
    return null;
  }
};
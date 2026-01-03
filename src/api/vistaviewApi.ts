// ============================================================================
// VISTAVIEW API CLIENT
// Frontend can import this to connect to backend
// ============================================================================

const API_BASE = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3001';

// Auth
export const authApi = {
    startOtp: async (phone: string, type = 'vendor') => {
        const res = await fetch(`${API_BASE}/api/auth/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, type })
        });
        return res.json();
    },
    verifyOtp: async (session_id: string, otp: string) => {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id, otp })
        });
        return res.json();
    }
};

// Vendors
export const vendorApi = {
    create: async (data: any) => {
        const res = await fetch(`${API_BASE}/api/vendors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    list: async (params?: any) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/api/vendors?${query}`);
        return res.json();
    },
    get: async (id: string) => {
        const res = await fetch(`${API_BASE}/api/vendors/${id}`);
        return res.json();
    }
};

// Builders
export const builderApi = {
    create: async (data: any) => {
        const res = await fetch(`${API_BASE}/api/builders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    list: async () => {
        const res = await fetch(`${API_BASE}/api/builders`);
        return res.json();
    }
};

// Catalog
export const catalogApi = {
    upload: async (vendor_id: string, catalog_name: string, file_data: string, file_type: string) => {
        const res = await fetch(`${API_BASE}/api/catalog/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendor_id, catalog_name, file_data, file_type })
        });
        return res.json();
    },
    process: async (id: string) => {
        const res = await fetch(`${API_BASE}/api/catalog/${id}/process`, { method: 'POST' });
        return res.json();
    },
    getItems: async (id: string, page = 1, limit = 50) => {
        const res = await fetch(`${API_BASE}/api/catalog/${id}/items?page=${page}&limit=${limit}`);
        return res.json();
    }
};

// AI Memory
export const aiMemoryApi = {
    store: async (memory_type: string, context: string, learned_data: any, confidence_score?: number) => {
        const res = await fetch(`${API_BASE}/api/ai/memory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memory_type, context, learned_data, confidence_score })
        });
        return res.json();
    },
    getByType: async (type: string, limit = 50) => {
        const res = await fetch(`${API_BASE}/api/ai/memory/${type}?limit=${limit}`);
        return res.json();
    },
    search: async (query: string, limit = 10) => {
        const res = await fetch(`${API_BASE}/api/ai/memory/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit })
        });
        return res.json();
    }
};

// Learning
export const learningApi = {
    getSessions: async (status?: string) => {
        const params = status ? `?status=${status}` : '';
        const res = await fetch(`${API_BASE}/api/ai/learning/sessions${params}`);
        return res.json();
    }
};

// Training Stats
export const trainingApi = {
    getStats: async () => {
        const res = await fetch(`${API_BASE}/api/ai/training/stats`);
        return res.json();
    }
};

// Market
export const marketApi = {
    getSources: async () => {
        const res = await fetch(`${API_BASE}/api/market/sources`);
        return res.json();
    },
    compare: async (product_name: string, category: string) => {
        const res = await fetch(`${API_BASE}/api/market/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_name, category })
        });
        return res.json();
    }
};

// Voice Commands
export const voiceApi = {
    sendCommand: async (command_text: string, session_id?: string) => {
        const res = await fetch(`${API_BASE}/api/voice/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command_text, session_id })
        });
        return res.json();
    }
};

// Summary
export const summaryApi = {
    generate: async (entity_type: string, entity_id: string, summary_type = 'brief') => {
        const res = await fetch(`${API_BASE}/api/ai/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entity_type, entity_id, summary_type })
        });
        return res.json();
    }
};

// Services
export const servicesApi = {
    list: async () => {
        const res = await fetch(`${API_BASE}/api/services`);
        return res.json();
    },
    get: async (slug: string) => {
        const res = await fetch(`${API_BASE}/api/services/${slug}`);
        return res.json();
    }
};

// Health Check
export const healthCheck = async () => {
    try {
        const res = await fetch(`${API_BASE}/health`);
        return res.json();
    } catch {
        return { status: 'offline' };
    }
};

export default {
    auth: authApi,
    vendor: vendorApi,
    builder: builderApi,
    catalog: catalogApi,
    aiMemory: aiMemoryApi,
    learning: learningApi,
    training: trainingApi,
    market: marketApi,
    voice: voiceApi,
    summary: summaryApi,
    services: servicesApi,
    healthCheck
};

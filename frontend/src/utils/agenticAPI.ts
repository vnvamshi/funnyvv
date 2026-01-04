/**
 * VISTAVIEW AGENTIC API
 * Connects frontend to backend (port 1117)
 */

const AGENTIC_API = 'http://localhost:1117/api';

// Send voice/text input to backend
export async function sendToAgentic(text: string, userType: string = 'visitor', pageRoute?: string) {
    try {
        const response = await fetch(`${AGENTIC_API}/ledger/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_type: userType,
                raw_transcript: text,
                page_route: pageRoute || window.location.pathname
            })
        });
        return response.json();
    } catch (error) {
        console.error('[AgenticAPI] Send error:', error);
        return null;
    }
}

// Get training stats (for AI Learning panel)
export async function getTrainingStats() {
    try {
        const response = await fetch(`${AGENTIC_API}/ai/training/stats`);
        return response.json();
    } catch (error) {
        console.error('[AgenticAPI] Stats error:', error);
        return { interactions: 0, patterns: 0, webCrawls: 0, confidence: 0 };
    }
}

// Get agentic bar configuration
export async function getAgenticBarConfig() {
    try {
        const response = await fetch(`${AGENTIC_API}/agentic-bar/config`);
        return response.json();
    } catch (error) {
        return {};
    }
}

// Save to system memory
export async function saveMemory(key: string, value: string, type: string = 'user', importance: number = 5) {
    try {
        const response = await fetch(`${AGENTIC_API}/memory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memory_type: type, memory_key: key, memory_value: value, importance })
        });
        return response.json();
    } catch (error) {
        return null;
    }
}

// Search knowledge base
export async function searchKnowledge(query: string) {
    try {
        const response = await fetch(`${AGENTIC_API}/knowledge/search?q=${encodeURIComponent(query)}`);
        return response.json();
    } catch (error) {
        return [];
    }
}

export default {
    sendToAgentic,
    getTrainingStats,
    getAgenticBarConfig,
    saveMemory,
    searchKnowledge
};

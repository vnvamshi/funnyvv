// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW CORE RULES ENGINE
// This file MUST be imported into EVERY script, component, and module
// ═══════════════════════════════════════════════════════════════════════════════
//
// HOW TO USE:
// import { RULES, validateChange, enforceRules } from './core/rules-engine';
//
// Before ANY change:
// if (!validateChange('ui', myChange)) return;
//
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// IMMUTABLE THEME (NEVER CHANGE THESE VALUES)
// ═══════════════════════════════════════════════════════════════════════════════
export const THEME = Object.freeze({
  colors: {
    teal: {
      primary: '#004236',
      secondary: '#007E67',
      light: '#00A86B',
      gradient: 'linear-gradient(135deg, #004236 0%, #007E67 100%)'
    },
    gold: {
      primary: '#905E26',
      secondary: '#F5EC9B',
      accent: '#B8860B',
      gradient: 'linear-gradient(135deg, #905E26 0%, #B8860B 100%)'
    },
    white: '#FFFFFF',
    black: '#1A1A1A',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      500: '#6B7280',
      900: '#111827'
    }
  },
  fonts: {
    primary: '"Poppins", "Inter", sans-serif',
    secondary: '"Playfair Display", serif',
    mono: '"Fira Code", monospace'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE MAP (PERMANENT - NEVER ADD DUPLICATES)
// ═══════════════════════════════════════════════════════════════════════════════
export const ROUTES = Object.freeze({
  home: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  partners: '/partners',
  lendWithUs: '/lend-with-us',
  realEstate: '/real-estate',
  catalog: '/catalog',
  interior: '/interior',
  services: '/services',
  signIn: '/sign-in',
  // V3 routes
  v3Landing: '/v3',
  v3About: '/v3/about',
  v3Catalog: '/v3/catalog'
});

// ═══════════════════════════════════════════════════════════════════════════════
// UI ACTION BUS (STANDARD ACTIONS)
// ═══════════════════════════════════════════════════════════════════════════════
export const UI_ACTIONS = Object.freeze({
  HIGHLIGHT: 'UI_HIGHLIGHT',
  MOVE_CURSOR: 'UI_MOVE_CURSOR',
  CLICK: 'UI_CLICK',
  SCROLL_TO: 'UI_SCROLL_TO',
  OPEN_MODAL: 'UI_OPEN_MODAL',
  CLOSE_MODAL: 'UI_CLOSE_MODAL',
  NAVIGATE: 'UI_NAVIGATE',
  BACK: 'UI_BACK',
  SPEAK: 'UI_SPEAK',
  STOP_SPEAK: 'UI_STOP_SPEAK',
  PAUSE: 'UI_PAUSE',
  RESUME: 'UI_RESUME'
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════
export const VOICE = Object.freeze({
  wakePhrase: 'Hey Vista',
  interruptPhrases: ['hey', 'stop', 'wait', 'pause', 'hold on'],
  resumePhrases: ['continue', 'go on', 'okay', 'yes', 'proceed'],
  closePhrases: ['close', 'exit', 'cancel', 'back', 'go back'],
  tts: {
    rate: 1.07,      // 7% faster
    pitch: 0.95,     // Slightly lower (more confident)
    volume: 1.0,
    voice: 'en-US'
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM DATA (CEO & FOUNDERS)
// ═══════════════════════════════════════════════════════════════════════════════
export const TEAM = Object.freeze({
  ceo: {
    name: 'Vamshi Vuppaladhadium',
    title: 'Founder & CEO',
    image: '/team/vamshi.jpg',
    highlight: true,
    bio: `Vamshi Vuppaladhadium is the visionary founder and CEO of VistaView, pioneering the future of real estate and home services through AI-powered innovation. With a passion for transforming how people discover, purchase, and personalize their homes, Vamshi envisions VistaView as "The Amazon of Real Estate" – a one-stop platform where buyers, sellers, vendors, and builders converge seamlessly.`,
    vision: `"Our mission is to democratize access to quality homes and home services. We're building an AI-powered ecosystem that learns, adapts, and serves every stakeholder – from first-time buyers to seasoned investors, from local contractors to global manufacturers. VistaView isn't just a platform; it's the future of how we live."`,
    message: `Welcome to VistaView! I founded this company with a simple belief: finding and creating your perfect home should be effortless, transparent, and even enjoyable. Our AI assistant Mr. V is always here to help you navigate your journey. Whether you're searching for your dream property, furnishing your space, or building the next landmark – we've got you covered. Thank you for being part of our vision.`,
    achievements: [
      'Founded VistaView with the vision of revolutionizing real estate',
      'Pioneered AI-driven property matching and recommendation',
      'Built partnerships with leading vendors and builders nationwide',
      'Created the innovative "1-hour storefront" vendor onboarding system'
    ],
    social: {
      linkedin: 'https://linkedin.com/in/vamshi-vuppaladhadium',
      twitter: 'https://twitter.com/vamshi_vista'
    }
  },
  coFounders: [
    {
      name: 'Vikram',
      title: 'Co-Founder & CTO',
      image: '/team/vikram.jpg',
      highlight: false,
      shortBio: 'Technology visionary leading our AI and engineering teams.',
      tags: ['AI/ML', 'Architecture', 'Engineering']
    },
    {
      name: 'Sunita',
      title: 'Co-Founder & COO',
      image: '/team/sunita.jpg',
      highlight: false,
      shortBio: 'Operations expert driving business growth and partnerships.',
      tags: ['Operations', 'Strategy', 'Partnerships']
    }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════
export const VISTAVIEW = Object.freeze({
  name: 'VistaView',
  tagline: 'The Amazon of Real Estate',
  description: `VistaView is an AI-powered real estate and home services marketplace that brings together buyers, sellers, vendors, and builders on one seamless platform. Our intelligent assistant Mr. V guides users through every step – from finding the perfect property to furnishing and renovating their dream home.`,
  mission: `To revolutionize the real estate and home services industry by creating an intelligent, all-in-one platform that makes buying, selling, and improving homes effortless for everyone.`,
  vision: `A world where finding your perfect home, furnishing it, and managing it is as simple as a conversation with AI.`,
  values: [
    { name: 'Innovation', description: 'Pushing boundaries with AI-first solutions' },
    { name: 'Transparency', description: 'Clear pricing, honest recommendations' },
    { name: 'Accessibility', description: 'Quality homes and services for everyone' },
    { name: 'Excellence', description: 'The highest standards in everything we do' }
  ],
  features: [
    { name: 'AI-Powered Search', description: 'Mr. V understands natural language and learns your preferences' },
    { name: 'One-Hour Storefront', description: 'Vendors go live in under 60 minutes' },
    { name: 'Smart Matching', description: 'Properties, products, and services matched to your needs' },
    { name: 'Voice Control', description: 'Navigate the entire platform hands-free' },
    { name: '24/7 Learning', description: 'Our AI continuously improves to serve you better' }
  ],
  userRoles: [
    { role: 'Buyer', icon: '🏠', description: 'Find and purchase your dream home' },
    { role: 'Renter', icon: '🔑', description: 'Discover perfect rental properties' },
    { role: 'Vendor', icon: '🏪', description: 'Sell products and services to homeowners' },
    { role: 'Builder', icon: '🏗️', description: 'Showcase projects and connect with buyers' },
    { role: 'Agent', icon: '🏢', description: 'Manage listings and grow your business' },
    { role: 'Admin', icon: '👨‍💼', description: 'Oversee platform operations' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════════
const RULES = {
  // UI Rules
  ui: {
    themeImmutable: true,        // NEVER change theme colors
    additiveOnly: true,          // Only ADD, never replace
    noFullPageReload: true,      // Client-side navigation only
    widgetGlobal: true,          // Widget on every page
    persistWidgetState: true,    // Widget state persists across routes
    animatedCursor: true,        // Cursor moves with intent
    stackBasedHistory: true      // Predictable back behavior
  },
  
  // Learning Rules
  learning: {
    neverStop: true,             // Learning backend runs 24/7
    logEverything: true,         // All events must be logged
    noDataLoss: true,            // UI changes cannot erase data
    trackGoldenConversations: true,
    replayFailures: true
  },
  
  // Voice Rules
  voice: {
    instantInterrupt: true,      // Interrupt stops TTS immediately
    confirmResume: true,         // Ask before resuming
    explainActions: true,        // Say what you're doing
    askPermission: true          // Ask before reading aloud
  },
  
  // Modal Rules
  modal: {
    alwaysHasTeleprompter: true, // Every modal has AI bar
    closeOnCommand: true,        // "close" always works
    backToParent: true           // Close returns to previous state
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates a proposed change against the rules
 * @param category - 'ui', 'learning', 'voice', or 'modal'
 * @param change - description of the change
 * @returns boolean - true if change is allowed
 */
export function validateChange(category, change) {
  console.log(`[RULES] Validating ${category} change:`, change);
  
  // Check if category exists
  if (!RULES[category]) {
    console.warn(`[RULES] Unknown category: ${category}`);
    return true; // Allow unknown categories (be permissive)
  }
  
  const rules = RULES[category];
  
  // UI validations
  if (category === 'ui') {
    // Check for theme modifications
    if (change.modifiesTheme) {
      console.error('[RULES] ❌ BLOCKED: Theme modifications are not allowed');
      return false;
    }
    
    // Check for full page reloads
    if (change.causesFullReload) {
      console.error('[RULES] ❌ BLOCKED: Full page reloads not allowed');
      return false;
    }
    
    // Check for widget removal
    if (change.removesWidget) {
      console.error('[RULES] ❌ BLOCKED: Cannot remove global widget');
      return false;
    }
  }
  
  // Learning validations
  if (category === 'learning') {
    // Check for data loss
    if (change.erasesData) {
      console.error('[RULES] ❌ BLOCKED: Cannot erase learning data');
      return false;
    }
    
    // Check for stopping learning
    if (change.stopsLearning) {
      console.error('[RULES] ❌ BLOCKED: Learning must never stop');
      return false;
    }
  }
  
  console.log('[RULES] ✅ Change validated');
  return true;
}

/**
 * Logs an event (Rule: if it isn't logged, it didn't happen)
 */
export function logEvent(type, data) {
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    data
  };
  
  // Log to console
  console.log(`[EVENT] ${type}:`, data);
  
  // Send to backend
  try {
    fetch('http://localhost:3005/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {}); // Silent fail
  } catch (e) {}
  
  return event;
}

/**
 * Execute UI action via the action bus
 */
export function executeUIAction(action, target, context = {}) {
  if (!UI_ACTIONS[action.replace('UI_', '')]) {
    console.warn(`[UI_ACTION] Unknown action: ${action}`);
    return null;
  }
  
  const event = {
    action,
    target,
    context,
    timestamp: new Date().toISOString()
  };
  
  logEvent('UI_ACTION', event);
  
  // Dispatch custom event for UI to handle
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vistaview-ui-action', { detail: event }));
  }
  
  return event;
}

/**
 * Get the script header that must be prepended to all scripts
 */
export function getScriptHeader() {
  return `
// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW SCRIPT - GOLDEN RULES ENFORCED
// ═══════════════════════════════════════════════════════════════════════════════
// 
// BEFORE MODIFYING THIS FILE, REMEMBER:
// 
// 🎨 UI RULES:
//    - Theme is IMMUTABLE (Teal #004236, Gold #B8860B)
//    - ADDITIVE UI only - never replace existing components
//    - Widget is GLOBAL - must exist on every page
//    - No full page reloads
// 
// 🧠 LEARNING RULES:
//    - Learning backend NEVER stops
//    - Log EVERYTHING (if not logged, didn't happen)
//    - UI changes cannot erase data
// 
// 🎤 VOICE RULES:
//    - Interrupt stops TTS immediately
//    - Always confirm before resuming
//    - Explain actions ("opening products...")
// 
// 📦 BACKUP RULES:
//    - NEVER delete without backup
//    - Create version before modifying
// 
// ═══════════════════════════════════════════════════════════════════════════════
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
export default {
  THEME,
  ROUTES,
  UI_ACTIONS,
  VOICE,
  TEAM,
  VISTAVIEW,
  RULES,
  validateChange,
  logEvent,
  executeUIAction,
  getScriptHeader
};

// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW KNOWLEDGE BASE - RAG Data
// ═══════════════════════════════════════════════════════════════════════════════

export const countries = [
  { code: '+1', name: 'USA', flag: '🇺🇸', currency: 'USD', tax: 0, taxName: 'Sales Tax', einFormat: 'XX-XXXXXXX', einLabel: 'EIN' },
  { code: '+91', name: 'India', flag: '🇮🇳', currency: 'INR', tax: 18, taxName: 'GST 18%', einFormat: 'XXXXXXXXXXXX', einLabel: 'GST Number' },
  { code: '+44', name: 'UK', flag: '🇬🇧', currency: 'GBP', tax: 20, taxName: 'VAT 20%', einFormat: 'GB XXXXXXXXX', einLabel: 'VAT Number' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', currency: 'AED', tax: 5, taxName: 'VAT 5%', einFormat: 'XXXXXXXXXXXXXXX', einLabel: 'TRN' },
];

export const roles = [
  { id: 'customer', name: 'Customer', icon: '🏠', color: '#4CAF50', desc: 'Browse and explore properties' },
  { id: 'buyer', name: 'Buyer', icon: '🛒', color: '#2196F3', desc: 'Purchase property or products' },
  { id: 'investor', name: 'Investor', icon: '💰', color: '#B8860B', desc: 'Investment opportunities' },
  { id: 'agent', name: 'Agent', icon: '👔', color: '#9C27B0', desc: 'Real estate professional' },
  { id: 'builder', name: 'Builder', icon: '🏗️', color: '#FF5722', desc: 'Property developer' },
  { id: 'vendor', name: 'Vendor', icon: '🏭', color: '#607D8B', desc: 'Product supplier' },
];

export const vendorCategories = [
  { id: 'furniture', name: 'Furniture', icon: '🛋️' },
  { id: 'appliances', name: 'Appliances', icon: '🔌' },
  { id: 'decor', name: 'Home Decor', icon: '🖼️' },
  { id: 'flooring', name: 'Flooring', icon: '🪵' },
  { id: 'lighting', name: 'Lighting', icon: '💡' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚿' },
];

export const teamMembers = [
  { id: 'vamshi', name: 'Vamshi V', title: 'CEO & Founder', icon: '👨‍💼', color: '#B8860B' },
  { id: 'vikram', name: 'Vikram J', title: 'Investor', icon: '💼', color: '#4CAF50' },
  { id: 'krishna', name: 'Krishna Y', title: 'Tech Lead', icon: '👨‍💻', color: '#2196F3' },
  { id: 'sunitha', name: 'Sunitha T', title: 'Operations', icon: '👩‍💼', color: '#9C27B0' },
];

export const howItWorks = [
  { step: 1, title: 'Discover', icon: '🔍', desc: 'AI-powered search finds your perfect match' },
  { step: 2, title: 'Explore', icon: '🏠', desc: '3D virtual tours from anywhere' },
  { step: 3, title: 'Connect', icon: '🤝', desc: 'Chat with verified professionals' },
  { step: 4, title: 'Transact', icon: '✨', desc: 'Secure, seamless closing' },
];

export const catalogSteps = [
  { step: 1, name: 'Parse', icon: '📄', desc: 'Extract images & text from PDF' },
  { step: 2, name: 'Crop', icon: '✂️', desc: 'Isolate individual products' },
  { step: 3, name: 'Upscale', icon: '🔍', desc: 'Enhance to 4x resolution' },
  { step: 4, name: 'Describe', icon: '📝', desc: 'AI generates descriptions' },
  { step: 5, name: 'List', icon: '🏷️', desc: 'Create marketplace listings' },
];

export const learnedPatterns = {
  zillow: ['Property listings: price, beds, baths, sqft, photos', 'Virtual tours +40% engagement'],
  ikea: ['Products: dimensions, materials, colors, room suggestions', 'AR preview +35% purchase intent'],
  general: ['Phone verification -90% fraud', 'Voice commands need confirmation', 'Auto-fill saves 60% time'],
};

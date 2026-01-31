// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW OPENCLAW SKILL
// Chat-based interface for furniture price comparison
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

const config = require('../skill.json').config;

// Simulated retailer data (in production, this would call the API)
const RETAILERS = {
  US: ['Amazon', 'Wayfair', 'IKEA', 'Target', 'Walmart', 'West Elm', 'Pottery Barn'],
  IN: ['Amazon India', 'Flipkart', 'Pepperfry', 'Urban Ladder', 'IKEA India'],
  UK: ['Amazon UK', 'Wayfair UK', 'IKEA UK', 'John Lewis', 'Made.com'],
  DE: ['Amazon Germany', 'IKEA Germany', 'OTTO'],
  FR: ['Amazon France', 'IKEA France', 'Maisons du Monde'],
};

const REGIONS = {
  'us': 'US', 'usa': 'US', 'united states': 'US', 'america': 'US',
  'india': 'IN', 'in': 'IN',
  'uk': 'UK', 'united kingdom': 'UK', 'britain': 'UK', 'england': 'UK',
  'germany': 'DE', 'de': 'DE', 'deutschland': 'DE',
  'france': 'FR', 'fr': 'FR',
};

// Session storage (per user)
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { region: config.defaultRegion });
  }
  return sessions.get(userId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

async function searchFurniture(context, params) {
  const { item } = params;
  const session = getSession(context.userId);
  const region = session.region;
  const retailers = RETAILERS[region] || RETAILERS['US'];

  // Generate search links
  const searchUrl = `${config.vistaviewUrl}/compare?q=${encodeURIComponent(item)}`;

  let response = `🔍 **Searching for "${item}"**\n\n`;
  response += `Found in ${retailers.length} retailers in ${region}:\n\n`;

  retailers.slice(0, 5).forEach((ret, i) => {
    response += `${i + 1}. ${ret}\n`;
  });

  response += `\n🔗 **Compare all prices:**\n${searchUrl}\n\n`;
  response += `_Tip: Say "change region to India" to see Indian retailers_`;

  // Track the search
  try {
    await fetch(`${config.apiUrl}/api/analytics/affiliate-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerId: 'chat-search',
        searchQuery: item,
        region: region,
        referrer: context.platform
      })
    });
  } catch (e) {
    // Silent fail
  }

  return response;
}

async function compareRetailers(context, params) {
  const { retailer1, retailer2 } = params;

  let response = `📊 **${retailer1} vs ${retailer2}**\n\n`;

  // Generic comparison info
  const comparisons = {
    'amazon': { commission: '1-4%', shipping: 'Prime: Free 2-day', returns: '30 days' },
    'wayfair': { commission: '7%', shipping: 'Free over $35', returns: '30 days' },
    'ikea': { commission: '3%', shipping: 'Varies', returns: '365 days' },
    'flipkart': { commission: '6%', shipping: 'Free over ₹500', returns: '7-30 days' },
    'pepperfry': { commission: '8%', shipping: 'Free assembly', returns: '14 days' },
  };

  const r1 = retailer1.toLowerCase();
  const r2 = retailer2.toLowerCase();

  if (comparisons[r1]) {
    response += `**${retailer1}:**\n`;
    response += `• Shipping: ${comparisons[r1].shipping}\n`;
    response += `• Returns: ${comparisons[r1].returns}\n\n`;
  }

  if (comparisons[r2]) {
    response += `**${retailer2}:**\n`;
    response += `• Shipping: ${comparisons[r2].shipping}\n`;
    response += `• Returns: ${comparisons[r2].returns}\n\n`;
  }

  response += `🔗 Compare prices: ${config.vistaviewUrl}/compare`;

  return response;
}

async function setRegion(context, params) {
  const { region } = params;
  const session = getSession(context.userId);

  const normalizedRegion = REGIONS[region.toLowerCase()];

  if (normalizedRegion) {
    session.region = normalizedRegion;
    const retailers = RETAILERS[normalizedRegion] || [];

    let response = `✅ **Region set to ${normalizedRegion}**\n\n`;
    response += `You'll now see retailers like:\n`;
    retailers.slice(0, 4).forEach(r => {
      response += `• ${r}\n`;
    });
    response += `\n_Search for furniture to see prices!_`;

    return response;
  } else {
    return `❌ Sorry, I don't recognize that region. Try: US, India, UK, Germany, or France.`;
  }
}

async function getDeals(context) {
  const session = getSession(context.userId);
  const region = session.region;

  let response = `🔥 **Today's Hot Deals (${region})**\n\n`;

  // In production, this would fetch real deals
  const deals = [
    { item: 'Mid Century Sofa', discount: '30% off', store: 'Wayfair' },
    { item: 'Queen Bed Frame', discount: '25% off', store: 'Amazon' },
    { item: 'Dining Table Set', discount: '40% off', store: 'IKEA' },
  ];

  deals.forEach((deal, i) => {
    response += `${i + 1}. **${deal.item}**\n`;
    response += `   ${deal.discount} at ${deal.store}\n\n`;
  });

  response += `🔗 See all deals: ${config.vistaviewUrl}/compare`;

  return response;
}

async function showHelp(context) {
  let response = `🛋️ **VistaView Help**\n\n`;
  response += `I can help you compare furniture prices across 100+ retailers!\n\n`;
  response += `**Commands:**\n`;
  response += `• "find [item]" - Search for furniture\n`;
  response += `• "compare [store1] and [store2]" - Compare retailers\n`;
  response += `• "change region to [country]" - Switch region\n`;
  response += `• "deals" - See today's best deals\n\n`;
  response += `**Examples:**\n`;
  response += `• "find mid century sofa"\n`;
  response += `• "compare Amazon and Wayfair"\n`;
  response += `• "change region to India"\n\n`;
  response += `🌍 Available regions: US, India, UK, Germany, France`;

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  searchFurniture,
  compareRetailers,
  setRegion,
  getDeals,
  showHelp,

  // Main handler
  async handle(context, intent, params) {
    switch (intent) {
      case 'search_furniture':
        return searchFurniture(context, params);
      case 'compare_retailers':
        return compareRetailers(context, params);
      case 'set_region':
        return setRegion(context, params);
      case 'get_deals':
        return getDeals(context);
      case 'help':
        return showHelp(context);
      default:
        return showHelp(context);
    }
  }
};

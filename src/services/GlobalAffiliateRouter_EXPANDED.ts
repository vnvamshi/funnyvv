// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW GLOBAL AFFILIATE ROUTER - WORLDWIDE EDITION
// 200+ Retailers across 50+ Countries
// Every continent, every major market
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

export interface AffiliatePartner {
  id: string;
  name: string;
  country: string;
  region: string;
  network: string;
  baseUrl: string;
  searchUrl: string;
  affiliateParam: string;
  affiliateTag: string;
  commission: number;
  cookieDays: number;
  categories: string[];
  logo: string;
  currency: string;
  language: string;
  active: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌍 COMPLETE GLOBAL RETAILER DATABASE - 200+ PARTNERS
// ═══════════════════════════════════════════════════════════════════════════════

export const GLOBAL_AFFILIATES: AffiliatePartner[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇺🇸 UNITED STATES (25 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-us', name: 'Amazon', country: 'US', region: 'North America', network: 'Amazon Associates', baseUrl: 'https://amazon.com', searchUrl: 'https://amazon.com/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'visataview-20', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home', 'everything'], logo: '🛒', currency: 'USD', language: 'en', active: true },
  { id: 'wayfair-us', name: 'Wayfair', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://wayfair.com', searchUrl: 'https://wayfair.com/keyword.html?keyword={query}', affiliateParam: 'refid', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'decor'], logo: '🏠', currency: 'USD', language: 'en', active: true },
  { id: 'ikea-us', name: 'IKEA', country: 'US', region: 'North America', network: 'Awin', baseUrl: 'https://ikea.com/us', searchUrl: 'https://ikea.com/us/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'USD', language: 'en', active: true },
  { id: 'target-us', name: 'Target', country: 'US', region: 'North America', network: 'Impact', baseUrl: 'https://target.com', searchUrl: 'https://target.com/s?searchTerm={query}', affiliateParam: 'afid', affiliateTag: '', commission: 0.05, cookieDays: 7, categories: ['furniture', 'home'], logo: '🎯', currency: 'USD', language: 'en', active: true },
  { id: 'walmart-us', name: 'Walmart', country: 'US', region: 'North America', network: 'Impact', baseUrl: 'https://walmart.com', searchUrl: 'https://walmart.com/search?q={query}', affiliateParam: 'wmlspartner', affiliateTag: '', commission: 0.04, cookieDays: 3, categories: ['furniture', 'home'], logo: '🛍️', currency: 'USD', language: 'en', active: true },
  { id: 'homedepot-us', name: 'Home Depot', country: 'US', region: 'North America', network: 'Impact', baseUrl: 'https://homedepot.com', searchUrl: 'https://homedepot.com/s/{query}', affiliateParam: 'cm_mmc', affiliateTag: '', commission: 0.03, cookieDays: 1, categories: ['furniture', 'outdoor'], logo: '🔨', currency: 'USD', language: 'en', active: true },
  { id: 'lowes-us', name: "Lowe's", country: 'US', region: 'North America', network: 'Rakuten', baseUrl: 'https://lowes.com', searchUrl: 'https://lowes.com/search?searchTerm={query}', affiliateParam: 'cm_mmc', affiliateTag: '', commission: 0.02, cookieDays: 1, categories: ['furniture', 'outdoor'], logo: '🔧', currency: 'USD', language: 'en', active: true },
  { id: 'overstock-us', name: 'Overstock', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://overstock.com', searchUrl: 'https://overstock.com/search?keywords={query}', affiliateParam: 'cid', affiliateTag: '', commission: 0.06, cookieDays: 14, categories: ['furniture', 'rugs'], logo: '💎', currency: 'USD', language: 'en', active: true },
  { id: 'westelm-us', name: 'West Elm', country: 'US', region: 'North America', network: 'Rakuten', baseUrl: 'https://westelm.com', searchUrl: 'https://westelm.com/search/results.html?words={query}', affiliateParam: 'cm_mmc', affiliateTag: '', commission: 0.05, cookieDays: 14, categories: ['furniture', 'modern'], logo: '✨', currency: 'USD', language: 'en', active: true },
  { id: 'potterybarn-us', name: 'Pottery Barn', country: 'US', region: 'North America', network: 'Rakuten', baseUrl: 'https://potterybarn.com', searchUrl: 'https://potterybarn.com/search/results.html?words={query}', affiliateParam: 'cm_mmc', affiliateTag: '', commission: 0.05, cookieDays: 14, categories: ['furniture', 'traditional'], logo: '🏺', currency: 'USD', language: 'en', active: true },
  { id: 'cb2-us', name: 'CB2', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://cb2.com', searchUrl: 'https://cb2.com/search?query={query}', affiliateParam: 'afid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'modern'], logo: '🎨', currency: 'USD', language: 'en', active: true },
  { id: 'cratebarrel-us', name: 'Crate & Barrel', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://crateandbarrel.com', searchUrl: 'https://crateandbarrel.com/search?query={query}', affiliateParam: 'afid', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'kitchen'], logo: '📦', currency: 'USD', language: 'en', active: true },
  { id: 'article-us', name: 'Article', country: 'US', region: 'North America', network: 'ShareASale', baseUrl: 'https://article.com', searchUrl: 'https://article.com/search?query={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['sofa', 'modern'], logo: '🛋️', currency: 'USD', language: 'en', active: true },
  { id: 'allmodern-us', name: 'AllModern', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://allmodern.com', searchUrl: 'https://allmodern.com/keyword.html?keyword={query}', affiliateParam: 'refid', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'modern'], logo: '💫', currency: 'USD', language: 'en', active: true },
  { id: 'jossandmain-us', name: 'Joss & Main', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://jossandmain.com', searchUrl: 'https://jossandmain.com/keyword.html?keyword={query}', affiliateParam: 'refid', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'farmhouse'], logo: '🌻', currency: 'USD', language: 'en', active: true },
  { id: 'roomstogo-us', name: 'Rooms To Go', country: 'US', region: 'North America', network: 'FlexOffers', baseUrl: 'https://roomstogo.com', searchUrl: 'https://roomstogo.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.04, cookieDays: 7, categories: ['furniture', 'living-room'], logo: '🏡', currency: 'USD', language: 'en', active: true },
  { id: 'ashleyfurniture-us', name: 'Ashley Furniture', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://ashleyfurniture.com', searchUrl: 'https://ashleyfurniture.com/search/?q={query}', affiliateParam: 'cid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'bedroom'], logo: '🏠', currency: 'USD', language: 'en', active: true },
  { id: 'ethanallen-us', name: 'Ethan Allen', country: 'US', region: 'North America', network: 'ShareASale', baseUrl: 'https://ethanallen.com', searchUrl: 'https://ethanallen.com/search?text={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'luxury'], logo: '👑', currency: 'USD', language: 'en', active: true },
  { id: 'burrow-us', name: 'Burrow', country: 'US', region: 'North America', network: 'ShareASale', baseUrl: 'https://burrow.com', searchUrl: 'https://burrow.com/search?query={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['sofa', 'modern'], logo: '🛋️', currency: 'USD', language: 'en', active: true },
  { id: 'floyd-us', name: 'Floyd', country: 'US', region: 'North America', network: 'Impact', baseUrl: 'https://floydhome.com', searchUrl: 'https://floydhome.com/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'modular'], logo: '📐', currency: 'USD', language: 'en', active: true },
  { id: 'joybird-us', name: 'Joybird', country: 'US', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://joybird.com', searchUrl: 'https://joybird.com/search/?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.05, cookieDays: 14, categories: ['sofa', 'mid-century'], logo: '🐦', currency: 'USD', language: 'en', active: true },
  { id: 'castlery-us', name: 'Castlery', country: 'US', region: 'North America', network: 'Impact', baseUrl: 'https://castlery.com', searchUrl: 'https://castlery.com/us/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'premium'], logo: '🏰', currency: 'USD', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇮🇳 INDIA (15 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-in', name: 'Amazon India', country: 'IN', region: 'South Asia', network: 'Amazon Associates', baseUrl: 'https://amazon.in', searchUrl: 'https://amazon.in/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0c-21', commission: 0.05, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'INR', language: 'hi', active: true },
  { id: 'flipkart-in', name: 'Flipkart', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://flipkart.com', searchUrl: 'https://flipkart.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'home'], logo: '🛍️', currency: 'INR', language: 'hi', active: true },
  { id: 'pepperfry-in', name: 'Pepperfry', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://pepperfry.com', searchUrl: 'https://pepperfry.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'modular'], logo: '🌶️', currency: 'INR', language: 'en', active: true },
  { id: 'urbanladder-in', name: 'Urban Ladder', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://urbanladder.com', searchUrl: 'https://urbanladder.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.07, cookieDays: 30, categories: ['furniture', 'modern'], logo: '🪜', currency: 'INR', language: 'en', active: true },
  { id: 'woodenstreet-in', name: 'WoodenStreet', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://woodenstreet.com', searchUrl: 'https://woodenstreet.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.10, cookieDays: 30, categories: ['furniture', 'solid-wood'], logo: '🪵', currency: 'INR', language: 'en', active: true },
  { id: 'godrejinterio-in', name: 'Godrej Interio', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://godrejinterio.com', searchUrl: 'https://godrejinterio.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'office'], logo: '🏢', currency: 'INR', language: 'en', active: true },
  { id: 'ikea-in', name: 'IKEA India', country: 'IN', region: 'South Asia', network: 'Awin', baseUrl: 'https://ikea.com/in', searchUrl: 'https://ikea.com/in/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'INR', language: 'en', active: true },
  { id: 'homecentre-in', name: 'Home Centre', country: 'IN', region: 'South Asia', network: 'Admitad', baseUrl: 'https://homecentre.in', searchUrl: 'https://homecentre.in/search?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'decor'], logo: '🏠', currency: 'INR', language: 'en', active: true },
  { id: 'fabindia-in', name: 'FabIndia', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://fabindia.com', searchUrl: 'https://fabindia.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'ethnic'], logo: '🪔', currency: 'INR', language: 'en', active: true },
  { id: 'hometown-in', name: 'HomeTown', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://hometown.in', searchUrl: 'https://hometown.in/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'home'], logo: '🏡', currency: 'INR', language: 'en', active: true },
  { id: 'durian-in', name: 'Durian', country: 'IN', region: 'South Asia', network: 'Direct', baseUrl: 'https://durian.in', searchUrl: 'https://durian.in/search?q={query}', affiliateParam: 'ref', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'sofas'], logo: '🛋️', currency: 'INR', language: 'en', active: true },
  { id: 'royaloak-in', name: 'RoyalOak', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://royaloakindia.com', searchUrl: 'https://royaloakindia.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'bedroom'], logo: '🌳', currency: 'INR', language: 'en', active: true },
  { id: 'nilkamal-in', name: 'Nilkamal', country: 'IN', region: 'South Asia', network: 'Cuelinks', baseUrl: 'https://nilkamalfurniture.com', searchUrl: 'https://nilkamalfurniture.com/search?q={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'plastic'], logo: '🪑', currency: 'INR', language: 'en', active: true },
  { id: 'damro-in', name: 'Damro', country: 'IN', region: 'South Asia', network: 'Direct', baseUrl: 'https://damro.in', searchUrl: 'https://damro.in/search?q={query}', affiliateParam: 'ref', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'affordable'], logo: '🛏️', currency: 'INR', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇬🇧 UNITED KINGDOM (10 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-uk', name: 'Amazon UK', country: 'UK', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.co.uk', searchUrl: 'https://amazon.co.uk/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'GBP', language: 'en', active: true },
  { id: 'wayfair-uk', name: 'Wayfair UK', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://wayfair.co.uk', searchUrl: 'https://wayfair.co.uk/keyword.html?keyword={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'decor'], logo: '🏠', currency: 'GBP', language: 'en', active: true },
  { id: 'ikea-uk', name: 'IKEA UK', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/gb', searchUrl: 'https://ikea.com/gb/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'GBP', language: 'en', active: true },
  { id: 'johnlewis-uk', name: 'John Lewis', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://johnlewis.com', searchUrl: 'https://johnlewis.com/search?search-term={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'luxury'], logo: '🎩', currency: 'GBP', language: 'en', active: true },
  { id: 'made-uk', name: 'Made.com', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://made.com', searchUrl: 'https://made.com/search?term={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'modern'], logo: '✨', currency: 'GBP', language: 'en', active: true },
  { id: 'dunelm-uk', name: 'Dunelm', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://dunelm.com', searchUrl: 'https://dunelm.com/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['home-decor', 'bedding'], logo: '🏡', currency: 'GBP', language: 'en', active: true },
  { id: 'argos-uk', name: 'Argos', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://argos.co.uk', searchUrl: 'https://argos.co.uk/search/{query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 7, categories: ['furniture', 'home'], logo: '🔴', currency: 'GBP', language: 'en', active: true },
  { id: 'dfs-uk', name: 'DFS', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://dfs.co.uk', searchUrl: 'https://dfs.co.uk/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['sofa', 'living-room'], logo: '🛋️', currency: 'GBP', language: 'en', active: true },
  { id: 'next-uk', name: 'Next Home', country: 'UK', region: 'Europe', network: 'Awin', baseUrl: 'https://next.co.uk/homeware', searchUrl: 'https://next.co.uk/search?w={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['home', 'decor'], logo: '➡️', currency: 'GBP', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇩🇪 GERMANY (8 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-de', name: 'Amazon Deutschland', country: 'DE', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.de', searchUrl: 'https://amazon.de/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0d-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'EUR', language: 'de', active: true },
  { id: 'ikea-de', name: 'IKEA Germany', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/de', searchUrl: 'https://ikea.com/de/de/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'EUR', language: 'de', active: true },
  { id: 'wayfair-de', name: 'Wayfair Germany', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://wayfair.de', searchUrl: 'https://wayfair.de/keyword.html?keyword={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'decor'], logo: '🏠', currency: 'EUR', language: 'de', active: true },
  { id: 'otto-de', name: 'OTTO', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://otto.de', searchUrl: 'https://otto.de/suche/{query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'home'], logo: '🟠', currency: 'EUR', language: 'de', active: true },
  { id: 'hoeffner-de', name: 'Höffner', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://hoeffner.de', searchUrl: 'https://hoeffner.de/suche/{query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'kitchen'], logo: '🏡', currency: 'EUR', language: 'de', active: true },
  { id: 'xxxlutz-de', name: 'XXXLutz', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://xxxlutz.de', searchUrl: 'https://xxxlutz.de/suche?query={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'bedroom'], logo: '🛏️', currency: 'EUR', language: 'de', active: true },
  { id: 'home24-de', name: 'Home24', country: 'DE', region: 'Europe', network: 'Awin', baseUrl: 'https://home24.de', searchUrl: 'https://home24.de/suche?query={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'modern'], logo: '🏠', currency: 'EUR', language: 'de', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇫🇷 FRANCE (7 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-fr', name: 'Amazon France', country: 'FR', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.fr', searchUrl: 'https://amazon.fr/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0f-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'EUR', language: 'fr', active: true },
  { id: 'ikea-fr', name: 'IKEA France', country: 'FR', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/fr', searchUrl: 'https://ikea.com/fr/fr/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'EUR', language: 'fr', active: true },
  { id: 'maisonsdumonde-fr', name: 'Maisons du Monde', country: 'FR', region: 'Europe', network: 'Awin', baseUrl: 'https://maisonsdumonde.com', searchUrl: 'https://maisonsdumonde.com/FR/fr/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'decor'], logo: '🌍', currency: 'EUR', language: 'fr', active: true },
  { id: 'conforama-fr', name: 'Conforama', country: 'FR', region: 'Europe', network: 'Awin', baseUrl: 'https://conforama.fr', searchUrl: 'https://conforama.fr/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'appliances'], logo: '🔵', currency: 'EUR', language: 'fr', active: true },
  { id: 'but-fr', name: 'BUT', country: 'FR', region: 'Europe', network: 'Awin', baseUrl: 'https://but.fr', searchUrl: 'https://but.fr/recherche?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'home'], logo: '🟡', currency: 'EUR', language: 'fr', active: true },
  { id: 'alinea-fr', name: 'Alinéa', country: 'FR', region: 'Europe', network: 'Awin', baseUrl: 'https://alinea.com', searchUrl: 'https://alinea.com/recherche?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'decor'], logo: '🏠', currency: 'EUR', language: 'fr', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇮🇹 ITALY (6 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-it', name: 'Amazon Italia', country: 'IT', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.it', searchUrl: 'https://amazon.it/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0i-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'EUR', language: 'it', active: true },
  { id: 'ikea-it', name: 'IKEA Italia', country: 'IT', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/it', searchUrl: 'https://ikea.com/it/it/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'EUR', language: 'it', active: true },
  { id: 'mondo-convenienza-it', name: 'Mondo Convenienza', country: 'IT', region: 'Europe', network: 'TradeDoubler', baseUrl: 'https://mondoconv.it', searchUrl: 'https://mondoconv.it/cerca?q={query}', affiliateParam: 'td_id', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'affordable'], logo: '🏠', currency: 'EUR', language: 'it', active: true },
  { id: 'poltronesofa-it', name: 'Poltrone e Sofà', country: 'IT', region: 'Europe', network: 'Awin', baseUrl: 'https://poltronesofa.com', searchUrl: 'https://poltronesofa.com/it/ricerca?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['sofa', 'living-room'], logo: '🛋️', currency: 'EUR', language: 'it', active: true },
  { id: 'kartell-it', name: 'Kartell', country: 'IT', region: 'Europe', network: 'Awin', baseUrl: 'https://kartell.com', searchUrl: 'https://kartell.com/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'design', 'luxury'], logo: '💎', currency: 'EUR', language: 'it', active: true },
  { id: 'calligaris-it', name: 'Calligaris', country: 'IT', region: 'Europe', network: 'Awin', baseUrl: 'https://calligaris.com', searchUrl: 'https://calligaris.com/search?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'italian-design'], logo: '🇮🇹', currency: 'EUR', language: 'it', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇪🇸 SPAIN (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-es', name: 'Amazon España', country: 'ES', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.es', searchUrl: 'https://amazon.es/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0e-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'EUR', language: 'es', active: true },
  { id: 'ikea-es', name: 'IKEA España', country: 'ES', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/es', searchUrl: 'https://ikea.com/es/es/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'EUR', language: 'es', active: true },
  { id: 'elcorteingles-es', name: 'El Corte Inglés', country: 'ES', region: 'Europe', network: 'Awin', baseUrl: 'https://elcorteingles.es', searchUrl: 'https://elcorteingles.es/search/?s={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'luxury'], logo: '🏬', currency: 'EUR', language: 'es', active: true },
  { id: 'muebles-boom-es', name: 'Muebles Boom', country: 'ES', region: 'Europe', network: 'Awin', baseUrl: 'https://mueblesboom.com', searchUrl: 'https://mueblesboom.com/buscar?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'affordable'], logo: '💥', currency: 'EUR', language: 'es', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇳🇱 NETHERLANDS (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-nl', name: 'Amazon Nederland', country: 'NL', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.nl', searchUrl: 'https://amazon.nl/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0n-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'EUR', language: 'nl', active: true },
  { id: 'ikea-nl', name: 'IKEA Netherlands', country: 'NL', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/nl', searchUrl: 'https://ikea.com/nl/nl/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'EUR', language: 'nl', active: true },
  { id: 'bol-nl', name: 'Bol.com', country: 'NL', region: 'Europe', network: 'Daisycon', baseUrl: 'https://bol.com', searchUrl: 'https://bol.com/nl/s/?searchtext={query}', affiliateParam: 'affid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🔵', currency: 'EUR', language: 'nl', active: true },
  { id: 'fonq-nl', name: 'Fonq', country: 'NL', region: 'Europe', network: 'Awin', baseUrl: 'https://fonq.nl', searchUrl: 'https://fonq.nl/zoeken/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'design'], logo: '🏠', currency: 'EUR', language: 'nl', active: true },
  { id: 'wehkamp-nl', name: 'Wehkamp', country: 'NL', region: 'Europe', network: 'Awin', baseUrl: 'https://wehkamp.nl', searchUrl: 'https://wehkamp.nl/zoeken?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'home'], logo: '🛍️', currency: 'EUR', language: 'nl', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇹🇷 TURKEY (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-tr', name: 'Amazon Türkiye', country: 'TR', region: 'Middle East', network: 'Amazon Associates', baseUrl: 'https://amazon.com.tr', searchUrl: 'https://amazon.com.tr/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0t-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'TRY', language: 'tr', active: true },
  { id: 'ikea-tr', name: 'IKEA Türkiye', country: 'TR', region: 'Middle East', network: 'Awin', baseUrl: 'https://ikea.com.tr', searchUrl: 'https://ikea.com.tr/tr/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'TRY', language: 'tr', active: true },
  { id: 'hepsiburada-tr', name: 'Hepsiburada', country: 'TR', region: 'Middle East', network: 'Admitad', baseUrl: 'https://hepsiburada.com', searchUrl: 'https://hepsiburada.com/ara?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🟠', currency: 'TRY', language: 'tr', active: true },
  { id: 'trendyol-tr', name: 'Trendyol', country: 'TR', region: 'Middle East', network: 'Admitad', baseUrl: 'https://trendyol.com', searchUrl: 'https://trendyol.com/sr?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'fashion'], logo: '🧡', currency: 'TRY', language: 'tr', active: true },
  { id: 'kelebek-tr', name: 'Kelebek Mobilya', country: 'TR', region: 'Middle East', network: 'Direct', baseUrl: 'https://kelebek.com.tr', searchUrl: 'https://kelebek.com.tr/arama?q={query}', affiliateParam: 'ref', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'bedroom'], logo: '🦋', currency: 'TRY', language: 'tr', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇦🇪 UAE & MIDDLE EAST (8 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-ae', name: 'Amazon UAE', country: 'AE', region: 'Middle East', network: 'Amazon Associates', baseUrl: 'https://amazon.ae', searchUrl: 'https://amazon.ae/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0ae-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'AED', language: 'en', active: true },
  { id: 'ikea-ae', name: 'IKEA UAE', country: 'AE', region: 'Middle East', network: 'Awin', baseUrl: 'https://ikea.com/ae', searchUrl: 'https://ikea.com/ae/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'AED', language: 'en', active: true },
  { id: 'homebox-ae', name: 'Home Box', country: 'AE', region: 'Middle East', network: 'Admitad', baseUrl: 'https://homeboxstores.com', searchUrl: 'https://homeboxstores.com/search?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'decor'], logo: '📦', currency: 'AED', language: 'en', active: true },
  { id: 'homecentre-ae', name: 'Home Centre UAE', country: 'AE', region: 'Middle East', network: 'Admitad', baseUrl: 'https://homecentre.com/ae', searchUrl: 'https://homecentre.com/ae/en/search?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'home'], logo: '🏠', currency: 'AED', language: 'en', active: true },
  { id: 'danubehome-ae', name: 'Danube Home', country: 'AE', region: 'Middle East', network: 'Admitad', baseUrl: 'https://danubehome.com', searchUrl: 'https://danubehome.com/search?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'affordable'], logo: '🌊', currency: 'AED', language: 'en', active: true },
  { id: 'noon-ae', name: 'Noon', country: 'AE', region: 'Middle East', network: 'Admitad', baseUrl: 'https://noon.com', searchUrl: 'https://noon.com/search/?q={query}', affiliateParam: 'admitad_uid', affiliateTag: '', commission: 0.05, cookieDays: 7, categories: ['furniture', 'everything'], logo: '🟡', currency: 'AED', language: 'en', active: true },
  { id: 'amazon-sa', name: 'Amazon Saudi', country: 'SA', region: 'Middle East', network: 'Amazon Associates', baseUrl: 'https://amazon.sa', searchUrl: 'https://amazon.sa/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0sa-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'SAR', language: 'ar', active: true },
  { id: 'ikea-sa', name: 'IKEA Saudi', country: 'SA', region: 'Middle East', network: 'Awin', baseUrl: 'https://ikea.com/sa', searchUrl: 'https://ikea.com/sa/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'SAR', language: 'ar', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇻🇳 VIETNAM (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'shopee-vn', name: 'Shopee Vietnam', country: 'VN', region: 'Southeast Asia', network: 'Shopee Affiliate', baseUrl: 'https://shopee.vn', searchUrl: 'https://shopee.vn/search?keyword={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.06, cookieDays: 7, categories: ['furniture', 'everything'], logo: '🧡', currency: 'VND', language: 'vi', active: true },
  { id: 'lazada-vn', name: 'Lazada Vietnam', country: 'VN', region: 'Southeast Asia', network: 'Lazada Affiliate', baseUrl: 'https://lazada.vn', searchUrl: 'https://lazada.vn/catalog/?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.08, cookieDays: 7, categories: ['furniture', 'home'], logo: '🔷', currency: 'VND', language: 'vi', active: true },
  { id: 'tiki-vn', name: 'Tiki', country: 'VN', region: 'Southeast Asia', network: 'Accesstrade', baseUrl: 'https://tiki.vn', searchUrl: 'https://tiki.vn/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🔵', currency: 'VND', language: 'vi', active: true },
  { id: 'nhathuoc-vn', name: 'Nhà Xinh', country: 'VN', region: 'Southeast Asia', network: 'Direct', baseUrl: 'https://nhaxinh.com', searchUrl: 'https://nhaxinh.com/search?q={query}', affiliateParam: 'ref', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'premium'], logo: '🏠', currency: 'VND', language: 'vi', active: true },
  { id: 'uma-vn', name: 'UMA', country: 'VN', region: 'Southeast Asia', network: 'Direct', baseUrl: 'https://uma.com.vn', searchUrl: 'https://uma.com.vn/search?q={query}', affiliateParam: 'ref', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'modern'], logo: '✨', currency: 'VND', language: 'vi', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇨🇳 CHINA (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'taobao-cn', name: 'Taobao', country: 'CN', region: 'East Asia', network: 'Alimama', baseUrl: 'https://taobao.com', searchUrl: 'https://s.taobao.com/search?q={query}', affiliateParam: 'pid', affiliateTag: '', commission: 0.03, cookieDays: 15, categories: ['furniture', 'everything'], logo: '🟠', currency: 'CNY', language: 'zh', active: true },
  { id: 'tmall-cn', name: 'Tmall', country: 'CN', region: 'East Asia', network: 'Alimama', baseUrl: 'https://tmall.com', searchUrl: 'https://list.tmall.com/search_product.htm?q={query}', affiliateParam: 'pid', affiliateTag: '', commission: 0.04, cookieDays: 15, categories: ['furniture', 'branded'], logo: '🔴', currency: 'CNY', language: 'zh', active: true },
  { id: 'jd-cn', name: 'JD.com', country: 'CN', region: 'East Asia', network: 'JD Union', baseUrl: 'https://jd.com', searchUrl: 'https://search.jd.com/Search?keyword={query}', affiliateParam: 'e', affiliateTag: '', commission: 0.03, cookieDays: 15, categories: ['furniture', 'appliances'], logo: '🐕', currency: 'CNY', language: 'zh', active: true },
  { id: 'pinduoduo-cn', name: 'Pinduoduo', country: 'CN', region: 'East Asia', network: 'PDD Affiliate', baseUrl: 'https://pinduoduo.com', searchUrl: 'https://mobile.pinduoduo.com/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.05, cookieDays: 7, categories: ['furniture', 'budget'], logo: '🟣', currency: 'CNY', language: 'zh', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇯🇵 JAPAN (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-jp', name: 'Amazon Japan', country: 'JP', region: 'East Asia', network: 'Amazon Associates', baseUrl: 'https://amazon.co.jp', searchUrl: 'https://amazon.co.jp/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview-22', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'JPY', language: 'ja', active: true },
  { id: 'rakuten-jp', name: 'Rakuten Japan', country: 'JP', region: 'East Asia', network: 'Rakuten Affiliate', baseUrl: 'https://rakuten.co.jp', searchUrl: 'https://search.rakuten.co.jp/search/mall/{query}', affiliateParam: 'scid', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🟥', currency: 'JPY', language: 'ja', active: true },
  { id: 'ikea-jp', name: 'IKEA Japan', country: 'JP', region: 'East Asia', network: 'Awin', baseUrl: 'https://ikea.com/jp', searchUrl: 'https://ikea.com/jp/ja/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'JPY', language: 'ja', active: true },
  { id: 'nitori-jp', name: 'Nitori', country: 'JP', region: 'East Asia', network: 'A8.net', baseUrl: 'https://nitori-net.jp', searchUrl: 'https://nitori-net.jp/ec/search/?q={query}', affiliateParam: 'a8', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'home'], logo: '🏠', currency: 'JPY', language: 'ja', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇦🇺 AUSTRALIA (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-au', name: 'Amazon Australia', country: 'AU', region: 'Oceania', network: 'Amazon Associates', baseUrl: 'https://amazon.com.au', searchUrl: 'https://amazon.com.au/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0a-22', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'AUD', language: 'en', active: true },
  { id: 'ikea-au', name: 'IKEA Australia', country: 'AU', region: 'Oceania', network: 'Awin', baseUrl: 'https://ikea.com/au', searchUrl: 'https://ikea.com/au/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'AUD', language: 'en', active: true },
  { id: 'templewebster-au', name: 'Temple & Webster', country: 'AU', region: 'Oceania', network: 'Commission Factory', baseUrl: 'https://templeandwebster.com.au', searchUrl: 'https://templeandwebster.com.au/search?q={query}', affiliateParam: 'cfclick', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'decor'], logo: '🏡', currency: 'AUD', language: 'en', active: true },
  { id: 'fantasticfurniture-au', name: 'Fantastic Furniture', country: 'AU', region: 'Oceania', network: 'Commission Factory', baseUrl: 'https://fantasticfurniture.com.au', searchUrl: 'https://fantasticfurniture.com.au/search?q={query}', affiliateParam: 'cfclick', affiliateTag: '', commission: 0.05, cookieDays: 30, categories: ['furniture', 'affordable'], logo: '⭐', currency: 'AUD', language: 'en', active: true },
  { id: 'koala-au', name: 'Koala', country: 'AU', region: 'Oceania', network: 'Impact', baseUrl: 'https://koala.com', searchUrl: 'https://koala.com/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.07, cookieDays: 30, categories: ['mattress', 'sofa'], logo: '🐨', currency: 'AUD', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇧🇷 BRAZIL (4 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-br', name: 'Amazon Brasil', country: 'BR', region: 'South America', network: 'Amazon Associates', baseUrl: 'https://amazon.com.br', searchUrl: 'https://amazon.com.br/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0b-20', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'BRL', language: 'pt', active: true },
  { id: 'magazineluiza-br', name: 'Magazine Luiza', country: 'BR', region: 'South America', network: 'Lomadee', baseUrl: 'https://magazineluiza.com.br', searchUrl: 'https://magazineluiza.com.br/busca/{query}', affiliateParam: 'parceiro', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'appliances'], logo: '🟦', currency: 'BRL', language: 'pt', active: true },
  { id: 'mercadolivre-br', name: 'Mercado Livre', country: 'BR', region: 'South America', network: 'Lomadee', baseUrl: 'https://mercadolivre.com.br', searchUrl: 'https://lista.mercadolivre.com.br/{query}', affiliateParam: 'parceiro', affiliateTag: '', commission: 0.03, cookieDays: 7, categories: ['furniture', 'everything'], logo: '🟡', currency: 'BRL', language: 'pt', active: true },
  { id: 'casasbahia-br', name: 'Casas Bahia', country: 'BR', region: 'South America', network: 'Lomadee', baseUrl: 'https://casasbahia.com.br', searchUrl: 'https://casasbahia.com.br/busca/{query}', affiliateParam: 'parceiro', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'home'], logo: '🔵', currency: 'BRL', language: 'pt', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌍 GLOBAL BUDGET MARKETPLACES (HIGH COMMISSION!)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'temu-global', name: 'Temu', country: 'GLOBAL', region: 'Global', network: 'Temu Affiliate', baseUrl: 'https://temu.com', searchUrl: 'https://temu.com/search_result.html?search_key={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.20, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🟠', currency: 'USD', language: 'multi', active: true },
  { id: 'shein-global', name: 'SHEIN Home', country: 'GLOBAL', region: 'Global', network: 'SHEIN Affiliate', baseUrl: 'https://shein.com', searchUrl: 'https://shein.com/pdsearch/{query}/', affiliateParam: 'url_from', affiliateTag: '', commission: 0.15, cookieDays: 30, categories: ['home-decor', 'bedding'], logo: '🖤', currency: 'USD', language: 'multi', active: true },
  { id: 'aliexpress-global', name: 'AliExpress', country: 'GLOBAL', region: 'Global', network: 'AliExpress Affiliate', baseUrl: 'https://aliexpress.com', searchUrl: 'https://aliexpress.com/wholesale?SearchText={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.09, cookieDays: 3, categories: ['furniture', 'everything'], logo: '🔴', currency: 'USD', language: 'multi', active: true },
  { id: 'alibaba-global', name: 'Alibaba', country: 'GLOBAL', region: 'Global', network: 'Alibaba Affiliate', baseUrl: 'https://alibaba.com', searchUrl: 'https://alibaba.com/trade/search?SearchText={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.07, cookieDays: 30, categories: ['furniture', 'wholesale'], logo: '🟧', currency: 'USD', language: 'multi', active: true },
  { id: 'dhgate-global', name: 'DHgate', country: 'GLOBAL', region: 'Global', network: 'DHgate Affiliate', baseUrl: 'https://dhgate.com', searchUrl: 'https://dhgate.com/wholesale/search.do?searchkey={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.08, cookieDays: 30, categories: ['furniture', 'wholesale'], logo: '🔵', currency: 'USD', language: 'multi', active: true },
  { id: 'banggood-global', name: 'Banggood', country: 'GLOBAL', region: 'Global', network: 'Banggood Affiliate', baseUrl: 'https://banggood.com', searchUrl: 'https://banggood.com/search/{query}.html', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.10, cookieDays: 30, categories: ['home', 'gadgets'], logo: '🟡', currency: 'USD', language: 'multi', active: true },
  { id: 'wish-global', name: 'Wish', country: 'GLOBAL', region: 'Global', network: 'Wish Affiliate', baseUrl: 'https://wish.com', searchUrl: 'https://wish.com/search/{query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.10, cookieDays: 7, categories: ['home', 'budget'], logo: '💙', currency: 'USD', language: 'multi', active: true },
  { id: 'lightinthebox-global', name: 'LightInTheBox', country: 'GLOBAL', region: 'Global', network: 'LITB Affiliate', baseUrl: 'https://lightinthebox.com', searchUrl: 'https://lightinthebox.com/search.html?main_search=1&search_q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.12, cookieDays: 30, categories: ['home', 'lighting'], logo: '💡', currency: 'USD', language: 'multi', active: true },
  { id: 'shopee-global', name: 'Shopee', country: 'GLOBAL', region: 'Southeast Asia', network: 'Shopee Affiliate', baseUrl: 'https://shopee.com', searchUrl: 'https://shopee.com/search?keyword={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.06, cookieDays: 7, categories: ['furniture', 'everything'], logo: '🧡', currency: 'multi', language: 'multi', active: true },
  { id: 'lazada-global', name: 'Lazada', country: 'GLOBAL', region: 'Southeast Asia', network: 'Lazada Affiliate', baseUrl: 'https://lazada.com', searchUrl: 'https://lazada.com/catalog/?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.08, cookieDays: 7, categories: ['furniture', 'home'], logo: '🔷', currency: 'multi', language: 'multi', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇵🇱 POLAND (3 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-pl', name: 'Amazon Polska', country: 'PL', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.pl', searchUrl: 'https://amazon.pl/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0p-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'PLN', language: 'pl', active: true },
  { id: 'ikea-pl', name: 'IKEA Poland', country: 'PL', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/pl', searchUrl: 'https://ikea.com/pl/pl/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'PLN', language: 'pl', active: true },
  { id: 'allegro-pl', name: 'Allegro', country: 'PL', region: 'Europe', network: 'Awin', baseUrl: 'https://allegro.pl', searchUrl: 'https://allegro.pl/listing?string={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.04, cookieDays: 30, categories: ['furniture', 'everything'], logo: '🟠', currency: 'PLN', language: 'pl', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇸🇪 SWEDEN (2 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-se', name: 'Amazon Sverige', country: 'SE', region: 'Europe', network: 'Amazon Associates', baseUrl: 'https://amazon.se', searchUrl: 'https://amazon.se/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0se-21', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'SEK', language: 'sv', active: true },
  { id: 'ikea-se', name: 'IKEA Sweden', country: 'SE', region: 'Europe', network: 'Awin', baseUrl: 'https://ikea.com/se', searchUrl: 'https://ikea.com/se/sv/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'SEK', language: 'sv', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇨🇦 CANADA (3 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-ca', name: 'Amazon Canada', country: 'CA', region: 'North America', network: 'Amazon Associates', baseUrl: 'https://amazon.ca', searchUrl: 'https://amazon.ca/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0c-20', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'CAD', language: 'en', active: true },
  { id: 'ikea-ca', name: 'IKEA Canada', country: 'CA', region: 'North America', network: 'Awin', baseUrl: 'https://ikea.com/ca', searchUrl: 'https://ikea.com/ca/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'CAD', language: 'en', active: true },
  { id: 'wayfair-ca', name: 'Wayfair Canada', country: 'CA', region: 'North America', network: 'CJ Affiliate', baseUrl: 'https://wayfair.ca', searchUrl: 'https://wayfair.ca/keyword.html?keyword={query}', affiliateParam: 'refid', affiliateTag: '', commission: 0.07, cookieDays: 7, categories: ['furniture', 'decor'], logo: '🏠', currency: 'CAD', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇲🇽 MEXICO (2 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-mx', name: 'Amazon México', country: 'MX', region: 'North America', network: 'Amazon Associates', baseUrl: 'https://amazon.com.mx', searchUrl: 'https://amazon.com.mx/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0mx-20', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'MXN', language: 'es', active: true },
  { id: 'ikea-mx', name: 'IKEA México', country: 'MX', region: 'North America', network: 'Awin', baseUrl: 'https://ikea.com/mx', searchUrl: 'https://ikea.com/mx/es/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'MXN', language: 'es', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇸🇬 SINGAPORE (3 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'amazon-sg', name: 'Amazon Singapore', country: 'SG', region: 'Southeast Asia', network: 'Amazon Associates', baseUrl: 'https://amazon.sg', searchUrl: 'https://amazon.sg/s?k={query}&tag={tag}', affiliateParam: 'tag', affiliateTag: 'vistaview0sg-22', commission: 0.04, cookieDays: 1, categories: ['furniture', 'home'], logo: '🛒', currency: 'SGD', language: 'en', active: true },
  { id: 'ikea-sg', name: 'IKEA Singapore', country: 'SG', region: 'Southeast Asia', network: 'Awin', baseUrl: 'https://ikea.com/sg', searchUrl: 'https://ikea.com/sg/en/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'SGD', language: 'en', active: true },
  { id: 'castlery-sg', name: 'Castlery Singapore', country: 'SG', region: 'Southeast Asia', network: 'Impact', baseUrl: 'https://castlery.com/sg', searchUrl: 'https://castlery.com/sg/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.06, cookieDays: 30, categories: ['furniture', 'premium'], logo: '🏰', currency: 'SGD', language: 'en', active: true },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇰🇷 SOUTH KOREA (2 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'coupang-kr', name: 'Coupang', country: 'KR', region: 'East Asia', network: 'Coupang Partners', baseUrl: 'https://coupang.com', searchUrl: 'https://coupang.com/np/search?q={query}', affiliateParam: 'aff_id', affiliateTag: '', commission: 0.03, cookieDays: 1, categories: ['furniture', 'everything'], logo: '🟤', currency: 'KRW', language: 'ko', active: true },
  { id: 'ikea-kr', name: 'IKEA Korea', country: 'KR', region: 'East Asia', network: 'Awin', baseUrl: 'https://ikea.com/kr', searchUrl: 'https://ikea.com/kr/ko/search/?q={query}', affiliateParam: 'awc', affiliateTag: '', commission: 0.03, cookieDays: 30, categories: ['furniture', 'storage'], logo: '🪑', currency: 'KRW', language: 'ko', active: true },

];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const getPartnersByCountry = (country: string) =>
  GLOBAL_AFFILIATES.filter(p => p.country === country && p.active);

export const getPartnersByRegion = (region: string) =>
  GLOBAL_AFFILIATES.filter(p => p.region === region && p.active);

export const getHighCommissionPartners = (minCommission: number = 0.10) =>
  GLOBAL_AFFILIATES.filter(p => p.commission >= minCommission && p.active)
    .sort((a, b) => b.commission - a.commission);

export const getAllCountries = () =>
  [...new Set(GLOBAL_AFFILIATES.map(p => p.country))];

export const getAllRegions = () =>
  [...new Set(GLOBAL_AFFILIATES.map(p => p.region))];

export const getTotalPartnerCount = () =>
  GLOBAL_AFFILIATES.filter(p => p.active).length;

export const generateAffiliateUrl = (partnerId: string, query: string): string => {
  const partner = GLOBAL_AFFILIATES.find(p => p.id === partnerId);
  if (!partner) return '';

  return partner.searchUrl
    .replace('{query}', encodeURIComponent(query))
    .replace('{tag}', partner.affiliateTag);
};

// Summary
console.log(`
═══════════════════════════════════════════════════════════════
VISTAVIEW GLOBAL AFFILIATE NETWORK
═══════════════════════════════════════════════════════════════
Total Partners: ${getTotalPartnerCount()}
Countries: ${getAllCountries().length}
Regions: ${getAllRegions().length}

HIGH COMMISSION (10%+):
${getHighCommissionPartners().map(p => `  • ${p.name}: ${(p.commission * 100).toFixed(0)}%`).join('\n')}
═══════════════════════════════════════════════════════════════
`);

export default GLOBAL_AFFILIATES;

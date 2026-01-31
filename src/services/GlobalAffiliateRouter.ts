// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW GLOBAL AFFILIATE ROUTER
// Routes to 100+ retailers worldwide with geo-detection
// © 2026 Vista View Realty Services LLC. All Rights Reserved.
// ═══════════════════════════════════════════════════════════════════════════════

export interface AffiliatePartner {
  id: string;
  name: string;
  region: 'US' | 'IN' | 'EU' | 'UK' | 'DE' | 'FR' | 'IT' | 'ES' | 'CN' | 'JP' | 'AU' | 'BR' | 'AE' | 'GLOBAL';
  network: string;  // Affiliate network (Awin, CJ, ShareASale, etc.)
  baseUrl: string;
  searchUrl: string;
  affiliateParam: string;
  affiliateTag: string;
  commission: number;
  cookieDays: number;
  categories: string[];
  logo?: string;
  active: boolean;
}

export interface AffiliateLink {
  partner: string;
  region: string;
  url: string;
  logo: string;
  commission: number;
  tagline: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL AFFILIATE PARTNERS DATABASE (100+)
// ═══════════════════════════════════════════════════════════════════════════════

const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 🇺🇸 UNITED STATES (25+ partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-us',
    name: 'Amazon',
    region: 'US',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.com',
    searchUrl: 'https://www.amazon.com/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'visataview-20',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor', 'outdoor', 'lighting', 'kitchen', 'bedroom', 'office'],
    logo: '🛒',
    active: true
  },
  {
    id: 'wayfair-us',
    name: 'Wayfair',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.wayfair.com',
    searchUrl: 'https://www.wayfair.com/keyword.html?keyword={query}',
    affiliateParam: 'refid',
    affiliateTag: '', // Add when signed up
    commission: 0.07,
    cookieDays: 7,
    categories: ['furniture', 'home-decor', 'outdoor', 'lighting', 'rugs', 'bedding'],
    logo: '🏠',
    active: true
  },
  {
    id: 'ikea-us',
    name: 'IKEA',
    region: 'US',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/us/en',
    searchUrl: 'https://www.ikea.com/us/en/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '', // Add when signed up
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen', 'bedroom', 'office', 'outdoor'],
    logo: '🪑',
    active: true
  },
  {
    id: 'target-us',
    name: 'Target',
    region: 'US',
    network: 'Impact',
    baseUrl: 'https://www.target.com',
    searchUrl: 'https://www.target.com/s?searchTerm={query}',
    affiliateParam: 'afid',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 7,
    categories: ['furniture', 'home', 'decor', 'outdoor', 'kitchen'],
    logo: '🎯',
    active: true
  },
  {
    id: 'walmart-us',
    name: 'Walmart',
    region: 'US',
    network: 'Impact',
    baseUrl: 'https://www.walmart.com',
    searchUrl: 'https://www.walmart.com/search?q={query}',
    affiliateParam: 'wmlspartner',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 3,
    categories: ['furniture', 'home', 'outdoor', 'kitchen', 'bedroom'],
    logo: '🛍️',
    active: true
  },
  {
    id: 'homedepot-us',
    name: 'Home Depot',
    region: 'US',
    network: 'Impact',
    baseUrl: 'https://www.homedepot.com',
    searchUrl: 'https://www.homedepot.com/s/{query}',
    affiliateParam: 'cm_mmc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 1,
    categories: ['furniture', 'outdoor', 'lighting', 'storage', 'kitchen'],
    logo: '🔨',
    active: true
  },
  {
    id: 'lowes-us',
    name: 'Lowe\'s',
    region: 'US',
    network: 'Rakuten',
    baseUrl: 'https://www.lowes.com',
    searchUrl: 'https://www.lowes.com/search?searchTerm={query}',
    affiliateParam: 'cm_mmc',
    affiliateTag: '',
    commission: 0.02,
    cookieDays: 1,
    categories: ['furniture', 'outdoor', 'lighting', 'appliances'],
    logo: '🔧',
    active: true
  },
  {
    id: 'overstock-us',
    name: 'Overstock',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.overstock.com',
    searchUrl: 'https://www.overstock.com/search?keywords={query}',
    affiliateParam: 'cid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 14,
    categories: ['furniture', 'rugs', 'decor', 'bedding', 'outdoor'],
    logo: '💎',
    active: true
  },
  {
    id: 'westelm-us',
    name: 'West Elm',
    region: 'US',
    network: 'Rakuten',
    baseUrl: 'https://www.westelm.com',
    searchUrl: 'https://www.westelm.com/search/results.html?words={query}',
    affiliateParam: 'cm_mmc',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 14,
    categories: ['furniture', 'modern', 'decor', 'lighting'],
    logo: '✨',
    active: true
  },
  {
    id: 'potterybarn-us',
    name: 'Pottery Barn',
    region: 'US',
    network: 'Rakuten',
    baseUrl: 'https://www.potterybarn.com',
    searchUrl: 'https://www.potterybarn.com/search/results.html?words={query}',
    affiliateParam: 'cm_mmc',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 14,
    categories: ['furniture', 'traditional', 'decor', 'outdoor'],
    logo: '🏺',
    active: true
  },
  {
    id: 'cb2-us',
    name: 'CB2',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.cb2.com',
    searchUrl: 'https://www.cb2.com/search?query={query}',
    affiliateParam: 'afid',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'modern', 'contemporary', 'decor'],
    logo: '🎨',
    active: true
  },
  {
    id: 'cratebarrel-us',
    name: 'Crate & Barrel',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.crateandbarrel.com',
    searchUrl: 'https://www.crateandbarrel.com/search?query={query}',
    affiliateParam: 'afid',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'kitchen', 'decor', 'dining'],
    logo: '📦',
    active: true
  },
  {
    id: 'article-us',
    name: 'Article',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://www.article.com',
    searchUrl: 'https://www.article.com/search?query={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['sofa', 'furniture', 'modern', 'mid-century'],
    logo: '🛋️',
    active: true
  },
  {
    id: 'allmodern-us',
    name: 'AllModern',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.allmodern.com',
    searchUrl: 'https://www.allmodern.com/keyword.html?keyword={query}',
    affiliateParam: 'refid',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 7,
    categories: ['furniture', 'modern', 'contemporary', 'lighting'],
    logo: '💫',
    active: true
  },
  {
    id: 'jossandmain-us',
    name: 'Joss & Main',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.jossandmain.com',
    searchUrl: 'https://www.jossandmain.com/keyword.html?keyword={query}',
    affiliateParam: 'refid',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 7,
    categories: ['furniture', 'farmhouse', 'cottage', 'decor'],
    logo: '🌻',
    active: true
  },
  {
    id: 'zgallerie-us',
    name: 'Z Gallerie',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://www.zgallerie.com',
    searchUrl: 'https://www.zgallerie.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 45,
    categories: ['furniture', 'luxury', 'decor', 'art'],
    logo: '🖼️',
    active: true
  },
  {
    id: 'roomstogo-us',
    name: 'Rooms To Go',
    region: 'US',
    network: 'FlexOffers',
    baseUrl: 'https://www.roomstogo.com',
    searchUrl: 'https://www.roomstogo.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 7,
    categories: ['furniture', 'living-room', 'bedroom', 'dining'],
    logo: '🏡',
    active: true
  },
  {
    id: 'ashleyfurniture-us',
    name: 'Ashley Furniture',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://www.ashleyfurniture.com',
    searchUrl: 'https://www.ashleyfurniture.com/search/?q={query}',
    affiliateParam: 'cid',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'traditional', 'bedroom', 'living-room'],
    logo: '🏠',
    active: true
  },
  {
    id: 'ethanallen-us',
    name: 'Ethan Allen',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://www.ethanallen.com',
    searchUrl: 'https://www.ethanallen.com/en_US/search?text={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'luxury', 'traditional', 'custom'],
    logo: '👑',
    active: true
  },
  {
    id: 'havertys-us',
    name: 'Havertys',
    region: 'US',
    network: 'Rakuten',
    baseUrl: 'https://www.havertys.com',
    searchUrl: 'https://www.havertys.com/search?q={query}',
    affiliateParam: 'cm_mmc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 14,
    categories: ['furniture', 'traditional', 'bedroom', 'living-room'],
    logo: '🏛️',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇮🇳 INDIA (15+ partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-in',
    name: 'Amazon India',
    region: 'IN',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.in',
    searchUrl: 'https://www.amazon.in/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0c-21', // India tag format
    commission: 0.05,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor', 'outdoor', 'kitchen'],
    logo: '🛒',
    active: true
  },
  {
    id: 'flipkart-in',
    name: 'Flipkart',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.flipkart.com',
    searchUrl: 'https://www.flipkart.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'home', 'decor', 'kitchen', 'bedroom'],
    logo: '🛍️',
    active: true
  },
  {
    id: 'pepperfry-in',
    name: 'Pepperfry',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.pepperfry.com',
    searchUrl: 'https://www.pepperfry.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'home-decor', 'modular', 'outdoor'],
    logo: '🌶️',
    active: true
  },
  {
    id: 'urbanladder-in',
    name: 'Urban Ladder',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.urbanladder.com',
    searchUrl: 'https://www.urbanladder.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 30,
    categories: ['furniture', 'modern', 'bedroom', 'living-room'],
    logo: '🪜',
    active: true
  },
  {
    id: 'woodenstreet-in',
    name: 'WoodenStreet',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.woodenstreet.com',
    searchUrl: 'https://www.woodenstreet.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.10,
    cookieDays: 30,
    categories: ['furniture', 'solid-wood', 'custom', 'bedroom'],
    logo: '🪵',
    active: true
  },
  {
    id: 'godrejinterio-in',
    name: 'Godrej Interio',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.godrejinterio.com',
    searchUrl: 'https://www.godrejinterio.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'office', 'modular', 'storage'],
    logo: '🏢',
    active: true
  },
  {
    id: 'ikea-in',
    name: 'IKEA India',
    region: 'IN',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/in/en',
    searchUrl: 'https://www.ikea.com/in/en/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen', 'bedroom'],
    logo: '🪑',
    active: true
  },
  {
    id: 'homecentre-in',
    name: 'Home Centre',
    region: 'IN',
    network: 'Admitad',
    baseUrl: 'https://www.homecentre.in',
    searchUrl: 'https://www.homecentre.in/in/en/search?q={query}',
    affiliateParam: 'admitad_uid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'home-decor', 'bedding', 'dining'],
    logo: '🏠',
    active: true
  },
  {
    id: 'fabindia-in',
    name: 'FabIndia',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.fabindia.com',
    searchUrl: 'https://www.fabindia.com/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'ethnic', 'decor', 'traditional'],
    logo: '🪔',
    active: true
  },
  {
    id: 'hometown-in',
    name: 'HomeTown',
    region: 'IN',
    network: 'Cuelinks',
    baseUrl: 'https://www.hometown.in',
    searchUrl: 'https://www.hometown.in/search?q={query}',
    affiliateParam: 'affid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'home', 'decor', 'modular'],
    logo: '🏡',
    active: true
  },
  {
    id: 'durian-in',
    name: 'Durian',
    region: 'IN',
    network: 'Direct',
    baseUrl: 'https://www.durian.in',
    searchUrl: 'https://www.durian.in/search?q={query}',
    affiliateParam: 'ref',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'modular', 'sofas', 'bedroom'],
    logo: '🛋️',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇬🇧 UNITED KINGDOM (10+ partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-uk',
    name: 'Amazon UK',
    region: 'UK',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.co.uk',
    searchUrl: 'https://www.amazon.co.uk/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview-21', // UK tag format
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor', 'outdoor', 'kitchen'],
    logo: '🛒',
    active: true
  },
  {
    id: 'wayfair-uk',
    name: 'Wayfair UK',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.wayfair.co.uk',
    searchUrl: 'https://www.wayfair.co.uk/keyword.html?keyword={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 7,
    categories: ['furniture', 'home-decor', 'outdoor', 'lighting'],
    logo: '🏠',
    active: true
  },
  {
    id: 'ikea-uk',
    name: 'IKEA UK',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/gb/en',
    searchUrl: 'https://www.ikea.com/gb/en/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen', 'bedroom'],
    logo: '🪑',
    active: true
  },
  {
    id: 'johnlewis-uk',
    name: 'John Lewis',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.johnlewis.com',
    searchUrl: 'https://www.johnlewis.com/search?search-term={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'home', 'luxury', 'bedding'],
    logo: '🎩',
    active: true
  },
  {
    id: 'made-uk',
    name: 'Made.com',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.made.com',
    searchUrl: 'https://www.made.com/search?term={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'modern', 'designer', 'sofas'],
    logo: '✨',
    active: true
  },
  {
    id: 'dunelm-uk',
    name: 'Dunelm',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.dunelm.com',
    searchUrl: 'https://www.dunelm.com/search?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['home-decor', 'bedding', 'curtains', 'lighting'],
    logo: '🏡',
    active: true
  },
  {
    id: 'argos-uk',
    name: 'Argos',
    region: 'UK',
    network: 'Awin',
    baseUrl: 'https://www.argos.co.uk',
    searchUrl: 'https://www.argos.co.uk/search/{query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 7,
    categories: ['furniture', 'home', 'outdoor', 'storage'],
    logo: '🔴',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇩🇪 GERMANY (8+ partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-de',
    name: 'Amazon Deutschland',
    region: 'DE',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.de',
    searchUrl: 'https://www.amazon.de/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0d-21',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor', 'outdoor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'ikea-de',
    name: 'IKEA Germany',
    region: 'DE',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/de/de',
    searchUrl: 'https://www.ikea.com/de/de/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen', 'bedroom'],
    logo: '🪑',
    active: true
  },
  {
    id: 'wayfair-de',
    name: 'Wayfair Germany',
    region: 'DE',
    network: 'Awin',
    baseUrl: 'https://www.wayfair.de',
    searchUrl: 'https://www.wayfair.de/keyword.html?keyword={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 7,
    categories: ['furniture', 'home-decor', 'outdoor'],
    logo: '🏠',
    active: true
  },
  {
    id: 'otto-de',
    name: 'OTTO',
    region: 'DE',
    network: 'Awin',
    baseUrl: 'https://www.otto.de',
    searchUrl: 'https://www.otto.de/suche/{query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'home', 'fashion', 'decor'],
    logo: '🟠',
    active: true
  },
  {
    id: 'hoeffner-de',
    name: 'Höffner',
    region: 'DE',
    network: 'Awin',
    baseUrl: 'https://www.hoeffner.de',
    searchUrl: 'https://www.hoeffner.de/suche/{query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'kitchen', 'bedroom', 'living-room'],
    logo: '🏡',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇫🇷 FRANCE (6+ partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-fr',
    name: 'Amazon France',
    region: 'FR',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.fr',
    searchUrl: 'https://www.amazon.fr/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0f-21',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor', 'outdoor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'ikea-fr',
    name: 'IKEA France',
    region: 'FR',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/fr/fr',
    searchUrl: 'https://www.ikea.com/fr/fr/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen', 'bedroom'],
    logo: '🪑',
    active: true
  },
  {
    id: 'maisonsdumonde-fr',
    name: 'Maisons du Monde',
    region: 'FR',
    network: 'Awin',
    baseUrl: 'https://www.maisonsdumonde.com/FR/fr',
    searchUrl: 'https://www.maisonsdumonde.com/FR/fr/search?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'decor', 'outdoor', 'lighting'],
    logo: '🌍',
    active: true
  },
  {
    id: 'conforama-fr',
    name: 'Conforama',
    region: 'FR',
    network: 'Awin',
    baseUrl: 'https://www.conforama.fr',
    searchUrl: 'https://www.conforama.fr/search?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'appliances', 'bedroom', 'living-room'],
    logo: '🔵',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇮🇹 ITALY (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-it',
    name: 'Amazon Italy',
    region: 'IT',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.it',
    searchUrl: 'https://www.amazon.it/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0i-21',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'ikea-it',
    name: 'IKEA Italy',
    region: 'IT',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/it/it',
    searchUrl: 'https://www.ikea.com/it/it/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen'],
    logo: '🪑',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇪🇸 SPAIN (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-es',
    name: 'Amazon Spain',
    region: 'ES',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.es',
    searchUrl: 'https://www.amazon.es/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0e-21',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'ikea-es',
    name: 'IKEA Spain',
    region: 'ES',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/es/es',
    searchUrl: 'https://www.ikea.com/es/es/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen'],
    logo: '🪑',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇨🇳 CHINA (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'taobao-cn',
    name: 'Taobao',
    region: 'CN',
    network: 'Alimama',
    baseUrl: 'https://www.taobao.com',
    searchUrl: 'https://s.taobao.com/search?q={query}',
    affiliateParam: 'pid',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 15,
    categories: ['furniture', 'home', 'decor', 'everything'],
    logo: '🟠',
    active: true
  },
  {
    id: 'tmall-cn',
    name: 'Tmall',
    region: 'CN',
    network: 'Alimama',
    baseUrl: 'https://www.tmall.com',
    searchUrl: 'https://list.tmall.com/search_product.htm?q={query}',
    affiliateParam: 'pid',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 15,
    categories: ['furniture', 'home', 'branded'],
    logo: '🔴',
    active: true
  },
  {
    id: 'jd-cn',
    name: 'JD.com',
    region: 'CN',
    network: 'JD Union',
    baseUrl: 'https://www.jd.com',
    searchUrl: 'https://search.jd.com/Search?keyword={query}',
    affiliateParam: 'e',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 15,
    categories: ['furniture', 'home', 'appliances'],
    logo: '🐕',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇯🇵 JAPAN (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-jp',
    name: 'Amazon Japan',
    region: 'JP',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.co.jp',
    searchUrl: 'https://www.amazon.co.jp/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview-22',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'rakuten-jp',
    name: 'Rakuten Japan',
    region: 'JP',
    network: 'Rakuten Affiliate',
    baseUrl: 'https://www.rakuten.co.jp',
    searchUrl: 'https://search.rakuten.co.jp/search/mall/{query}',
    affiliateParam: 'scid',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'home', 'everything'],
    logo: '🟥',
    active: true
  },
  {
    id: 'ikea-jp',
    name: 'IKEA Japan',
    region: 'JP',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/jp/ja',
    searchUrl: 'https://www.ikea.com/jp/ja/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen'],
    logo: '🪑',
    active: true
  },
  {
    id: 'nitori-jp',
    name: 'Nitori',
    region: 'JP',
    network: 'A8.net',
    baseUrl: 'https://www.nitori-net.jp',
    searchUrl: 'https://www.nitori-net.jp/ec/search/?q={query}',
    affiliateParam: 'a8',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'home', 'bedding'],
    logo: '🏠',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇦🇺 AUSTRALIA (5 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-au',
    name: 'Amazon Australia',
    region: 'AU',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.com.au',
    searchUrl: 'https://www.amazon.com.au/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0a-22',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'templewebster-au',
    name: 'Temple & Webster',
    region: 'AU',
    network: 'Commission Factory',
    baseUrl: 'https://www.templeandwebster.com.au',
    searchUrl: 'https://www.templeandwebster.com.au/search?q={query}',
    affiliateParam: 'cfclick',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'home-decor', 'outdoor'],
    logo: '🏡',
    active: true
  },
  {
    id: 'ikea-au',
    name: 'IKEA Australia',
    region: 'AU',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/au/en',
    searchUrl: 'https://www.ikea.com/au/en/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen'],
    logo: '🪑',
    active: true
  },
  {
    id: 'fantasticfurniture-au',
    name: 'Fantastic Furniture',
    region: 'AU',
    network: 'Commission Factory',
    baseUrl: 'https://www.fantasticfurniture.com.au',
    searchUrl: 'https://www.fantasticfurniture.com.au/search?q={query}',
    affiliateParam: 'cfclick',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['furniture', 'affordable', 'bedroom'],
    logo: '⭐',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇧🇷 BRAZIL (3 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-br',
    name: 'Amazon Brazil',
    region: 'BR',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.com.br',
    searchUrl: 'https://www.amazon.com.br/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0b-20',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'magazineluiza-br',
    name: 'Magazine Luiza',
    region: 'BR',
    network: 'Lomadee',
    baseUrl: 'https://www.magazineluiza.com.br',
    searchUrl: 'https://www.magazineluiza.com.br/busca/{query}',
    affiliateParam: 'parceiro',
    affiliateTag: '',
    commission: 0.04,
    cookieDays: 30,
    categories: ['furniture', 'appliances', 'home'],
    logo: '🟦',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇦🇪 UAE / Middle East (3 partners)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'amazon-ae',
    name: 'Amazon UAE',
    region: 'AE',
    network: 'Amazon Associates',
    baseUrl: 'https://www.amazon.ae',
    searchUrl: 'https://www.amazon.ae/s?k={query}&tag={tag}',
    affiliateParam: 'tag',
    affiliateTag: 'vistaview0ae-21',
    commission: 0.04,
    cookieDays: 1,
    categories: ['furniture', 'home', 'decor'],
    logo: '🛒',
    active: true
  },
  {
    id: 'homebox-ae',
    name: 'Home Box',
    region: 'AE',
    network: 'Admitad',
    baseUrl: 'https://www.homeboxstores.com',
    searchUrl: 'https://www.homeboxstores.com/ae/en/search?q={query}',
    affiliateParam: 'admitad_uid',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'home-decor', 'bedding'],
    logo: '📦',
    active: true
  },
  {
    id: 'ikea-ae',
    name: 'IKEA UAE',
    region: 'AE',
    network: 'Awin',
    baseUrl: 'https://www.ikea.com/ae/en',
    searchUrl: 'https://www.ikea.com/ae/en/search/products/?q={query}',
    affiliateParam: 'awc',
    affiliateTag: '',
    commission: 0.03,
    cookieDays: 30,
    categories: ['furniture', 'storage', 'kitchen'],
    logo: '🪑',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌍 GLOBAL BUDGET MARKETPLACES (HIGH COMMISSION!)
  // Temu, Shein, AliExpress, Alibaba - AGGRESSIVE MONEY MAKERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'temu-global',
    name: 'Temu',
    region: 'GLOBAL',
    network: 'Temu Affiliate',
    baseUrl: 'https://www.temu.com',
    searchUrl: 'https://www.temu.com/search_result.html?search_key={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '', // Sign up: https://affiliate.temu.com
    commission: 0.20, // UP TO 20% COMMISSION!
    cookieDays: 30,
    categories: ['furniture', 'home', 'decor', 'outdoor', 'everything'],
    logo: '🟠',
    active: true
  },
  {
    id: 'shein-global',
    name: 'SHEIN Home',
    region: 'GLOBAL',
    network: 'SHEIN Affiliate',
    baseUrl: 'https://www.shein.com',
    searchUrl: 'https://www.shein.com/pdsearch/{query}/?ici=s1`EditSearch`{query}',
    affiliateParam: 'url_from',
    affiliateTag: '', // Sign up: https://us.shein.com/affiliate
    commission: 0.15, // UP TO 15% COMMISSION!
    cookieDays: 30,
    categories: ['home-decor', 'bedding', 'rugs', 'lighting', 'storage'],
    logo: '🖤',
    active: true
  },
  {
    id: 'aliexpress-global',
    name: 'AliExpress',
    region: 'GLOBAL',
    network: 'AliExpress Affiliate',
    baseUrl: 'https://www.aliexpress.com',
    searchUrl: 'https://www.aliexpress.com/wholesale?SearchText={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '', // Sign up: https://portals.aliexpress.com
    commission: 0.09, // UP TO 9% COMMISSION
    cookieDays: 3,
    categories: ['furniture', 'home', 'decor', 'lighting', 'outdoor', 'everything'],
    logo: '🔴',
    active: true
  },
  {
    id: 'alibaba-global',
    name: 'Alibaba',
    region: 'GLOBAL',
    network: 'Alibaba Affiliate',
    baseUrl: 'https://www.alibaba.com',
    searchUrl: 'https://www.alibaba.com/trade/search?SearchText={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '', // Sign up: https://affiliate.alibaba.com
    commission: 0.07,
    cookieDays: 30,
    categories: ['furniture', 'wholesale', 'bulk', 'manufacturing'],
    logo: '🟧',
    active: true
  },
  {
    id: 'dhgate-global',
    name: 'DHgate',
    region: 'GLOBAL',
    network: 'DHgate Affiliate',
    baseUrl: 'https://www.dhgate.com',
    searchUrl: 'https://www.dhgate.com/wholesale/search.do?searchkey={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'home', 'wholesale', 'decor'],
    logo: '🔵',
    active: true
  },
  {
    id: 'banggood-global',
    name: 'Banggood',
    region: 'GLOBAL',
    network: 'Banggood Affiliate',
    baseUrl: 'https://www.banggood.com',
    searchUrl: 'https://www.banggood.com/search/{query}.html',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.10, // UP TO 10%!
    cookieDays: 30,
    categories: ['home', 'outdoor', 'lighting', 'tools', 'gadgets'],
    logo: '🟡',
    active: true
  },
  {
    id: 'wish-global',
    name: 'Wish',
    region: 'GLOBAL',
    network: 'Wish Affiliate',
    baseUrl: 'https://www.wish.com',
    searchUrl: 'https://www.wish.com/search/{query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.10,
    cookieDays: 7,
    categories: ['home', 'decor', 'gadgets', 'budget'],
    logo: '💙',
    active: true
  },
  {
    id: 'gearbest-global',
    name: 'Gearbest',
    region: 'GLOBAL',
    network: 'Gearbest Affiliate',
    baseUrl: 'https://www.gearbest.com',
    searchUrl: 'https://www.gearbest.com/sale/{query}/',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['home', 'smart-home', 'gadgets', 'lighting'],
    logo: '🔶',
    active: true
  },
  {
    id: 'lightinthebox-global',
    name: 'LightInTheBox',
    region: 'GLOBAL',
    network: 'LITB Affiliate',
    baseUrl: 'https://www.lightinthebox.com',
    searchUrl: 'https://www.lightinthebox.com/search.html?main_search=1&search_q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.12, // UP TO 12%!
    cookieDays: 30,
    categories: ['home', 'lighting', 'decor', 'outdoor'],
    logo: '💡',
    active: true
  },
  {
    id: 'miniinthebox-global',
    name: 'MiniInTheBox',
    region: 'GLOBAL',
    network: 'MITB Affiliate',
    baseUrl: 'https://www.miniinthebox.com',
    searchUrl: 'https://www.miniinthebox.com/search.html?main_search=1&search_q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.12,
    cookieDays: 30,
    categories: ['home', 'gadgets', 'decor', 'lighting'],
    logo: '📦',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇻🇳 VIETNAM & SOUTHEAST ASIA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shopee-sea',
    name: 'Shopee',
    region: 'GLOBAL',
    network: 'Shopee Affiliate',
    baseUrl: 'https://shopee.com',
    searchUrl: 'https://shopee.com/search?keyword={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 7,
    categories: ['furniture', 'home', 'decor', 'everything'],
    logo: '🧡',
    active: true
  },
  {
    id: 'lazada-sea',
    name: 'Lazada',
    region: 'GLOBAL',
    network: 'Lazada Affiliate',
    baseUrl: 'https://www.lazada.com',
    searchUrl: 'https://www.lazada.com/catalog/?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 7,
    categories: ['furniture', 'home', 'decor', 'electronics'],
    logo: '🔷',
    active: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛒 SHOPIFY STORES (Premium commissions)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'burrow-us',
    name: 'Burrow',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://burrow.com',
    searchUrl: 'https://burrow.com/search?query={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 30,
    categories: ['sofa', 'furniture', 'modern'],
    logo: '🛋️',
    active: true
  },
  {
    id: 'floyd-us',
    name: 'Floyd',
    region: 'US',
    network: 'Impact',
    baseUrl: 'https://floydhome.com',
    searchUrl: 'https://floydhome.com/search?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.08,
    cookieDays: 30,
    categories: ['furniture', 'modern', 'modular'],
    logo: '📐',
    active: true
  },
  {
    id: 'interior-define-us',
    name: 'Interior Define',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://www.interiordefine.com',
    searchUrl: 'https://www.interiordefine.com/search?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 45,
    categories: ['sofa', 'furniture', 'custom'],
    logo: '🎨',
    active: true
  },
  {
    id: 'joybird-us',
    name: 'Joybird',
    region: 'US',
    network: 'CJ Affiliate',
    baseUrl: 'https://joybird.com',
    searchUrl: 'https://joybird.com/search/?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.05,
    cookieDays: 14,
    categories: ['sofa', 'furniture', 'mid-century'],
    logo: '🐦',
    active: true
  },
  {
    id: 'albany-park-us',
    name: 'Albany Park',
    region: 'US',
    network: 'ShareASale',
    baseUrl: 'https://albanypark.com',
    searchUrl: 'https://albanypark.com/search?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.07,
    cookieDays: 30,
    categories: ['sofa', 'sectional', 'modern'],
    logo: '🏠',
    active: true
  },
  {
    id: 'castlery-us',
    name: 'Castlery',
    region: 'US',
    network: 'Impact',
    baseUrl: 'https://www.castlery.com',
    searchUrl: 'https://www.castlery.com/us/search?q={query}',
    affiliateParam: 'aff_id',
    affiliateTag: '',
    commission: 0.06,
    cookieDays: 30,
    categories: ['furniture', 'modern', 'premium'],
    logo: '🏰',
    active: true
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL AFFILIATE ROUTER SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

class GlobalAffiliateRouterService {
  private static instance: GlobalAffiliateRouterService;
  private partners: AffiliatePartner[] = AFFILIATE_PARTNERS;
  private userRegion: string = 'US';

  private constructor() {
    this.detectUserRegion();
  }

  static getInstance(): GlobalAffiliateRouterService {
    if (!GlobalAffiliateRouterService.instance) {
      GlobalAffiliateRouterService.instance = new GlobalAffiliateRouterService();
    }
    return GlobalAffiliateRouterService.instance;
  }

  /**
   * Detect user's region from browser/timezone
   */
  private async detectUserRegion(): Promise<void> {
    try {
      // Try to get from localStorage first
      const cached = localStorage.getItem('vv_user_region');
      if (cached) {
        this.userRegion = cached;
        return;
      }

      // Detect from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const regionMap: Record<string, string> = {
        'America/': 'US',
        'Asia/Kolkata': 'IN',
        'Asia/Calcutta': 'IN',
        'Asia/Mumbai': 'IN',
        'Europe/London': 'UK',
        'Europe/Berlin': 'DE',
        'Europe/Paris': 'FR',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Asia/Shanghai': 'CN',
        'Asia/Tokyo': 'JP',
        'Australia/': 'AU',
        'America/Sao_Paulo': 'BR',
        'Asia/Dubai': 'AE'
      };

      for (const [tz, region] of Object.entries(regionMap)) {
        if (timezone.startsWith(tz) || timezone === tz) {
          this.userRegion = region;
          localStorage.setItem('vv_user_region', region);
          return;
        }
      }

      // Default to US
      this.userRegion = 'US';
      localStorage.setItem('vv_user_region', 'US');
    } catch (e) {
      this.userRegion = 'US';
    }
  }

  /**
   * Get partners for user's region + global options
   */
  getPartnersForRegion(region?: string): AffiliatePartner[] {
    const targetRegion = region || this.userRegion;
    return this.partners.filter(p =>
      p.active && (p.region === targetRegion || p.region === 'GLOBAL')
    );
  }

  /**
   * Get all active partners grouped by region
   */
  getPartnersByRegion(): Record<string, AffiliatePartner[]> {
    const grouped: Record<string, AffiliatePartner[]> = {};
    for (const partner of this.partners.filter(p => p.active)) {
      if (!grouped[partner.region]) {
        grouped[partner.region] = [];
      }
      grouped[partner.region].push(partner);
    }
    return grouped;
  }

  /**
   * Generate affiliate link for a product search
   */
  generateAffiliateUrl(partnerId: string, searchQuery: string): string {
    const partner = this.partners.find(p => p.id === partnerId);
    if (!partner) return '';

    const encodedQuery = encodeURIComponent(searchQuery);
    let url = partner.searchUrl
      .replace('{query}', encodedQuery)
      .replace('{tag}', partner.affiliateTag);

    // Add affiliate parameter if tag exists and isn't already in URL
    if (partner.affiliateTag && !url.includes(partner.affiliateTag)) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}${partner.affiliateParam}=${partner.affiliateTag}`;
    }

    return url;
  }

  /**
   * Get comparison links for all partners in user's region
   */
  getComparisonLinks(searchQuery: string, category?: string): AffiliateLink[] {
    const links: AffiliateLink[] = [];
    const regionalPartners = this.getPartnersForRegion();

    for (const partner of regionalPartners) {
      // Filter by category if specified
      if (category && !partner.categories.some(c =>
        c.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(c.toLowerCase())
      )) {
        continue;
      }

      links.push({
        partner: partner.name,
        region: partner.region,
        url: this.generateAffiliateUrl(partner.id, searchQuery),
        logo: partner.logo || '🛒',
        commission: partner.commission,
        tagline: this.getPartnerTagline(partner)
      });
    }

    // Sort by commission (highest first)
    return links.sort((a, b) => b.commission - a.commission);
  }

  /**
   * Get tagline for partner
   */
  private getPartnerTagline(partner: AffiliatePartner): string {
    const taglines: Record<string, string> = {
      'amazon': 'Free shipping with Prime',
      'wayfair': 'Free shipping over $35',
      'ikea': 'Affordable & stylish',
      'flipkart': 'India\'s largest marketplace',
      'pepperfry': 'Best furniture deals',
      'taobao': 'Millions of products',
      'jd': 'Quality guaranteed',
    };

    const key = partner.name.toLowerCase().split(' ')[0];
    return taglines[key] || `Shop at ${partner.name}`;
  }

  /**
   * Track affiliate click
   */
  async trackClick(partnerId: string, searchQuery: string): Promise<void> {
    try {
      await fetch('/api/analytics/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          searchQuery,
          region: this.userRegion,
          timestamp: new Date().toISOString(),
          referrer: window.location.pathname
        })
      });
    } catch (e) {
      // Silent fail
    }
  }

  /**
   * Get stats for admin dashboard
   */
  getStats(): {
    totalPartners: number;
    activePartners: number;
    regionCounts: Record<string, number>;
    networkCounts: Record<string, number>;
  } {
    const active = this.partners.filter(p => p.active);
    const regionCounts: Record<string, number> = {};
    const networkCounts: Record<string, number> = {};

    for (const p of active) {
      regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
      networkCounts[p.network] = (networkCounts[p.network] || 0) + 1;
    }

    return {
      totalPartners: this.partners.length,
      activePartners: active.length,
      regionCounts,
      networkCounts
    };
  }

  /**
   * Get user's detected region
   */
  getUserRegion(): string {
    return this.userRegion;
  }

  /**
   * Set user's region manually
   */
  setUserRegion(region: string): void {
    this.userRegion = region;
    localStorage.setItem('vv_user_region', region);
  }

  /**
   * Get all available regions
   */
  getAvailableRegions(): { code: string; name: string; flag: string }[] {
    return [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'CN', name: 'China', flag: '🇨🇳' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
      { code: 'AE', name: 'UAE', flag: '🇦🇪' }
    ];
  }

  /**
   * Get affiliate networks signup info
   */
  getAffiliateNetworksInfo(): { name: string; url: string; description: string }[] {
    return [
      {
        name: 'Amazon Associates',
        url: 'https://affiliate-program.amazon.com/',
        description: 'World\'s largest affiliate program. Sign up for each country separately.'
      },
      {
        name: 'Awin',
        url: 'https://www.awin.com/',
        description: 'Global network with IKEA, Wayfair, John Lewis, and 15,000+ advertisers.'
      },
      {
        name: 'CJ Affiliate',
        url: 'https://www.cj.com/',
        description: 'Premium network with Overstock, CB2, Crate & Barrel, and more.'
      },
      {
        name: 'ShareASale',
        url: 'https://www.shareasale.com/',
        description: 'Large network with Ethan Allen, Z Gallerie, Article, and many more.'
      },
      {
        name: 'Rakuten Advertising',
        url: 'https://rakutenadvertising.com/',
        description: 'Premium network with West Elm, Pottery Barn, Lowe\'s, and more.'
      },
      {
        name: 'Impact',
        url: 'https://impact.com/',
        description: 'Modern platform with Target, Walmart, and major brands.'
      },
      {
        name: 'FlexOffers',
        url: 'https://www.flexoffers.com/',
        description: 'Large network with diverse furniture and home retailers.'
      },
      {
        name: 'Cuelinks (India)',
        url: 'https://www.cuelinks.com/',
        description: 'Best for Indian market - Flipkart, Pepperfry, Urban Ladder, etc.'
      },
      {
        name: 'Admitad',
        url: 'https://www.admitad.com/',
        description: 'Global network strong in Europe, Middle East, and Asia.'
      },
      {
        name: 'Commission Factory (Australia)',
        url: 'https://www.commissionfactory.com/',
        description: 'Australia\'s largest affiliate network.'
      },
      {
        name: 'Alimama (China)',
        url: 'https://www.alimama.com/',
        description: 'Alibaba\'s affiliate platform for Taobao and Tmall.'
      },
      {
        name: 'JD Union (China)',
        url: 'https://union.jd.com/',
        description: 'JD.com\'s affiliate program.'
      },
      {
        name: 'A8.net (Japan)',
        url: 'https://www.a8.net/',
        description: 'Japan\'s largest affiliate network.'
      },
      {
        name: 'Lomadee (Brazil)',
        url: 'https://www.lomadee.com/',
        description: 'Brazil\'s leading affiliate network.'
      }
    ];
  }
}

export const globalAffiliateRouter = GlobalAffiliateRouterService.getInstance();
export default GlobalAffiliateRouterService;

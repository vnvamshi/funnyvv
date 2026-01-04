// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - HOW IT WORKS DATA
// All content for the How It Works section - 10 icons with subpages
// Place this file in: ~/vistaview_WORKING/src/components/HowItWorksData.ts
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubPage {
  id: string;
  title: string;
  icon: string;
  content: string;
  highlights?: string[];
}

export interface HowItWorksItem {
  id: string;
  title: string;
  icon: string;
  voiceAliases: string[];
  summary: string;
  fullDescription: string;
  subPages: SubPage[];
}

export const HOW_IT_WORKS_DATA: HowItWorksItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. OVERALL FLOW
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'overall-flow',
    title: 'Overall Flow',
    icon: '🌐',
    voiceAliases: ['overall', 'flow', 'overview', 'how does it work', 'general'],
    summary: "The world's first hands-free, self-learning real estate intelligence platform",
    fullDescription: `VistaView is revolutionary! It's the world's first hands-free, self-learning real estate intelligence platform. Imagine placing orders, exploring properties, and managing your entire real estate journey just by speaking naturally - like talking to a brilliant human assistant who never sleeps!

Our agentic AI doesn't just respond - it ACTS. It moves, clicks, navigates, reads aloud, and builds experiences for you. This is what the future of real estate looks like!`,
    subPages: [
      {
        id: 'voice-first',
        title: 'Voice-First Experience',
        icon: '🎤',
        content: `Isn't it amazing? You can literally talk to VistaView like you'd talk to a friend! Say "show me 3-bedroom homes in Irving" and watch the magic happen. The AI cursor walks to the search, types for you, and presents results - all hands-free!

This is how we're solving the world's problem: no more endless clicking, no more confusing navigation. Just speak, and it happens!`,
        highlights: ['Natural conversation', 'Hands-free navigation', 'Real-time responses', 'Human-like interaction']
      },
      {
        id: 'self-learning',
        title: 'Self-Learning AI',
        icon: '🧠',
        content: `Our AI never stops learning! Every interaction makes it smarter. It learns your preferences, understands market trends, and continuously improves.

The more you use VistaView, the better it gets at predicting what you need. It's like having a personal assistant who gets to know you better every day!`,
        highlights: ['Continuous improvement', 'Pattern recognition', 'Personalized experiences', 'Market intelligence']
      },
      {
        id: 'market-problems',
        title: 'Problems We Solve',
        icon: '🎯',
        content: `Real estate has been fragmented for decades! Data silos everywhere, manual processes, endless paperwork. We're changing all of that!

VistaView unifies everything: listings, documents, catalogs, services, insurance, finance - all in one intelligent platform. No more jumping between 10 different websites!`,
        highlights: ['Eliminates data silos', 'Unified platform', 'Automated workflows', 'Single source of truth']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. MR. V AGENT
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mr-v-agent',
    title: 'Mr. V Agent',
    icon: '🤖',
    voiceAliases: ['mr v', 'agent', 'assistant', 'ai agent', 'mr v agent'],
    summary: 'Your intelligent AI companion that walks, clicks, and executes for you',
    fullDescription: `Meet Mr. V - your personal AI agent! Unlike boring chatbots that just respond with text, Mr. V actually DOES things for you. Watch the walking icon move across the screen, highlight buttons, click them, and navigate the entire platform!

Mr. V is an execution agent. It doesn't just answer - it ACTS. Need to sign up? Mr. V walks you through every step. Want to explore properties? Mr. V takes you there!`,
    subPages: [
      {
        id: 'walking-navigation',
        title: 'Walking Navigation',
        icon: '🚶',
        content: `This is where the magic happens! See that walking icon? It's Mr. V physically navigating the interface for you. It walks to buttons, highlights them, clicks them - just like a human would!

Say "go to About Us" and watch Mr. V walk to the navigation, highlight the button, and click it. It's so intuitive, you'll forget you're using a computer!`,
        highlights: ['Visual cursor movement', 'Button highlighting', 'Click animations', 'Human-like browsing']
      },
      {
        id: 'confirmation-gates',
        title: 'Safe Confirmations',
        icon: '✅',
        content: `Mr. V is smart but also careful! Before making any important action, it asks for your permission. "Should I submit this form?" "Want me to proceed with this listing?"

This means you're always in control. Nothing happens without your approval. It's like having an assistant who double-checks everything!`,
        highlights: ['Permission-based actions', 'User always in control', 'Safe operations', 'Mistake prevention']
      },
      {
        id: 'recovery-mode',
        title: 'Smart Recovery',
        icon: '🔄',
        content: `What if something goes wrong? Mr. V has got you covered! If a page is missing, it creates a placeholder and continues. If there's an error, it recovers gracefully.

Our AI is resilient. It adapts, recovers, and keeps going - just like a human problem-solver would!`,
        highlights: ['Auto-recovery', 'Error handling', 'Graceful degradation', 'Continuous operation']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. VOICE & TELEPROMPTER
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'voice-teleprompter',
    title: 'Voice & Teleprompter',
    icon: '🎙️',
    voiceAliases: ['voice', 'teleprompter', 'speech', 'talk', 'speak'],
    summary: 'Always-on voice with real-time teleprompter feedback',
    fullDescription: `The teleprompter bar you see at the bottom? That's your window into the AI's mind! It shows exactly what you said, what the AI understood, and what it's doing right now.

Three powerful modes: Interactive (AI navigates for you), Talkative (natural conversation), and Text (typing). Switch anytime by just asking!`,
    subPages: [
      {
        id: 'always-listening',
        title: 'Always Listening',
        icon: '👂',
        content: `VistaView is always ready to help! No need to click a button first - just start talking. The green indicator shows when it's listening.

Say "Hey" or "Stop" to interrupt anytime. It's designed to feel like a real conversation where you can jump in whenever you want!`,
        highlights: ['No wake word needed', 'Instant interrupts', 'Natural pauses', 'Continuous listening']
      },
      {
        id: 'read-aloud',
        title: 'Read Aloud Feature',
        icon: '📖',
        content: `Don't want to read? No problem! Mr. V can read everything aloud for you. Property descriptions, team bios, how-to guides - all spoken in a natural voice.

Perfect for multitasking! Listen while you cook, drive, or relax. Real estate information has never been so accessible!`,
        highlights: ['Natural speech', 'Adjustable speed', 'Pause/resume', 'Skip sections']
      },
      {
        id: 'accessibility',
        title: 'Full Accessibility',
        icon: '♿',
        content: `VistaView is designed for everyone! Our voice-first approach means people with visual impairments or motor difficulties can use the platform fully.

This is real estate for ALL people. No barriers, no limitations - just speak and explore!`,
        highlights: ['Screen reader compatible', 'Voice-only mode', 'Large text options', 'High contrast themes']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. AI LEARNING & RAG
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ai-learning',
    title: 'AI Learning & RAG',
    icon: '📚',
    voiceAliases: ['learning', 'rag', 'ai learning', 'knowledge', 'training'],
    summary: 'Continuous learning from documents, catalogs, and interactions',
    fullDescription: `Our AI gets smarter every single day! It learns from uploaded documents, catalogs, market data, and every interaction. We use RAG (Retrieval Augmented Generation) to give you accurate, source-backed answers.

Ask anything about real estate, products, or services - and get answers grounded in real data, not hallucinations!`,
    subPages: [
      {
        id: 'document-ingestion',
        title: 'Document Ingestion',
        icon: '📄',
        content: `Upload PDFs, CAD files, catalogs, brochures - VistaView understands them all! Our AI extracts text, tables, images, and creates structured data automatically.

A 100-page property document? Processed in minutes. All the key information extracted and ready to query!`,
        highlights: ['PDF processing', 'CAD file support', 'Image extraction', 'Table recognition']
      },
      {
        id: 'vector-embeddings',
        title: 'Smart Embeddings',
        icon: '🔢',
        content: `Every piece of content becomes a mathematical vector - a smart representation that captures meaning, not just words.

This is why you can ask "homes with mountain views" and find properties that match, even if they don't use those exact words!`,
        highlights: ['Semantic search', 'Meaning-based matching', 'Context awareness', 'Multi-language support']
      },
      {
        id: 'ask-anything',
        title: 'Ask Anything',
        icon: '❓',
        content: `Go ahead - ask anything! "What's the average price in this area?" "Which builders have 5-star ratings?" "Show me homes with pools under $500K."

Our RAG system retrieves relevant information and generates accurate answers. It's like having a real estate expert available 24/7!`,
        highlights: ['Natural questions', 'Accurate answers', 'Source citations', 'Follow-up queries']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. TRUST & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'trust-security',
    title: 'Trust & Security',
    icon: '🔒',
    voiceAliases: ['trust', 'security', 'safe', 'secure', 'privacy'],
    summary: 'Transparent, secure, and always accountable',
    fullDescription: `Trust is built into every layer of VistaView! Every action is logged, every change is tracked, and you can always see where information comes from.

We don't just say we're secure - we prove it with full audit trails, permission controls, and rollback capabilities!`,
    subPages: [
      {
        id: 'audit-trail',
        title: 'Full Audit Trail',
        icon: '📋',
        content: `Every single action is recorded! Who made changes, when, and what exactly changed. Perfect for compliance, accountability, and peace of mind.

Need to know what happened last Tuesday? Just check the audit log. Complete transparency!`,
        highlights: ['Complete history', 'User attribution', 'Timestamp tracking', 'Change details']
      },
      {
        id: 'permissions',
        title: 'Permission Controls',
        icon: '🛡️',
        content: `Not everyone should have access to everything. VistaView has granular permission controls - define who can view, edit, or delete.

Vendors see their stuff, buyers see public listings, admins manage everything. Clear boundaries, no confusion!`,
        highlights: ['Role-based access', 'Granular controls', 'Team management', 'Secure sharing']
      },
      {
        id: 'rollback',
        title: 'Version Rollback',
        icon: '⏪',
        content: `Made a mistake? No worries! Every version is saved. You can roll back to any previous state with one click.

This is enterprise-grade data protection for everyone. Your work is always safe!`,
        highlights: ['Version history', 'One-click restore', 'Data protection', 'Peace of mind']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. REAL ESTATE
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'real-estate',
    title: 'Real Estate',
    icon: '🏠',
    voiceAliases: ['real estate', 'properties', 'homes', 'listings', 'houses'],
    summary: 'Explore residential, commercial, and industrial properties',
    fullDescription: `This is the heart of VistaView! Browse the full spectrum of real estate - residential homes, commercial spaces, industrial properties, warehouses, and more.

Upload listings, explore immersively, compare options - all with voice commands. Say "show me 4-bedroom homes in Dallas" and watch the magic!`,
    subPages: [
      {
        id: 'residential',
        title: 'Residential Properties',
        icon: '🏡',
        content: `Find your dream home! Single-family houses, condos, townhomes, apartments - all searchable by voice.

"Show me homes with pools under $400K" - and there they are! Filter by bedrooms, bathrooms, square footage, amenities, schools nearby, and more!`,
        highlights: ['All home types', 'Voice search', 'Smart filters', 'Neighborhood insights']
      },
      {
        id: 'commercial',
        title: 'Commercial Spaces',
        icon: '🏢',
        content: `Office spaces, retail locations, restaurants - VistaView covers it all! Perfect for business owners and investors.

Compare lease terms, check foot traffic data, explore virtual tours - all in one place!`,
        highlights: ['Office spaces', 'Retail locations', 'Lease comparison', 'Traffic analytics']
      },
      {
        id: 'for-builders',
        title: 'Builder Projects',
        icon: '🏗️',
        content: `Builders can go live in under 30 minutes! Upload your project documents, and VistaView creates beautiful, interactive project pages automatically.

Floor plans, amenities, pricing, timelines - all extracted and presented professionally. No technical skills needed!`,
        highlights: ['Quick onboarding', 'Auto-generated pages', 'Floor plan display', 'Progress tracking']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. PRODUCT CATALOG
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'product-catalog',
    title: 'Product Catalog',
    icon: '📦',
    voiceAliases: ['product', 'catalog', 'catalogue', 'products', 'shop'],
    summary: 'Vendor storefronts with 500,000+ SKUs',
    fullDescription: `Vendors can create stunning storefronts in minutes! Upload your catalog, and VistaView extracts every product, price, specification, and image automatically.

We're building toward 500,000+ SKUs - furniture, appliances, fixtures, materials - everything for real estate!`,
    subPages: [
      {
        id: 'vendor-onboarding',
        title: 'Vendor Onboarding',
        icon: '🚀',
        content: `Go live in under 30 minutes! That's our promise to vendors. Upload your catalog PDF or spreadsheet, and watch your storefront appear.

No coding, no design skills, no technical setup. Just upload and sell. It's that simple!`,
        highlights: ['30-minute setup', 'Auto catalog import', 'Instant storefront', 'Zero coding']
      },
      {
        id: 'smart-search',
        title: 'Smart Product Search',
        icon: '🔍',
        content: `Find products by speaking naturally! "Show me leather sofas under $2000" or "I need energy-efficient refrigerators."

Our AI understands what you mean, not just what you say. Semantic search that actually works!`,
        highlights: ['Voice search', 'Semantic matching', 'Filter by specs', 'Price comparison']
      },
      {
        id: 'order-management',
        title: 'Order Management',
        icon: '📋',
        content: `Place orders with voice commands! "Add this sofa to cart" → "Proceed to checkout" → Done!

Track orders, manage inventory, handle returns - all integrated into one seamless experience!`,
        highlights: ['Voice ordering', 'Order tracking', 'Inventory sync', 'Return handling']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. INTERIOR DESIGN
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'interior-design',
    title: 'Interior Design',
    icon: '🎨',
    voiceAliases: ['interior', 'design', 'decor', 'decoration', 'styling'],
    summary: 'AI-powered design recommendations and room packages',
    fullDescription: `Transform any space with AI-powered design! Get style recommendations, room packages, and shoppable looks - all personalized to your taste.

Say "I like modern minimalist style" and watch VistaView curate the perfect products for you!`,
    subPages: [
      {
        id: 'style-discovery',
        title: 'Style Discovery',
        icon: '✨',
        content: `Not sure what style you like? Let's discover it together! Show us images you love, describe your vibe, and our AI identifies your style.

Modern? Farmhouse? Industrial? Bohemian? We'll find your perfect match and recommend products accordingly!`,
        highlights: ['Style quiz', 'Image analysis', 'Personalized profile', 'Trend insights']
      },
      {
        id: 'room-packages',
        title: 'Room Packages',
        icon: '🛋️',
        content: `Complete rooms in one click! Our curated packages include everything - furniture, lighting, decor, rugs - all designed to work together.

"Show me living room packages under $5000" - instant options, professionally designed!`,
        highlights: ['Curated sets', 'Budget options', 'Style-matched', 'One-click buy']
      },
      {
        id: 'visualizer',
        title: '3D Visualizer',
        icon: '🖼️',
        content: `See it before you buy it! Our 3D visualizer lets you place products in your space virtually.

Upload a photo of your room, drag in products, and see how they look. No more guessing!`,
        highlights: ['AR placement', 'Room photos', 'Scale accurate', 'Color matching']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. SERVICES
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'services',
    title: 'Services',
    icon: '🔧',
    voiceAliases: ['services', 'service', 'help', 'assistance', 'support'],
    summary: 'Insurance, finance, moving, maintenance - all integrated',
    fullDescription: `Real estate isn't just about properties - it's about services too! VistaView integrates insurance, financing, moving, maintenance, and more.

One platform for everything. Buy a home, get insurance, schedule movers, find contractors - seamlessly!`,
    subPages: [
      {
        id: 'insurance',
        title: 'Insurance Integration',
        icon: '🛡️',
        content: `Get insurance quotes while you browse properties! Our integrated insurance partners provide instant quotes based on the property you're viewing.

No separate searches, no multiple forms. See the true cost of ownership upfront!`,
        highlights: ['Instant quotes', 'Multiple providers', 'Property-specific', 'Easy comparison']
      },
      {
        id: 'financing',
        title: 'Finance Options',
        icon: '💰',
        content: `Mortgage pre-approval in minutes! Our finance partners integrate directly - see your buying power before you even start browsing.

Compare rates, calculate payments, get approved - all without leaving VistaView!`,
        highlights: ['Pre-approval', 'Rate comparison', 'Calculator tools', 'Lender matching']
      },
      {
        id: 'home-services',
        title: 'Home Services',
        icon: '🏠',
        content: `Moving? Need repairs? Looking for cleaners? VistaView connects you with verified service providers.

"Find movers for next Saturday" - and get quotes instantly. That's the power of integration!`,
        highlights: ['Verified providers', 'Instant quotes', 'Scheduling', 'Reviews & ratings']
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. WHY VISTAVIEW
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'why-vistaview',
    title: 'Why VistaView',
    icon: '⭐',
    voiceAliases: ['why vistaview', 'advantages', 'benefits', 'why', 'what makes'],
    summary: "The world's first - and there's nothing else like it",
    fullDescription: `Why choose VistaView? Because there's literally nothing else like it on the planet! We're the world's first hands-free, self-learning real estate intelligence platform.

This isn't an incremental improvement - it's a complete reimagining of how real estate works!`,
    subPages: [
      {
        id: 'world-first',
        title: "World's First",
        icon: '🌍',
        content: `No one else has built this! Voice-driven, agentic AI that actually navigates, clicks, and executes in real estate? That's VistaView alone.

We're not improving the old way - we're creating the new way. This is the future, available today!`,
        highlights: ['First in market', 'Patent-pending tech', 'Unique approach', 'Industry pioneer']
      },
      {
        id: 'for-everyone',
        title: 'For Everyone',
        icon: '👥',
        content: `Buyers, sellers, agents, builders, vendors, investors - VistaView serves everyone in the real estate ecosystem.

One platform, multiple perspectives, unified experience. No more fragmented tools!`,
        highlights: ['Buyers & sellers', 'Agents & brokers', 'Builders & vendors', 'Investors']
      },
      {
        id: 'the-future',
        title: 'The Future is Here',
        icon: '🚀',
        content: `This is what real estate will look like in 10 years - and we're delivering it now! Early adopters get the competitive advantage.

Join us in building the future. Be part of the revolution. Experience VistaView!`,
        highlights: ['Cutting edge', 'Competitive advantage', 'Growing platform', 'Community driven']
      }
    ]
  }
];

// Voice aliases for quick lookup
export const VOICE_COMMAND_MAP: Record<string, string> = {};
HOW_IT_WORKS_DATA.forEach(item => {
  item.voiceAliases.forEach(alias => {
    VOICE_COMMAND_MAP[alias.toLowerCase()] = item.id;
  });
});

// Get item by voice command
export function findItemByVoice(command: string): HowItWorksItem | undefined {
  const lower = command.toLowerCase();
  for (const item of HOW_IT_WORKS_DATA) {
    for (const alias of item.voiceAliases) {
      if (lower.includes(alias)) {
        return item;
      }
    }
  }
  return undefined;
}

// Get subpage by title
export function findSubPageByVoice(command: string, item: HowItWorksItem): SubPage | undefined {
  const lower = command.toLowerCase();
  for (const subPage of item.subPages) {
    if (lower.includes(subPage.title.toLowerCase()) || lower.includes(subPage.id)) {
      return subPage;
    }
  }
  return undefined;
}

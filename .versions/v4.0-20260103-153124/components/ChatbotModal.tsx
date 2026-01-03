import React, { useState, useRef, useEffect } from 'react';
import attachIcon from '../assets/images/v3.2/attach-circle.png';
import micIcon from '../assets/images/v3.2/mic-icon.png';
import sendIcon from '../assets/images/v3.2/sent-icon.png';
import aiModeIcon from '../assets/images/v3.2/ai-mode.png';
import voiceChatIcon from '../assets/images/v3.2/voicechaticon.png';
import { useChatbot } from '../contexts/ChatbotContext';
import { useCart } from '../contexts/CartContext';
import VoiceToVoiceModal from './VoiceToVoiceModal';
import { sendToGeminiAI, searchProperties, transcribeAudio, extractPropertyQueryAI, AIPropertyExtraction } from '../utils/api';
import { 
  detectEcommerceIntent, 
  extractProductName, 
  getProductAlternatives,
  generateProductDetailsResponse,
  generateAlternativesResponse,
  generateCartResponse,
  generateCheckoutResponse,
  generatePaymentConfirmationResponse,
  generateOTPResponse,
  generateOrderConfirmationResponse,
  getRandomProducts,
  EcommerceFlowState
} from '../utils/ecommerceFlow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import v3Properties from '../v3/data/properties.json';
import { processProperties } from '../v3/utils/imageMapping';
import v3Products from '../v3/data/products.json';
import { persistSelectedPropertyId } from '../utils/propertyNavigation';
import skyvenImage from '../assets/images/v3.2/skyven.png';
import { VR_TOUR_URL } from '../utils/vrTourUrl';

const SKYVEN_PROPERTY_ID = 9999;
const SKYVEN_VIEWER_ROUTE = '/skyven-with-surroundings-viewer';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  properties?: any[]; // Array of property objects
  products?: any[]; // Array of product objects
  warrantyPlans?: Array<{ years: number; price: number; serviceCharge: number; total: number; recommended?: boolean; savings?: number }>; // Plan cards
  planType?: 'warranty' | 'insurance';
  actionButtons?: Array<{ label: string; type: 'photos' | 'videos' | 'floorplans' | 'vtour'; propertyId?: number }>;
  // E-commerce specific
  ecommerceFlow?: {
    phase: 'browsing' | 'product-details' | 'alternatives' | 'cart' | 'checkout' | 'payment' | 'otp' | 'order-confirmation';
    selectedProduct?: any;
    alternatives?: any[];
    cartItems?: any[];
    paymentMethod?: string;
    orderDetails?: any;
  };
}

// Property Card Component (from MapSearch page)
const PropertyCard: React.FC<{ property: any; onClick?: () => void }> = ({ property, onClick }) => {
  return (
    <div 
      className="gradient-border-mask mx-auto transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
      style={{ padding: 1.5, borderRadius: 12 }} 
      onClick={onClick}
    >
      <div className="rounded-[12px] overflow-hidden mx-auto w-full max-w-[280px] bg-white">
        <div className="relative aspect-[16/11] w-full overflow-hidden">
          <ImageWithFallback src={property.image} alt={property.title} />
          <button 
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-emerald-700" 
            onClick={(e) => { e.stopPropagation(); }}
          >
            ♡
          </button>
        </div>
        <div className="p-2 text-left">
          <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 text-left text-emerald-900">
            {property.title}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5 text-left">{property.location}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-1 justify-start">
            <span>{property.beds}BHK</span>
            <span>•</span>
            <span>{property.baths} Bathrooms</span>
            <span>•</span>
            <span>{property.sqft.toLocaleString()} Sq. Ft.</span>
          </div>
          <div className="mt-1 text-[15px] font-extrabold text-left text-emerald-900">
            ${property.price.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{ product: any; onClick?: () => void }> = ({ product, onClick }) => {
  const savings = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  
  return (
    <div 
      className="gradient-border-mask mx-auto transition-all duration-300 cursor-pointer hover:scale-[1.02]" 
      style={{ padding: 1.5, borderRadius: 12 }} 
      onClick={onClick}
    >
      <div className="rounded-[12px] overflow-hidden mx-auto w-full max-w-[280px] bg-white">
        <div className="relative aspect-[16/11] w-full overflow-hidden">
          <ImageWithFallback src={product.image} alt={product.name} />
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {savings}% OFF
          </div>
          <button 
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-emerald-700" 
            onClick={(e) => { e.stopPropagation(); }}
          >
            ♡
          </button>
        </div>
        <div className="p-2 text-left">
          <h3 className="font-semibold text-[13px] leading-tight line-clamp-2 text-left text-emerald-900">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5 text-left">{product.category}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mt-1 justify-start">
            <span>{product.vendor}</span>
            <span>•</span>
            <span>{product.warranty}</span>
            <span>•</span>
            <span>{product.rating}★</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-left text-emerald-900">
              ${product.price.toLocaleString()}
            </span>
            <span className="text-[12px] text-gray-500 line-through">
              ${product.mrp.toLocaleString()}
            </span>
          </div>
          {product.insurance?.available && (
            <div className="mt-1 text-[9px] text-green-600">
              + Insurance: ${product.insurance.price}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Warranty/Insurance Plan Cards (compact, inspired by cart modal)
const PlanCards: React.FC<{ plans: Array<{ years: number; price: number; serviceCharge: number; total: number; recommended?: boolean; savings?: number }>; planType?: 'warranty' | 'insurance' }> = ({ plans, planType = 'warranty' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {plans.map((p) => {
        const selected = !!p.recommended; // highlight the recommended (second) plan with green gradient
        return (
          <div
            key={p.years}
            className={`relative p-3 border-2 rounded-lg shadow-lg ${p.recommended ? 'border-yellow-500' : 'border-gray-200'}`}
            style={{
              background: selected
                ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)'
                : 'rgba(253, 251, 235, 1)'
            }}
          >
            {p.recommended && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded font-semibold">
                Recommended
              </div>
            )}
            <div className="text-center">
              <div className="mb-2">
                <h4
                  className="font-bold text-base mb-1"
                  style={{
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  + {p.years} year
                </h4>
                <p
                  className="text-xs font-medium"
                  style={{ color: selected ? 'white' : 'rgba(0, 66, 54, 1)' }}
                >
                  {planType === 'insurance' ? 'Insurance' : 'Extended warranty'}
                </p>
              </div>
              <div className="space-y-2">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-bold w-full inline-block"
                  style={selected ? {
                    background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
                    color: 'rgba(0, 66, 54, 1)'
                  } : {
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    color: 'white'
                  }}
                >
                  ${p.price}
                </div>
                <div className="text-xs font-medium" style={{ color: selected ? 'white' : 'rgba(0, 66, 54, 1)' }}>
                  +${p.serviceCharge} for Service charge
                </div>
                {typeof p.savings === 'number' && p.savings > 0 && (
                  <div className="text-xs font-semibold" style={{ color: selected ? 'rgba(0, 255, 115, 1)' : 'rgba(227, 29, 28, 1)' }}>
                    Save ${p.savings}!
                  </div>
                )}
                <div className="text-[12px] font-semibold" style={{ color: selected ? 'white' : 'rgba(0, 66, 54, 1)' }}>
                  Total : $ {p.total}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Image with fallback component
const ImageWithFallback: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  return errored ? (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <span className="text-gray-400 text-sm">No Image</span>
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover" 
      onError={() => setErrored(true)} 
    />
  );
};

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const isAudioRecordingSupported = typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

type UploadedFile = {
  file: File;
  previewUrl?: string;
};

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, initialMessage = '' }) => {
  const navigate = useNavigate();
  const { openVoiceModal, closeVoiceModal, isVoiceModalOpen } = useChatbot();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, createOrder, verifyOTP } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState(initialMessage);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [ecommerceFlowState, setEcommerceFlowState] = useState<EcommerceFlowState>({
    currentPhase: 'browsing',
    cartItems: [],
    otpAttempts: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shownIdsRef = useRef<Set<number>>(new Set());

  // Load conversation history from sessionStorage when modal opens (clears on page refresh)
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, loading chat history...');
      const savedMessages = sessionStorage.getItem('chatbot-messages');
      console.log('Saved messages from sessionStorage:', savedMessages);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          console.log('Parsed messages:', parsedMessages);
          // Show last 10 messages to keep it manageable
          const recentMessages = parsedMessages.slice(-10);
          console.log('Recent messages to display:', recentMessages);
          setMessages(recentMessages);
        } catch (error) {
          console.error('Error loading chat history:', error);
          // Fallback to welcome message
          setMessages([{
            id: '1',
            text: 'Hello! I\'m VistaView AI, your comprehensive *real estate and home solutions assistant*. I can help you with:\n\n• *Real Estate* - Find properties, locations, prices, and features\n• *Products* - Browse furniture, appliances, flooring, and home items\n• *Warranty* - Information about product warranties and guarantees\n• *Insurance* - Product protection and insurance options\n\nHow can I assist you today?',
            isUser: false,
            timestamp: new Date()
          }]);
        }
      } else {
        console.log('No saved messages found, showing welcome message');
        // No saved messages, show welcome message
        setMessages([{
          id: '1',
          text: 'Hello! I\'m VistaView AI, your comprehensive *real estate and home solutions assistant*. I can help you with:\n\n• *Real Estate* - Find properties, locations, prices, and features\n• *Products* - Browse furniture, appliances, flooring, and home items\n• *Warranty* - Information about product warranties and guarantees\n• *Insurance* - Product protection and insurance options\n\nHow can I assist you today?',
          isUser: false,
          timestamp: new Date()
        }]);
      }
      // Load shown property ids to avoid repetition across the session
      try {
        const savedShown = sessionStorage.getItem('chatbot-shown-property-ids');
        if (savedShown) {
          const arr: number[] = JSON.parse(savedShown);
          shownIdsRef.current = new Set(arr);
        }
      } catch {}
    }
  }, [isOpen]);

  // Handle initial message when it changes
  useEffect(() => {
    if (initialMessage && initialMessage.trim() !== '') {
      setInputMessage(initialMessage);
    }
  }, [initialMessage]);

  // Save conversation history to sessionStorage whenever messages change (clears on page refresh)
  useEffect(() => {
    if (messages.length > 0) {
      console.log('Saving messages to sessionStorage:', messages);
      sessionStorage.setItem('chatbot-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Generate intelligent property response based on user query and real data
  // Function to clean up formatting in AI responses
  const cleanResponseFormatting = (text: string): string => {
    // Replace **bold** with *bold*
    let cleaned = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
    // Remove any remaining bold formatting
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    return cleaned;
  };

  // Render AI text via Markdown (GFM). We keep styling minimal and safe.
  const renderAIText = (text: string) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      strong: (props: any) => <strong {...props} className="font-semibold" />,
      em: (props: any) => <em {...props} className="italic" />,
      p: (props: any) => <p {...props} className="mb-1 last:mb-0" />,
      ul: (props: any) => <ul {...props} className="list-disc pl-5 my-1" />,
      ol: (props: any) => <ol {...props} className="list-decimal pl-5 my-1" />,
      code: ({inline, className, children, ...props}: any) => (
        <code {...props} className={`bg-gray-100 rounded px-1 ${className || ''}`}>{children}</code>
      )
    }}>
      {text}
    </ReactMarkdown>
  );

  // Helpers to manage non-repeating selections
  const loadShownIds = (): Set<number> => shownIdsRef.current;
  const saveShownIds = (ids: Set<number>) => {
    shownIdsRef.current = ids;
    try {
      sessionStorage.setItem('chatbot-shown-property-ids', JSON.stringify(Array.from(ids)));
    } catch {}
  };

  const recordShownProperties = (props?: any[]) => {
    if (!props || !props.length) return;
    const ids = loadShownIds();
    props.forEach(p => {
      if (typeof p?.id === 'number') ids.add(p.id);
    });
    // Keep only recent last 60 to bound size
    const arr = Array.from(ids).slice(-60);
    saveShownIds(new Set(arr));
  };

  const pickNonRepeating = (list: any[], count: number): any[] => {
    const ids = loadShownIds();
    const unseen = list.filter(p => !ids.has(Number(p.id)));
    const seen = list.filter(p => ids.has(Number(p.id)));
    const result: any[] = [];
    for (const p of unseen) {
      if (result.length >= count) break;
      result.push(p);
    }
    if (result.length < count) {
      for (const p of seen) {
        if (result.length >= count) break;
        result.push(p);
      }
    }
    return result.slice(0, count);
  };

  // Extract structured keywords/filters from a freeform user query
  const extractQueryKeywords = (query: string) => {
    const q = query.toLowerCase();
    const result: {
      propertyId?: number;
      titleText?: string;
      locationText?: string;
      priceMin?: number;
      priceMax?: number;
      beds?: number;
      baths?: number;
      propertyType?: string;
      amenities?: string[];
    } = {};

    // Property id patterns: "property 12", "id 12", "#12"
    const idMatch = q.match(/(?:property\s*#?|id\s*#?)(\d{1,6})\b/);
    if (idMatch) {
      result.propertyId = parseInt(idMatch[1], 10);
    }

    // Price: between X and Y
    const moneyToNumber = (s: string) => {
      // Handle formats: 1,500,000 | 1.5m | 1.5 million | 15k
      let t = s.trim().replace(/[$,\s]/g, '');
      const million = /m(illion)?$/i.test(t);
      const thousand = /k$/i.test(t);
      t = t.replace(/m(illion)?$/i, '').replace(/k$/i, '');
      const n = parseFloat(t || '0');
      if (isNaN(n)) return undefined;
      if (million) return Math.round(n * 1_000_000);
      if (thousand) return Math.round(n * 1_000);
      return Math.round(n);
    };

    const between = q.match(/between\s*([$\d.,mk\s]+)\s*(?:and|to|\-)\s*([$\d.,mk\s]+)/i);
    if (between) {
      const a = moneyToNumber(between[1]);
      const b = moneyToNumber(between[2]);
      if (a !== undefined && b !== undefined) {
        result.priceMin = Math.min(a, b);
        result.priceMax = Math.max(a, b);
      }
    }
    const under = q.match(/(?:under|below|less than)\s*([$\d.,mk\s]+)/i);
    if (under && result.priceMax === undefined) {
      const v = moneyToNumber(under[1]);
      if (v !== undefined) result.priceMax = v;
    }
    const over = q.match(/(?:over|above|more than)\s*([$\d.,mk\s]+)/i);
    if (over && result.priceMin === undefined) {
      const v = moneyToNumber(over[1]);
      if (v !== undefined) result.priceMin = v;
    }

    // Beds/Baths
    const beds = q.match(/(\d+)\s*(?:bed|bedroom)s?/i);
    if (beds) result.beds = parseInt(beds[1], 10);
    const baths = q.match(/(\d+)\s*(?:bath|bathroom)s?/i);
    if (baths) result.baths = parseInt(baths[1], 10);

    // Property type
    const types = ['apartment', 'house', 'condo', 'townhouse', 'villa', 'duplex', 'studio', 'loft'];
    const foundType = types.find(t => q.includes(t));
    if (foundType) result.propertyType = foundType === 'duplex' ? 'Duplex Homes' : (foundType.charAt(0).toUpperCase() + foundType.slice(1));

    // Amenities
    const amenityKeywords = ['gym', 'garden', 'parking', 'bbq', 'deck', 'sauna', 'smart home', 'fireplace', 'clubhouse', 'playground'];
    const foundAmenities = amenityKeywords.filter(a => q.includes(a));
    if (foundAmenities.length) result.amenities = foundAmenities;

    // Title/location text: try to infer by scanning known titles and city/borough cues
    const v3List = Array.isArray(v3Properties) ? (v3Properties as any[]) : [];
    const titleHit = v3List.find(p => q.includes(String(p.title).toLowerCase()));
    if (titleHit) result.titleText = titleHit.title;

    const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'new york', 'nyc'];
    const locHit = boroughs.find(b => q.includes(b));
    if (locHit) result.locationText = locHit;

    // Also attempt to catch a free-text location token from property locations
    if (!result.locationText) {
      const uniqueAreas = Array.from(new Set(v3List.map(p => String(p.location).split(',')[0].toLowerCase().trim())));
      const areaHit = uniqueAreas.find(a => a && q.includes(a));
      if (areaHit) result.locationText = areaHit;
    }

    return result;
  };

  const generateProductResponse = async (query: string, allProducts: any[]): Promise<Message> => {
    const queryLower = query.toLowerCase();
    const v3ProductsList = Array.isArray(v3Products) ? (v3Products as any[]) : [];

    // Analyze user intent and provide contextual response
    const analyzeIntent = (query: string) => {
      const q = query.toLowerCase();
      
    // Intent analysis
    const intents = {
      browse: /(?:show|browse|see|view|list|find|get|want|need|looking for)/i.test(q),
      specific: /(?:specific|particular|exact|precise)/i.test(q),
      compare: /(?:compare|vs|versus|difference|better|best)/i.test(q),
      budget: /(?:cheap|affordable|budget|low cost|inexpensive|under|below)/i.test(q),
      premium: /(?:expensive|premium|luxury|high end|top|best quality)/i.test(q),
      category: /(?:furniture|flooring|lighting|appliances|bathroom|tiles|sofa|dining|kitchen)/i.test(q),
      warranty: /(?:warranty|guarantee|protection|coverage)/i.test(q),
      insurance: /(?:insurance|insured|protection|secure)/i.test(q),
      help: /(?:help|what|how|can you|suggest|recommend)/i.test(q),
      cart: /(?:cart|shopping cart|buy|purchase|order|checkout|add to cart)/i.test(q),
      purchase: /(?:buy|purchase|order|checkout|payment|pay|transaction)/i.test(q)
    };

      return intents;
    };

    const intents = analyzeIntent(query);
    
    // Generate contextual response based on intent
    let responseText = '';
    let filteredProducts = [...v3ProductsList];

    if (intents.cart || intents.purchase) {
      responseText = `As VistaView AI, I don't have a shopping cart feature or the ability to process direct product purchases. My expertise lies in real estate and home solutions.\n\nHowever, I can certainly help you learn more about products that might enhance your home! To assist you best, could you tell me more about what you're interested in? For example:\n\n• Are you looking for furniture for a specific room?\n• Perhaps appliances for a new kitchen or renovation?\n• Are you interested in smart home technology?\n• Or maybe you're considering specific features or materials for a property?\n\nUnderstanding your needs will help me provide relevant information, comparisons, or even suggest how certain products can impact your home's value or functionality.`;
      
      // Don't show products for cart/purchase queries, just provide informational response
      filteredProducts = [];
      
    } else if (intents.help || (intents.browse && !intents.specific)) {
      responseText = `I'd be happy to help you learn about products that might enhance your home! As VistaView AI, I specialize in real estate and home solutions, including product information, warranties, and insurance options.\n\nWhat specific type of products are you interested in? For example:\n• Furniture for a specific room\n• Appliances for kitchen or renovation\n• Smart home technology\n• Flooring or lighting solutions\n\nUnderstanding your needs will help me provide relevant information and comparisons!`;
      
      // Show a sample of different categories
      const categorySamples: { [key: string]: any } = {};
      v3ProductsList.forEach(product => {
        if (!categorySamples[product.category]) {
          categorySamples[product.category] = product;
        }
      });
      filteredProducts = Object.values(categorySamples).slice(0, 6);
      
    } else if (intents.category) {
      const categories = ['furniture', 'flooring', 'lighting', 'appliances', 'bathroom'];
      const foundCategory = categories.find(cat => queryLower.includes(cat));
      
      if (foundCategory) {
        filteredProducts = v3ProductsList.filter(p => 
          p.category.toLowerCase().includes(foundCategory)
        );
        responseText = `Here are some excellent *${foundCategory} products* from our collection. Each comes with warranty and insurance options:`;
      } else {
        responseText = `I found some great products for you. Here's what we have available:`;
        filteredProducts = pickNonRepeating(v3ProductsList, 6);
      }
      
    } else if (intents.budget) {
      filteredProducts = v3ProductsList.filter(p => p.price < 50000);
      responseText = `I understand you're looking for *affordable options*. Here are some great products under $600 with excellent value:`;
      
    } else if (intents.premium) {
      filteredProducts = v3ProductsList.filter(p => p.price > 50000);
      responseText = `For *premium quality*, here are our luxury products with extended warranties and insurance:`;
      
    } else if (intents.warranty || intents.insurance) {
      // Provide an actual answer + plan cards appended
      const plans = intents.warranty ? [
        { years: 1, price: 0.18, serviceCharge: 0.02, total: 0.20 },
        { years: 2, price: 0.30, serviceCharge: 0.02, total: 0.32, recommended: true, savings: 0.06 },
        { years: 3, price: 0.46, serviceCharge: 0.02, total: 0.48 }
      ] : [
        { years: 1, price: 1.20, serviceCharge: 0, total: 1.20 },
        { years: 2, price: 2.17, serviceCharge: 0, total: 2.17, recommended: true, savings: 0.24 },
        { years: 3, price: 3.01, serviceCharge: 0, total: 3.01 }
      ];
      const focus = intents.warranty ? 'warranty' : 'insurance';
      responseText = focus === 'warranty'
        ? `Our extended warranty covers manufacturing defects and functional failures after the standard warranty period. You can extend coverage by 1, 2, or 3 years. Here are the pricing options: 1 year for $0.20 total ($0.18 + $0.02 service charge), 2 years for $0.32 total ($0.30 + $0.02 service charge, recommended with $0.06 savings), or 3 years for $0.48 total ($0.46 + $0.02 service charge). Pricing shown is per item with a small service charge at the time of claim.`
        : `Product insurance protects against accidental damage and unforeseen incidents beyond manufacturer warranty. Here are the pricing options: 1 year for $1.20, 2 years for $2.17 (recommended with $0.24 savings), or 3 years for $3.01. Pricing varies by item value and we also offer extended warranty plans for long-term coverage.`;
      // Show relevant products too when user asked generally
      filteredProducts = intents.warranty
        ? v3ProductsList.filter(p => p.warranty)
        : v3ProductsList.filter(p => p.insurance?.available);
      return {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        products: pickNonRepeating(filteredProducts, 3),
        warrantyPlans: plans,
        planType: focus
      };
      
    } else if (intents.compare) {
      responseText = `I can help you compare products! Here are some options with different features and price points:`;
      filteredProducts = pickNonRepeating(v3ProductsList, 6);
      
    } else if (intents.specific) {
      responseText = `Let me find the most relevant products based on your specific requirements:`;
      filteredProducts = pickNonRepeating(v3ProductsList, 6);
      
    } else {
      // General product query
      responseText = `Here are some *featured products* from our collection. Each product includes warranty and insurance options:`;
      filteredProducts = pickNonRepeating([...v3ProductsList].sort((a, b) => b.rating - a.rating), 6);
    }

    // If no products found after filtering, show general products
    if (filteredProducts.length === 0) {
      filteredProducts = pickNonRepeating(v3ProductsList, 6);
      responseText = `Here are some popular products from our collection:`;
    }

    return {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
      products: pickNonRepeating(filteredProducts, 6)
    };
  };

  const generatePropertyResponse = async (query: string, allProperties: any[]): Promise<Message> => {
    const queryLower = query.toLowerCase();
    const v3List = Array.isArray(v3Properties) ? processProperties(v3Properties as any[]) : [];

    const skyvenProperty = {
      id: SKYVEN_PROPERTY_ID,
      title: 'Skyven Residences',
      location: 'Kokapet, Hyderabad',
      lat: 17.385,
      lng: 78.403,
      beds: 3,
      baths: 3,
      sqft: 4500,
      lotSqft: 0,
      price: 12500000,
      listingType: 'For Sale',
      propertyStatus: 'Active',
      parkingSlots: 2,
      propertyType: 'Apartment',
      amenities: {
        appliancetype: ['Smart Appliances'],
        indoorfeature: ['Home Theater', 'Gym'],
        outdooramenity: ['Sky Deck', 'Infinity Pool'],
        communitytype: ['Gated Community']
      },
      views: ['City View'],
      image: skyvenImage,
      builder: 'Skyven Builder'
    };

    if (!allProperties.some((p) => Number(p.id) === SKYVEN_PROPERTY_ID)) {
      allProperties.unshift(skyvenProperty);
    }
    if (!v3List.some((p) => Number(p.id) === SKYVEN_PROPERTY_ID)) {
      v3List.unshift(skyvenProperty);
    }

    const ensureSkyvenFirst = (props?: any[]): any[] | undefined => {
      if (!props) return props;
      const filtered = props.filter(
        (p) =>
          Number(p?.id) !== SKYVEN_PROPERTY_ID &&
          !String(p?.title || '').toLowerCase().includes('skyven')
      );
      return [skyvenProperty, ...filtered];
    };

    // First, try AI-assisted extraction
    let k: ReturnType<typeof extractQueryKeywords> | (AIPropertyExtraction & { __ai?: true }) = extractQueryKeywords(query);
    try {
      // Pass a compact property list to aid disambiguation
      const compact = v3List.slice(0, 60).map(p => ({
        id: p.id,
        title: p.title,
        location: p.location,
        price: p.price,
        beds: p.beds,
        baths: p.baths,
        propertyType: p.propertyType,
      }));
      const ai = await extractPropertyQueryAI(query, compact);
      if (ai) {
        k = { ...k, ...ai, __ai: true } as any;
      }
    } catch (e) {
      // ignore AI failure and continue with local extraction
    }

    // DIRECT SHOW: property id match
    if (k.propertyId) {
      const byId = v3List.find(p => Number(p.id) === k.propertyId);
      if (byId) {
        const actionButtons: Message['actionButtons'] = [
          { label: 'View Photos', type: 'photos', propertyId: byId.id },
          { label: 'View Floorplans', type: 'floorplans', propertyId: byId.id },
          { label: 'Open VR Tour', type: 'vtour', propertyId: byId.id }
        ];
        return {
          id: (Date.now() + 1).toString(),
          text: `Here is "${byId.title}". Use the buttons below to open media or click the card to view details.`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst([byId]),
          actionButtons
        };
      }
    }

    // DIRECT SHOW: explicit title phrases
    const nameBeforeType = queryLower.match(/(?:show|find|open)\s+(?:the\s+)?([a-z0-9 .\-]+?)\s+(?:property|home|house|listing)\b/i);
    const nameAfterType = queryLower.match(/(?:show|find|open)\s+(?:the\s+)?(?:property|home|house|listing)\s+(?:called|named)?\s*['\"]?([a-z0-9 .\-]+)['\"]?/i);
    const requestedName = (nameBeforeType?.[1] || nameAfterType?.[1] || '').trim();
    if (requestedName) {
      const requested = requestedName.toLowerCase();
      const exact = v3List.find(p => String(p.title).toLowerCase() === requested);
      const partial = exact ? exact : v3List.find(p => String(p.title).toLowerCase().includes(requested));
      if (partial) {
        const actionButtons: Message['actionButtons'] = [
          { label: 'View Photos', type: 'photos', propertyId: partial.id },
          { label: 'View Floorplans', type: 'floorplans', propertyId: partial.id },
          { label: 'Open VR Tour', type: 'vtour', propertyId: partial.id }
        ];
        return {
          id: (Date.now() + 1).toString(),
          text: `Here is "${partial.title}". Use the buttons below to open media or click the card to view details.`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst([partial]),
          actionButtons
        };
      }
    }

    // DIRECT SHOW: title contained unprompted (e.g., user just typed the title)
    if (k.titleText) {
      const byTitle = v3List.find(p => String(p.title).toLowerCase() === k.titleText!.toLowerCase())
        || v3List.find(p => String(p.title).toLowerCase().includes(k.titleText!.toLowerCase()));
      if (byTitle) {
        const actionButtons: Message['actionButtons'] = [
          { label: 'View Photos', type: 'photos', propertyId: byTitle.id },
          { label: 'View Floorplans', type: 'floorplans', propertyId: byTitle.id },
          { label: 'Open VR Tour', type: 'vtour', propertyId: byTitle.id }
        ];
        return {
          id: (Date.now() + 1).toString(),
          text: `Here is "${byTitle.title}". Use the buttons below to open media or click the card to view details.`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst([byTitle]),
          actionButtons
        };
      }
    }
    
    // Price-related queries
    if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('expensive') || queryLower.includes('cheap')) {
      const prices = allProperties.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      
      const affordableCandidates = allProperties.filter(p => p.price <= avgPrice);
      const affordableProperties = pickNonRepeating(affordableCandidates, 3);
      
      return {
        id: (Date.now() + 1).toString(),
        text: `*Property prices* range from $${minPrice.toLocaleString()} to $${maxPrice.toLocaleString()}. Average price is $${avgPrice.toLocaleString()}. Here are some options:`,
        isUser: false,
        timestamp: new Date(),
        properties: ensureSkyvenFirst(affordableProperties)
      };
    }
    
    // Bedroom-related queries
    if (queryLower.includes('bedroom') || queryLower.includes('bed') || queryLower.includes('room')) {
      const bedCount = parseInt(query.match(/(\d+)\s*(?:bed|bedroom|room)/i)?.[1] || '0');
      let filteredProperties = allProperties;
      
      if (bedCount > 0) {
        filteredProperties = allProperties.filter(p => p.beds === bedCount);
      } else {
        // Show variety of bedroom options (non-repeating)
        filteredProperties = pickNonRepeating(allProperties, 6);
      }
      
      return {
        id: (Date.now() + 1).toString(),
        text: bedCount > 0 
          ? `Found ${filteredProperties.length} properties with *${bedCount} bedroom${bedCount > 1 ? 's' : ''}*. Here are the options:`
          : `Here are properties with *different bedroom configurations*:`,
        isUser: false,
        timestamp: new Date(),
        properties: ensureSkyvenFirst(pickNonRepeating(filteredProperties, 6))
      };
    }
    
    // Location-related queries
    if (queryLower.includes('location') || queryLower.includes('area') || queryLower.includes('neighborhood') || 
        queryLower.includes('manhattan') || queryLower.includes('brooklyn') || queryLower.includes('queens') || 
        queryLower.includes('bronx') || queryLower.includes('new york')) {
      
      // Extract location from query
      const locations = ['manhattan', 'brooklyn', 'queens', 'bronx', 'new york'];
      const foundLocation = locations.find(loc => queryLower.includes(loc));
      
      if (foundLocation) {
        const locationCandidates = allProperties.filter(p => 
          p.location.toLowerCase().includes(foundLocation)
        );
        const locationProperties = pickNonRepeating(locationCandidates, 6);
        
        return {
          id: (Date.now() + 1).toString(),
          text: `Here are properties in *${foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1)}*:`,
          isUser: false,
          timestamp: new Date(),
        properties: ensureSkyvenFirst(locationProperties)
        };
      }
    }
    
    // Property type queries
    if (queryLower.includes('apartment') || queryLower.includes('house') || queryLower.includes('condo') || 
        queryLower.includes('townhouse') || queryLower.includes('villa')) {
      
      const propertyTypes = ['apartment', 'house', 'condo', 'townhouse', 'villa'];
      const foundType = propertyTypes.find(type => queryLower.includes(type));
      
      if (foundType) {
        const typeCandidates = allProperties.filter(p => 
          p.propertyType.toLowerCase().includes(foundType)
        );
        const typeProperties = pickNonRepeating(typeCandidates, 6);
        
        return {
          id: (Date.now() + 1).toString(),
          text: `Here are *${foundType}s* available:`,
          isUser: false,
          timestamp: new Date(),
        properties: ensureSkyvenFirst(typeProperties)
        };
      }
    }
    
    // Amenities queries
    if (queryLower.includes('amenities') || queryLower.includes('features') || queryLower.includes('gym') || 
        queryLower.includes('parking') || queryLower.includes('garden') || queryLower.includes('pool')) {
      
      const amenityCandidates = allProperties.filter(p => 
        p.amenities && Object.values(p.amenities).some((amenityList: any) => 
          Array.isArray(amenityList) && amenityList.length > 0
        )
      );
      const amenityProperties = pickNonRepeating(amenityCandidates, 6);
      
      return {
        id: (Date.now() + 1).toString(),
        text: `Here are properties with *great amenities and features*:`,
        isUser: false,
        timestamp: new Date(),
        properties: ensureSkyvenFirst(amenityProperties)
      };
    }
    
    // Size-related queries
    if (queryLower.includes('size') || queryLower.includes('sqft') || queryLower.includes('square feet') || 
        queryLower.includes('big') || queryLower.includes('small') || queryLower.includes('large')) {
      
      const sizes = allProperties.map(p => p.sqft);
      const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
      
      if (queryLower.includes('big') || queryLower.includes('large')) {
        const largeCandidates = allProperties.filter(p => p.sqft > avgSize);
        const largeProperties = pickNonRepeating(largeCandidates, 6);
        return {
          id: (Date.now() + 1).toString(),
          text: `Here are *larger properties* (above ${avgSize.toLocaleString()} sq ft):`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst(largeProperties)
        };
      } else if (queryLower.includes('small')) {
        const smallCandidates = allProperties.filter(p => p.sqft < avgSize);
        const smallProperties = pickNonRepeating(smallCandidates, 6);
        return {
          id: (Date.now() + 1).toString(),
          text: `Here are *compact properties* (below ${avgSize.toLocaleString()} sq ft):`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst(smallProperties)
        };
      }
    }
    
    // Media intent queries
    if (/(photos?|pictures|images|gallery)/i.test(queryLower) || /(videos?)/i.test(queryLower) || /(floor\s*plans?|floorplans?)/i.test(queryLower) || /(vr\s*tour|virtual\s*tour)/i.test(queryLower)) {
      const v3List = Array.isArray(v3Properties) ? (v3Properties as any[]) : [];
      const target = v3List[0];
      const wantsPhotos = /(photos?|pictures|images|gallery)/i.test(queryLower);
      const wantsVideos = /(videos?)/i.test(queryLower);
      const wantsFloor = /(floor\s*plans?|floorplans?)/i.test(queryLower);
      const wantsVRTour = /(vr\s*tour|virtual\s*tour)/i.test(queryLower);

      // Show action buttons (Photos/Floorplans/Videos/VR) like the floorplan flow
      const actionButtons: Message['actionButtons'] = [];
      if (wantsPhotos) actionButtons.push({ label: 'View Photos', type: 'photos', propertyId: target?.id });
      if (wantsVideos) actionButtons.push({ label: 'View Videos', type: 'videos', propertyId: target?.id });
      if (wantsFloor) actionButtons.push({ label: 'View Floorplans', type: 'floorplans', propertyId: target?.id });
      if (wantsVRTour) actionButtons.push({ label: 'Open VR Tour', type: 'vtour', propertyId: target?.id });

      return {
        id: (Date.now() + 1).toString(),
        text: `Got it. Use the buttons below to open the requested media.`,
        isUser: false,
        timestamp: new Date(),
        properties: target ? ensureSkyvenFirst([target]) : ensureSkyvenFirst([]),
        actionButtons
      };
    }

    // If we have any extracted filters, apply them holistically
    if (k.priceMin !== undefined || k.priceMax !== undefined || k.beds !== undefined || k.baths !== undefined || k.propertyType || k.locationText || (k.amenities && k.amenities.length)) {
      let filtered = [...allProperties];
      if (k.locationText) {
        filtered = filtered.filter(p => String(p.location).toLowerCase().includes(k.locationText!));
      }
      if (k.propertyType) {
        filtered = filtered.filter(p => String(p.propertyType).toLowerCase().includes(k.propertyType!.toLowerCase()));
      }
      if (k.beds !== undefined) {
        filtered = filtered.filter(p => Number(p.beds) === k.beds);
      }
      if (k.baths !== undefined) {
        filtered = filtered.filter(p => Number(p.baths) === k.baths);
      }
      if (k.priceMin !== undefined) {
        filtered = filtered.filter(p => Number(p.price) >= k.priceMin!);
      }
      if (k.priceMax !== undefined) {
        filtered = filtered.filter(p => Number(p.price) <= k.priceMax!);
      }
      if (k.amenities && k.amenities.length) {
        const ak = k.amenities.map(a => a.toLowerCase());
        filtered = filtered.filter(p => {
          const vals = p.amenities ? Object.values(p.amenities).flat().map((x: any) => String(x).toLowerCase()) : [];
          return ak.every(a => vals.some(v => v.includes(a)));
        });
      }
      const top = pickNonRepeating(filtered, 6);
      if (top.length) {
        const parts: string[] = [];
        if (k.locationText) parts.push(`${k.locationText.charAt(0).toUpperCase() + k.locationText.slice(1)}`);
        if (k.propertyType) parts.push(k.propertyType);
        if (k.beds !== undefined) parts.push(`${k.beds} bed` + (k.beds > 1 ? 's' : ''));
        if (k.baths !== undefined) parts.push(`${k.baths} bath` + (k.baths > 1 ? 's' : ''));
        if (k.priceMin !== undefined && k.priceMax !== undefined) parts.push(`$${k.priceMin.toLocaleString()}-$${k.priceMax.toLocaleString()}`);
        else if (k.priceMin !== undefined) parts.push(`from $${k.priceMin.toLocaleString()}`);
        else if (k.priceMax !== undefined) parts.push(`under $${k.priceMax.toLocaleString()}`);
        return {
          id: (Date.now() + 1).toString(),
          text: `Here are properties${parts.length ? ` matching *${parts.join(', ')}*` : ''}:`,
          isUser: false,
          timestamp: new Date(),
          properties: ensureSkyvenFirst(top)
        };
      }
    }

    // General property queries - show featured properties
    const featuredProperties = pickNonRepeating([...allProperties].sort((a, b) => b.price - a.price), 6);
    return {
      id: (Date.now() + 1).toString(),
      text: `Here are *featured properties* from our inventory:`,
      isUser: false,
      timestamp: new Date(),
      properties: ensureSkyvenFirst(featuredProperties)
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      adjustTextareaHeight();
    }
  }, [isOpen]);

  // Audio recording setup
  useEffect(() => {
    if (!isAudioRecordingSupported) {
      console.log('Audio recording not supported');
      return;
    }
    
    // Cleanup function to stop recording when component unmounts
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleEcommerceFlow = async (intent: string, message: string, products: any[]) => {
    try {
      let response: Message;
      
      switch (intent) {
        case 'browse-products':
          const randomProducts = getRandomProducts(4);
          response = {
            id: (Date.now() + 1).toString(),
            text: "Here are some amazing products I think you'll love! Each one is carefully selected for quality and value.",
            isUser: false,
            timestamp: new Date(),
            products: randomProducts,
            ecommerceFlow: {
              phase: 'browsing',
              cartItems: cart.items
            }
          };
          break;
          
        case 'product-details':
          const product = extractProductName(message, products);
          if (product) {
            setEcommerceFlowState(prev => ({ ...prev, selectedProduct: product, currentPhase: 'product-details' }));
            response = {
              id: (Date.now() + 1).toString(),
              text: generateProductDetailsResponse(product),
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'product-details',
                selectedProduct: product,
                cartItems: cart.items
              }
            };
          } else {
            response = {
              id: (Date.now() + 1).toString(),
              text: "I couldn't find that specific product. Let me show you our available products instead.",
              isUser: false,
              timestamp: new Date(),
              products: getRandomProducts(4),
              ecommerceFlow: {
                phase: 'browsing',
                cartItems: cart.items
              }
            };
          }
          break;
          
        case 'show-alternatives':
          const selectedProduct = ecommerceFlowState.selectedProduct || extractProductName(message, products);
          if (selectedProduct) {
            const alternatives = getProductAlternatives(selectedProduct);
            setEcommerceFlowState(prev => ({ ...prev, alternatives, currentPhase: 'alternatives' }));
            response = {
              id: (Date.now() + 1).toString(),
              text: generateAlternativesResponse(selectedProduct, alternatives),
              isUser: false,
              timestamp: new Date(),
              products: alternatives,
              ecommerceFlow: {
                phase: 'alternatives',
                selectedProduct,
                alternatives,
                cartItems: cart.items
              }
            };
          } else {
            response = {
              id: (Date.now() + 1).toString(),
              text: "Please first select a product to see its alternatives. Let me show you our products:",
              isUser: false,
              timestamp: new Date(),
              products: getRandomProducts(4),
              ecommerceFlow: {
                phase: 'browsing',
                cartItems: cart.items
              }
            };
          }
          break;
          
        case 'add-to-cart':
          const productToAdd = ecommerceFlowState.selectedProduct || extractProductName(message, products);
          if (productToAdd) {
            // Build updated cart snapshot immediately to avoid stale state in the response
            const existingItem = cart.items.find(item => item.productId === productToAdd.id);
            const updatedCartItems = existingItem
              ? cart.items.map(item => item.productId === productToAdd.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item)
              : [
                  ...cart.items,
                  {
                    productId: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    quantity: 1,
                    image: productToAdd.image,
                    vendor: productToAdd.vendor,
                    category: productToAdd.category
                  }
                ];
            const updatedTotal = updatedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            addToCart(productToAdd);
            setEcommerceFlowState(prev => ({ ...prev, currentPhase: 'cart' }));
            response = {
              id: (Date.now() + 1).toString(),
              text: `✅ *${productToAdd.name}* has been added to your cart!\n\n${generateCartResponse(updatedCartItems, updatedTotal)}`,
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'cart',
                selectedProduct: productToAdd,
                cartItems: updatedCartItems
              }
            };
          } else {
            response = {
              id: (Date.now() + 1).toString(),
              text: "Please select a product first to add it to your cart.",
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'browsing',
                cartItems: cart.items
              }
            };
          }
          break;
          
        case 'view-cart':
          setEcommerceFlowState(prev => ({ ...prev, currentPhase: 'cart' }));
          response = {
            id: (Date.now() + 1).toString(),
            text: generateCartResponse(cart.items, cart.total),
            isUser: false,
            timestamp: new Date(),
            ecommerceFlow: {
              phase: 'cart',
              cartItems: cart.items
            }
          };
          break;
          
        case 'checkout':
          if (cart.items.length === 0) {
            response = {
              id: (Date.now() + 1).toString(),
              text: "Your cart is empty. Would you like to browse our products first?",
              isUser: false,
              timestamp: new Date(),
              products: getRandomProducts(4),
              ecommerceFlow: {
                phase: 'browsing',
                cartItems: cart.items
              }
            };
          } else {
            setEcommerceFlowState(prev => ({ ...prev, currentPhase: 'checkout' }));
            response = {
              id: (Date.now() + 1).toString(),
              text: generateCheckoutResponse(cart.items, cart.total),
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'checkout',
                cartItems: cart.items
              }
            };
          }
          break;
          
        case 'select-payment':
          // Ignore UPI and default to supported methods
          const lower = message.toLowerCase();
          const paymentMethod = lower.includes('card') ? 'Credit/Debit Card' :
                               lower.includes('bank') ? 'Net Banking' :
                               lower.includes('emi') ? 'EMI' : 'Credit/Debit Card';

          setEcommerceFlowState(prev => ({ ...prev, paymentMethod, currentPhase: 'payment' }));
          response = {
            id: (Date.now() + 1).toString(),
            text: generatePaymentConfirmationResponse(paymentMethod),
            isUser: false,
            timestamp: new Date(),
            ecommerceFlow: {
              phase: 'payment',
              paymentMethod,
              cartItems: cart.items
            }
          };
          break;
          
        case 'verify-otp':
          const otpMatch = message.match(/\b\d{6}\b/);
          const otp = otpMatch ? otpMatch[0] : '';
          const isValidOTP = verifyOTP(otp);
          
          if (isValidOTP) {
            const order = createOrder(ecommerceFlowState.paymentMethod || 'Credit/Debit Card');
            setEcommerceFlowState(prev => ({ ...prev, orderDetails: order, currentPhase: 'order-confirmation' }));
            clearCart();
            
            response = {
              id: (Date.now() + 1).toString(),
              text: generateOrderConfirmationResponse(order),
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'order-confirmation',
                orderDetails: order,
                cartItems: []
              }
            };
          } else {
            const newAttempts = ecommerceFlowState.otpAttempts + 1;
            setEcommerceFlowState(prev => ({ ...prev, otpAttempts: newAttempts }));
            
            response = {
              id: (Date.now() + 1).toString(),
              text: generateOTPResponse(false, newAttempts),
              isUser: false,
              timestamp: new Date(),
              ecommerceFlow: {
                phase: 'otp',
                paymentMethod: ecommerceFlowState.paymentMethod,
                cartItems: cart.items
              }
            };
          }
          break;
          
        default:
          response = {
            id: (Date.now() + 1).toString(),
            text: "I'm here to help you with products, cart management, and purchases. What would you like to do?",
            isUser: false,
            timestamp: new Date(),
            ecommerceFlow: {
              phase: 'browsing',
              cartItems: cart.items
            }
          };
      }
      
      setMessages(prev => [...prev, response]);
      
    } catch (error) {
      console.error('Error in e-commerce flow:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
        ecommerceFlow: {
          phase: 'browsing',
          cartItems: cart.items
        }
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !uploadedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage || (uploadedFile ? `Uploaded: ${uploadedFile.file.name}` : ''),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setUploadedFile(null);
    setIsTyping(true);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Quick path: if explicitly asking about warranty/insurance, answer with plan cards immediately
      const mentionsWarrantyOrInsurance = /(warranty|insurance)/i.test(currentMessage);

      if (mentionsWarrantyOrInsurance) {
      const isWarranty = /warranty/i.test(currentMessage);
      const plans = isWarranty ? [
        { years: 1, price: 15, serviceCharge: 2, total: 17 },
        { years: 2, price: 25, serviceCharge: 2, total: 27, recommended: true, savings: 5 },
        { years: 3, price: 38, serviceCharge: 2, total: 40 }
      ] : [
        { years: 1, price: 100, serviceCharge: 0, total: 100 },
        { years: 2, price: 180, serviceCharge: 0, total: 180, recommended: true, savings: 20 },
        { years: 3, price: 250, serviceCharge: 0, total: 250 }
      ];
        const explanation = isWarranty
          ? `Our extended warranty covers manufacturing defects and functional failures beyond the standard warranty period. Choose 1, 2 or 3 years of extension per item; a small service charge applies during claims.`
          : `Product insurance protects against accidental damage and unforeseen incidents beyond the manufacturer warranty. You can also pair it with an extended warranty for long‑term coverage.`;
        const resp: Message = {
          id: (Date.now() + 1).toString(),
          text: explanation,
          isUser: false,
          timestamp: new Date(),
          warrantyPlans: plans,
          planType: isWarranty ? 'warranty' : 'insurance'
        };
        setMessages(prev => [...prev, resp]);
        return;
      }

      // FIRST: Handle ecommerce intents immediately (prevents Gemini from hijacking flows like "pay with card")
      const earlyEcommerceIntent = detectEcommerceIntent(currentMessage);
      if (earlyEcommerceIntent) {
        await handleEcommerceFlow(earlyEcommerceIntent, currentMessage, Array.isArray(v3Products) ? (v3Products as any[]) : []);
        return;
      }

      // Enhanced product detection with better context analysis
      const isProductRelated = /(?:products?|items?|furniture|tiles?|sofa|dining|appliances?|lighting|bathroom|warranty|insurance|protection|cheap|affordable|budget|expensive|premium|luxury|buy|purchase|shop|shopping|store|catalog|collection|inventory|cart|shopping cart|order|checkout|payment)/i.test(currentMessage);
      
      // Check if user is asking anything about properties
      const isPropertyRelated = /(?:properties?|houses?|homes?|apartments?|condos?|real estate|property|house|home|apartment|condo|rent|buy|price|cost|bedroom|bathroom|sqft|square feet|location|area|neighborhood|amenities|features|photos?|pictures?|images?|gallery|videos?|floor\s*plans?|floorplans?|vr\s*tour|virtual\s*tour)/i.test(currentMessage);
      
      if (isProductRelated) {
        console.log('Product-related query detected:', currentMessage);
        
        // Get all products data for analysis
        const allProducts = Array.isArray(v3Products) ? (v3Products as any[]) : [];
        
        // (Redundant now, but keep as a fallback if future changes reorder logic)
        const ecommerceIntent = detectEcommerceIntent(currentMessage);
        if (ecommerceIntent) {
          if (abortController.signal.aborted) return;
          await handleEcommerceFlow(ecommerceIntent, currentMessage, allProducts);
          return;
        }
        
        // Check if request was cancelled
        if (abortController.signal.aborted) {
          console.log('Request cancelled');
          return;
        }
        
        // First, try AI analysis for better intent understanding
        let aiEnhancedResponse = null;
        try {
          const conversationContext = messages
            .slice(-3) // Last 3 messages for context
            .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
            .join('\n');
          
          const aiResponseText = await sendToGeminiAI(
            `User is asking about products: "${currentMessage}". You are VistaView AI, a comprehensive real estate and home solutions assistant. Analyze their intent and provide a brief contextual response before showing product recommendations. Focus on understanding what they're looking for (furniture, budget, premium, warranty, insurance, etc.). Keep response concise and helpful.`,
            conversationContext
          );
          
          if (aiResponseText && !aiResponseText.includes('I apologize')) {
            // Use AI response as the text, but still show product cards
            const productResponse = await generateProductResponse(currentMessage, allProducts);
            productResponse.text = aiResponseText;
            aiEnhancedResponse = productResponse;
          }
        } catch (error) {
          console.log('AI analysis failed, using fallback:', error);
        }
        
        // Check if request was cancelled
        if (abortController.signal.aborted) {
          console.log('Request cancelled');
          return;
        }
        
        // Use AI enhanced response or fallback to regular analysis
        const productResponse = aiEnhancedResponse || await generateProductResponse(currentMessage, allProducts);
        
        // Check if request was cancelled before updating state
        if (abortController.signal.aborted) {
          console.log('Request cancelled before updating state');
          return;
        }
        
        setMessages(prev => [...prev, productResponse]);
        recordShownProperties(productResponse.products);
      } else if (isPropertyRelated) {
        console.log('Property-related query detected:', currentMessage);
        
        // Get all properties data for analysis
        const allProperties = await searchProperties('', {}); // Get all properties
        
        // Check if request was cancelled
        if (abortController.signal.aborted) {
          console.log('Request cancelled');
          return;
        }
        
        // Analyze the query and provide intelligent response with real data
        const propertyResponse = await generatePropertyResponse(currentMessage, allProperties);
        
        // Check if request was cancelled before updating state
        if (abortController.signal.aborted) {
          console.log('Request cancelled before updating state');
          return;
        }
        
        setMessages(prev => [...prev, propertyResponse]);
        recordShownProperties(propertyResponse.properties);
      } else {
        // Regular AI response for non-property queries
        const conversationContext = messages
          .slice(-5) // Last 5 messages for context
          .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
          .join('\n');
        
        console.log('Sending to Gemini API:', { message: currentMessage, context: conversationContext });
        
        // Get AI response from Gemini API with comprehensive context
        const enhancedContext = `You are VistaView AI, a comprehensive real estate and home solutions assistant. You can help with:
        - Real Estate: Finding properties, locations, prices, and features
        - Products: Browsing furniture, appliances, flooring, and home items  
        - Warranty: Information about product warranties and guarantees
        - Insurance: Product protection and insurance options
        
        ${conversationContext}`;
        
        const aiResponseText = await sendToGeminiAI(currentMessage, enhancedContext);
        
        // Check if request was cancelled
        if (abortController.signal.aborted) {
          console.log('Request cancelled');
          return;
        }
        
        console.log('Received AI response:', aiResponseText);
        
        // Clean up formatting in the response
        const cleanedResponseText = cleanResponseFormatting(aiResponseText);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanedResponseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show the specific error message to help debug
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown error occurred';
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanResponseFormatting(`I apologize, but I'm having trouble connecting to the AI service right now. Error: ${errorMessage}. Please check your internet connection and try again. If the problem persists, please contact support.`),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Removed VR tour functionality - now using pure AI chat

  const handleMicClick = async () => {
    if (!isAudioRecordingSupported) {
      alert('Audio recording is not supported in this browser. Please use a modern browser.');
      return;
    }
    
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
          
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
            
            // Transcribe the audio
            setIsTranscribing(true);
            try {
              const response = await transcribeAudio(audioFile);
              if (response.success && response.data && response.data.text) {
                setInputMessage(prev => prev + response.data.text);
              } else {
                alert('Failed to transcribe audio. Please try again.');
              }
            } catch (error) {
              console.error('Error transcribing audio:', error);
              alert('Failed to transcribe audio. Please try again.');
            } finally {
              setIsTranscribing(false);
            }
          }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting audio recording:', error);
        alert('Failed to start audio recording. Please check microphone permissions.');
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setUploadedFile({ file, previewUrl });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    <div 
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-green-900 bg-opacity-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-3xl mx-4 max-h-[95vh] bg-white rounded-2xl shadow-2xl animate-chatbot-slide-up chatbot-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-[#004236] to-[#007E67] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={aiModeIcon} alt="AI Mode" className="w-8 h-8" />
            </div>
            <h2 className="font-semibold text-lg chatbot-title-gradient">
              VistaView AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors text-2xl font-light p-1"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[65vh]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                  message.isUser
                    ? 'text-gray-800'
                    : 'text-gray-800'
                }`}
                style={{
                  backgroundColor: message.isUser 
                    ? 'rgba(240, 240, 240, 1)' 
                    : 'rgba(203, 233, 228, 0.5)'
                }}
              >
                <div className="text-sm">
                  {message.isUser ? message.text : renderAIText(message.text)}
                </div>
                
                {/* Property Cards */}
                {message.properties && message.properties.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {message.properties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          onClick={() => {
                            try {
                              if (
                                Number(property?.id) === SKYVEN_PROPERTY_ID ||
                                String(property?.title || '').toLowerCase().includes('skyven')
                              ) {
                                onClose();
                                navigate(SKYVEN_VIEWER_ROUTE);
                                return;
                              }
                              const cardData = { ...property, __source: 'chatbot' };
                              // Close the chatbot modal first
                              onClose();
                              // Navigate to property details using the card data (JSON)
                              navigate('/v3/property', { state: { cardData } });
                            } catch (error) {
                              console.error('Navigation error:', error);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {message.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onClick={() => {
                            try {
                              // Close the chatbot modal first
                              onClose();
                              // Navigate to cart for more product information
                              navigate(`/v3/cart`);
                            } catch (error) {
                              console.error('Navigation error:', error);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Warranty/Insurance Plans */}
                {message.warrantyPlans && message.warrantyPlans.length > 0 && (
                  <div className="mt-4">
                    <PlanCards plans={message.warrantyPlans} planType={message.planType} />
                  </div>
                )}
          {/* Action Buttons */}
          {message.actionButtons && message.actionButtons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actionButtons.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`px-3 py-1.5 rounded-[10px] text-sm font-semibold text-white gradient-border-mask hover:opacity-90 transition-opacity`}
                  style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
                  onClick={() => {
                    try {
                      const pid = btn.propertyId;
                      const propertyId = pid ? String(pid) : null;

                      // Skyven: action buttons should open the GLB viewer page
                      if (Number(pid) === SKYVEN_PROPERTY_ID) {
                        onClose();
                        navigate(SKYVEN_VIEWER_ROUTE);
                        return;
                      }

                      // Always route property-related actions to the property page (in-app),
                      // instead of opening a new tab (popup blockers can block window.open).
                      if (propertyId) {
                        persistSelectedPropertyId(propertyId);
                      }

                      const params = new URLSearchParams();
                      if (propertyId) params.set('pid', propertyId);
                      if (btn.type) params.set('media', btn.type);

                      // Close the chatbot before navigation so the property page is fully visible.
                      onClose();
                      navigate({ pathname: '/v3/property', search: params.toString() ? `?${params.toString()}` : '' }, propertyId ? { state: { propertyId } } : undefined);
                    } catch (e) {
                      console.error('Action button error:', e);
                    }
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
              </div>
            </div>
          ))}


          {isTyping && (
            <div className="flex justify-start">
              <div 
                className="max-w-[80%] px-3 py-2 rounded-2xl text-gray-800"
                style={{ backgroundColor: 'rgba(203, 233, 228, 0.5)' }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">VistaView AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Same design as FloatingAskBar */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="gold-gradient-frame floating-askbar-elevation">
            <div className="flex items-center gap-2 rounded-[14px] bg-white/95 px-3 py-1 md:px-4 md:py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={handleAttachClick}
                className="rounded-full hover:bg-gray-100 transition"
              >
                <img src={attachIcon} alt="attach" className="w-6 h-6 md:w-7 md:h-7" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  onPaste={() => {
                    // Adjust height after paste
                    setTimeout(adjustTextareaHeight, 0);
                  }}
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm md:text-base resize-none overflow-hidden min-h-[20px] max-h-[120px]"
                  placeholder={isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Ask anything..."}
                  rows={1}
                  style={{ height: 'auto' }}
                />
                {/* Removed bouncing indicators near input while recording/transcribing per request */}
              </div>

              <div className="flex items-center gap-1">
                {/* Voice-to-Voice Button */}
                <button
                  type="button"
                  onClick={openVoiceModal}
                  className="rounded-full hover:opacity-80 transition-all duration-300 flex items-center justify-center w-8 h-8 md:w-7 md:h-7"
                  style={{ backgroundColor: 'rgba(0, 75, 61, 0.2)' }}
                  title="Voice-to-Voice Chat"
                >
                  <img 
                    src={voiceChatIcon} 
                    alt="Voice Chat" 
                    className="w-5 h-5 md:w-4 md:h-4 object-contain"
                  />
                </button>

                {/* Regular Microphone Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isTranscribing}
                    className={`relative z-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                      isRecording 
                        ? 'mic-stop-gold w-9 h-9 md:w-9 md:h-9' 
                        : isTranscribing
                        ? 'bg-blue-100 w-8 h-8 md:w-7 md:h-7'
                        : 'hover:opacity-80 w-8 h-8 md:w-7 md:h-7'
                    } ${isTranscribing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      backgroundColor: (!isRecording && !isTranscribing) ? 'rgba(0, 75, 61, 0.2)' : undefined
                    }}
                  >
                    {isTranscribing ? (
                      <div className="w-5 h-5 md:w-4 md:h-4 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 md:h-2.5 md:w-2.5 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : isRecording ? (
                      <div className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center">
                        <svg className="w-4 h-4 md:w-3.5 md:h-3.5 text-emerald-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 6h12v12H6z"/>
                        </svg>
                      </div>
                    ) : (
                      <img 
                        src={micIcon} 
                        alt="mic" 
                        className={`w-5 h-5 md:w-4 md:h-4 transition-all duration-300 ${
                          isRecording ? 'scale-110' : 'scale-100'
                        }`} 
                      />
                    )}
                  </button>
                  {isRecording && (
                    <>
                      <span className="absolute inset-0 -m-1 rounded-full mic-pulse-bg" />
                      <span className="absolute inset-0 -m-2 rounded-full mic-ripple" />
                    </>
                  )}
                </div>
              </div>

              <button
                type={isTyping ? "button" : "submit"}
                onClick={isTyping ? () => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setIsTyping(false);
                } : undefined}
                className={`p-1 rounded-full transition ${
                  isTyping 
                    ? 'bg-red-100 hover:bg-red-200 cursor-pointer' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {isTyping ? (
                  <div className="w-7 h-7 md:w-7 md:h-7 flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </div>
                ) : (
                  <img src={sendIcon} alt="send" className="w-7 h-7 md:w-7 md:h-7" />
                )}
              </button>
            </div>
          </form>

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          {uploadedFile?.previewUrl && (
            <div className="mt-2 ml-1 text-xs text-gray-600 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-2 py-1 bg-white/90 rounded shadow-sm border border-gray-200">
                {uploadedFile.previewUrl ? (
                  <img src={uploadedFile.previewUrl} alt={uploadedFile.file.name} className="w-6 h-6 object-cover rounded" />
                ) : null}
                <span className="max-w-[200px] truncate">{uploadedFile.file.name}</span>
                <button onClick={() => setUploadedFile(null)} type="button" className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Voice-to-Voice Modal */}
      <VoiceToVoiceModal 
        isOpen={isVoiceModalOpen} 
        onClose={closeVoiceModal}
        onAddMessage={(message) => setMessages(prev => [...prev, message])}
      />
    </div>
  );
};

export default ChatbotModal;

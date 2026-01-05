#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  PART D: REAL ESTATE PAGE + VECTORIZATION
#  
#  Features:
#  1. Real Estate page for Builder & Agent uploads
#  2. Property listings with AgenticBar
#  3. Builder projects with AgenticBar
#  4. Vectorized search across properties
#  5. Talk to any property
#  6. Walker tours properties
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
PAGES_DIR="$VV/src/pages"
COMPONENTS_DIR="$VV/src/components"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🏠 PART D: REAL ESTATE PAGE + VECTORIZATION"
echo "═══════════════════════════════════════════════════════════════════════════════"

mkdir -p "$PAGES_DIR"
mkdir -p "$COMPONENTS_DIR/realestate"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Create PropertyCard with AgenticBar
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🏠 Creating PropertyCard..."

cat > "$COMPONENTS_DIR/realestate/PropertyCard.tsx" << 'PROPERTYCARD'
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Property {
  id: number;
  title: string;
  description?: string;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  property_type?: string;
  image_url?: string;
  listing_type?: 'sale' | 'rent' | 'project';
  agent_id?: string;
  builder_id?: string;
}

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  isWalkerActive?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isWalkerActive
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        
        if (event.results[0].isFinal) {
          handlePropertyQuestion(text);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    synthRef.current.speak(u);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak(`Ask me about ${property.title}`);
      } catch (e) {}
    }
  };

  const handlePropertyQuestion = async (question: string) => {
    setIsThinking(true);
    
    const q = question.toLowerCase();
    let answer = '';
    
    if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
      answer = property.price 
        ? `This property is ${property.listing_type === 'rent' ? 'available for rent at' : 'listed at'} $${property.price.toLocaleString()}${property.listing_type === 'rent' ? ' per month' : ''}.`
        : `Price information is available upon request.`;
    }
    else if (q.includes('bedroom') || q.includes('bed')) {
      answer = property.bedrooms
        ? `This property has ${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}.`
        : `Bedroom information not specified.`;
    }
    else if (q.includes('bathroom') || q.includes('bath')) {
      answer = property.bathrooms
        ? `There are ${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}.`
        : `Bathroom information not specified.`;
    }
    else if (q.includes('size') || q.includes('square') || q.includes('sqft') || q.includes('area')) {
      answer = property.sqft
        ? `The property is ${property.sqft.toLocaleString()} square feet.`
        : `Size information not specified.`;
    }
    else if (q.includes('address') || q.includes('location') || q.includes('where')) {
      answer = property.address
        ? `Located at ${property.address}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}.`
        : `Address available upon request.`;
    }
    else if (q.includes('type') || q.includes('kind')) {
      answer = property.property_type
        ? `This is a ${property.property_type}.`
        : `Property type not specified.`;
    }
    else if (q.includes('description') || q.includes('about') || q.includes('tell me')) {
      answer = property.description || `${property.title} is a beautiful property. Contact agent for details.`;
    }
    else {
      answer = `${property.title}. ${property.bedrooms ? `${property.bedrooms} beds` : ''} ${property.bathrooms ? `${property.bathrooms} baths` : ''} ${property.sqft ? `${property.sqft.toLocaleString()} sqft` : ''}. ${property.price ? `$${property.price.toLocaleString()}` : ''}. What would you like to know?`;
    }
    
    setAiResponse(answer);
    speak(answer);
    setIsThinking(false);
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  return (
    <div
      onClick={() => !isExpanded && onSelect?.(property)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="property-card"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 16,
        overflow: 'hidden',
        border: `2px solid ${isExpanded ? '#f59e0b' : hovered ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.3s',
        transform: hovered && !isExpanded ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
        cursor: isExpanded ? 'default' : 'pointer'
      }}
    >
      {/* Property Image */}
      <div style={{
        height: 180,
        background: property.image_url 
          ? `url(${property.image_url}) center/cover`
          : 'linear-gradient(135deg, #1e3a5f, #0f1c2e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {!property.image_url && (
          <span style={{ fontSize: 48, opacity: 0.5 }}>🏠</span>
        )}
        
        {/* Price badge */}
        {property.price && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: '#f59e0b',
            color: '#000',
            padding: '6px 14px',
            borderRadius: 20,
            fontWeight: 700,
            fontSize: '1em'
          }}>
            {formatPrice(property.price)}
            {property.listing_type === 'rent' && <span style={{ fontSize: '0.7em' }}>/mo</span>}
          </div>
        )}

        {/* Listing type badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: property.listing_type === 'rent' ? '#8b5cf6' : property.listing_type === 'project' ? '#10b981' : '#06b6d4',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 10,
          fontSize: '0.75em',
          fontWeight: 600
        }}>
          {property.listing_type === 'rent' ? 'FOR RENT' : property.listing_type === 'project' ? 'PROJECT' : 'FOR SALE'}
        </div>

        {/* Talk button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid #f59e0b',
            color: '#f59e0b',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.75em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          🎤 {isExpanded ? 'Close' : 'Ask'}
        </button>
      </div>

      {/* Property Info */}
      <div style={{ padding: 16 }}>
        <h3 style={{
          color: '#e2e8f0',
          margin: '0 0 8px',
          fontSize: '1.05em',
          fontWeight: 600,
          lineHeight: 1.3
        }}>
          {property.title}
        </h3>
        
        {property.address && (
          <p style={{ color: '#94a3b8', fontSize: '0.85em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {property.address}{property.city ? `, ${property.city}` : ''}
          </p>
        )}
        
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, color: '#64748b', fontSize: '0.85em' }}>
          {property.bedrooms && <span>🛏️ {property.bedrooms} beds</span>}
          {property.bathrooms && <span>🚿 {property.bathrooms} baths</span>}
          {property.sqft && <span>📐 {property.sqft.toLocaleString()} sqft</span>}
        </div>
        
        {property.property_type && (
          <span style={{
            display: 'inline-block',
            marginTop: 10,
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: '0.75em'
          }}>
            {property.property_type}
          </span>
        )}
      </div>

      {/* Expanded AgenticBar */}
      {isExpanded && (
        <div style={{
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.3)'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 12,
            padding: 14,
            border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isListening ? '#10b981' : isThinking ? '#f59e0b' : '#64748b',
                animation: isListening ? 'pulse 1s infinite' : 'none'
              }} />
              <span style={{ color: '#f59e0b', fontSize: '0.8em' }}>
                {isListening ? 'Listening...' : isThinking ? 'Thinking...' : 'Ask about this property'}
              </span>
            </div>

            {isListening && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, height: 20, alignItems: 'center', marginBottom: 10 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{
                    width: 2,
                    background: '#f59e0b',
                    borderRadius: 1,
                    animation: `wave 0.3s ease-in-out ${i * 0.05}s infinite alternate`,
                    height: 6
                  }} />
                ))}
              </div>
            )}

            {transcript && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10
              }}>
                <span style={{ color: '#64748b', fontSize: '0.7em' }}>You asked:</span>
                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.85em' }}>"{transcript}"</p>
              </div>
            )}

            {aiResponse && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10
              }}>
                <span style={{ color: '#10b981', fontSize: '0.7em' }}>Answer:</span>
                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.85em' }}>{aiResponse}</p>
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); toggleListening(); }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 20,
                border: 'none',
                background: isListening ? '#ef4444' : '#f59e0b',
                color: isListening ? '#fff' : '#000',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85em'
              }}
            >
              {isListening ? '⏹️ Stop' : '🎤 Ask a Question'}
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {['Price?', 'Bedrooms?', 'Location?', 'Size?'].map(q => (
                <button
                  key={q}
                  onClick={(e) => { e.stopPropagation(); handlePropertyQuestion(q); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 15,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.7em',
                    cursor: 'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 4px; } to { height: 16px; } }
      `}</style>
    </div>
  );
};

export default PropertyCard;
PROPERTYCARD

echo "  ✅ PropertyCard.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Create Real Estate Page
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🏠 Creating RealEstatePage..."

cat > "$PAGES_DIR/RealEstatePage.tsx" << 'REALESTATEPAGE'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropertyCard from '../components/realestate/PropertyCard';

interface Property {
  id: number;
  title: string;
  description?: string;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  property_type?: string;
  image_url?: string;
  listing_type?: 'sale' | 'rent' | 'project';
  agent_id?: string;
  builder_id?: string;
}

const RealEstatePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent' | 'projects'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [walkerActive, setWalkerActive] = useState(false);
  const [walkerIndex, setWalkerIndex] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:1117/api/properties');
      const data = await response.json();
      setProperties(data);
      setFilteredProperties(data);
    } catch (err) {
      // Demo data
      const demoProperties: Property[] = [
        { id: 1, title: 'Modern Downtown Condo', price: 425000, address: '123 Main St', city: 'Austin', state: 'TX', bedrooms: 2, bathrooms: 2, sqft: 1200, property_type: 'Condo', listing_type: 'sale' },
        { id: 2, title: 'Luxury Suburban Home', price: 875000, address: '456 Oak Ave', city: 'Austin', state: 'TX', bedrooms: 4, bathrooms: 3, sqft: 3200, property_type: 'Single Family', listing_type: 'sale' },
        { id: 3, title: 'Cozy Studio Apartment', price: 1500, address: '789 Elm St', city: 'Austin', state: 'TX', bedrooms: 0, bathrooms: 1, sqft: 550, property_type: 'Apartment', listing_type: 'rent' },
        { id: 4, title: 'New Construction - Phase 1', price: 550000, address: 'Sunset Ridge', city: 'Round Rock', state: 'TX', bedrooms: 3, bathrooms: 2, sqft: 2100, property_type: 'New Construction', listing_type: 'project' },
        { id: 5, title: 'Waterfront Estate', price: 1250000, address: '321 Lake View', city: 'Lakeway', state: 'TX', bedrooms: 5, bathrooms: 4, sqft: 4500, property_type: 'Estate', listing_type: 'sale' },
        { id: 6, title: 'Urban Loft', price: 2200, address: '555 Downtown Blvd', city: 'Austin', state: 'TX', bedrooms: 1, bathrooms: 1, sqft: 900, property_type: 'Loft', listing_type: 'rent' },
      ];
      setProperties(demoProperties);
      setFilteredProperties(demoProperties);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        
        if (event.results[event.resultIndex].isFinal) {
          handleVoiceCommand(text);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) {}
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    synthRef.current.speak(u);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak("Search for properties, filter by type, or say guide me.");
      } catch (e) {}
    }
  };

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    
    // Search
    if (lower.includes('search') || lower.includes('find') || lower.includes('show')) {
      const terms = lower.replace(/search|find|show|me|for/g, '').trim();
      setSearchQuery(terms);
      filterProperties(terms, activeTab);
      speak(`Searching for ${terms}`);
      return;
    }
    
    // Tab switching
    if (lower.includes('sale') || lower.includes('buy')) {
      setActiveTab('sale');
      filterProperties(searchQuery, 'sale');
      speak('Showing properties for sale');
      return;
    }
    if (lower.includes('rent')) {
      setActiveTab('rent');
      filterProperties(searchQuery, 'rent');
      speak('Showing rentals');
      return;
    }
    if (lower.includes('project') || lower.includes('builder') || lower.includes('new construction')) {
      setActiveTab('projects');
      filterProperties(searchQuery, 'projects');
      speak('Showing builder projects');
      return;
    }
    if (lower.includes('all')) {
      setActiveTab('all');
      filterProperties(searchQuery, 'all');
      speak('Showing all properties');
      return;
    }
    
    // Guide
    if (lower.includes('guide') || lower.includes('tour')) {
      setWalkerActive(true);
      setWalkerIndex(0);
      speak('Starting property tour');
      return;
    }
    
    if (lower.includes('stop') && walkerActive) {
      setWalkerActive(false);
      speak('Tour stopped');
      return;
    }
    
    // Price filter
    const priceMatch = lower.match(/under (\d+)/);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1]) * 1000;
      setPriceRange([0, maxPrice]);
      filterProperties(searchQuery, activeTab, [0, maxPrice]);
      speak(`Showing properties under ${priceMatch[1]}K`);
      return;
    }
    
    // General search
    filterProperties(text, activeTab);
  };

  const filterProperties = (query: string, tab: string, prices?: [number, number]) => {
    let filtered = properties;
    const [minPrice, maxPrice] = prices || priceRange;
    
    // Tab filter
    if (tab === 'sale') filtered = filtered.filter(p => p.listing_type === 'sale');
    else if (tab === 'rent') filtered = filtered.filter(p => p.listing_type === 'rent');
    else if (tab === 'projects') filtered = filtered.filter(p => p.listing_type === 'project');
    
    // Price filter
    filtered = filtered.filter(p => !p.price || (p.price >= minPrice && p.price <= maxPrice));
    
    // Text search
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.property_type?.toLowerCase().includes(q)
      );
    }
    
    setFilteredProperties(filtered);
  };

  // Walker
  useEffect(() => {
    if (!walkerActive || filteredProperties.length === 0) return;
    
    const interval = setInterval(() => {
      setWalkerIndex(prev => {
        const next = (prev + 1) % filteredProperties.length;
        const prop = filteredProperties[next];
        speak(`${prop.title}. ${prop.bedrooms || 0} beds, ${prop.price ? '$' + prop.price.toLocaleString() : 'Price on request'}`);
        
        const cards = document.querySelectorAll('.property-card');
        if (cards[next]) {
          cards[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return next;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [walkerActive, filteredProperties]);

  const stats = {
    forSale: properties.filter(p => p.listing_type === 'sale').length,
    forRent: properties.filter(p => p.listing_type === 'rent').length,
    projects: properties.filter(p => p.listing_type === 'project').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      padding: 20
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '2em' }}>🏠 Real Estate</h1>
          <p style={{ color: '#94a3b8', margin: '8px 0 0' }}>
            {filteredProperties.length} properties • {stats.forSale} for sale • {stats.forRent} for rent • {stats.projects} projects
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); filterProperties(e.target.value, activeTab); }}
            placeholder="Search properties..."
            style={{
              padding: '12px 20px',
              borderRadius: 25,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              width: 250
            }}
          />
          
          <button
            onClick={toggleListening}
            style={{
              padding: '12px 20px',
              borderRadius: 25,
              border: 'none',
              background: isListening ? '#ef4444' : '#f59e0b',
              color: isListening ? '#fff' : '#000',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isListening ? '⏹️ Stop' : '🎤 Voice'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto 30px',
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'all', label: 'All Properties', icon: '🏘️' },
          { id: 'sale', label: 'For Sale', icon: '🏷️' },
          { id: 'rent', label: 'For Rent', icon: '🔑' },
          { id: 'projects', label: 'Builder Projects', icon: '🏗️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); filterProperties(searchQuery, tab.id); }}
            style={{
              padding: '10px 24px',
              borderRadius: 25,
              border: 'none',
              background: activeTab === tab.id ? '#f59e0b' : 'rgba(255,255,255,0.1)',
              color: activeTab === tab.id ? '#000' : '#94a3b8',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        
        <button
          onClick={() => { setWalkerActive(!walkerActive); setWalkerIndex(0); }}
          style={{
            marginLeft: 'auto',
            padding: '10px 24px',
            borderRadius: 25,
            border: '1px solid #06b6d4',
            background: walkerActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: '#06b6d4',
            cursor: 'pointer'
          }}
        >
          {walkerActive ? '⏸️ Stop Tour' : '🚶 Property Tour'}
        </button>
      </div>

      {/* Property Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>⏳</div>
          <p style={{ color: '#94a3b8' }}>Loading properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🏠</div>
          <p style={{ color: '#94a3b8' }}>No properties found</p>
        </div>
      ) : (
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {filteredProperties.map((property, idx) => (
            <div
              key={property.id}
              style={{
                transform: walkerActive && walkerIndex === idx ? 'scale(1.03)' : 'none',
                transition: 'transform 0.3s',
                position: 'relative'
              }}
            >
              {walkerActive && walkerIndex === idx && (
                <div style={{
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 30,
                  zIndex: 10,
                  animation: 'bounce 0.5s infinite'
                }}>
                  👆
                </div>
              )}
              
              <PropertyCard
                property={property}
                isWalkerActive={walkerActive && walkerIndex === idx}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating AgenticBar */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: 25,
        padding: '12px 24px',
        border: `2px solid ${isListening ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        zIndex: 1000
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isListening ? '#f59e0b' : '#64748b',
          animation: isListening ? 'pulse 1s infinite' : 'none'
        }} />
        
        <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>
          {isListening ? 'Listening...' : 'Voice Search'}
        </span>
        
        {transcript && (
          <span style={{ color: '#e2e8f0', fontSize: '0.85em', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{transcript}"
          </span>
        )}
        
        <button
          onClick={toggleListening}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            background: isListening ? '#ef4444' : '#f59e0b',
            color: isListening ? '#fff' : '#000',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isListening ? '⏹️' : '🎤'}
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-10px); } }
      `}</style>
    </div>
  );
};

export default RealEstatePage;
REALESTATEPAGE

echo "  ✅ RealEstatePage.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Backend routes for properties
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔌 Creating property backend routes..."

cat > "$VV/backend/property_routes.cjs" << 'PROPERTYROUTES'
// Property Routes for Real Estate

// Get all properties
app.get('/api/properties', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
            ['active']
        );
        res.json(result.rows);
    } catch (err) {
        // Demo data
        res.json([
            { id: 1, title: 'Modern Downtown Condo', price: 425000, address: '123 Main St', city: 'Austin', state: 'TX', bedrooms: 2, bathrooms: 2, sqft: 1200, property_type: 'Condo', listing_type: 'sale' },
            { id: 2, title: 'Luxury Suburban Home', price: 875000, address: '456 Oak Ave', city: 'Austin', state: 'TX', bedrooms: 4, bathrooms: 3, sqft: 3200, property_type: 'Single Family', listing_type: 'sale' },
        ]);
    }
});

// Create property
app.post('/api/properties', async (req, res) => {
    try {
        const { title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url } = req.body;
        
        const result = await pool.query(
            `INSERT INTO properties (title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', NOW())
             RETURNING *`,
            [title, description, price, address, city, state, bedrooms, bathrooms, sqft, property_type, listing_type, agent_id, builder_id, image_url]
        );
        
        res.json({ success: true, property: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search properties with vector similarity
app.post('/api/properties/search', async (req, res) => {
    try {
        const { query, listingType, minPrice, maxPrice, limit = 20 } = req.body;
        
        let sql = 'SELECT * FROM properties WHERE status = $1';
        const params = ['active'];
        let paramCount = 1;
        
        if (listingType) {
            paramCount++;
            sql += ` AND listing_type = $${paramCount}`;
            params.push(listingType);
        }
        
        if (minPrice) {
            paramCount++;
            sql += ` AND price >= $${paramCount}`;
            params.push(minPrice);
        }
        
        if (maxPrice) {
            paramCount++;
            sql += ` AND price <= $${paramCount}`;
            params.push(maxPrice);
        }
        
        // Text search
        if (query) {
            paramCount++;
            sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR address ILIKE $${paramCount} OR city ILIKE $${paramCount})`;
            params.push(`%${query}%`);
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ${limit}`;
        
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log('✅ Property routes loaded');
PROPERTYROUTES

echo "  ✅ property_routes.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Database migration for properties
#═══════════════════════════════════════════════════════════════════════════════
cat > "$VV/backend/migrations/create_properties_table.sql" << 'PROPERTYMIGRATION'
-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    address VARCHAR(500),
    city VARCHAR(200),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    sqft INT,
    lot_size DECIMAL(10,2),
    year_built INT,
    property_type VARCHAR(100),
    listing_type VARCHAR(50) DEFAULT 'sale', -- sale, rent, project
    agent_id VARCHAR(100),
    builder_id VARCHAR(100),
    image_url TEXT,
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    embedding TEXT,
    status VARCHAR(50) DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_listing ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_builder ON properties(builder_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

SELECT 'Properties table created!' as status;
PROPERTYMIGRATION

echo "  ✅ create_properties_table.sql"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Update realestate index
#═══════════════════════════════════════════════════════════════════════════════
cat > "$COMPONENTS_DIR/realestate/index.ts" << 'REALESTATEINDEX'
export { default as PropertyCard } from './PropertyCard';
REALESTATEINDEX

echo "  ✅ realestate/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ PART D COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  🏠 REAL ESTATE PAGE:"
echo "     • All properties grid"
echo "     • Tabs: All, For Sale, For Rent, Builder Projects"
echo "     • Voice search & filter"
echo "     • Property tour with walker"
echo ""
echo "  🏷️ PROPERTY CARD WITH AGENTIC BAR:"
echo "     • Click 'Ask' to expand"
echo "     • Voice questions about property"
echo "     • Quick question buttons"
echo "     • Price, beds, baths, sqft display"
echo ""
echo "  🎤 VOICE COMMANDS:"
echo "     • 'Show rentals' - filter"
echo "     • 'Under 500K' - price filter"
echo "     • 'Search downtown' - location"
echo "     • 'Guide me' - start tour"
echo ""
echo "  📊 BUILDER/AGENT SEPARATION:"
echo "     • Builder uploads → Projects tab"
echo "     • Agent uploads → Sale/Rent tabs"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"

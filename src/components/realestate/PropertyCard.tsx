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

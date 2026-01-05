import React, { useState, useRef, useCallback, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  category?: string;
  image_url?: string;
  dimensions?: string;
  vendor_id?: string;
}

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isWalkerActive?: boolean;
  onWalkerVisit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isWalkerActive,
  onWalkerVisit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize speech
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
          handleProductQuestion(text);
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
        speak(`Ask me anything about ${product.name}`);
      } catch (e) {}
    }
  };

  // Handle question about this specific product
  const handleProductQuestion = async (question: string) => {
    setIsThinking(true);
    
    try {
      // Call AI endpoint with product context
      const response = await fetch('http://localhost:1117/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          product: product,
          question: question
        })
      });
      
      const data = await response.json();
      const answer = data.answer || generateLocalAnswer(question);
      
      setAiResponse(answer);
      speak(answer);
    } catch (err) {
      // Fallback: Generate local answer
      const answer = generateLocalAnswer(question);
      setAiResponse(answer);
      speak(answer);
    } finally {
      setIsThinking(false);
    }
  };

  // Local answer generation when API fails
  const generateLocalAnswer = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
      return product.price 
        ? `${product.name} is priced at $${product.price.toFixed(2)}.`
        : `Price information is not available for ${product.name}. Please contact the vendor.`;
    }
    
    if (q.includes('dimension') || q.includes('size') || q.includes('measurement')) {
      return product.dimensions
        ? `The dimensions are ${product.dimensions}.`
        : `Dimension information is not available. Please check the product specifications.`;
    }
    
    if (q.includes('sku') || q.includes('part number') || q.includes('model')) {
      return product.sku
        ? `The SKU is ${product.sku}.`
        : `SKU information is not available for this product.`;
    }
    
    if (q.includes('description') || q.includes('about') || q.includes('tell me')) {
      return product.description
        ? product.description
        : `${product.name} is a quality product. Contact the vendor for more details.`;
    }
    
    if (q.includes('category') || q.includes('type')) {
      return product.category
        ? `This product is in the ${product.category} category.`
        : `Category information is not specified.`;
    }
    
    return `${product.name} is available. ${product.price ? `Priced at $${product.price.toFixed(2)}.` : ''} Would you like to know about the price, dimensions, or specifications?`;
  };

  return (
    <div
      ref={cardRef}
      onClick={() => !isExpanded && onSelect?.(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="product-card"
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 16,
        overflow: 'hidden',
        border: `2px solid ${isExpanded ? '#10b981' : hovered ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.3s',
        transform: hovered && !isExpanded ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
        cursor: isExpanded ? 'default' : 'pointer'
      }}
    >
      {/* Product Image */}
      <div style={{
        height: 160,
        background: product.image_url 
          ? `url(${product.image_url}) center/cover`
          : 'linear-gradient(135deg, #1e293b, #334155)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {!product.image_url && (
          <span style={{ fontSize: 48, opacity: 0.5 }}>📦</span>
        )}
        
        {/* Price badge */}
        {product.price && (
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: '#10b981',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: '0.9em'
          }}>
            ${product.price.toFixed(2)}
          </div>
        )}

        {/* Talk to product button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid #06b6d4',
            color: '#06b6d4',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.75em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          🎤 {isExpanded ? 'Close' : 'Talk'}
        </button>
      </div>

      {/* Product Info */}
      <div style={{ padding: 16 }}>
        <h3 style={{
          color: '#e2e8f0',
          margin: '0 0 8px',
          fontSize: '1em',
          fontWeight: 600,
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>
        
        {product.sku && (
          <div style={{ color: '#64748b', fontSize: '0.75em', marginBottom: 4 }}>
            SKU: {product.sku}
          </div>
        )}
        
        {product.category && (
          <span style={{
            background: 'rgba(6, 182, 212, 0.2)',
            color: '#06b6d4',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: '0.7em'
          }}>
            {product.category}
          </span>
        )}
      </div>

      {/* Expanded: AgenticBar for this product */}
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
            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isListening ? '#10b981' : isThinking ? '#f59e0b' : '#64748b',
                animation: isListening ? 'pulse 1s infinite' : 'none'
              }} />
              <span style={{ color: '#06b6d4', fontSize: '0.8em' }}>
                {isListening ? 'Listening...' : isThinking ? 'Thinking...' : 'Ask about this product'}
              </span>
            </div>

            {/* Waveform */}
            {isListening && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, height: 20, alignItems: 'center', marginBottom: 10 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{
                    width: 2,
                    background: '#10b981',
                    borderRadius: 1,
                    animation: `wave 0.3s ease-in-out ${i * 0.05}s infinite alternate`,
                    height: 6
                  }} />
                ))}
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10
              }}>
                <span style={{ color: '#64748b', fontSize: '0.7em' }}>You asked:</span>
                <p style={{ color: '#e2e8f0', margin: '4px 0 0', fontSize: '0.85em' }}>"{transcript}"</p>
              </div>
            )}

            {/* AI Response */}
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

            {/* Listen button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleListening(); }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 20,
                border: 'none',
                background: isListening ? '#ef4444' : '#10b981',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85em'
              }}
            >
              {isListening ? '⏹️ Stop' : '🎤 Ask a Question'}
            </button>

            {/* Quick questions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {['What\'s the price?', 'Dimensions?', 'Tell me more'].map(q => (
                <button
                  key={q}
                  onClick={(e) => { e.stopPropagation(); handleProductQuestion(q); }}
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

export default ProductCard;

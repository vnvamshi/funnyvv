// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - REAL ESTATE PAGE
// With STT/TTS teleprompter, vectorized property data
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  image?: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

// Mock properties - would come from backend
const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', title: 'Modern Downtown Condo', price: 450000, address: '123 Main St, Miami FL', beds: 2, baths: 2, sqft: 1200, type: 'condo' },
  { id: 'p2', title: 'Luxury Waterfront Villa', price: 1250000, address: '456 Ocean Dr, Miami FL', beds: 5, baths: 4, sqft: 4500, type: 'house' },
  { id: 'p3', title: 'Cozy Studio Apartment', price: 185000, address: '789 Beach Blvd, Miami FL', beds: 1, baths: 1, sqft: 600, type: 'apartment' },
  { id: 'p4', title: 'Family Home with Pool', price: 650000, address: '321 Palm Ave, Coral Gables FL', beds: 4, baths: 3, sqft: 2800, type: 'house' },
];

const PROPERTY_TYPES = [
  { id: 'all', name: 'All', icon: '🏠' },
  { id: 'house', name: 'Houses', icon: '🏡' },
  { id: 'condo', name: 'Condos', icon: '🏢' },
  { id: 'apartment', name: 'Apartments', icon: '🏬' },
  { id: 'land', name: 'Land', icon: '🌳' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RealEstatePage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter properties
  useEffect(() => {
    let filtered = [...properties];
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    setFilteredProperties(filtered);
  }, [properties, selectedType, searchQuery, priceRange]);

  // Voice command handler
  const handleVoiceCommand = useCallback((cmd: string) => {
    console.log('[RealEstate] Voice command:', cmd);
    
    if (cmd.startsWith('search:')) {
      setSearchQuery(cmd.replace('search:', ''));
    }
    
    // Price filter commands
    if (cmd.includes('under') && cmd.includes('million')) {
      const match = cmd.match(/(\d+)/);
      if (match) setPriceRange([0, parseInt(match[1]) * 1000000]);
    }
    if (cmd.includes('house') || cmd.includes('houses')) {
      setSelectedType('house');
    }
    if (cmd.includes('condo') || cmd.includes('condos')) {
      setSelectedType('condo');
    }
    if (cmd.includes('apartment') || cmd.includes('apartments')) {
      setSelectedType('apartment');
    }
  }, []);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home' || target === 'catalog') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f5f5f5',
      zIndex: 9998,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
        padding: '30px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.2em'
          }}
        >
          ✕
        </button>
        <h1 style={{ color: '#fff', margin: '0 0 8px', fontSize: '2em' }}>
          🏠 Real Estate
        </h1>
        <p style={{ color: THEME.goldLight, margin: 0 }}>
          {filteredProperties.length} properties available
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search properties..."
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '0.95em'
          }}
        />
        {PROPERTY_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              background: selectedType === type.id ? THEME.gold : '#e0e0e0',
              color: selectedType === type.id ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            {type.icon} {type.name}
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredProperties.map(property => (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{
                height: '180px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '4em', opacity: 0.8 }}>🏠</span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1em', color: '#333' }}>
                  {property.title}
                </h3>
                <p style={{ color: '#888', margin: '0 0 12px', fontSize: '0.85em' }}>
                  📍 {property.address}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#666', fontSize: '0.85em' }}>
                  <span>🛏 {property.beds} beds</span>
                  <span>🚿 {property.baths} baths</span>
                  <span>📐 {property.sqft.toLocaleString()} sqft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: THEME.gold, fontWeight: 700, fontSize: '1.3em' }}>
                    ${property.price.toLocaleString()}
                  </span>
                  <button style={{
                    background: THEME.gold,
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.85em'
                  }}>
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Teleprompter */}
      <VoiceTeleprompter
        context="realestate"
        onCommand={handleVoiceCommand}
        onNavigate={handleNavigate}
        initialMessage="Welcome to Real Estate. Say 'show houses' or 'under 500 thousand' to filter."
      />

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div
          onClick={() => setSelectedProperty(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <div style={{
              height: '250px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '6em', opacity: 0.8 }}>🏠</span>
            </div>
            <div style={{ padding: '30px' }}>
              <h2 style={{ margin: '0 0 12px' }}>{selectedProperty.title}</h2>
              <p style={{ color: '#888', marginBottom: '16px' }}>📍 {selectedProperty.address}</p>
              <p style={{ color: THEME.gold, fontSize: '2em', fontWeight: 700, margin: '0 0 20px' }}>
                ${selectedProperty.price.toLocaleString()}
              </p>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div><strong>{selectedProperty.beds}</strong> Bedrooms</div>
                <div><strong>{selectedProperty.baths}</strong> Bathrooms</div>
                <div><strong>{selectedProperty.sqft.toLocaleString()}</strong> sqft</div>
              </div>
              <button style={{
                width: '100%',
                padding: '14px',
                background: THEME.gold,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 600
              }}>
                Schedule a Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstatePage;

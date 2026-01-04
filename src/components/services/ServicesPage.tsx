// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - SERVICES PAGE
// With STT/TTS teleprompter
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

const SERVICES: Service[] = [
  { id: 's1', icon: '🏗️', title: 'Home Renovation', description: 'Complete home renovation services including kitchen, bathroom, and living spaces.', price: 'From $5,000' },
  { id: 's2', icon: '🎨', title: 'Interior Design', description: 'Professional interior design consultation and implementation.', price: 'From $500' },
  { id: 's3', icon: '🔧', title: 'Plumbing Services', description: '24/7 plumbing repairs, installations, and maintenance.', price: 'From $100' },
  { id: 's4', icon: '⚡', title: 'Electrical Work', description: 'Licensed electricians for all residential and commercial needs.', price: 'From $150' },
  { id: 's5', icon: '🌳', title: 'Landscaping', description: 'Transform your outdoor space with professional landscaping.', price: 'From $300' },
  { id: 's6', icon: '🧹', title: 'Cleaning Services', description: 'Regular and deep cleaning for homes and offices.', price: 'From $80' },
  { id: 's7', icon: '🛡️', title: 'Home Security', description: 'Security system installation and monitoring services.', price: 'From $200' },
  { id: 's8', icon: '🚚', title: 'Moving Services', description: 'Professional moving and relocation assistance.', price: 'From $400' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ServicesPage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = SERVICES.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVoiceCommand = useCallback((cmd: string) => {
    console.log('[Services] Voice command:', cmd);
    
    if (cmd.startsWith('search:')) {
      setSearchQuery(cmd.replace('search:', ''));
    }
    
    // Find service by name
    const service = SERVICES.find(s => 
      cmd.includes(s.title.toLowerCase().split(' ')[0])
    );
    if (service) {
      setSelectedService(service);
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
          🛠️ Services
        </h1>
        <p style={{ color: THEME.goldLight, margin: 0 }}>
          Professional services for your home
        </p>
      </div>

      {/* Search */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search services..."
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '1em'
          }}
        />
      </div>

      {/* Services Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredServices.map(service => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${THEME.gold}20, ${THEME.gold}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '2em'
              }}>
                {service.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#333' }}>{service.title}</h3>
              <p style={{ color: '#888', margin: '0 0 12px', fontSize: '0.9em', lineHeight: 1.4 }}>
                {service.description}
              </p>
              <span style={{
                display: 'inline-block',
                background: THEME.gold,
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85em',
                fontWeight: 600
              }}>
                {service.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Teleprompter */}
      <VoiceTeleprompter
        context="services"
        onCommand={handleVoiceCommand}
        onNavigate={handleNavigate}
        initialMessage="Welcome to Services. Say a service name like 'plumbing' or 'interior design' to learn more."
      />

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          onClick={() => setSelectedService(null)}
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
              maxWidth: '500px',
              width: '100%',
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '3em'
            }}>
              {selectedService.icon}
            </div>
            <h2 style={{ margin: '0 0 12px' }}>{selectedService.title}</h2>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
              {selectedService.description}
            </p>
            <p style={{ color: THEME.gold, fontSize: '1.5em', fontWeight: 700, marginBottom: '24px' }}>
              {selectedService.price}
            </p>
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
              Request Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
